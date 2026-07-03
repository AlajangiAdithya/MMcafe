// Supabase Edge Function: payment-webhook
// Razorpay -> us. Fallback so an order is recorded even if the user
// closes the browser before /payment-verify runs.
//
// Razorpay signs the raw body with HMAC-SHA256 using the webhook secret.
// We verify, then call the same idempotent create_order_with_stock RPC
// used by payment-verify. Duplicate events are no-ops.
//
// Configure in Razorpay dashboard:
//   URL:    https://<project>.supabase.co/functions/v1/payment-webhook
//   Events: payment.captured, payment.failed
//   Secret: same value as RAZORPAY_WEBHOOK_SECRET below
//
// Deploy:  supabase functions deploy payment-webhook --no-verify-jwt
// Secrets: supabase secrets set RAZORPAY_WEBHOOK_SECRET=...

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Constant-time string compare (avoids signature timing leaks)
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    const RZP_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RZP_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
    const SUPA_URL = Deno.env.get('SUPABASE_URL')!
    const SUPA_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (!WEBHOOK_SECRET || !RZP_KEY_ID || !RZP_KEY_SECRET) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500 })
    }

    const signature = req.headers.get('x-razorpay-signature') || ''
    const raw = await req.text()
    const expected = await hmacSha256Hex(WEBHOOK_SECRET, raw)
    if (!safeEqual(expected, signature)) {
      return new Response(JSON.stringify({ error: 'Bad signature' }), { status: 401 })
    }

    const event = JSON.parse(raw)
    const eventType = event?.event as string
    const payment = event?.payload?.payment?.entity
    if (!payment) {
      return new Response(JSON.stringify({ ok: true, ignored: 'no payment entity' }))
    }

    // Only act on captured payments. Failed payments don't need an order row.
    if (eventType !== 'payment.captured') {
      return new Response(JSON.stringify({ ok: true, ignored: eventType }))
    }

    const admin = createClient(SUPA_URL, SUPA_SERVICE)

    const orderId = payment.order_id as string
    const paymentId = payment.id as string
    const amount = Number(payment.amount) / 100

    // Pull the original order from Razorpay so we can read the notes
    // (kind, user_id, course_id, coupon_code) we set in payment-order.
    const ordResp = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: `Basic ${btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`)}` },
    })
    if (!ordResp.ok) {
      return new Response(JSON.stringify({ error: 'Could not fetch order' }), { status: 502 })
    }
    const ord = await ordResp.json()
    const notes = (ord.notes || {}) as Record<string, string>
    const userId = notes.user_id
    const kind = notes.kind

    if (!userId) {
      return new Response(JSON.stringify({ ok: true, ignored: 'no user in notes' }))
    }

    if (kind === 'course') {
      const courseId = Number(notes.course_id)
      if (!courseId) {
        return new Response(JSON.stringify({ ok: true, ignored: 'no course_id' }))
      }
      await admin.from('enrollments').upsert(
        { user_id: userId, course_id: courseId, payment_id: paymentId },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true },
      )
      return new Response(JSON.stringify({ ok: true, kind: 'course' }))
    }

    if (kind === 'cart') {
      // Preferred source of truth: the compact items snapshot payment-order
      // wrote into the Razorpay order notes ("id x qty" pairs). Falls back to
      // the user's cart_items rows for orders created before that change.
      // If payment-verify already ran, the idempotency check inside the RPC
      // (orders_payment_id_unique) short-circuits anyway.
      let pairs = (notes.items || '')
        .split(',')
        .map((s: string) => {
          const [id, qty] = s.split('x').map(Number)
          return { id, qty }
        })
        .filter((i: any) => Number.isFinite(i.id) && i.id > 0 && Number.isFinite(i.qty) && i.qty > 0)

      if (pairs.length === 0) {
        const { data: cartRows } = await admin
          .from('cart_items')
          .select('product_id, qty')
          .eq('user_id', userId)
        if (!cartRows || cartRows.length === 0) {
          // Cart already cleared — verify path most likely succeeded. Nothing to do.
          return new Response(JSON.stringify({ ok: true, ignored: 'cart empty (likely already processed)' }))
        }
        pairs = cartRows.map((r: any) => ({ id: Number(r.product_id), qty: Number(r.qty) }))
      }

      const ids = pairs.map((r: any) => Number(r.id))
      const { data: products } = await admin
        .from('products')
        .select('id, name, price, image')
        .in('id', ids)
      const pmap = new Map((products || []).map((p: any) => [Number(p.id), p]))
      const itemsSnapshot = pairs.map((r: any) => {
        const p = pmap.get(Number(r.id))
        return {
          id: r.id,
          name: p?.name || '',
          price: Number(p?.price || 0),
          qty: Number(r.qty),
          image: p?.image || '',
        }
      })

      let couponId: number | null = null
      if (notes.coupon_id) couponId = Number(notes.coupon_id)

      const { error: rpcErr } = await admin.rpc('create_order_with_stock', {
        p_user_id: userId,
        p_items: itemsSnapshot,
        p_total: amount,
        p_shipping_address: {},
        p_payment_id: paymentId,
        p_coupon_id: couponId,
      })
      if (rpcErr) {
        return new Response(JSON.stringify({ error: rpcErr.message }), { status: 500 })
      }
      return new Response(JSON.stringify({ ok: true, kind: 'cart' }))
    }

    return new Response(JSON.stringify({ ok: true, ignored: 'unknown kind' }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 })
  }
})
