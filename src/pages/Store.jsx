import { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Filter, Search, Star, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { getProducts } from '../lib/database'
import { supabase } from '../lib/supabase'
import ProductDetailModal from '../components/ProductDetailModal'
import WishlistButton from '../components/WishlistButton'
import { ProductGridSkeleton } from '../components/Skeleton'
import { usePageMeta } from '../lib/usePageMeta'
import toast from 'react-hot-toast'

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
    title: 'Buy Specialty Coffee Beans & Ground Coffee Online',
    description: 'Hand-picked single-origin Karnataka coffee beans and freshly ground powders, roasted in partnership with Bean Rove. Free shipping above ₹999 across India.',
    keywords: 'buy coffee beans online India, single origin coffee, Chikmagalur coffee, ground coffee India, specialty coffee shop, Mastermind Brews store',
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

  const productCount = filtered.length

  return (
    <div className="store-page store-page--siatra">
      <header className="siatra-hero">
        <div className="siatra-hero-inner">
          <motion.span
            className="siatra-hero-eyebrow"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="siatra-hero-eyebrow-line" />
            Shop · Coffee Collection
            <span className="siatra-hero-eyebrow-line" />
          </motion.span>
          <motion.h1
            className="siatra-hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            Beans & powders, <em>roasted into shape.</em>
          </motion.h1>
          <motion.p
            className="siatra-hero-lede"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            Hand-picked single-origin from Chikmagalur, roasted with Bean Rove.
            The same coffee we pour at the bar — sealed fresh, shipped to your door.
          </motion.p>
          <motion.div
            className="siatra-hero-meta"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <span><em>{productCount}</em> {productCount === 1 ? 'product' : 'products'} in store</span>
            <span><em>Free shipping</em> on orders ₹999+</span>
            <span><em>Roasted</em> weekly · shipped within 48h</span>
          </motion.div>
        </div>
      </header>

      <div className="siatra-shell">
        {loading ? (
          <ProductGridSkeleton count={8} />
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
              className="siatra-controls"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32 }}
            >
              <div className="siatra-filter">
                <span id="siatra-filter-label" className="siatra-filter-label"><Filter size={13} aria-hidden="true" /> Filter</span>
                <div className="siatra-filter-chips" role="group" aria-labelledby="siatra-filter-label">
                  {['all', 'beans', 'powder'].map(f => (
                    <button
                      type="button"
                      key={f}
                      className={`siatra-chip ${filter === f ? 'is-active' : ''}`}
                      onClick={() => setFilter(f)}
                      aria-pressed={filter === f}
                    >
                      {f === 'all' ? 'All' : f === 'beans' ? 'Whole Bean' : 'Ground'}
                    </button>
                  ))}
                </div>
              </div>
              <label className="siatra-search">
                <span className="visually-hidden">Search products</span>
                <Search size={14} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search the collection"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search products"
                />
              </label>
            </motion.div>

            <motion.div
              className="siatra-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
            >
              {filtered.map((product, i) => {
                const stats = reviewStats[product.id]
                return (
                  <motion.article
                    key={product.id}
                    className="siatra-card"
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
                    <div className="siatra-card-media">
                      {product.image ? (
                        <img src={product.image} alt={product.name} loading="lazy" />
                      ) : (
                        <div className="siatra-card-placeholder"><Package size={36} /></div>
                      )}
                      <span className="siatra-card-num">0{(i + 1).toString().slice(-2)}</span>
                      <span className="siatra-card-tag">{product.category}</span>
                      <WishlistButton productId={product.id} className="siatra-card-wish" />
                      <div className="siatra-card-shade" aria-hidden="true" />
                    </div>
                    <div className="siatra-card-body">
                      <div className="siatra-card-head">
                        <h3 className="siatra-card-name">{product.name}</h3>
                        {product.weight && <span className="siatra-card-weight">{product.weight}</span>}
                      </div>
                      {stats && stats.count > 0 && (
                        <div className="siatra-card-rating">
                          <Star size={11} fill="currentColor" />
                          <span>{stats.avg.toFixed(1)}</span>
                          <span className="siatra-card-rating-count">({stats.count})</span>
                        </div>
                      )}
                      <div className="siatra-card-foot">
                        <span className="siatra-card-price">₹{product.price}</span>
                        <button
                          className="siatra-card-add"
                          onClick={e => handleAdd(e, product)}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart size={13} /> Add
                        </button>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </motion.div>

            {filtered.length === 0 && (
              <div className="siatra-empty">
                <p>No products match {search ? <>“<strong>{search}</strong>”</> : 'this filter'}.</p>
                {(search || filter !== 'all') && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setSearch(''); setFilter('all') }}
                    style={{ marginTop: 14 }}
                  >
                    Clear filters
                  </button>
                )}
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
          allProducts={products}
        />
      )}
    </div>
  )
}
