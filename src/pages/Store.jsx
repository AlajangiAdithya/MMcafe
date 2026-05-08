import { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Filter, Search, Star, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { getProducts } from '../lib/database'
import { supabase } from '../lib/supabase'
import ProductDetailModal from '../components/ProductDetailModal'
import WishlistButton from '../components/WishlistButton'
import { usePageMeta } from '../lib/usePageMeta'
import toast from 'react-hot-toast'
import Loader from '@/components/ui/loader-4'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

export default function Store() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [reviewStats, setReviewStats] = useState({})
  const [selected, setSelected] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const { addItem } = useCart()

  usePageMeta({
    title: 'The Store · Premium Coffee Beans & Powder',
    description: 'Hand-picked Karnataka coffee beans and freshly ground powders, roasted to perfection. Free shipping above ₹999.',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setLoading(false)
        setError('Taking longer than expected. Check your connection.')
      }
    }, 10000)
    getProducts()
      .then(data => {
        if (cancelled) return
        setProducts(data)
        setError(null)
      })
      .catch(err => { if (!cancelled) setError(err?.message || 'Could not load products') })
      .finally(() => {
        clearTimeout(timeoutId)
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true; clearTimeout(timeoutId) }
  }, [reloadKey])

  useEffect(() => {
    if (products.length === 0) return
    let cancelled = false
    ;(async () => {
      const ids = products.map(p => p.id)
      const { data, error } = await supabase
        .from('reviews')
        .select('product_id, rating')
        .in('product_id', ids)
        .eq('approved', true)
      if (error || cancelled) return
      const stats = {}
      for (const row of data || []) {
        const s = stats[row.product_id] || { sum: 0, count: 0 }
        s.sum += row.rating
        s.count += 1
        stats[row.product_id] = s
      }
      const final = {}
      for (const id of ids) {
        const s = stats[id]
        final[id] = s ? { avg: s.sum / s.count, count: s.count } : { avg: 0, count: 0 }
      }
      setReviewStats(final)
    })()
    return () => { cancelled = true }
  }, [products])

  const filtered = useMemo(() => products
    .filter(p => p.in_stock !== false)
    .filter(p => filter === 'all' || p.category === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
  [products, filter, search])

  const handleAdd = (e, product) => {
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="store-page">
      <div className="store-hero">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
          }}
        >
          <motion.div className="section-label" variants={fadeUp}>Our Products</motion.div>
          <motion.h1 variants={fadeUp}>The Store</motion.h1>
          <motion.p variants={fadeUp}>Hand-picked beans and freshly ground powders, roasted to perfection</motion.p>
        </motion.div>
      </div>

      <div className="store-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Loader />
          </div>
        ) : error ? (
          <div className="store-empty">
            <Package size={56} />
            <h3>Couldn't load products</h3>
            <p>{error}</p>
            <button className="btn btn-blue" onClick={() => setReloadKey(k => k + 1)} style={{ marginTop: 16 }}>
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="store-empty">
            <Package size={56} />
            <h3>No products registered yet</h3>
            <p>Our shelves are being stocked. Please check back soon.</p>
          </div>
        ) : (
          <>
            <motion.div
              className="filter-bar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Filter size={16} />
              {['all', 'beans', 'powder'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'beans' ? 'Beans' : 'Powder'}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <div className="input-group" style={{ marginBottom: 0, maxWidth: 240, padding: '8px 14px' }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </motion.div>

            <motion.div
              className="products-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
            >
              {filtered.map(product => {
                const stats = reviewStats[product.id]
                return (
                  <motion.div
                    key={product.id}
                    className="product-card clickable"
                    onClick={() => setSelected(product)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(product)
                      }
                    }}
                    variants={fadeUp}
                  >
                    <div className="product-image">
                      <img src={product.image} alt={product.name} loading="lazy" />
                      <span className="product-badge">{product.category}</span>
                      <WishlistButton productId={product.id} className="product-wishlist" />
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <span className="product-weight">{product.weight}</span>
                      {stats && stats.count > 0 && (
                        <div className="product-rating">
                          <Star size={12} fill="currentColor" />
                          <span>{stats.avg.toFixed(1)}</span>
                          <span className="text-muted">({stats.count})</span>
                        </div>
                      )}
                      <div className="product-bottom">
                        <span className="product-price">₹{product.price}</span>
                        <button
                          className="add-to-cart-btn"
                          onClick={e => handleAdd(e, product)}
                        >
                          <ShoppingCart size={14} /> Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <p>No products found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <ProductDetailModal
          product={selected}
          onClose={() => setSelected(null)}
          reviewStats={reviewStats[selected.id]}
        />
      )}
    </div>
  )
}
