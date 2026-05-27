import { useEffect, useRef, useState } from 'react'

/**
 * MaskReveal — wraps a child element and applies a clip-path wipe
 * the first time it enters the viewport.
 *
 * Variants:
 *   "up"        — wipe from bottom (default)
 *   "diagonal"  — corner-to-corner sweep
 *
 * Honors prefers-reduced-motion: shows content instantly.
 */
export default function MaskReveal({
  children,
  variant = 'up',
  threshold = 0.18,
  margin = '0px 0px -6% 0px',
  delay = 0,
  className = '',
}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
            break
          }
        }
      },
      { threshold, rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, margin, shown])

  const base = variant === 'diagonal' ? 'mask-reveal mask-reveal--diagonal' : 'mask-reveal'

  return (
    <div
      ref={ref}
      className={`${base} ${shown ? 'is-in' : ''} ${className}`.trim()}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
