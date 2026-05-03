// Server-verified payment flow.
//
// Client only chooses *what* to buy and shows the Razorpay UI; the actual
// amount is computed and the signature verified by the Edge Functions
// (supabase/functions/payment-order, payment-verify) using secrets the
// browser can't see. This is what makes the ecommerce safe to take real money.

import { supabase } from './supabase'

let scriptPromise = null
function loadRazorpay() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve()
    s.onerror = () => { scriptPromise = null; reject(new Error('Razorpay script failed')) }
    document.body.appendChild(s)
  })
  return scriptPromise
}

async function callFn(name, payload) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not signed in')
  const { data, error } = await supabase.functions.invoke(name, {
    body: payload,
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (error) throw new Error(error.message || 'Edge function failed')
  if (data?.error) throw new Error(data.error)
  return data
}

/**
 * Run the entire pay -> verify -> persist flow.
 *
 * @param {object} opts
 * @param {'cart'|'course'} opts.kind
 * @param {Array<{id:number, qty:number}>} [opts.items]
 * @param {number} [opts.courseId]
 * @param {string} [opts.couponCode]
 * @param {object} [opts.shippingAddress]
 * @param {{name?:string, email?:string, phone?:string}} [opts.customer]
 * @param {string} [opts.brandName]
 * @param {(payload:object)=>void} [opts.onSuccess]  // called with edge-fn response
 * @param {(err:string)=>void} [opts.onFailure]
 */
export async function payAndVerify(opts) {
  const {
    kind, items, courseId, couponCode, shippingAddress,
    customer = {}, brandName = 'Mastermind Brews',
    onSuccess, onFailure,
  } = opts

  try {
    // 1) Server creates the Razorpay order with a verified amount
    const order = await callFn('payment-order', { kind, items, courseId, couponCode })

    await loadRazorpay()

    // 2) Open the Razorpay checkout with that order_id
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: Math.round(order.amount * 100),
      currency: order.currency,
      name: brandName,
      description: order.description,
      image: '/logo.png',
      prefill: {
        name: customer.name || '',
        email: customer.email || '',
        contact: customer.phone || '',
      },
      theme: { color: '#1a1a2e' },
      handler: async (resp) => {
        try {
          // 3) Server verifies the signature and writes the order/enrollment
          const result = await callFn('payment-verify', {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
            kind, items, courseId, couponCode, shippingAddress,
          })
          onSuccess?.({ ...result, paymentId: resp.razorpay_payment_id, total: order.amount })
        } catch (e) {
          onFailure?.(e.message || 'Verification failed')
        }
      },
      modal: { ondismiss: () => onFailure?.('Payment cancelled') },
    })
    rzp.on('payment.failed', (r) => onFailure?.(r?.error?.description || 'Payment failed'))
    rzp.open()
  } catch (e) {
    onFailure?.(e.message || 'Could not start payment')
  }
}

/** Get a coupon discount preview (no commitment, no DB write). */
export async function previewCoupon(code, subtotal) {
  const { data, error } = await supabase.rpc('validate_coupon', {
    p_code: code,
    p_subtotal: subtotal,
  })
  if (error) throw error
  const row = data?.[0]
  return {
    ok: !!row?.ok,
    message: row?.message || 'Invalid',
    discount: row?.discount || 0,
    couponId: row?.coupon_id || null,
  }
}
