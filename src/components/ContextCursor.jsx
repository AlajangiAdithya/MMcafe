import { useEffect, useRef } from 'react'

/**
 * ContextCursor, an awwwards-style cursor ring that follows the pointer,
 * grows over interactive elements, and morphs into a labelled pill over any
 * element carrying a `data-cursor="…"` attribute (e.g. "drag", "expand").
 *
 * - The ring uses mix-blend-mode: difference so it stays visible on both the
 *   dark Home theme and the light About/Projects theme without per-page tweaks.
 * - Runs alongside <CursorTrail /> (the soft steam puff); this sits on top.
 * - Skipped on touch devices and when the user prefers reduced motion.
 * - All per-frame work is direct DOM writes (no React re-render).
 */
export default function ContextCursor() {
  const ref = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (coarse || reduced) return

    const el = ref.current
    const label = labelRef.current
    if (!el) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let x = mx
    let y = my
    let raf = 0

    const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary, label[for], .hr-pf-img, [data-cursor]'

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      el.style.opacity = '1'
      const target = e.target
      if (!target || !target.closest) return
      const labelled = target.closest('[data-cursor]')
      if (labelled) {
        const text = labelled.getAttribute('data-cursor') || ''
        if (label.textContent !== text) label.textContent = text
        el.classList.add('has-label')
      } else {
        el.classList.remove('has-label')
      }
      el.classList.toggle('is-active', !!target.closest(INTERACTIVE))
    }
    const onLeave = () => { el.style.opacity = '0' }
    const onDown = () => el.classList.add('is-down')
    const onUp = () => el.classList.remove('is-down')

    const tick = () => {
      x += (mx - x) * 0.2
      y += (my - y) * 0.2
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <div ref={ref} className="ctx-cursor" aria-hidden="true">
      <span className="ctx-cursor-ring" />
      <span ref={labelRef} className="ctx-cursor-label" />
    </div>
  )
}
