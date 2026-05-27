import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion, animate } from 'framer-motion'
import { MOTION } from '../lib/motionConfig'

/**
 * CountUp — animates from `from` → `to` when the element scrolls into view.
 * Preserves any prefix / suffix the parent already shows.
 *
 * Usage:
 *   <CountUp to={4.8} decimals={1} />           // "4.8"
 *   <CountUp to={1400} suffix="m" />            // "1,400m"
 *   <CountUp to={5} pad={2} />                  // "05"
 */
export default function CountUp({
  to,
  from = 0,
  duration = MOTION.countUp.duration,
  decimals = 0,
  pad = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className = '',
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-30%' })
  const reduced = useReducedMotion()
  const [value, setValue] = useState(() => (reduced ? to : from))

  useEffect(() => {
    if (!isInView || reduced) return
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    })
    return () => controls.stop()
  }, [isInView, from, to, duration, reduced])

  const formatted = formatNumber(value, { decimals, pad, separator })

  return (
    <span ref={ref} className={`count-up ${className}`.trim()}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

function formatNumber(value, { decimals, pad, separator }) {
  const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()
  if (pad > 0 && decimals === 0) {
    return fixed.padStart(pad, '0')
  }
  // Group thousands
  const [intPart, decPart] = fixed.split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return decPart != null ? `${grouped}.${decPart}` : grouped
}
