import { motion, useReducedMotion } from 'framer-motion'

/**
 * KineticHeading — large display headline that splits text into words
 * and animates each word with a stagger as the heading enters view.
 *
 * Props:
 *   children   — the text
 *   as         — element type (default "h2")
 *   className  — additional class names
 *   delay      — base delay in seconds
 */
const word = {
  hidden: { y: '120%', opacity: 0, rotate: 4 },
  visible: (i) => ({
    y: '0%',
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.85,
      delay: 0.08 + i * 0.07,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

export default function KineticHeading({
  children,
  as = 'h2',
  className = '',
  delay = 0,
}) {
  const reduced = useReducedMotion()
  const text = typeof children === 'string' ? children : ''
  const words = text.split(/\s+/).filter(Boolean)

  const Tag = motion[as] || motion.h2

  if (reduced || !text) {
    const Static = as === 'h1' ? 'h1' : as === 'h3' ? 'h3' : as === 'h4' ? 'h4' : 'h2'
    return <Static className={`kinetic-heading ${className}`.trim()}>{children}</Static>
  }

  return (
    <Tag
      className={`kinetic-heading ${className}`.trim()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay }}
    >
      {words.map((w, i) => (
        <span key={i} className="kh-word">
          <motion.span className="kh-word-inner" variants={word} custom={i}>
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
