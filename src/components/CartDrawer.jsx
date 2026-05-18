import { useEffect } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function CartDrawer() {
  const { items, removeItem, updateQty, total, isOpen, setIsOpen } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Lock body scroll while open + close on Escape. Pure UX polish, no
  // change to cart state or open/close semantics from the consumer side.
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, setIsOpen])

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout')
      setIsOpen(false)
      navigate('/login')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsOpen(false)
    navigate('/checkout')
  }

  if (!isOpen) return null

  return (
    <div
      className="cart-overlay"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2><ShoppingBag size={22} /> Your Cart</h2>
          <button onClick={() => setIsOpen(false)} className="icon-btn" aria-label="Close cart"><X size={22} /></button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={48} />
            <p>Your cart is empty</p>
            <Link
              to="/store"
              className="btn btn-blue btn-sm"
              onClick={() => setIsOpen(false)}
            >
              Browse Store
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} loading="lazy" width="72" height="72" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p className="cart-item-price">₹{item.price}</p>
                    <div className="qty-controls">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                      <button onClick={() => removeItem(item.id)} className="remove-btn" aria-label="Remove from cart"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
