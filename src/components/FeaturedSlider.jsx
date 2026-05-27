import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ShoppingBag, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function FeaturedSlider({ products = [], autoplayMs = 5200 }) {
  const { addItem } = useCart()
  const prefersReducedMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = products.length
  const dragX = useRef(0)
  const dragging = useRef(false)
  const dragOriginX = useRef(0)
  const trackRef = useRef(null)

  const go = useCallback(
    (n) => {
      if (total === 0) return
      setIndex(((n % total) + total) % total)
    },
    [total],
  )
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  useEffect(() => {
    if (prefersReducedMotion || paused || total < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % total), autoplayMs)
    return () => clearInterval(id)
  }, [paused, total, autoplayMs, prefersReducedMotion])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    const node = trackRef.current
    if (!node) return
    node.addEventListener('keydown', onKey)
    return () => node.removeEventListener('keydown', onKey)
  }, [next, prev])

  if (total === 0) return null
  const current = products[index]

  function onPointerDown(e) {
    dragging.current = true
    dragOriginX.current = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
    dragX.current = 0
  }
  function onPointerMove(e) {
    if (!dragging.current) return
    const x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
    dragX.current = x - dragOriginX.current
  }
  function onPointerUp() {
    if (!dragging.current) return
    dragging.current = false
    const dx = dragX.current
    if (Math.abs(dx) > 60) {
      if (dx < 0) next()
      else prev()
    }
    dragX.current = 0
  }

  const peekLeft = products[(index - 1 + total) % total]
  const peekRight = products[(index + 1) % total]

  return (
    <div
      className="fs-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        type="button"
        className="fs-arrow fs-arrow--prev"
        onClick={prev}
        aria-label="Previous product"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        className="fs-track"
        ref={trackRef}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        {total > 1 && (
          <div className="fs-peek fs-peek--left" aria-hidden="true">
            <SliderCard product={peekLeft} variant="peek" />
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            className="fs-slide"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -22, scale: 0.97 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <SliderCard product={current} onAdd={() => { addItem(current); toast.success(`${current.name} added`) }} />
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <div className="fs-peek fs-peek--right" aria-hidden="true">
            <SliderCard product={peekRight} variant="peek" />
          </div>
        )}
      </div>

      <button
        type="button"
        className="fs-arrow fs-arrow--next"
        onClick={next}
        aria-label="Next product"
      >
        <ChevronRight size={20} />
      </button>

      <div className="fs-dots" role="tablist" aria-label="Featured products pagination">
        {products.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`fs-dot ${i === index ? 'is-active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Show product ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function SliderCard({ product, onAdd, variant }) {
  const isPeek = variant === 'peek'
  return (
    <article className={`fs-card ${isPeek ? 'fs-card--peek' : ''}`}>
      <div className="fs-card-media">
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" draggable={false} />
        ) : (
          <div className="fs-card-placeholder"><Package size={36} /></div>
        )}
        <span className="fs-card-tag">{product.category}</span>
      </div>
      <div className="fs-card-body">
        <h3 className="fs-card-title">{product.name}</h3>
        {product.weight && <p className="fs-card-weight">{product.weight}</p>}
        {product.description && (
          <p className="fs-card-desc">{product.description}</p>
        )}
        <div className="fs-card-foot">
          <span className="fs-card-price">₹{product.price}</span>
          {!isPeek && (
            <button
              type="button"
              className="fs-card-add"
              onClick={onAdd}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={16} /> Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
