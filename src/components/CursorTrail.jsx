import { useEffect, useRef } from 'react'

/**
 * CursorTrail, a soft steam-puff follower that trails the cursor.
 * Adds a "warm, alive" feel without interfering with the custom coffee
 * cursor (the puff sits behind, the bean cursor sits on top via z-index).
 *
 * Skipped on touch devices and when the user prefers reduced motion.
 */
export default function CursorTrail() {
  const dotRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (coarse || reduced) return

    const dot = dotRef.current
    if (!dot) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let x = mouseX
    let y = mouseY

    const onMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.opacity = '1'
    }
    const onLeave = () => { dot.style.opacity = '0' }

    const tick = () => {
      // Lerp for a soft, lazy follow, about 14% per frame.
      x += (mouseX - x) * 0.14
      y += (mouseY - y) * 0.14
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <div ref={dotRef} className="cursor-trail" aria-hidden="true" />
}
