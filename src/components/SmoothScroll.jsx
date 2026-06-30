import { useEffect } from 'react'
import Lenis from 'lenis'
import { MOTION } from '../lib/motionConfig'

/**
 * SmoothScroll, Lenis momentum scrolling, mounted once at app shell.
 *
 * - Skipped entirely when prefers-reduced-motion is set.
 * - Skipped when body scroll is locked (modals, drawers) by checking
 *   `document.body.style.overflow === 'hidden'`. We re-enable on unlock.
 * - Exposes `window.__lenis` so other components can hook into scroll
 *   velocity (e.g. marquee speed nudge) without prop drilling.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Native momentum scroll on touch devices. Lenis' syncTouch hijacks the
    // browser's native touch scrolling and makes phones/tablets feel laggy and
    // floaty — the #1 "mobile feels bad" culprit. Only run smooth scroll where
    // there's a real pointer (mouse/trackpad). ScrollToTop falls back to native.
    if (window.matchMedia('(pointer: coarse)').matches) return

    const lenis = new Lenis({
      lerp: MOTION.smoothScroll.lerp,
      wheelMultiplier: MOTION.smoothScroll.wheelMultiplier,
      touchMultiplier: MOTION.smoothScroll.touchMultiplier,
      syncTouch: MOTION.smoothScroll.syncTouch,
      smoothWheel: true,
    })

    window.__lenis = lenis

    let rafId = 0
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Track scroll velocity → CSS var for marquee speed-up effect.
    const onScroll = ({ velocity }) => {
      const v = Math.min(Math.abs(velocity) / 12, 2.4)
      document.documentElement.style.setProperty('--marquee-vel', String(1 + v * 0.6))
    }
    lenis.on('scroll', onScroll)

    // Pause Lenis whenever a drawer/modal locks the body. Re-enable on unlock.
    const bodyObserver = new MutationObserver(() => {
      const locked = document.body.style.overflow === 'hidden'
      if (locked) lenis.stop()
      else lenis.start()
    })
    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    })

    return () => {
      cancelAnimationFrame(rafId)
      bodyObserver.disconnect()
      lenis.off('scroll', onScroll)
      lenis.destroy()
      delete window.__lenis
      document.documentElement.style.removeProperty('--marquee-vel')
    }
  }, [])

  return null
}
