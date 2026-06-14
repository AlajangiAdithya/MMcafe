import { useMemo } from 'react'

/**
 * FloatingBeans, decorative slow-drifting coffee-bean dots.
 * Pure CSS animation (keyframes in animation-tokens.css), GPU-only.
 *
 * Props:
 *   count, number of beans (default 8)
 *   tone, "gold" (default) | "ink"
 *   seed, change to re-roll positions (useful per-section)
 */
export default function FloatingBeans({ count = 8, tone = 'gold', seed = 1 }) {
  const beans = useMemo(() => makeBeans(count, seed), [count, seed])

  return (
    <div className="floating-beans" aria-hidden="true" data-tone={tone}>
      {beans.map((b, i) => (
        <span
          key={i}
          className="floating-bean"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: `${b.size}px`,
            height: `${b.size * 1.28}px`,
            opacity: b.opacity,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            transform: `rotate(${b.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}

function makeBeans(count, seed) {
  // Deterministic pseudo-random so SSR/CSR match and beans don't reshuffle on re-render.
  let s = seed * 9301 + 49297
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  return Array.from({ length: count }, () => ({
    left: rand() * 100,
    top: rand() * 100,
    size: 12 + rand() * 14,
    opacity: 0.28 + rand() * 0.22,
    duration: 18 + rand() * 14,
    delay: -rand() * 22,
    rotate: rand() * 360,
  }))
}
