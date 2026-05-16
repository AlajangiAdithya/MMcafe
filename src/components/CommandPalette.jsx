import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, BookOpen, Package, Newspaper, Compass, Coffee } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProducts, getCourses, getPublishedBlogPosts } from '../lib/database'

// Static route index so the palette can navigate even when DB is empty.
const STATIC_ITEMS = [
  { id: 'page-home', kind: 'page', title: 'Home', href: '/', icon: Compass },
  { id: 'page-store', kind: 'page', title: 'Store', subtitle: 'Browse coffee', href: '/store', icon: Package },
  { id: 'page-workshop', kind: 'page', title: 'Workshop', subtitle: 'Barista academy', href: '/workshop', icon: BookOpen },
  { id: 'page-consultancy', kind: 'page', title: 'Consultancy', href: '/consultancy', icon: Compass },
  { id: 'page-blog', kind: 'page', title: 'Blog', href: '/blog', icon: Newspaper },
  { id: 'page-baristas', kind: 'page', title: 'Hire Baristas', href: '/baristas', icon: Coffee },
  { id: 'page-about', kind: 'page', title: 'About Us', href: '/about', icon: Compass },
  { id: 'page-contact', kind: 'page', title: 'Contact', href: '/contact', icon: Compass },
]

const fmtPrice = (p) => (p === 0 ? 'Free' : `₹${Number(p).toLocaleString()}`)

let dataCache = null
let dataPromise = null

async function loadAll() {
  if (dataCache) return dataCache
  if (dataPromise) return dataPromise
  dataPromise = Promise.all([
    getProducts().catch(() => []),
    getCourses().catch(() => []),
    getPublishedBlogPosts().catch(() => []),
  ]).then(([products, courses, posts]) => {
    dataCache = { products, courses, posts }
    return dataCache
  })
  return dataPromise
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [data, setData] = useState({ products: [], courses: [], posts: [] })
  const [active, setActive] = useState(0)

  // Load data lazily on first open. Cached for subsequent opens.
  useEffect(() => {
    if (!open) return
    loadAll().then((d) => setData(d))
    setQuery('')
    setActive(0)
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.body.style.overflow = prev
    }
  }, [open])

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const products = data.products.map((p) => ({
      id: `product-${p.id}`,
      kind: 'product',
      title: p.name,
      subtitle: `${p.category}${p.weight ? ' · ' + p.weight : ''} · ${fmtPrice(p.price)}`,
      href: '/store',
      icon: Package,
      hay: `${p.name} ${p.category} ${p.weight || ''}`.toLowerCase(),
    }))
    const courses = data.courses.map((c) => ({
      id: `course-${c.id}`,
      kind: 'course',
      title: c.title,
      subtitle: `${c.level || 'Course'} · ${c.free ? 'Free' : fmtPrice(c.price)}`,
      href: `/course/${c.id}`,
      icon: BookOpen,
      hay: `${c.title} ${c.description || ''} ${c.level || ''}`.toLowerCase(),
    }))
    const posts = data.posts.map((p) => ({
      id: `post-${p.id}`,
      kind: 'post',
      title: p.title,
      subtitle: p.excerpt || 'Blog post',
      href: `/blog/${p.slug}`,
      icon: Newspaper,
      hay: `${p.title} ${p.excerpt || ''}`.toLowerCase(),
    }))
    const all = [...STATIC_ITEMS.map((s) => ({ ...s, hay: s.title.toLowerCase() })), ...products, ...courses, ...posts]
    if (!q) return all.slice(0, 12)
    return all.filter((it) => it.hay.includes(q)).slice(0, 12)
  }, [query, data])

  useEffect(() => {
    if (active >= items.length) setActive(0)
  }, [items, active])

  const go = useCallback((item) => {
    if (!item) return
    onClose?.()
    navigate(item.href)
  }, [navigate, onClose])

  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(items.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(items[active])
    } else if (e.key === 'Escape') {
      onClose?.()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmdk-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="cmdk-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          >
            <div className="cmdk-input-row">
              <Search size={18} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder="Search products, courses, posts…"
                aria-label="Search"
              />
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search">
                <X size={18} />
              </button>
            </div>
            <ul className="cmdk-list">
              {items.length === 0 ? (
                <li className="cmdk-empty">No results for &ldquo;{query}&rdquo;</li>
              ) : (
                items.map((it, i) => {
                  const Icon = it.icon
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        className={`cmdk-item ${i === active ? 'active' : ''}`}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(it)}
                      >
                        <span className="cmdk-item-icon"><Icon size={16} /></span>
                        <span className="cmdk-item-body">
                          <span className="cmdk-item-title">{it.title}</span>
                          {it.subtitle && <span className="cmdk-item-sub">{it.subtitle}</span>}
                        </span>
                        <span className="cmdk-item-kind">{it.kind}</span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
            <div className="cmdk-foot">
              <kbd>↑↓</kbd> navigate <kbd>↵</kbd> go <kbd>esc</kbd> close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
