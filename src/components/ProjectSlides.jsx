import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { MapPin, ArrowUpRight, Calendar } from 'lucide-react'

function Slide({ project, index, total, progress, prefersReducedMotion }) {
  const segment = 1 / total
  const start = index * segment
  const peak = start + segment * 0.45
  const end = start + segment
  const isFirst = index === 0
  const isLast = index === total - 1

  // Each slide rises from below, settles in place, then exits with a subtle
  // upward fade-and-shrink so the next slide can take the stage cleanly.
  const enterY = useTransform(
    progress,
    isFirst
      ? [0, 0]
      : [Math.max(0, start - segment * 0.4), start],
    prefersReducedMotion || isFirst ? ['0%', '0%'] : ['90%', '0%'],
  )
  const exitY = useTransform(
    progress,
    [peak, end],
    prefersReducedMotion || isLast ? ['0%', '0%'] : ['0%', '-6%'],
  )
  const opacity = useTransform(
    progress,
    [Math.max(0, start - segment * 0.4), start, peak, end],
    prefersReducedMotion
      ? [1, 1, 1, 1]
      : [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0],
  )
  const scale = useTransform(
    progress,
    [start, peak, end],
    prefersReducedMotion || isLast ? [1, 1, 1] : [0.96, 1, 0.96],
  )

  return (
    <motion.div
      className="psl-slide"
      style={{
        y: enterY,
        opacity,
        scale,
        zIndex: index + 1,
      }}
    >
      <motion.div className="psl-slide-inner" style={{ y: exitY }}>
        <div className="psl-slide-media">
          <img src={project.image} alt={project.title} loading="lazy" />
          <div className="psl-slide-shade" aria-hidden="true" />
          <div className="psl-slide-stripe" aria-hidden="true">
            <span>{`0${index + 1} · 0${total}`}</span>
            <span className="psl-slide-stripe-rule" />
            <span>{project.tag}</span>
          </div>
          {project.year && (
            <div className="psl-slide-year">
              <Calendar size={12} />
              <span>{project.year}</span>
            </div>
          )}
        </div>
        <div className="psl-slide-body">
          <div className="psl-slide-head">
            <span className="psl-slide-tag">{project.tag}</span>
            <span className="psl-slide-index">0{index + 1} / 0{total}</span>
          </div>
          <h3 className="psl-slide-title">{project.title}</h3>
          <p className="psl-slide-loc"><MapPin size={12} /> {project.location}</p>
          <p className="psl-slide-summary">{project.summary}</p>
          {project.metrics && project.metrics.length > 0 && (
            <ul className="psl-slide-metrics" aria-label="Project highlights">
              {project.metrics.map((m) => (
                <li key={m.label}>
                  <span className="psl-slide-metric-value">{m.value}</span>
                  <span className="psl-slide-metric-label">{m.label}</span>
                </li>
              ))}
            </ul>
          )}
          {project.chips && project.chips.length > 0 && (
            <div className="psl-slide-chips" aria-hidden="true">
              {project.chips.map((c) => (
                <span key={c} className="psl-slide-chip">{c}</span>
              ))}
            </div>
          )}
          <span className="psl-slide-cta">
            Read case study <ArrowUpRight size={16} />
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ProjectSlides({ projects = [] }) {
  const sectionRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const total = projects.length

  if (prefersReducedMotion) {
    return (
      <section className="psl-fallback" style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '64px 24px' }}>
        {projects.map((p, i) => (
          <div key={p.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{p.title}</h3>
            <p>{p.summary}</p>
            {p.image && <img src={p.image} alt={p.title} style={{ marginTop: '16px', borderRadius: '8px', maxWidth: '100%', height: 'auto', objectFit: 'cover', maxHeight: '400px' }} />}
          </div>
        ))}
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      className="psl-section"
      style={{ height: `${Math.max(140, total * 130)}vh` }}
    >
      <div className="psl-sticky">
        <div className="psl-progress" aria-hidden="true">
          <motion.span className="psl-progress-bar" style={{ scaleX: scrollYProgress }} />
        </div>
        <div className="psl-counter" aria-hidden="true">
          {projects.map((_, i) => (
            <span key={i} className="psl-counter-tick" />
          ))}
        </div>
        {projects.map((p, i) => (
          <Slide
            key={p.title}
            project={p}
            index={i}
            total={total}
            progress={scrollYProgress}
            prefersReducedMotion={false}
          />
        ))}
      </div>
    </section>
  )
}
