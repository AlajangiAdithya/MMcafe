import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ShieldCheck, User, Phone, Briefcase,
  BookOpen, Clock, Tag, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getCourseById, isEnrolled, addEnrollment } from '../lib/database'
import { payAndVerify, previewCoupon } from '../lib/payments'
import { sendCourseEmail } from '../lib/email'
import toast from 'react-hot-toast'
import SlideButton from '../components/SlideButton'

export default function CourseCheckout() {
  const { courseId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  // 'idle' | 'loading' | 'error' | 'success' — drives the SlideButton so a
  // failed validation/payment resets the slider instead of hanging on "Processing…".
  const [payStatus, setPayStatus] = useState('idle')
  const loading = payStatus === 'loading'

  const [details, setDetails] = useState({
    fullName: '',
    phone: '',
    profession: '',
  })
  const [errors, setErrors] = useState({})

  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponBusy, setCouponBusy] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      toast.error('Please login to continue')
      navigate('/login')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const c = await getCourseById(courseId)
        if (cancelled) return
        const already = await isEnrolled(user.id, c.id).catch(() => false)
        if (already) {
          navigate('/my-courses', { replace: true })
          return
        }
        setCourse(c)
        setDetails((p) => ({ ...p, fullName: user.user_metadata?.full_name || '' }))
      } catch (err) {
        toast.error(err?.message || 'Course not found')
        navigate('/academy')
      } finally {
        if (!cancelled) setPageLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [courseId, user, authLoading, navigate])

  const update = (field, value) => {
    setDetails((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const applyCoupon = async () => {
    const code = couponInput.trim()
    if (!code || !course) return
    setCouponBusy(true)
    try {
      const r = await previewCoupon(code, Number(course.price || 0))
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

  const validate = () => {
    const e = {}
    if (!details.fullName.trim()) e.fullName = 'Full name is required'
    if (!details.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(details.phone.trim())) e.phone = 'Enter a valid 10-digit phone number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const failPay = (msg) => {
    setPayStatus('error')
    toast.error(msg)
    setTimeout(() => setPayStatus('idle'), 1500)
  }

  const handlePay = () => {
    if (!course) return
    if (loading) return
    if (!validate()) {
      const firstError = document.querySelector('.input-group.input-error input')
      firstError?.focus()
      failPay('Please correct the highlighted fields before paying')
      return
    }
    setPayStatus('loading')

    if (course.free) {
      addEnrollment({ userId: user.id, courseId: course.id })
        .then(() => {
          setPayStatus('success')
          toast.success(`Enrolled in ${course.title}`)
          sendCourseEmail({
            customerName: details.fullName,
            customerEmail: user.email,
            orderId: `FREE-${course.id}`,
            courseTitle: course.title,
            total: 0,
          })
          navigate('/my-courses')
        })
        .catch((err) => failPay(err?.message || 'Could not enroll'))
      return
    }

    payAndVerify({
      kind: 'course',
      courseId: course.id,
      couponCode: coupon?.code,
      customer: {
        name: details.fullName.trim(),
        email: user.email,
        phone: details.phone.trim(),
      },
      notes: {
        profession: details.profession.trim() || undefined,
      },
      brandName: course.title,
      onSuccess: () => {
        setPayStatus('success')
        toast.success(`Enrolled in ${course.title}`)
        sendCourseEmail({
          customerName: details.fullName,
          customerEmail: user.email,
          orderId: `COURSE-${course.id}`,
          courseTitle: course.title,
          total: grandTotal,
        })
        navigate('/my-courses')
      },
      onFailure: (msg) => {
        failPay(msg || 'Payment failed')
      },
    })
  }

  if (authLoading || pageLoading) {
    return <div className="myorders-loading"><span className="spinner" /> Loading checkout...</div>
  }
  if (!course) return null

  const price = Number(course.price || 0)
  const discount = coupon?.discount || 0
  const grandTotal = course.free ? 0 : Math.max(0, price - discount)

  return (
    <div className="checkout-page">
      <div className="container">
        <button className="checkout-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your enrollment</p>
        </div>

        <div className="checkout-grid">
          {/* Your Details Form */}
          <div className="checkout-section">
            <div className="checkout-section-header">
              <User size={20} />
              <h2>Your Details</h2>
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
                      value={details.fullName}
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
                      value={details.phone}
                      onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="checkout-field">
                <label>Profession <span className="text-muted">(optional)</span></label>
                <div className="input-group">
                  <Briefcase size={16} />
                  <input
                    type="text"
                    placeholder="e.g. Cafe owner, Barista, Student"
                    value={details.profession}
                    onChange={(e) => update('profession', e.target.value)}
                  />
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
              <div className="checkout-item">
                {course.image && <img src={course.image} alt={course.title} loading="lazy" />}
                <div className="checkout-item-info">
                  <h4>{course.title}</h4>
                  <span className="checkout-item-qty">
                    {course.duration && <><Clock size={12} /> {course.duration} · </>}
                    {course.lessons ? <><BookOpen size={12} /> {course.lessons} lessons</> : null}
                  </span>
                </div>
                <span className="checkout-item-price">
                  {course.free ? 'FREE' : `₹${price.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Coupon */}
            {!course.free && (
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
            )}

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Course price</span>
                <span>{course.free ? 'FREE' : `₹${price.toLocaleString()}`}</span>
              </div>
              {discount > 0 && (
                <div className="checkout-total-row" style={{ color: 'var(--success)' }}>
                  <span>Discount ({coupon.code})</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="checkout-total-row checkout-grand-total">
                <span>Total</span>
                <span>{course.free ? 'FREE' : `₹${grandTotal.toLocaleString()}`}</span>
              </div>
            </div>

            <SlideButton
              variant="blue"
              label={course.free ? 'Slide to Enroll' : `Slide to Pay ₹${grandTotal.toLocaleString()}`}
              onConfirm={handlePay}
              loading={loading}
              status={payStatus}
              disabled={loading}
              className="checkout-pay-btn"
            />

            <div className="checkout-sticky-mobile">
              <div className="checkout-sticky-mobile-total">
                <span>{course.free ? 'Enrollment' : 'Total'}</span>
                <strong>{course.free ? 'FREE' : `₹${grandTotal.toLocaleString()}`}</strong>
              </div>
              <button
                type="button"
                className="btn btn-blue"
                onClick={handlePay}
                disabled={loading}
              >
                {loading
                  ? 'Processing…'
                  : course.free
                    ? 'Enroll now'
                    : `Pay ₹${grandTotal.toLocaleString()}`}
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
