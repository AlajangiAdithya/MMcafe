import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { payAndVerify, previewCoupon } from '../lib/payments'
import { sendOrderEmail, sendCafeOrderEmail } from '../lib/email'
import { getOrdersForUser, getProducts } from '../lib/database'
import {
  MapPin, Phone, User, Home, Building2, Map, Hash, ShieldCheck,
  ArrowLeft, Truck, Tag, X, AlertCircle, RefreshCw, Check, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import SlideButton from '../components/SlideButton'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [address, setAddress] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [errors, setErrors] = useState({})
  // 'idle' | 'loading' | 'error' | 'success' — drives the SlideButton state so
  // a failed validation/payment shows an error and resets instead of hanging.
  const [payStatus, setPayStatus] = useState('idle')
  const loading = payStatus === 'loading'

  // Coupon
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null) // { code, discount, message }
  const [couponBusy, setCouponBusy] = useState(false)

  // Pincode lookup: { status: 'idle'|'loading'|'ok'|'error'|'unknown', label?: string }
  const [pincodeLookup, setPincodeLookup] = useState({ status: 'idle' })

  // Last-used address from prior orders (for one-tap fill)
  const [lastAddress, setLastAddress] = useState(null)

  // Stock issues found when comparing cart against current product stock
  const [stockIssues, setStockIssues] = useState([])

  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
    else if (items.length === 0) navigate('/store', { replace: true })
  }, [user, items.length, navigate])

  // Pull most recent shipping address from prior orders so returning
  // customers can fill the form in one tap.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const orders = await getOrdersForUser(user.id)
        if (cancelled) return
        const recent = orders.find((o) => o?.shipping_address && typeof o.shipping_address === 'object')
        if (recent?.shipping_address) setLastAddress(recent.shipping_address)
      } catch { /* non-fatal */ }
    })()
    return () => { cancelled = true }
  }, [user])

  // Verify cart against live stock before allowing payment. Runs once on mount
  // and again whenever cart items change.
  useEffect(() => {
    if (items.length === 0) return
    let cancelled = false
    ;(async () => {
      try {
        const products = await getProducts()
        if (cancelled) return
        const byId = new Map(products.map((p) => [p.id, p]))
        const issues = []
        for (const it of items) {
          const p = byId.get(it.id)
          if (!p) {
            issues.push({ id: it.id, name: it.name, reason: 'no-longer-available' })
            continue
          }
          if (p.in_stock === false) {
            issues.push({ id: it.id, name: it.name, reason: 'out-of-stock' })
            continue
          }
          if (typeof p.stock_quantity === 'number' && p.stock_quantity >= 0 && it.qty > p.stock_quantity) {
            issues.push({
              id: it.id,
              name: it.name,
              reason: 'low-stock',
              available: p.stock_quantity,
              requested: it.qty,
            })
          }
        }
        setStockIssues(issues)
      } catch { /* non-fatal */ }
    })()
    return () => { cancelled = true }
  }, [items])

  if (!user || items.length === 0) return null

  const subtotal = total
  const shipping = subtotal >= 999 ? 0 : 49
  const discount = coupon?.discount || 0
  const grandTotal = Math.max(0, subtotal + shipping - discount)

  const validate = () => {
    const e = {}
    if (!address.fullName.trim()) e.fullName = 'Full name is required'
    if (!address.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(address.phone.trim())) e.phone = 'Enter a valid 10-digit phone number'
    if (!address.line1.trim()) e.line1 = 'Address is required'
    if (!address.city.trim()) e.city = 'City is required'
    if (!address.state.trim()) e.state = 'State is required'
    if (!address.pincode.trim()) e.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(address.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const update = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // India Post free API: returns post office data for a 6-digit pin.
  // We only fill state/city if they are still blank, never overwrite typed input.
  const lookupPincode = useCallback(async (pin) => {
    setPincodeLookup({ status: 'loading' })
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      const row = Array.isArray(data) ? data[0] : null
      const po = row?.PostOffice?.[0]
      if (row?.Status === 'Success' && po) {
        setAddress((prev) => ({
          ...prev,
          state: prev.state.trim() ? prev.state : (po.State || ''),
          city: prev.city.trim() ? prev.city : (po.District || po.Block || ''),
        }))
        setPincodeLookup({ status: 'ok', label: `${po.District || ''}, ${po.State || ''}`.replace(/^,\s*/, '') })
      } else {
        setPincodeLookup({ status: 'unknown' })
      }
    } catch {
      setPincodeLookup({ status: 'error' })
    }
  }, [])

  const updatePincode = (raw) => {
    const value = raw.replace(/\D/g, '').slice(0, 6)
    update('pincode', value)
    if (value.length === 6) lookupPincode(value)
    else setPincodeLookup({ status: 'idle' })
  }

  const useLastAddress = () => {
    if (!lastAddress) return
    setAddress((prev) => ({
      fullName: lastAddress.fullName || prev.fullName,
      phone: lastAddress.phone || prev.phone,
      line1: lastAddress.line1 || prev.line1,
      line2: lastAddress.line2 || prev.line2,
      city: lastAddress.city || prev.city,
      state: lastAddress.state || prev.state,
      pincode: lastAddress.pincode || prev.pincode,
    }))
    setErrors({})
    toast.success('Last used address filled')
  }

  const applyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) return
    setCouponBusy(true)
    try {
      const r = await previewCoupon(code, subtotal)
      if (!r.ok) {
        toast.error(r.message || 'Invalid coupon')
        setCoupon(null)
      } else {
        setCoupon({ code, discount: r.discount, message: r.message })
        toast.success(`Coupon applied. You saved ₹${r.discount.toLocaleString()}`)
      }
    } catch (e) {
      toast.error(e.message || 'Could not validate coupon')
    } finally {
      setCouponBusy(false)
    }
  }

  const removeCoupon = () => {
    setCoupon(null)
    setCouponInput('')
  }

  // Flash an error on the slide button, surface a toast, then reset to idle so
  // the slider snaps back and the customer can fix things and retry.
  const failOrder = (msg) => {
    setPayStatus('error')
    toast.error(msg)
    setTimeout(() => setPayStatus('idle'), 1500)
  }

  const handlePlaceOrder = () => {
    if (loading) return
    if (stockIssues.length > 0) {
      failOrder('Please update your cart before placing the order')
      return
    }
    if (!validate()) {
      // validate() also populates `errors`, so each bad field shows its message.
      const firstError = document.querySelector('.input-group.input-error input')
      firstError?.focus()
      failOrder('Please correct the highlighted fields before paying')
      return
    }
    setPayStatus('loading')

    payAndVerify({
      kind: 'cart',
      items: items.map((i) => ({ id: i.id, qty: i.qty })),
      couponCode: coupon?.code,
      shippingAddress: address,
      customer: {
        name: address.fullName,
        email: user.email,
        phone: address.phone,
      },
      brandName: 'Mastermind Brews',
      onSuccess: (result) => {
        setPayStatus('success')
        toast.success('Order placed successfully!')
        const orderTotal = result.total || grandTotal
        const orderItemCount = items.length

        const emailOrderId = result.paymentId || result.orderId || '-'
        const emailItems = items.map(i => ({ name: i.name, qty: i.qty, price: i.price, image: i.image }))

        // Customer receipt (non-blocking)
        sendOrderEmail({
          customerName: address.fullName,
          customerEmail: user.email,
          orderId: emailOrderId,
          items: emailItems,
          subtotal,
          shipping,
          discount,
          total: orderTotal,
        })

        // Cafe new-order alert → points staff to the admin panel (non-blocking)
        sendCafeOrderEmail({
          orderId: emailOrderId,
          customerName: address.fullName,
          customerEmail: user.email,
          customerPhone: address.phone,
          shippingAddress: address,
          items: emailItems,
          subtotal,
          shipping,
          discount,
          total: orderTotal,
        })

        clearCart()
        navigate('/order-confirmation', {
          state: {
            paymentId: result.paymentId,
            orderId: result.orderId,
            total: orderTotal,
            itemCount: orderItemCount,
          },
        })
      },
      onFailure: (msg) => {
        failOrder(msg || 'Payment failed')
      },
    })
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <button className="checkout-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>

        <div className="checkout-grid">
          {/* Shipping Address Form */}
          <div className="checkout-section">
            <div className="checkout-section-header">
              <MapPin size={20} />
              <h2>Shipping Address</h2>
              {lastAddress && (
                <button
                  type="button"
                  className="checkout-last-address-btn"
                  onClick={useLastAddress}
                  title="Fill with your last used delivery address"
                >
                  <RefreshCw size={14} /> Use last address
                </button>
              )}
            </div>

            {stockIssues.length > 0 && (
              <div className="checkout-stock-banner" role="alert">
                <AlertCircle size={18} />
                <div>
                  <strong>Some items need attention</strong>
                  <ul>
                    {stockIssues.map((s) => (
                      <li key={s.id}>
                        {s.name}: {
                          s.reason === 'out-of-stock' ? 'currently out of stock' :
                          s.reason === 'no-longer-available' ? 'no longer available' :
                          `only ${s.available} left, you have ${s.requested} in cart`
                        }
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate('/cart')}
                  >
                    Edit cart
                  </button>
                </div>
              </div>
            )}

            <div className="checkout-form">
              <div className="checkout-row">
                <div className="checkout-field">
                  <label>Full Name *</label>
                  <div className={`input-group ${errors.fullName ? 'input-error' : ''}`}>
                    <User size={16} />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={address.fullName}
                      onChange={(e) => update('fullName', e.target.value)}
                    />
                  </div>
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>
                <div className="checkout-field">
                  <label>Phone Number *</label>
                  <div className={`input-group ${errors.phone ? 'input-error' : ''}`}>
                    <Phone size={16} />
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={address.phone}
                      onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="checkout-field">
                <label>Address Line 1 *</label>
                <div className={`input-group ${errors.line1 ? 'input-error' : ''}`}>
                  <Home size={16} />
                  <input
                    type="text"
                    placeholder="Enter house or flat number and building name"
                    value={address.line1}
                    onChange={(e) => update('line1', e.target.value)}
                  />
                </div>
                {errors.line1 && <span className="field-error">{errors.line1}</span>}
              </div>

              <div className="checkout-field">
                <label>Address Line 2</label>
                <div className="input-group">
                  <Building2 size={16} />
                  <input
                    type="text"
                    placeholder="Enter street, area or landmark (optional)"
                    value={address.line2}
                    onChange={(e) => update('line2', e.target.value)}
                  />
                </div>
              </div>

              <div className="checkout-row checkout-row-3">
                <div className="checkout-field">
                  <label>City *</label>
                  <div className={`input-group ${errors.city ? 'input-error' : ''}`}>
                    <Building2 size={16} />
                    <input
                      type="text"
                      placeholder="Enter your city"
                      value={address.city}
                      onChange={(e) => update('city', e.target.value)}
                    />
                  </div>
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>
                <div className="checkout-field">
                  <label>State *</label>
                  <div className={`input-group ${errors.state ? 'input-error' : ''}`}>
                    <Map size={16} />
                    <input
                      type="text"
                      placeholder="Enter your state"
                      value={address.state}
                      onChange={(e) => update('state', e.target.value)}
                    />
                  </div>
                  {errors.state && <span className="field-error">{errors.state}</span>}
                </div>
                <div className="checkout-field">
                  <label>Pincode *</label>
                  <div className={`input-group ${errors.pincode ? 'input-error' : ''}`}>
                    <Hash size={16} />
                    <input
                      type="text"
                      placeholder="Enter 6-digit pincode"
                      value={address.pincode}
                      onChange={(e) => updatePincode(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                  {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                  {!errors.pincode && pincodeLookup.status === 'loading' && (
                    <span className="field-hint">
                      <Loader2 size={12} className="spin" /> Looking up location…
                    </span>
                  )}
                  {!errors.pincode && pincodeLookup.status === 'ok' && (
                    <span className="field-hint field-hint-ok">
                      <Check size={12} /> {pincodeLookup.label}
                    </span>
                  )}
                  {!errors.pincode && pincodeLookup.status === 'unknown' && (
                    <span className="field-hint field-hint-warn">
                      Couldn't find that pincode. Please check and enter city/state manually.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="checkout-section-header">
              <ShieldCheck size={20} />
              <h2>Order Summary</h2>
            </div>

            <div className="checkout-items">
              {items.map((item) => (
                <div key={item.id} className="checkout-item">
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <div className="checkout-item-info">
                    <h4>{item.name}</h4>
                    <span className="checkout-item-qty">Qty: {item.qty}</span>
                  </div>
                  <span className="checkout-item-price">
                    ₹{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="checkout-coupon">
              <div className="checkout-coupon-head">
                <Tag size={14} /> <strong>Have a coupon?</strong>
              </div>
              {coupon ? (
                <div className="checkout-coupon-applied">
                  <span><code>{coupon.code}</code> applied. You save ₹{discount.toLocaleString()}</span>
                  <button className="icon-btn" onClick={removeCoupon} aria-label="Remove coupon">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="checkout-coupon-row">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={applyCoupon}
                    disabled={couponBusy || !couponInput.trim()}
                  >
                    {couponBusy ? 'Checking…' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="checkout-total-row">
                <span><Truck size={14} /> Shipping</span>
                <span className={shipping === 0 ? 'free-shipping' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="shipping-hint">Free shipping on orders above ₹999</p>
              )}
              {discount > 0 && (
                <div className="checkout-total-row" style={{ color: 'var(--success)' }}>
                  <span>Discount ({coupon.code})</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="checkout-total-row checkout-grand-total">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <SlideButton
              variant="blue"
              label={stockIssues.length > 0
                ? 'Resolve cart issues to continue'
                : `Slide to Pay ₹${grandTotal.toLocaleString()}`}
              onConfirm={handlePlaceOrder}
              loading={loading}
              status={payStatus}
              disabled={loading || stockIssues.length > 0}
              className="checkout-pay-btn"
            />

            {/* Sticky mobile-only pay bar, visible while the user is still
                filling out the address form. Hides on >= 760px via CSS. */}
            <div className="checkout-sticky-mobile">
              <div className="checkout-sticky-mobile-total">
                <span>Total</span>
                <strong>₹{grandTotal.toLocaleString()}</strong>
              </div>
              <button
                type="button"
                className="btn btn-blue"
                onClick={handlePlaceOrder}
                disabled={loading || stockIssues.length > 0}
              >
                {loading ? 'Processing…' : stockIssues.length > 0 ? 'Cart needs review' : `Pay ₹${grandTotal.toLocaleString()}`}
              </button>
            </div>

            <p className="checkout-secure">
              <ShieldCheck size={14} />
              Server-verified payment via Razorpay. Your data is encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
