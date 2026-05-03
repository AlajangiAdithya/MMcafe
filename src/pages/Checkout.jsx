import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { payAndVerify, previewCoupon } from '../lib/payments'
import { sendOrderEmail } from '../lib/email'
import {
  MapPin, Phone, User, Home, Building2, Map, Hash, ShieldCheck,
  ArrowLeft, Truck, Tag, X,
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
  const [loading, setLoading] = useState(false)

  // Coupon
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null) // { code, discount, message }
  const [couponBusy, setCouponBusy] = useState(false)

  if (!user) { navigate('/login'); return null }
  if (items.length === 0) { navigate('/store'); return null }

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

  const handlePlaceOrder = () => {
    if (!validate()) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)

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
        setLoading(false)
        toast.success('Order placed successfully!')
        const orderTotal = result.total || grandTotal
        const orderItemCount = items.length

        // Send confirmation email (non-blocking)
        sendOrderEmail({
          customerName: address.fullName,
          customerEmail: user.email,
          orderId: result.paymentId || result.orderId || '-',
          items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
          shipping,
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
        setLoading(false)
        toast.error(msg || 'Payment failed')
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
            </div>

            <div className="checkout-form">
              <div className="checkout-row">
                <div className="checkout-field">
                  <label>Full Name *</label>
                  <div className={`input-group ${errors.fullName ? 'input-error' : ''}`}>
                    <User size={16} />
                    <input
                      type="text"
                      placeholder="John Doe"
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
                      placeholder="9876543210"
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
                    placeholder="House/Flat no., Building name"
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
                    placeholder="Street, Area, Landmark (optional)"
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
                      placeholder="Mumbai"
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
                      placeholder="Maharashtra"
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
                      placeholder="400080"
                      value={address.pincode}
                      onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>
                  {errors.pincode && <span className="field-error">{errors.pincode}</span>}
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
                    placeholder="WELCOME10"
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
              label={`Slide to Pay ₹${grandTotal.toLocaleString()}`}
              onConfirm={handlePlaceOrder}
              loading={loading}
              status={loading ? 'loading' : 'idle'}
              disabled={loading}
              className="checkout-pay-btn"
            />

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
