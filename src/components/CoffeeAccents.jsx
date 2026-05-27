import { useMemo } from 'react'

/**
 * CoffeeAccents — decorative SVG coffee elements scattered across a container.
 * Used both ambiently (site-wide layer) and as a section-level overlay.
 *
 * Props:
 *   variant — "ambient" (full page, scattered) | "section" (corner accents)
 *   density — "light" | "normal" | "dense"
 *   seed    — re-roll positions
 */
export default function CoffeeAccents({ variant = 'section', density = 'normal', seed = 3 }) {
  const counts = {
    light:  { beans: 4, clusters: 1, steam: 1, leaves: 1, rings: 1 },
    normal: { beans: 7, clusters: 2, steam: 2, leaves: 2, rings: 2 },
    dense:  { beans: 12, clusters: 3, steam: 3, leaves: 3, rings: 3 },
  }[density] || { beans: 7, clusters: 2, steam: 2, leaves: 2, rings: 2 }

  const items = useMemo(() => scatter(counts, seed), [counts.beans, counts.clusters, counts.steam, counts.leaves, counts.rings, seed])

  return (
    <div className={`coffee-accents coffee-accents--${variant}`} aria-hidden="true">
      {items.map((it, i) => (
        <span
          key={i}
          className={`ca ca--${it.type}`}
          style={{
            left: `${it.left}%`,
            top: `${it.top}%`,
            width: `${it.size}px`,
            height: `${it.size}px`,
            transform: `rotate(${it.rotate}deg)`,
            animationDelay: `${it.delay}s`,
            animationDuration: `${it.duration}s`,
            opacity: it.opacity,
          }}
        >
          {it.type === 'bean' && <BeanSVG />}
          {it.type === 'cluster' && <ClusterSVG />}
          {it.type === 'steam' && <SteamSVG />}
          {it.type === 'leaf' && <LeafSVG />}
          {it.type === 'ring' && <RingSVG />}
        </span>
      ))}
    </div>
  )
}

function scatter(counts, seed) {
  let s = seed * 9301 + 49297
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const out = []
  const push = (type, count, sizeRange, opacityRange, durationRange) => {
    for (let i = 0; i < count; i++) {
      out.push({
        type,
        left: rand() * 100,
        top: rand() * 100,
        size: sizeRange[0] + rand() * (sizeRange[1] - sizeRange[0]),
        opacity: opacityRange[0] + rand() * (opacityRange[1] - opacityRange[0]),
        rotate: rand() * 360,
        delay: -rand() * 20,
        duration: durationRange[0] + rand() * (durationRange[1] - durationRange[0]),
      })
    }
  }
  push('bean',    counts.beans,    [16, 28], [0.35, 0.55], [22, 38])
  push('cluster', counts.clusters, [70, 110], [0.18, 0.30], [28, 44])
  push('steam',   counts.steam,    [60, 96], [0.20, 0.32], [14, 22])
  push('leaf',    counts.leaves,   [54, 90], [0.22, 0.34], [26, 40])
  push('ring',    counts.rings,    [80, 130], [0.14, 0.22], [30, 48])
  return out
}

function BeanSVG() {
  return (
    <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5A2B" />
          <stop offset="100%" stopColor="#3E2412" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="20" rx="13" ry="18" fill="url(#bg)" />
      <path d="M16 4 Q11 20 16 36" stroke="#1f120a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function ClusterSVG() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5A2B" />
          <stop offset="100%" stopColor="#3E2412" />
        </linearGradient>
      </defs>
      <g transform="rotate(-18 40 50)">
        <ellipse cx="40" cy="50" rx="13" ry="18" fill="url(#cg)" />
        <path d="M40 34 Q35 50 40 66" stroke="#1f120a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </g>
      <g transform="rotate(22 78 62)">
        <ellipse cx="78" cy="62" rx="12" ry="17" fill="url(#cg)" />
        <path d="M78 47 Q73 62 78 77" stroke="#1f120a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </g>
      <g transform="rotate(8 58 90)">
        <ellipse cx="58" cy="90" rx="11" ry="15" fill="url(#cg)" />
        <path d="M58 77 Q53 90 58 103" stroke="#1f120a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function SteamSVG() {
  return (
    <svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg" fill="none">
      <path
        d="M22 92 Q14 76 24 60 Q34 44 22 28 Q12 14 22 4"
        stroke="#8B5A2B"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M44 96 Q52 78 42 60 Q32 42 44 24 Q56 8 46 0"
        stroke="#8B5A2B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M64 92 Q56 74 64 56 Q72 38 60 22"
        stroke="#8B5A2B"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  )
}

function LeafSVG() {
  return (
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6E4A22" />
          <stop offset="100%" stopColor="#3E2412" />
        </linearGradient>
      </defs>
      <path
        d="M50 8 Q88 30 78 70 Q70 102 50 112 Q30 102 22 70 Q12 30 50 8 Z"
        fill="url(#lg)"
        opacity="0.55"
      />
      <path
        d="M50 12 Q50 60 50 110"
        stroke="#1f120a"
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M50 30 Q66 38 72 50 M50 50 Q68 56 74 68 M50 70 Q64 76 70 86"
        stroke="#1f120a"
        strokeWidth="0.9"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M50 30 Q34 38 28 50 M50 50 Q32 56 26 68 M50 70 Q36 76 30 86"
        stroke="#1f120a"
        strokeWidth="0.9"
        fill="none"
        opacity="0.55"
      />
    </svg>
  )
}

function RingSVG() {
  return (
    <svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" fill="none">
      <circle cx="70" cy="70" r="62" stroke="#8B5A2B" strokeWidth="1.5" opacity="0.65" />
      <circle cx="70" cy="70" r="48" stroke="#8B5A2B" strokeWidth="1" opacity="0.4" strokeDasharray="2 6" />
    </svg>
  )
}
