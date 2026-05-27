import { useReducedMotion } from 'framer-motion'

/**
 * MarqueeStrip — infinite horizontal marquee. Used between sections
 * to break up the page with a rotating band of coffee terms.
 *
 * The strip auto-scrolls via CSS `animation: marquee-slide`. Two
 * identical tracks side-by-side give a seamless loop.
 *
 * Props:
 *   items    — array of strings or { en } objects
 *   speed    — seconds per loop (default 36s)
 *   variant  — "dark" | "paper" | "accent"
 *   tall     — boolean, increases vertical padding for hero-style strips
 */
export default function MarqueeStrip({
  items,
  speed = 36,
  variant = 'dark',
  tall = false,
}) {
  const prefersReducedMotion = useReducedMotion()
  const animationDuration = prefersReducedMotion ? 0 : speed

  const renderItem = (item, idx) => {
    if (typeof item === 'string') {
      return (
        <span key={idx} className="mq-item">
          <span className="mq-en">{item}</span>
          <span className="mq-dot" aria-hidden="true" />
        </span>
      )
    }
    return (
      <span key={idx} className="mq-item">
        <span className="mq-en">{item.en}</span>
        <span className="mq-dot" aria-hidden="true" />
      </span>
    )
  }

  return (
    <div className={`mq mq--${variant} ${tall ? 'mq--tall' : ''}`} aria-hidden="true">
      <div
        className="mq-track"
        style={{ animationDuration: animationDuration ? `${animationDuration}s` : '0s' }}
      >
        {items.map(renderItem)}
        {items.map((it, i) => renderItem(it, `dup-${i}`))}
      </div>
    </div>
  )
}
