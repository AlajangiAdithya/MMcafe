import { useRef } from 'react'
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from 'framer-motion'

/* Wrap v into [min, max) so the track loops seamlessly. */
const wrap = (min, max, v) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

/**
 * VelocityMarquee — a big typographic band that drifts sideways on its own
 * and speeds up / reverses with the user's scroll velocity (the classic
 * awwwards "scroll-reactive marquee").
 *
 * The children are rendered four times inside one track; the track is
 * translated in % and wrapped at -25% so the loop is seamless. Static for
 * reduced-motion users.
 *
 * Props:
 *   baseVelocity — %-of-track per second at rest (default 2.4)
 *   className    — skin classes, e.g. "vmq--outline" / "vmq--ink"
 */
export default function VelocityMarquee({ children, baseVelocity = 2.4, className = '' }) {
  const reduced = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false })
  const directionRef = useRef(1)
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`)

  useAnimationFrame((t, delta) => {
    if (reduced) return
    let moveBy = directionRef.current * baseVelocity * (delta / 1000)
    const vf = velocityFactor.get()
    if (vf < 0) directionRef.current = -1
    else if (vf > 0) directionRef.current = 1
    moveBy += directionRef.current * moveBy * Math.abs(vf)
    baseX.set(baseX.get() + moveBy)
  })

  return (
    <div className={`vmq ${className}`.trim()} aria-hidden="true">
      <motion.div className="vmq-track" style={reduced ? undefined : { x }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="vmq-copy">{children}</span>
        ))}
      </motion.div>
    </div>
  )
}
