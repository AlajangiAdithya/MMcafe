import { useEffect, useRef } from 'react'

/**
 * Spotlight — attaches a soft, mouse-tracked radial glow inside its
 * parent. Render *inside* the section you want lit. The parent must
 * be position: relative or absolute.
 *
 * Disabled on touch / reduced-motion (the glow just sits centered).
 */
export default function Spotlight({ className = '', color = 'rgba(201, 151, 74, 0.18)', size = 520 }) {
  const ref = useRef(null)
  const rafRef = useRef(0)
  const target = useRef({ x: 50, y: 50 })
  const current = useRef({ x: 50, y: 50 })

  useEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (coarse || reduced) return

    const onMove = (e) => {
      const rect = parent.getBoundingClientRect()
      target.current.x = ((e.clientX - rect.left) / rect.width) * 100
      target.current.y = ((e.clientY - rect.top) / rect.height) * 100
      if (!rafRef.current) tick()
    }
    const tick = () => {
      const c = current.current
      const t = target.current
      c.x += (t.x - c.x) * 0.12
      c.y += (t.y - c.y) * 0.12
      el.style.setProperty('--sx', `${c.x.toFixed(2)}%`)
      el.style.setProperty('--sy', `${c.y.toFixed(2)}%`)
      if (Math.abs(t.x - c.x) > 0.05 || Math.abs(t.y - c.y) > 0.05) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = 0
      }
    }
    parent.addEventListener('mousemove', onMove)
    return () => {
      parent.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <span
      ref={ref}
      className={`spotlight ${className}`.trim()}
      aria-hidden="true"
      style={{
        '--spotlight-color': color,
        '--spotlight-size': `${size}px`,
      }}
    />
  )
}
