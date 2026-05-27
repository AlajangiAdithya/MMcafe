import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { MapPin, ArrowUpRight } from 'lucide-react'

/**
 * ProjectShowcase — three projects, framer-motion choreography.
 *
 * - Stagger entrance: each card fades + lifts + un-rotates as the
 *   section enters the viewport.
 * - Scroll-linked parallax: each card's image moves at a different
 *   speed as the user scrolls past, giving the row depth.
 * - Hover: card lifts, image zooms, tag tilts back to flat, the
 *   index numeral grows, and an underline sweeps the title.
 */

const cardVariants = {
  hidden: { opacity: 0, y: 80, rotate: -2 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.85,
      delay: i * 0.14,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

function ProjectCard({ project, index, prefersReducedMotion }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Each card pulls its image at a slightly different speed: cards 0 / 1 / 2
  // get y-ranges of [40,-40], [60,-60], [50,-50] — staggered enough to feel
  // alive, not chaotic.
  const range = 40 + index * 10
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [range, -range],
  )

  return (
    <motion.article
      ref={ref}
      className="ps-card"
      custom={index}
      variants={cardVariants}
      whileHover={prefersReducedMotion ? {} : { y: -14 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
    >
      <div className="ps-card-media">
        <motion.img
          src={project.image}
          alt={project.title}
          loading="lazy"
          style={{ y: imageY }}
        />
        <span className="ps-card-tag">{project.tag}</span>
        <span className="ps-card-arrow" aria-hidden="true">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="ps-card-body">
        <div className="ps-card-meta">
          <span className="ps-card-index">0{index + 1}</span>
          <span className="ps-card-location">
            <MapPin size={11} /> {project.location}
          </span>
        </div>
        <h3 className="ps-card-title">
          <span className="ps-card-title-text">{project.title}</span>
        </h3>
        <p className="ps-card-summary">{project.summary}</p>
        <span className="ps-card-rule" aria-hidden="true" />
      </div>
    </motion.article>
  )
}

export default function ProjectShowcase({ projects }) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <motion.div
      className="ps-grid"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {projects.map((p, i) => (
        <ProjectCard
          key={p.title}
          project={p}
          index={i}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </motion.div>
  )
}
