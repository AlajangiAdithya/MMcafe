import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ShoppingBag, ChevronDown, ChevronUp, MapPin, CheckCircle2, Circle, XCircle, Truck, Inbox } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getOrdersForUser } from '../lib/database'

const TIMELINE_STEPS = [
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'processing', label: 'Processing', icon: Inbox },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Package },
]

function OrderTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="order-timeline order-timeline-cancelled" aria-label="Order cancelled">
        <XCircle size={16} />
        <span>Order cancelled</span>
      </div>
    )
  }
  const activeIndex = TIMELINE_STEPS.findIndex((s) => s.id === status)
  const safeIndex = activeIndex === -1 ? 0 : activeIndex
  return (
    <ol className="order-timeline" aria-label={`Status: ${status}`}>
      {TIMELINE_STEPS.map((step, i) => {
        const Icon = step.icon
        const done = i < safeIndex
        const current = i === safeIndex
        return (
          <li
            key={step.id}
            className={`order-timeline-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}
          >
            <span className="order-timeline-dot">
              {done || current ? <Icon size={14} /> : <Circle size={12} />}
            </span>
            <span className="order-timeline-label">{step.label}</span>
            {i < TIMELINE_STEPS.length - 1 && (
              <span className="order-timeline-bar" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default function MyOrders() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setDataLoading(false)
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    getOrdersForUser(user.id)
      .then(rows => { if (!cancelled) setOrders(rows) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setDataLoading(false) })
    return () => { cancelled = true }
  }, [user, loading, navigate])

  if (loading || dataLoading) {
    return <div className="myorders-loading"><span className="spinner" /> Loading orders...</div>
  }

  return (
    <div className="myorders-page">
      <div className="container">
        <div className="myorders-header">
          <h1>My Orders</h1>
          <p>{orders.length} order{orders.length === 1 ? '' : 's'}</p>
        </div>

        {orders.length === 0 ? (
          <div className="myorders-empty">
            <ShoppingBag size={48} />
            <h3>No orders yet</h3>
            <p>Browse the store and place your first order.</p>
            <Link to="/store" className="btn btn-blue">Visit Store</Link>
          </div>
        ) : (
          <ul className="myorders-list">
            {orders.map(o => {
              const items = o.items || []
              const addr = o.shipping_address || {}
              const open = expanded === o.id
              return (
                <li key={o.id} className="myorders-card">
                  <div className="myorders-row">
                    <div className="myorders-id">
                      <Package size={18} />
                      <div>
                        <strong>Order #{o.id}</strong>
                        <span>{new Date(o.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="myorders-meta">
                      <span className={`status-badge status-${o.status}`}>{o.status}</span>
                      <span className="myorders-total">₹{(o.total || 0).toLocaleString()}</span>
                      <button
                        className="myorders-toggle"
                        onClick={() => setExpanded(open ? null : o.id)}
                        aria-label="Toggle details"
                      >
                        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="myorders-details">
                      <div className="myorders-details-section">
                        <h4>Status</h4>
                        <OrderTimeline status={o.status} />
                      </div>
                      <div className="myorders-details-section">
                        <h4>Items</h4>
                        <ul>
                          {items.map((it, i) => (
                            <li key={i} className="myorders-item">
                              {it.image && <img src={it.image} alt={it.name} />}
                              <div className="myorders-item-info">
                                <span>{it.name}</span>
                                <small>Qty: {it.qty}</small>
                              </div>
                              <span>₹{(it.price * it.qty).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="myorders-details-section">
                        <h4><MapPin size={14} /> Shipping</h4>
                        <p>{addr.fullName}</p>
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>{addr.line2}</p>}
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                        {addr.phone && <p>Phone: {addr.phone}</p>}
                        {o.payment_id && <p className="myorders-payid">Payment: <code>{o.payment_id}</code></p>}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
