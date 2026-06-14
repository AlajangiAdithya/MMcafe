import { useState, useEffect, useMemo, useRef } from 'react'
import { ShoppingCart, Filter, Search, Star, Package, LayoutGrid, Rows3, ArrowUpRight } from 'lucide-react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { getProducts } from '../lib/database'
import { supabase } from '../lib/supabase'
import ProductDetailModal from '../components/ProductDetailModal'
import WishlistButton from '../components/WishlistButton'
import { ProductGridSkeleton } from '../components/Skeleton'
import { usePageMeta } from '../lib/usePageMeta'
import RotatingWord from '../components/RotatingWord'
import MarqueeStrip from '../components/MarqueeStrip'
import toast from 'react-hot-toast'
import '../styles/store-cards.css'
import '../styles/premium-hero.css'

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
  const [view, setView] = useState('card') // 'card' (FCTRY-style panels) | 'grid'
  const { addItem } = useCart()

  usePageMeta({
    title: 'Buy Specialty Coffee Beans & Ground Coffee Online',
    description: 'Hand-picked single-origin Karnataka coffee beans and freshly ground powders, roasted in partnership with Bean Rove. Free shipping above ₹999 across India.',
    keywords: 'buy coffee beans online India, single origin coffee, Chikmagalur coffee, ground coffee India, specialty coffee shop, Mastermind Brews store',
    noindex: true, // hidden/prep: keep the shop out of the index until launch
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
      <header className="pg-hero">
        <div className="pg-hero-bg" aria-hidden="true" style={{ backgroundImage: 'url(/offer-beans.jpg)' }} />
        <div className="pg-hero-scrim" aria-hidden="true" />
        <motion.div
          className="pg-hero-inner"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.1 } } }}
        >
          <motion.div className="pg-eyebrow" variants={fadeUp}>Shop · Coffee Collection</motion.div>
          <motion.h1
            className="pg-title"
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
          >
            Beans &amp; powders,<br />
            <span className="siatra-roast-line"><em>roasted into</em>{' '}<RotatingWord words={['shape', 'balance', 'aroma', 'clarity']} /></span>
          </motion.h1>
          <motion.p className="pg-lede" variants={fadeUp}>
            Hand-picked single-origin from Chikmagalur, roasted with Bean Rove, the same coffee we pour at the bar, sealed fresh and shipped to your door.
          </motion.p>
          <motion.div className="pg-meta" variants={fadeUp}>
            <span><em>{productCount}</em>&nbsp;{productCount === 1 ? 'product' : 'products'} in store</span>
            <span><em>Free shipping</em>&nbsp;on ₹999+</span>
            <span><em>Roasted</em>&nbsp;weekly · shipped in 48h</span>
          </motion.div>
          <motion.div variants={fadeUp}>
            <span className="pg-scrollcue"><span className="pg-mouse" /> Browse the collection</span>
          </motion.div>
        </motion.div>
      </header>

      <MarqueeStrip
        variant="accent"
        speed={34}
        items={['Single Origin', 'Roasted Weekly', 'Chikmagalur', 'Whole Bean', 'Freshly Ground', 'Free Shipping ₹999+', 'Bean Rove', 'Sealed Fresh']}
      />

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
              <div className="fl-toggle" role="group" aria-label="Choose product view">
                <button
                  type="button"
                  className={view === 'card' ? 'is-active' : ''}
                  onClick={() => setView('card')}
                  aria-pressed={view === 'card'}
                >
                  <Rows3 size={14} aria-hidden="true" /> Cards
                </button>
                <button
                  type="button"
                  className={view === 'grid' ? 'is-active' : ''}
                  onClick={() => setView('grid')}
                  aria-pressed={view === 'grid'}
                >
                  <LayoutGrid size={14} aria-hidden="true" /> Grid
                </button>
              </div>
            </motion.div>

            {view === 'grid' ? (
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
            ) : (
              <div className="fl-list">
                {filtered.map((product, i) => (
                  <ProductPanel
                    key={product.id}
                    product={product}
                    index={i}
                    stats={reviewStats[product.id]}
                    onOpen={() => setSelected(product)}
                    onAdd={(e) => handleAdd(e, product)}
                  />
                ))}
              </div>
            )}

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

/* ------------------------------------------------------------------
   ProductPanel, full-width editorial "card" (FCTRY-Lab style):
   a numbered header row over a large media + detail block. The media
   clip-reveals and parallaxes as the panel scrolls into view. Panels
   alternate image side via CSS :nth-child for rhythm.
   ------------------------------------------------------------------ */
function ProductPanel({ product, index, stats, onOpen, onAdd }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-7%', '7%'])
  const num = String(index + 1).padStart(2, '0')
  const meta = [product.weight, product.category].filter(Boolean).join(' · ')

  return (
    <article className="fl-panel">
      <button type="button" className="fl-row" onClick={onOpen} aria-label={`View ${product.name}`}>
        <span className="fl-idx">{num}.</span>
        <span className="fl-row-name">{product.name}</span>
        <span className="fl-row-meta">
          {meta || 'Coffee'}
          {stats && stats.count > 0 && <> · {stats.avg.toFixed(1)}★</>}
        </span>
      </button>

      <div className="fl-body">
        <motion.div
          ref={ref}
          className="fl-media"
          onClick={onOpen}
          initial={reduced ? { opacity: 0 } : { clipPath: 'inset(10% 10% 10% 10% round 16px)', opacity: 0.4 }}
          whileInView={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1 }}
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {product.image ? (
            <motion.img src={product.image} alt={product.name} style={{ y: imgY, scale: 1.1 }} loading="lazy" />
          ) : (
            <div className="fl-media-placeholder"><Package size={42} /></div>
          )}
          <span className="fl-tag">{product.category}</span>
          <WishlistButton productId={product.id} className="fl-wish" />
        </motion.div>

        <div className="fl-detail">
          <span className="fl-detail-cat">{product.category || 'Specialty Coffee'}</span>
          <h3 className="fl-detail-name">{product.name}</h3>
          {product.description && <p className="fl-detail-desc">{product.description}</p>}
          {stats && stats.count > 0 && (
            <div className="fl-detail-rating">
              <Star size={13} fill="currentColor" />
              <span>{stats.avg.toFixed(1)}</span>
              <span className="fl-detail-rating-count">({stats.count} {stats.count === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
          <div className="fl-detail-foot">
            <span className="fl-detail-price">₹{product.price}</span>
            <div className="fl-detail-actions">
              <button className="fl-add" onClick={onAdd} aria-label={`Add ${product.name} to cart`}>
                <ShoppingCart size={15} /> Add to cart
              </button>
              <button className="fl-view" onClick={onOpen} aria-label={`View ${product.name} details`}>
                Details <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
