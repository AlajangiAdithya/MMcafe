import { useEffect, useRef } from 'react'

/**
 * ScrollProgress — a thin gold bar at the top of the viewport that fills
 * as the page scrolls. Mounted once at app level so it overlays every route.
 * Pure rAF + transform-style width, no library.
 */
export default function ScrollProgress() {
  const ref = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const bar = ref.current
    if (!bar) return

    let ticking = false
    const update = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0
      bar.style.width = `${pct}%`
      ticking = false
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
    }
  }, [])

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}
