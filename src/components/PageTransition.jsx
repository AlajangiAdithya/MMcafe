// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion'
import { MOTION } from '../lib/motionConfig'

/**
 * PageTransition, wraps a route's content in a fade + slight blur in/out.
 * Used together with AnimatePresence mode="wait" inside <Routes>.
 *
 * Pure visual layer. Does not affect routing, scroll-restoration, or focus.
 * Reduced-motion users get an instant swap (no animation).
 */
export default function PageTransition({ children }) {
  const reduced = useReducedMotion()

  const initial = reduced ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }
  const animate = reduced
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: 'blur(0px)' }
  const exit = reduced
    ? { opacity: 1 }
    : { opacity: 0, y: -8, filter: 'blur(4px)' }
  const transition = reduced
    ? { duration: 0 }
    : { duration: MOTION.page.duration, ease: MOTION.ease.out }

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  )
}
