import { useEffect, useRef } from 'react'

/**
 * Magnetic — wraps any child and pulls it toward the cursor while the
 * pointer is inside its hitbox. Disabled for touch and reduced-motion.
 *
 * Strength controls the pull (0 = none, 1 = full follow). 0.35 is a
 * nice "alive but subtle" default for buttons.
 */
export default function Magnetic({ children, strength = 0.35, radius = 1, className = '', ...rest }) {
  const wrapRef = useRef(null)
  const innerRef = useRef(null)
  const rafRef = useRef(0)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (coarse || reduced) return

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      target.current.x = (e.clientX - cx) * strength
      target.current.y = (e.clientY - cy) * strength
      if (!rafRef.current) tick()
    }
    const onLeave = () => {
      target.current.x = 0
      target.current.y = 0
      if (!rafRef.current) tick()
    }
    const tick = () => {
      const dx = target.current.x - current.current.x
      const dy = target.current.y - current.current.y
      current.current.x += dx * 0.18
      current.current.y += dy * 0.18
      inner.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = 0
      }
    }

    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)
    return () => {
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [strength, radius])

  return (
    <span ref={wrapRef} className={`magnetic ${className}`.trim()} {...rest}>
      <span ref={innerRef} className="magnetic-inner">{children}</span>
    </span>
  )
}
