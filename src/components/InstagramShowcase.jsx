import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

/* lucide-react no longer ships brand icons — inline Instagram glyph. */
export function InstagramIcon({ size = 16 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

const ACCOUNTS = [
  {
    role: 'The Brand',
    note: 'Beans · Brew guides · Craft',
    name: 'Mastermind Brews',
    handle: '@mastermindbrews',
    url: 'https://www.instagram.com/mastermindbrews/',
    img: '/pour-over-coffee.jpg',
  },
  {
    role: 'The Brewer',
    note: 'Founder · Training · Competitions',
    name: 'Namrata is Brewing',
    handle: '@namrata_is_brewing',
    url: 'https://www.instagram.com/namrata_is_brewing/',
    img: '/namrata-thakkar.jpg',
  },
  {
    role: 'The Cafe',
    note: 'Mulund · Community · Bicycles',
    name: 'Mastermind Bicycle Cafe',
    handle: '@mastermindbicyclecafe',
    url: 'https://www.instagram.com/mastermindbicyclecafe/',
    img: '/hero-bg.jpg',
  },
]

/**
 * InstagramShowcase — the awwwards "work list" pattern: three big editorial
 * rows, one per account. Hovering a row dims the others and reveals a photo
 * card that follows the cursor (spring-smoothed); clicking opens Instagram.
 * On touch the preview is hidden and each row shows an inline thumbnail.
 */
export default function InstagramShowcase() {
  const listRef = useRef(null)
  const [active, setActive] = useState(-1)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 260, damping: 28, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 260, damping: 28, mass: 0.6 })

  const onMove = (e) => {
    const r = listRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
  }

  return (
    <div
      className="igx"
      ref={listRef}
      onMouseMove={onMove}
      onMouseLeave={() => setActive(-1)}
    >
      {ACCOUNTS.map((a, i) => (
        <a
          key={a.handle}
          className={`igx-row${active === i ? ' is-active' : ''}${active !== -1 && active !== i ? ' is-dim' : ''}`}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setActive(i)}
          onFocus={() => setActive(i)}
          onBlur={() => setActive(-1)}
        >
          <span className="igx-index">0{i + 1}</span>
          <span className="igx-main">
            <span className="igx-role">{a.role} · {a.note}</span>
            <span className="igx-name">{a.name}</span>
          </span>
          <span className="igx-handle">{a.handle}</span>
          <span className="igx-arrow" aria-hidden="true"><ArrowUpRight size={22} /></span>
          <img className="igx-thumb" src={a.img} alt="" loading="lazy" />
        </a>
      ))}

      {/* floating preview — follows the cursor over the list (desktop only) */}
      <motion.div
        className="igx-preview"
        style={{ x: sx, y: sy }}
        animate={{
          opacity: active >= 0 ? 1 : 0,
          scale: active >= 0 ? 1 : 0.85,
          rotate: active >= 0 ? -2 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        {ACCOUNTS.map((a, i) => (
          <img key={a.handle} src={a.img} alt="" style={{ opacity: active === i ? 1 : 0 }} loading="lazy" />
        ))}
        <span className="igx-preview-tag"><InstagramIcon size={12} /> Follow</span>
      </motion.div>
    </div>
  )
}
