import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

function StackCard({ children, index, total, progress, prefersReducedMotion }) {
  const start = index / total
  const end = Math.min(1, (index + 1) / total)
  // Each card (except the topmost / last) scales down + lifts as the next slides over it.
  const targetScale = 1 - (total - index - 1) * 0.05
  const scale = useTransform(
    progress,
    [start, end],
    prefersReducedMotion ? [1, 1] : [1, targetScale],
  )
  const y = useTransform(
    progress,
    [start, end],
    prefersReducedMotion ? [0, 0] : [0, -28],
  )

  // Each card sticks at a slightly different top offset so the stack
  // shows a peek of the card underneath as it lands.
  const stickyTop = `calc(10vh + ${index * 22}px)`

  return (
    <div className="stack-card-wrap">
      <motion.div
        className="stack-card"
        style={{ scale, y, top: stickyTop }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default function StackCards({ children, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const prefersReducedMotion = useReducedMotion()
  const items = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean)
  return (
    <div
      ref={ref}
      className={`stack-cards ${className}`}
      style={{ '--stack-count': items.length }}
    >
      {items.map((child, i) => (
        <StackCard
          key={i}
          index={i}
          total={items.length}
          progress={scrollYProgress}
          prefersReducedMotion={prefersReducedMotion}
        >
          {child}
        </StackCard>
      ))}
    </div>
  )
}
