import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

// The handle zooms toward the viewer while scattered Instagram photos
// fade in around it from the corners, feels like the feed lighting up
// before the user clicks through to the real grid.
export default function ZoomCTA({
  pre = 'Do follow on',
  handle = '@mastermindbicyclecafe',
  href = 'https://www.instagram.com/mastermindbicyclecafe/',
  post = 'for daily brews',
  photos = [],
}) {
  const ref = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.4, 1.05, 1.6],
  )
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.82, 1],
    [0, 1, 1, 0],
  )
  const blur = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? ['blur(0px)', 'blur(0px)', 'blur(0px)'] : ['blur(14px)', 'blur(0px)', 'blur(8px)'],
  )

  const scatterOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.75, 1],
    prefersReducedMotion ? [1, 1, 1, 1] : [0, 1, 1, 0],
  )
  const scatterScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [0.6, 1, 1.15],
  )

  return (
    <section ref={ref} className="zoom-cta-section">
      <div className="zoom-cta-stage">
        {photos.length > 0 && (
          <motion.div
            className="zoom-cta-scatter"
            style={{ opacity: scatterOpacity, scale: scatterScale }}
            aria-hidden="true"
          >
            {photos.slice(0, 6).map((src, i) => (
              <span key={i} className={`zoom-cta-photo zoom-cta-photo--${i + 1}`}>
                <img src={src} alt="" loading="lazy" />
              </span>
            ))}
          </motion.div>
        )}
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="zoom-cta-text"
          style={{ scale, opacity, filter: blur }}
        >
          <span className="zoom-cta-pre">{pre}</span>
          <span className="zoom-cta-handle">{handle}</span>
          <span className="zoom-cta-post">{post}</span>
        </motion.a>
      </div>
    </section>
  )
}
