import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

export default function TedyScroll({ items = [], heading, eyebrow }) {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    function measure() {
      const track = trackRef.current
      if (!track) return
      const trackWidth = track.scrollWidth
      const viewportWidth = window.innerWidth
      setDistance(Math.max(0, trackWidth - viewportWidth + 80))
    }
    measure()
    window.addEventListener('resize', measure)
    const id = setTimeout(measure, 350)
    return () => {
      window.removeEventListener('resize', measure)
      clearTimeout(id)
    }
  }, [items])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -distance],
  )

  return (
    <section
      ref={sectionRef}
      className="tedy-section"
      style={{ height: `${Math.max(140, items.length * 65)}vh` }}
    >
      <div className="tedy-sticky">
        <div className="tedy-header">
          {eyebrow && <span className="tedy-eyebrow">{eyebrow}</span>}
          {heading && <h2 className="tedy-heading">{heading}</h2>}
        </div>
        <motion.div className="tedy-track" ref={trackRef} style={{ x }}>
          {items.map((it, i) => (
            <figure className={`tedy-card tedy-card--${(i % 3) + 1}`} key={i}>
              <div className="tedy-card-img">
                <img src={it.image} alt={it.title || ''} loading="lazy" draggable={false} />
                <span className="tedy-card-meta">{it.meta || `0${i + 1}`}</span>
              </div>
              {(it.title || it.caption || it.kicker) && (
                <figcaption className="tedy-card-cap">
                  {it.kicker && <span className="tedy-card-kicker">{it.kicker}</span>}
                  {it.title && <span className="tedy-card-title">{it.title}</span>}
                  {it.caption && <span className="tedy-card-sub">{it.caption}</span>}
                </figcaption>
              )}
            </figure>
          ))}
        </motion.div>
        <div className="tedy-progress" aria-hidden="true">
          <motion.span className="tedy-progress-bar" style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  )
}
