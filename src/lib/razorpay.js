const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY

// Loads the Razorpay checkout script once and caches the promise.
let scriptPromise = null
function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve()
    s.onerror = () => {
      scriptPromise = null
      reject(new Error('Failed to load Razorpay'))
    }
    document.body.appendChild(s)
  })
  return scriptPromise
}

export async function openRazorpay({
  amount,
  name,
  description,
  email,
  phone,
  notes,
  onSuccess,
  onFailure,
}) {
  if (!RAZORPAY_KEY) {
    onFailure?.('Razorpay key not configured')
    return
  }

  try {
    await loadScript()
  } catch (err) {
    onFailure?.(err.message)
    return
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    name: name || 'Mastermind Brews',
    description: description || 'Purchase',
    image: '/logo.png',
    prefill: { email: email || '', contact: phone || '' },
    notes: notes || {},
    theme: { color: '#1a1a2e' },
    handler: (response) => onSuccess?.(response),
    modal: {
      ondismiss: () => onFailure?.('Payment cancelled'),
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (resp) => {
    onFailure?.(resp?.error?.description || 'Payment failed')
  })
  rzp.open()
}
