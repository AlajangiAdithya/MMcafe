import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getWishlist, removeFromWishlist } from '../lib/database'
import toast from 'react-hot-toast'

export default function Wishlist() {
  const { user, loading } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setPageLoading(false)
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    getWishlist(user.id)
      .then(rows => { if (!cancelled) setRows(rows) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPageLoading(false) })
    return () => { cancelled = true }
  }, [user, loading, navigate])

  const remove = async (productId) => {
    try {
      await removeFromWishlist(user.id, productId)
      setRows((prev) => prev.filter((r) => r.product_id !== productId))
    } catch (e) {
      toast.error(e.message)
    }
  }

  const moveToCart = (p) => {
    addItem(p)
    toast.success(`${p.name} added to cart`)
    remove(p.id)
  }

  if (loading || pageLoading) {
    return <div className="myorders-loading"><span className="spinner" /> Loading wishlist…</div>
  }

  return (
    <div className="myorders-page">
      <div className="container">
        <div className="myorders-header">
          <h1><Heart size={20} /> Wishlist</h1>
          <p>{rows.length} saved item{rows.length === 1 ? '' : 's'}</p>
        </div>

        {rows.length === 0 ? (
          <div className="myorders-empty">
            <Heart size={48} />
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart on any product to save it here.</p>
            <Link to="/store" className="btn btn-blue">Visit Store</Link>
          </div>
        ) : (
          <div className="products-grid">
            {rows.map((r) => {
              const p = r.products
              if (!p) return null
              return (
                <div key={r.id} className="product-card">
                  <div className="product-image">
                    {p.image
                      ? <img src={p.image} alt={p.name} loading="lazy" />
                      : <div className="detail-modal-placeholder"><Package size={32} /></div>}
                    <span className="product-badge">{p.category}</span>
                  </div>
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <span className="product-weight">{p.weight}</span>
                    <div className="product-bottom">
                      <span className="product-price">₹{p.price}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="add-to-cart-btn" onClick={() => moveToCart(p)} title="Move to cart">
                          <ShoppingCart size={14} />
                        </button>
                        <button className="add-to-cart-btn" onClick={() => remove(p.id)} title="Remove" style={{ background: 'transparent' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
