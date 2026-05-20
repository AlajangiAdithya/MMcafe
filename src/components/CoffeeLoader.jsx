/**
 * CoffeeLoader — animated coffee cup with rising steam.
 * Used as the global Suspense fallback so every lazy route shows the
 * same on-brand loading state instead of a generic spinner.
 *
 * Pure SVG + CSS — no extra deps, GPU-accelerated, ~1KB.
 */
export default function CoffeeLoader({ label = 'Brewing…', fullscreen = true }) {
  return (
    <div className={fullscreen ? 'coffee-loader-screen' : 'coffee-loader-inline'} role="status" aria-live="polite">
      <div className="coffee-loader">
        <svg className="coffee-loader-svg" viewBox="0 0 120 140" aria-hidden="true">
          {/* Three steam wisps, staggered, animated upward */}
          <g className="steam">
            <path className="steam-1" d="M40 50 Q35 35 42 22 Q49 9 44 -2" />
            <path className="steam-2" d="M60 50 Q55 35 62 22 Q69 9 64 -2" />
            <path className="steam-3" d="M80 50 Q75 35 82 22 Q89 9 84 -2" />
          </g>

          {/* Saucer */}
          <ellipse cx="60" cy="128" rx="48" ry="6" fill="rgba(0,0,0,0.35)" />

          {/* Cup body */}
          <path
            d="M20 60 H100 V102 Q100 122 80 124 H40 Q20 122 20 102 Z"
            fill="url(#cupGradient)"
            stroke="#3a2818"
            strokeWidth="1.5"
          />

          {/* Coffee surface — filling animation via clipPath */}
          <clipPath id="cupClip">
            <path d="M22 62 H98 V102 Q98 120 80 122 H40 Q22 120 22 102 Z" />
          </clipPath>
          <g clipPath="url(#cupClip)">
            <rect className="brew" x="22" y="62" width="76" height="62" fill="url(#brewGradient)" />
            <ellipse className="crema" cx="60" cy="62" rx="38" ry="3.5" fill="#a87145" opacity="0.7" />
          </g>

          {/* Cup handle */}
          <path
            d="M100 72 Q120 72 120 90 Q120 108 100 108"
            fill="none"
            stroke="#3a2818"
            strokeWidth="6"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="cupGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8efe2" />
              <stop offset="100%" stopColor="#d9b899" />
            </linearGradient>
            <linearGradient id="brewGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b3a22" />
              <stop offset="100%" stopColor="#2c1f15" />
            </linearGradient>
          </defs>
        </svg>

        <p className="coffee-loader-label">{label}</p>
      </div>
    </div>
  )
}
