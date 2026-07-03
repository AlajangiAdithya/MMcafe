// Supabase Edge Function: payment-order
// Creates a Razorpay order with a server-validated total.
// - Re-prices items from the products table (no client tampering)
// - Optionally applies a coupon via the validate_coupon RPC
// - Returns { orderId, amount, currency } for the Razorpay checkout
//
// Deploy:  supabase functions deploy payment-order --no-verify-jwt
// Secrets: supabase secrets set RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=...
//
// (JWT is verified manually because we still want the user to be authenticated.)

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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const RZP_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RZP_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
    const SUPA_URL = Deno.env.get('SUPABASE_URL')!
    const SUPA_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
      return json({ error: 'Razorpay keys not configured' }, 500)
    }

    const auth = req.headers.get('Authorization') || ''
    const token = auth.replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Missing auth' }, 401)

    // Resolve user from the JWT
    const userClient = createClient(SUPA_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) return json({ error: 'Invalid auth' }, 401)
    const user = userData.user

    // Service-role client (used below for trusted reads + rate limit RPC)
    const admin = createClient(SUPA_URL, SUPA_SERVICE)

    // Rate limit: 10 order-creates per 60s per user
    const { data: allowed } = await admin.rpc('check_rate_limit', {
      p_key: user.id,
      p_endpoint: 'payment-order',
      p_window_seconds: 60,
      p_max: 10,
    })
    if (allowed === false) {
      return json({ error: 'Too many requests. Please wait a moment and try again.' }, 429)
    }

    const body = await req.json().catch(() => ({}))
    const { kind, items, courseId, bookId, couponCode } = body as {
      kind: 'cart' | 'course' | 'book'
      items?: Array<{ id: number; qty: number }>
      courseId?: number
      bookId?: number
      couponCode?: string
    }

    let amount = 0
    let description = ''
    const notes: Record<string, string> = { user_id: user.id }

    if (kind === 'cart') {
      if (!Array.isArray(items) || items.length === 0) {
        return json({ error: 'Cart is empty' }, 400)
      }
      const ids = items.map((i) => Number(i.id))
      const { data: products, error } = await admin
        .from('products')
        .select('id, price, in_stock, stock_quantity')
        .in('id', ids)
      if (error) return json({ error: error.message }, 500)

      const priceMap = new Map(products!.map((p) => [Number(p.id), p]))
      let subtotal = 0
      for (const it of items) {
        const p = priceMap.get(Number(it.id))
        if (!p) return json({ error: `Product ${it.id} not found` }, 400)
        if (!p.in_stock || (p.stock_quantity ?? 0) < it.qty) {
          return json({ error: `Insufficient stock for product ${it.id}` }, 400)
        }
        subtotal += Number(p.price) * Number(it.qty)
      }
      const shipping = subtotal >= 999 ? 0 : 49

      // Coupon
      let discount = 0
      let couponId: number | null = null
      if (couponCode) {
        const { data: vc, error: ce } = await admin.rpc('validate_coupon', {
          p_code: couponCode,
          p_subtotal: subtotal,
        })
        if (ce) return json({ error: ce.message }, 500)
        const row = (vc as any[])?.[0]
        if (!row?.ok) return json({ error: row?.message || 'Invalid coupon' }, 400)
        discount = row.discount
        couponId = row.coupon_id
        notes.coupon_code = couponCode
        notes.coupon_id = String(couponId)
      }

      amount = subtotal + shipping - discount
      description = `${items.length} item(s)`
      notes.kind = 'cart'
      // Compact item snapshot ("id x qty" pairs). payment-verify re-reads THIS
      // (never the client body) so the goods delivered always match the goods
      // that were priced into this order.
      notes.items = items.map((i) => `${Number(i.id)}x${Number(i.qty)}`).join(',')
      if (notes.items.length > 500) {
        return json({ error: 'Cart has too many distinct items' }, 400)
      }
    } else if (kind === 'course') {
      if (!courseId) return json({ error: 'Missing courseId' }, 400)
      const { data: course, error } = await admin
        .from('courses')
        .select('id, title, price, free')
        .eq('id', courseId)
        .single()
      if (error || !course) return json({ error: 'Course not found' }, 404)
      if (course.free) return json({ error: 'Course is free' }, 400)
      amount = Number(course.price)
      description = course.title
      notes.kind = 'course'
      notes.course_id = String(course.id)
    } else if (kind === 'book') {
      if (!bookId) return json({ error: 'Missing bookId' }, 400)
      const { data: book, error } = await admin
        .from('books')
        .select('id, title, price, free')
        .eq('id', bookId)
        .single()
      if (error || !book) return json({ error: 'Book not found' }, 404)
      if (book.free) return json({ error: 'Book is free' }, 400)
      amount = Number(book.price)
      description = book.title
      notes.kind = 'book'
      notes.book_id = String(book.id)
    } else {
      return json({ error: 'Invalid kind' }, 400)
    }

    if (amount <= 0) return json({ error: 'Invalid amount' }, 400)

    // Create Razorpay order
    const orderResp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`)}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `r_${Date.now()}_${user.id.slice(0, 8)}`,
        notes,
      }),
    })
    const order = await orderResp.json()
    if (!orderResp.ok) {
      return json({ error: order?.error?.description || 'Razorpay order failed' }, 502)
    }

    return json({
      orderId: order.id,
      amount,
      currency: order.currency,
      keyId: RZP_KEY_ID,
      description,
    })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
