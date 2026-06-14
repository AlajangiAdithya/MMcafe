import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, useScroll, useMotionValue, useMotionValueEvent } from 'framer-motion'

/**
 * HeroDockLogo, drop this at the top of a page hero. It renders the big
 * brand mark in place AND reserves its layout space. The global
 * <ScrollDockLogo/> finds it (via [data-dock-hero]) and animates a
 * fixed copy from here up into the navbar as the page scrolls.
 */
export function HeroDockLogo({ alt = '' }) {
  return (
    <div className="hero-dock-logo" data-dock-hero>
      <img className="hero-dock-logo-img" src="/logo.png" alt={alt} width="200" height="200" />
    </div>
  )
}

const lerp = (a, b, t) => a + (b - a) * t
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

/**
 * ScrollDockLogo, lulacafe.com-style shared-element logo.
 *
 * A single position:fixed logo rides the hero mark up into the navbar
 * slot as you scroll, shrinking and drifting to the nav position, then
 * docks. Scrolling back up reverses it (it's purely scroll-linked).
 * Disabled on small screens and when reduced-motion is requested.
 */
export default function ScrollDockLogo() {
  const location = useLocation()
  const { scrollY } = useScroll()
  const rectsRef = useRef(null)
  const [active, setActive] = useState(false)

  const left = useMotionValue(0)
  const top = useMotionValue(0)
  const size = useMotionValue(0)

  const apply = useCallback((s) => {
    const r = rectsRef.current
    if (!r) return
    const p = clamp01(s / r.dist)
    const sz = lerp(r.start.size, r.end.size, p)
    const cx = lerp(r.start.cx, r.end.cx, p)
    const cy = lerp(r.start.cy, r.end.cy, p) // start.cy is absolute, end.cy is viewport
    size.set(sz)
    left.set(cx - sz / 2)
    top.set(cy - sz / 2)
  }, [left, top, size])

  const measure = useCallback(() => {
    if (typeof window === 'undefined') return false
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const heroImg = document.querySelector('[data-dock-hero] img')
    const navImg = document.querySelector('[data-dock-target]')
    if (!heroImg || !navImg || window.innerWidth < 768 || reduce) {
      rectsRef.current = null
      setActive(false)
      document.body.classList.remove('dock-active')
      return false
    }
    const h = heroImg.getBoundingClientRect()
    const n = navImg.getBoundingClientRect()
    const scroll = window.scrollY || 0
    const start = {
      cx: h.left + h.width / 2,
      cy: h.top + h.height / 2 + scroll, // absolute document Y
      size: h.width,
    }
    const end = {
      cx: n.left + n.width / 2,
      cy: n.top + n.height / 2, // navbar is fixed → viewport Y
      size: n.width,
    }
    const dist = Math.max(start.cy - end.cy, 1)
    rectsRef.current = { start, end, dist }
    setActive(true)
    document.body.classList.add('dock-active')
    apply(scroll)
    return true
  }, [apply])

  useMotionValueEvent(scrollY, 'change', apply)

  // Re-measure on navigation. Lazy routes mount after Suspense resolves,
  // so retry a few times until the hero slot exists (or give up → inactive).
  useEffect(() => {
    let cancelled = false
    const delays = [0, 60, 150, 320, 650, 1100]
    const timers = delays.map((d) =>
      window.setTimeout(() => { if (!cancelled) measure() }, d),
    )
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [location.pathname, measure])

  useEffect(() => {
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      document.body.classList.remove('dock-active')
    }
  }, [measure])

  if (!active) return null

  return (
    <motion.div className="scroll-dock-logo" style={{ left, top, width: size, height: size }} aria-hidden="true">
      <img src="/logo.png" alt="" />
    </motion.div>
  )
}
