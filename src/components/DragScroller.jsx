import { useEffect, useRef } from 'react'

/**
 * DragScroller, horizontal strip with click-and-drag scrolling on
 * desktop, wheel-to-pan, plus an inertial flick. Touch devices use
 * native scrolling.
 *
 * Pass `autoDrift={0.3}` to slowly auto-scroll the strip. The drift
 * pauses while the cursor is inside the element.
 */
export default function DragScroller({ children, className = '', autoDrift = 0 }) {
  const ref = useRef(null)
  const driftRef = useRef(0)
  const velRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTRef = useRef(0)
  const draggingRef = useRef(false)
  const hoverRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    const tick = () => {
      // Auto drift when idle and not hovering (desktop only).
      if (autoDrift > 0 && !reduced && !hoverRef.current && !draggingRef.current && Math.abs(velRef.current) < 0.05) {
        el.scrollLeft += autoDrift
        // Loop around when we hit the right edge so it feels infinite.
        const max = el.scrollWidth - el.clientWidth
        if (el.scrollLeft >= max - 1) el.scrollLeft = 0
      }
      // Inertia after release.
      if (!draggingRef.current && Math.abs(velRef.current) > 0.05) {
        el.scrollLeft -= velRef.current
        velRef.current *= 0.94
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onEnter = () => { hoverRef.current = true }
    const onLeaveHover = () => { hoverRef.current = false }
    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeaveHover)

    const onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return
      draggingRef.current = true
      el.classList.add('is-dragging')
      lastXRef.current = e.clientX
      lastTRef.current = performance.now()
      velRef.current = 0
      // Prevent text selection while dragging.
      e.preventDefault()
    }
    const onMove = (e) => {
      if (!draggingRef.current) return
      const now = performance.now()
      const dx = e.clientX - lastXRef.current
      const dt = Math.max(8, now - lastTRef.current)
      velRef.current = (dx / dt) * 16
      el.scrollLeft -= dx
      lastXRef.current = e.clientX
      lastTRef.current = now
    }
    const onUp = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      el.classList.remove('is-dragging')
    }
    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    // Map vertical wheel scroll to horizontal pan while the strip is hovered.
    const onWheel = (e) => {
      if (!hoverRef.current) return
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      el.scrollLeft += e.deltaY
      e.preventDefault()
    }
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeaveHover)
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('wheel', onWheel)
    }
  }, [autoDrift])

  return (
    <div ref={driftRef} className="drag-scroller-wrap">
      <div ref={ref} className={`drag-scroller ${className}`.trim()}>
        {children}
      </div>
      <span className="drag-scroller-hint" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 9l-3 3 3 3" />
          <path d="M19 9l3 3-3 3" />
          <path d="M2 12h20" />
        </svg>
        Drag · Scroll · Flick
      </span>
    </div>
  )
}
