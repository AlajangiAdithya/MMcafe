import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

/**
 * RotatingWord, cravburgers.shop-style flipping word. Cycles through a
 * list of words with a vertical roll/flip so a headline can read e.g.
 * "roasted into shape → balance → aroma". Pauses for reduced-motion.
 *
 * Props:
 *   words, string[]
 *   interval, ms between flips (default 1900)
 *   className
 */
export default function RotatingWord({ words = [], interval = 1900, className = '' }) {
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || words.length <= 1) return
    const id = setInterval(() => setI((p) => (p + 1) % words.length), interval)
    return () => clearInterval(id)
  }, [words.length, interval, reduced])

  const word = words[i] ?? ''

  return (
    <span className={`rotating-word ${className}`.trim()}>
      {/* Reserve width with an invisible sizer using the longest word so the
          layout never jumps as words swap. */}
      <span className="rotating-word-sizer" aria-hidden="true">
        {words.reduce((a, b) => (b.length > a.length ? b : a), '')}
      </span>
      {/* No mode="wait": the entering and exiting words overlap in the same
          grid cell so there is never an empty frame between flips. */}
      <AnimatePresence initial={false}>
        <motion.span
          key={word}
          className="rotating-word-inner"
          aria-live="polite"
          initial={reduced ? false : { y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: '-110%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
