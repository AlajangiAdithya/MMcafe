import { useMemo } from 'react'

/**
 * SteamWisps — soft white plumes that drift upward, simulating
 * coffee steam behind hero content. Pure CSS keyframes.
 */
export default function SteamWisps({ count = 4, seed = 7 }) {
  const wisps = useMemo(() => makeWisps(count, seed), [count, seed])

  return (
    <div className="steam-layer" aria-hidden="true">
      {wisps.map((w, i) => (
        <span
          key={i}
          className="steam-wisp"
          style={{
            left: `${w.left}%`,
            width: `${w.size}px`,
            height: `${w.size}px`,
            animationDuration: `${w.duration}s`,
            animationDelay: `${w.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function makeWisps(count, seed) {
  let s = seed * 9301 + 49297
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  return Array.from({ length: count }, () => ({
    left: 8 + rand() * 84,
    size: 180 + rand() * 160,
    duration: 14 + rand() * 10,
    delay: -rand() * 14,
  }))
}
