import { useEffect, useRef } from 'react'

/**
 * TiltCard — 3D rotation toward the cursor with a moving radial
 * spotlight. Used to lift the "What We Offer" pillars off the page
 * so they feel like an object, not a card.
 *
 * Disabled for touch/reduced-motion. Pure rAF + CSS variables.
 */
export default function TiltCard({
  children,
  className = '',
  as: Tag = 'div',
  max = 9,
  glare = true,
  scale = 1.015,
  ...rest
}) {
  const ref = useRef(null)
  const rafRef = useRef(0)
  const target = useRef({ rx: 0, ry: 0, mx: 50, my: 50, s: 1 })
  const current = useRef({ rx: 0, ry: 0, mx: 50, my: 50, s: 1 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (coarse || reduced) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      target.current.ry = (px - 0.5) * 2 * max
      target.current.rx = (0.5 - py) * 2 * max
      target.current.mx = px * 100
      target.current.my = py * 100
      target.current.s = scale
      if (!rafRef.current) tick()
    }
    const onLeave = () => {
      target.current.rx = 0
      target.current.ry = 0
      target.current.s = 1
      if (!rafRef.current) tick()
    }
    const tick = () => {
      const lerp = (a, b, t) => a + (b - a) * t
      const c = current.current
      const t = target.current
      c.rx = lerp(c.rx, t.rx, 0.12)
      c.ry = lerp(c.ry, t.ry, 0.12)
      c.mx = lerp(c.mx, t.mx, 0.18)
      c.my = lerp(c.my, t.my, 0.18)
      c.s = lerp(c.s, t.s, 0.12)
      el.style.setProperty('--tilt-rx', `${c.rx.toFixed(2)}deg`)
      el.style.setProperty('--tilt-ry', `${c.ry.toFixed(2)}deg`)
      el.style.setProperty('--tilt-s', c.s.toFixed(3))
      el.style.setProperty('--tilt-mx', `${c.mx.toFixed(1)}%`)
      el.style.setProperty('--tilt-my', `${c.my.toFixed(1)}%`)
      const done =
        Math.abs(c.rx - t.rx) < 0.05 &&
        Math.abs(c.ry - t.ry) < 0.05 &&
        Math.abs(c.s - t.s) < 0.002
      if (!done) rafRef.current = requestAnimationFrame(tick)
      else rafRef.current = 0
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [max, scale])

  return (
    <Tag
      ref={ref}
      className={`tilt-card ${glare ? 'has-glare' : ''} ${className}`.trim()}
      {...rest}
    >
      <span className="tilt-card-inner">{children}</span>
      {glare && <span className="tilt-card-glare" aria-hidden="true" />}
    </Tag>
  )
}
