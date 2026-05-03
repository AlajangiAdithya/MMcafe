import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, Package, ShoppingBag, ArrowRight } from 'lucide-react'

export default function OrderConfirmation() {
  const location = useLocation()
  const { paymentId, total, itemCount } = location.state || {}

  return (
    <div className="order-confirmation">
      <div className="container">
        <div className="confirmation-card">
          <div className="confirmation-icon">
            <CheckCircle size={64} />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p className="confirmation-desc">
            Thank you for your order. We'll start preparing it right away.
          </p>

          {paymentId && (
            <div className="confirmation-details">
              <div className="confirmation-detail">
                <span>Payment ID</span>
                <strong>{paymentId}</strong>
              </div>
              {total && (
                <div className="confirmation-detail">
                  <span>Amount Paid</span>
                  <strong>₹{total.toLocaleString()}</strong>
                </div>
              )}
              {itemCount && (
                <div className="confirmation-detail">
                  <span>Items</span>
                  <strong>{itemCount} item(s)</strong>
                </div>
              )}
            </div>
          )}

          <div className="confirmation-info">
            <Package size={18} />
            <p>You'll receive an order confirmation email shortly with tracking details.</p>
          </div>

          <div className="confirmation-actions">
            <Link to="/store" className="btn btn-primary">
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
            <Link to="/" className="btn btn-outline">
              Go Home <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
