import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { MapPin, ArrowUpRight } from 'lucide-react'

export default function HorizontalProjects({ projects }) {
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
      const d = Math.max(0, trackWidth - viewportWidth)
      setDistance(d)
    }
    measure()
    window.addEventListener('resize', measure)
    const id = setTimeout(measure, 250) // re-measure after images load
    return () => {
      window.removeEventListener('resize', measure)
      clearTimeout(id)
    }
  }, [projects])

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
      className="hproj-section"
      style={{ height: `${Math.max(100, projects.length * 80)}vh` }}
    >
      <div className="hproj-sticky">
        <motion.div className="hproj-track" ref={trackRef} style={{ x }}>
          {projects.map((p, i) => (
            <article key={p.title} className="hproj-card">
              <div className="hproj-card-media">
                <img src={p.image} alt={p.title} loading="lazy" />
                <span className="hproj-card-tag">{p.tag}</span>
                <span className="hproj-card-arrow"><ArrowUpRight size={18} /></span>
                <span className="hproj-card-index">0{i + 1}</span>
              </div>
              <div className="hproj-card-body">
                <span className="hproj-card-location"><MapPin size={12} /> {p.location}</span>
                <h3 className="hproj-card-title">{p.title}</h3>
                <p className="hproj-card-summary">{p.summary}</p>
              </div>
            </article>
          ))}
        </motion.div>
        <div className="hproj-progress" aria-hidden="true">
          <motion.div className="hproj-progress-bar" style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  )
}
