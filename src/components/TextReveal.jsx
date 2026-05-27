import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

function Word({ children, range, progress, prefersReducedMotion }) {
  const opacity = useTransform(progress, range, prefersReducedMotion ? [1, 1] : [0.18, 1])
  const y = useTransform(progress, range, prefersReducedMotion ? [0, 0] : [12, 0])
  return (
    <motion.span className="tr-word" style={{ opacity, y }}>
      {children}&nbsp;
    </motion.span>
  )
}

/**
 * TextReveal — scroll-driven word-by-word reveal. The container becomes
 * tall so the page scroll drives each word in/out of focus.
 */
export default function TextReveal({ text, className = '' }) {
  const ref = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.4'],
  })
  const words = text.split(' ')
  return (
    <p ref={ref} className={`tr-paragraph ${className}`}>
      {words.map((w, i) => {
        const start = i / words.length
        const end = start + 1 / words.length
        return (
          <Word
            key={i}
            range={[start, end]}
            progress={scrollYProgress}
            prefersReducedMotion={prefersReducedMotion}
          >
            {w}
          </Word>
        )
      })}
    </p>
  )
}
