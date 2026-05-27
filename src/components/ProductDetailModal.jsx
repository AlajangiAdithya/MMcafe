import { useEffect, useMemo, useState } from 'react'
import { X, ShoppingCart, Package, Tag, Star } from 'lucide-react'
import ProductReviews from './ProductReviews'
import WishlistButton from './WishlistButton'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { pushRecentProduct } from '../lib/useRecentlyViewed'

export default function ProductDetailModal({ product, onClose, reviewStats, allProducts = [] }) {
  const { addItem } = useCart()

  const related = useMemo(() => {
    if (!product || !Array.isArray(allProducts) || allProducts.length === 0) return []
    return allProducts
      .filter((p) => p.id !== product.id && p.category === product.category && p.in_stock !== false)
      .slice(0, 4)
  }, [product, allProducts])

  // Build the gallery: prefer `product.images[]` when populated, otherwise
  // fall back to the single `product.image`. De-dupe so the same URL doesn't
  // show twice when an admin sets both fields.
  const gallery = useMemo(() => {
    const list = []
    if (Array.isArray(product?.images)) list.push(...product.images.filter(Boolean))
    if (product?.image) list.push(product.image)
    return Array.from(new Set(list))
  }, [product?.id, product?.image, product?.images])

  const [activeImg, setActiveImg] = useState(0)
  useEffect(() => { setActiveImg(0) }, [product?.id])

  // Record this open for "Recently viewed" on Home.
  useEffect(() => {
    if (product?.id != null) pushRecentProduct(product.id)
  }, [product?.id])

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
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <button type="button" className="detail-modal-close" onClick={onClose} aria-label="Close product details">
            <X size={20} />
          </button>

          <div className="detail-modal-media">
            {gallery.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={gallery[activeImg]}
                    src={gallery[activeImg]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  />
                </AnimatePresence>
                {gallery.length > 1 && (
                  <div className="gallery-thumbs" role="tablist" aria-label="Product images">
                    {gallery.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        role="tab"
                        aria-selected={activeImg === i}
                        className={`gallery-thumb ${activeImg === i ? 'active' : ''}`}
                        onClick={() => setActiveImg(i)}
                      >
                        <img src={src} alt={`${product.name} ${i + 1}`} loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </>
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

            {related.length > 0 && (
              <div className="detail-modal-section">
                <h3>You might also like</h3>
                <div className="related-products-row">
                  {related.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="related-product-card"
                      onClick={() => {
                        addItem(p)
                        toast.success(`${p.name} added to cart`)
                      }}
                    >
                      {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <div className="related-product-img-empty"><Package size={20} /></div>}
                      <div className="related-product-info">
                        <span className="related-product-name">{p.name}</span>
                        <span className="related-product-price">₹{p.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-modal-section">
              <ProductReviews productId={product.id} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
