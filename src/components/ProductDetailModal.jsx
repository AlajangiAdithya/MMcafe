import { useEffect } from 'react'
import { X, ShoppingCart, Package, Tag, Star } from 'lucide-react'
import ProductReviews from './ProductReviews'
import WishlistButton from './WishlistButton'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProductDetailModal({ product, onClose, reviewStats }) {
  const { addItem } = useCart()

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!product) return null

  const stats = reviewStats || null

  const handleAdd = () => {
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="detail-modal-overlay" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="detail-modal" 
          onClick={e => e.stopPropagation()}
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <button className="detail-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>

          <div className="detail-modal-media">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="detail-modal-placeholder"><Package size={48} /></div>
            )}
          </div>

          <div className="detail-modal-body">
            <div className="detail-modal-badges">
              {product.category && (
                <span className="detail-chip"><Tag size={12} /> {product.category}</span>
              )}
              {product.weight && <span className="detail-chip">{product.weight}</span>}
              {product.in_stock === false ? (
                <span className="detail-chip detail-chip-danger">Out of stock</span>
              ) : (
                <span className="detail-chip detail-chip-success">In stock</span>
              )}
            </div>

            <h2 className="detail-modal-title">{product.name}</h2>

            {stats && stats.count > 0 && (
              <div className="detail-modal-rating">
                <Star size={14} fill="currentColor" />
                <strong>{stats.avg.toFixed(1)}</strong>
                <span className="text-muted">({stats.count} review{stats.count === 1 ? '' : 's'})</span>
              </div>
            )}

            <div className="detail-modal-price">₹{Number(product.price || 0).toLocaleString()}</div>

            {product.description && (
              <div className="detail-modal-section">
                <h3>About this product</h3>
                <p className="detail-modal-desc">{product.description}</p>
              </div>
            )}

            <div className="detail-modal-actions" style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-gold full-width"
                onClick={handleAdd}
                disabled={product.in_stock === false}
              >
                <ShoppingCart size={16} />
                {product.in_stock === false ? 'Out of stock' : 'Add to cart'}
              </button>
              <WishlistButton productId={product.id} className="wishlist-btn-lg" size={20} stopProp={false} />
            </div>

            <div className="detail-modal-section">
              <ProductReviews productId={product.id} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
