// Supabase Edge Function: payment-verify
// Verifies the Razorpay payment signature, then writes the order/enrollment
// using the service role key. The client cannot fake a payment because the
// signature is HMAC-SHA256 of `${orderId}|${paymentId}` with the Razorpay
// key secret — known only to this server.
//
// Deploy:  supabase functions deploy payment-verify --no-verify-jwt
// Secrets: supabase secrets set RAZORPAY_KEY_SECRET=...

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })

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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const RZP_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
    const SUPA_URL = Deno.env.get('SUPABASE_URL')!
    const SUPA_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (!RZP_KEY_SECRET) return json({ error: 'Razorpay secret missing' }, 500)

    const auth = req.headers.get('Authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Missing auth' }, 401)

    const userClient = createClient(SUPA_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: userData } = await userClient.auth.getUser()
    if (!userData.user) return json({ error: 'Invalid auth' }, 401)
    const user = userData.user

    const body = await req.json().catch(() => ({}))
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      kind,
      items,
      courseId,
      bookId,
      shippingAddress,
      couponCode,
    } = body as any

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ error: 'Missing payment fields' }, 400)
    }

    const expected = await hmacSha256Hex(
      RZP_KEY_SECRET,
      `${razorpay_order_id}|${razorpay_payment_id}`,
    )
    if (expected !== razorpay_signature) {
      return json({ error: 'Signature mismatch' }, 400)
    }

    const admin = createClient(SUPA_URL, SUPA_SERVICE)

    // Fetch the Razorpay order to know the verified amount + notes
    const RZP_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
    const ordResp = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers: { Authorization: `Basic ${btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`)}` },
    })
    const ordData = await ordResp.json()
    if (!ordResp.ok) return json({ error: 'Could not fetch order' }, 502)

    const amount = ordData.amount / 100 // INR

    if (kind === 'cart') {
      // Re-load product names/images for snapshot
      const ids = (items || []).map((i: any) => Number(i.id))
      const { data: products } = await admin
        .from('products')
        .select('id, name, price, image')
        .in('id', ids)
      const pmap = new Map((products || []).map((p) => [Number(p.id), p]))
      const itemsSnapshot = (items || []).map((i: any) => {
        const p = pmap.get(Number(i.id))
        return {
          id: i.id,
          name: p?.name || '',
          price: Number(p?.price || 0),
          qty: Number(i.qty),
          image: p?.image || '',
        }
      })

      // Resolve coupon id (server-validated) so RPC can bump uses atomically
      let couponId: number | null = null
      if (couponCode) {
        const { data: vc } = await admin.rpc('validate_coupon', {
          p_code: couponCode,
          p_subtotal: itemsSnapshot.reduce((s, i) => s + i.price * i.qty, 0),
        })
        const row = (vc as any[])?.[0]
        if (row?.ok) couponId = row.coupon_id
      }

      // Atomic: insert order + decrement stock + bump coupon + clear cart.
      // Idempotent on payment_id, so a webhook retry won't duplicate.
      const { data: orderId, error: oerr } = await admin.rpc('create_order_with_stock', {
        p_user_id: user.id,
        p_items: itemsSnapshot,
        p_total: amount,
        p_shipping_address: shippingAddress || {},
        p_payment_id: razorpay_payment_id,
        p_coupon_id: couponId,
      })
      if (oerr) return json({ error: oerr.message }, 500)

      return json({ ok: true, orderId })
    }

    if (kind === 'course') {
      if (!courseId) return json({ error: 'Missing courseId' }, 400)
      const { error: enrErr } = await admin.from('enrollments').upsert(
        { user_id: user.id, course_id: courseId, payment_id: razorpay_payment_id },
        { onConflict: 'user_id,course_id', ignoreDuplicates: true },
      )
      if (enrErr) return json({ error: enrErr.message }, 500)
      return json({ ok: true, courseId })
    }

    if (kind === 'book') {
      if (!bookId) return json({ error: 'Missing bookId' }, 400)
      // Permanent entitlement. Idempotent on (user_id, book_id) so a webhook
      // retry or double-submit can't create duplicate purchases.
      const { error: bpErr } = await admin.from('book_purchases').upsert(
        { user_id: user.id, book_id: bookId, payment_id: razorpay_payment_id },
        { onConflict: 'user_id,book_id', ignoreDuplicates: true },
      )
      if (bpErr) return json({ error: bpErr.message }, 500)
      return json({ ok: true, bookId })
    }

    return json({ error: 'Invalid kind' }, 400)
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
