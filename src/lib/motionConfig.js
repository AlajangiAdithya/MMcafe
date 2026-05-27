/**
 * motionConfig — single source of truth for animation timing across Home + About.
 * Dial these to tune the whole site at once. Also exposed as CSS vars
 * in src/styles/animation-tokens.css for non-Motion code paths.
 */

export const MOTION = {
  // Reveal — fade + translateY on inView
  reveal: {
    distance: 36,        // px translated from below
    distanceStrong: 56,
    duration: 0.7,
    delay: 0,
    stagger: 0.09,       // seconds between siblings
    margin: '-80px',     // viewport margin for whileInView triggers
  },

  // Kinetic / mask reveals
  kinetic: {
    duration: 0.85,
    stagger: 0.07,
  },
  mask: {
    duration: 0.9,
  },

  // Parallax intensity (0 = off, 1 = strong). Affects hero bg, steam,
  // floating beans, and about parallax sections.
  parallax: {
    intensity: 0.28,
    steamIntensity: 0.12,
    foregroundIntensity: 0.08,
  },

  // Smooth scroll (Lenis)
  smoothScroll: {
    lerp: 0.12,         // 0.08–0.14 sweet spot: smooth yet responsive
    wheelMultiplier: 1,  // native scroll distance
    touchMultiplier: 1.6,
    syncTouch: true,
  },

  // Page transitions Home ↔ About
  page: {
    duration: 0.42,
    exit: 0.28,
  },

  // Button press
  press: {
    scale: 0.97,
    duration: 0.18,
  },

  // CountUp
  countUp: {
    duration: 1.6,
  },

  // Eases — keep these tight. cubic-bezier(0.16, 1, 0.3, 1) is the project default.
  ease: {
    out: [0.16, 1, 0.3, 1],
    standard: [0.25, 0.46, 0.45, 0.94],
    spring: [0.34, 1.56, 0.64, 1],
  },
}

// Variant helpers (composed from MOTION so a single tweak ripples out).
export const fadeUp = {
  hidden: { opacity: 0, y: MOTION.reveal.distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.reveal.duration, ease: MOTION.ease.out },
  },
}

export const fadeUpStrong = {
  hidden: { opacity: 0, y: MOTION.reveal.distanceStrong },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.reveal.duration + 0.15, ease: MOTION.ease.out },
  },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: MOTION.reveal.stagger, delayChildren: 0.05 },
  },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: MOTION.ease.out },
  },
}

export const maskUp = {
  hidden: { clipPath: 'inset(100% 0 0 0)' },
  visible: {
    clipPath: 'inset(0% 0 0 0)',
    transition: { duration: MOTION.mask.duration, ease: MOTION.ease.out },
  },
}
