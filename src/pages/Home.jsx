import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, BookOpen, ArrowRight, ArrowUpRight, MapPin, Package, Coffee, GraduationCap, Briefcase, Flame, Compass, Wind } from 'lucide-react'
import { motion, useInView, AnimatePresence, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { getFeaturedProducts } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'
import ProductDetailModal from '../components/ProductDetailModal'
import Magnetic from '../components/Magnetic'
import MarqueeStrip from '../components/MarqueeStrip'
import VaporizeTextCycle, { Tag } from '@/components/ui/vapour-text-effect'
import toast from 'react-hot-toast'
import '../styles/home-redesign.css'

const MARQUEE_TERMS = [
  { en: 'ROASTED IN CHIKMAGALUR' },
  { en: 'SPECIALTY COFFEE' },
  { en: 'ONE CUP AT A TIME' },
  { en: 'BEAN ROVE PROFILES' },
  { en: 'OPEN ALL DAYS · 08:30 – 24:00' },
  { en: 'CRAFTED BY HAND' },
]

const VERTICALS = [
  {
    num: '01', cat: 'The Beans', icon: Coffee,
    title: <>Single-origin, <em>roasted to profile.</em></>,
    body: 'Hand-picked cherries from Chikmagalur estates, roasted to exclusive profiles by Bean Rove and sealed fresh, the same coffee we pour at the bar, shipped to your door.',
    img: '/offer-beans.jpg', to: '/store', cta: 'Shop the beans',
  },
  {
    num: '02', cat: 'The Academy', icon: GraduationCap,
    title: <>Learn the craft, <em>on any screen.</em></>,
    body: 'HD video courses from certified, competition-placed baristas. From your first espresso pull to latte-art mastery, learn at your own pace, anywhere in India.',
    img: '/offer-academy.png', to: '/workshop', cta: 'Browse courses',
  },
  {
    num: '03', cat: 'The Projects', icon: Briefcase,
    title: <>We help cafes <em>get better.</em></>,
    body: 'Menu and beverage design, operations, barista training and quality audits, the same team that runs Mastermind, available to build your coffee program.',
    img: '/project-cafe.jpg', to: '/consultancy', cta: 'See our work',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

/* useParallax: maps a section's scroll-through-viewport progress to a px range.
   Smoothed with a spring so it never feels jittery. Returns 0 (no motion) when
   the user prefers reduced motion. */
function useParallax(ref, distance = 80) {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  const smooth = useSpring(raw, { stiffness: 90, damping: 24, mass: 0.4 })
  return reduced ? 0 : smooth
}

/* WordReveal: splits a heading into words and floats each one up in sequence
   the first time it scrolls into view. Italic <em> emphasis is preserved. */
function WordReveal({ text, className, as = 'h2' }) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-12%' })
  const MotionTag = motion[as]
  // text is an array of { t, em } segments
  const words = []
  text.forEach((seg, si) => {
    seg.t.split(' ').filter(Boolean).forEach((w, wi) => words.push({ w, em: seg.em, key: `${si}-${wi}` }))
  })
  if (reduced) {
    const Tag = as
    return <Tag ref={ref} className={className}>{text.map((s, i) => s.em ? <em key={i}>{s.t}</em> : s.t)}</Tag>
  }
  return (
    <MotionTag ref={ref} className={className} aria-label={text.map((s) => s.t).join('')}>
      {words.map((word, i) => (
        <span key={word.key} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.14em', marginBottom: '-0.14em' }} aria-hidden="true">
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%' }}
            animate={inView ? { y: '0%' } : { y: '110%' }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            {word.em ? <em>{word.w}</em> : word.w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}

/* ScrollFlowLines: decorative wavy lines that "draw" themselves (pathLength 0→1)
   in sync with how far the section has scrolled through the viewport. A spring
   keeps the flow smooth. Returns nothing when reduced motion is preferred. */
function ScrollFlowLines({ className, stroke = 'rgba(176,116,51,0.28)' }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const draw = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.5 })
  if (reduced) return null
  const paths = [
    'M-40,150 C220,60 380,250 640,150 900,50 1060,250 1240,150',
    'M-40,400 C200,300 420,500 660,400 900,300 1080,500 1240,400',
    'M-40,650 C220,560 380,760 640,650 900,540 1060,760 1240,650',
  ]
  return (
    <svg
      ref={ref}
      className={`flow-lines ${className || ''}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ pathLength: draw, opacity: draw }}
        />
      ))}
    </svg>
  )
}

/* Bean: a single coffee-bean glyph (ellipse + the signature curved crease). */
function Bean({ size = 26, rotate = 0, className, style }) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <g transform={`rotate(${rotate} 16 16)`}>
        <ellipse cx="16" cy="16" rx="9" ry="13" fill="currentColor" />
        <path d="M16 4.5C12 9 12 23 16 27.5" stroke="var(--bean-crease, rgba(255,247,230,0.55))" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  )
}

/* CoffeeBeans: a scattered cluster of beans used as a section decoration. */
function CoffeeBeans({ className }) {
  return (
    <span className={`coffee-beans ${className || ''}`} aria-hidden="true">
      <Bean size={30} rotate={-18} className="coffee-bean coffee-bean--1" />
      <Bean size={22} rotate={32} className="coffee-bean coffee-bean--2" />
      <Bean size={26} rotate={8} className="coffee-bean coffee-bean--3" />
      <Bean size={18} rotate={-40} className="coffee-bean coffee-bean--4" />
    </span>
  )
}

function AnimatedSection({ children, className, delay = 0, style }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] } } }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

function VerticalRow({ v }) {
  const ref = useRef(null)
  const mediaRef = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const reduced = useReducedMotion()
  const imgY = useParallax(mediaRef, 60)
  return (
    <div className="hr-vert" ref={ref}>
      <motion.div
        ref={mediaRef}
        className="hr-vert-media"
        initial={reduced ? { opacity: 0 } : { clipPath: 'inset(12% 12% 12% 12% round 16px)', opacity: 0.4 }}
        animate={inView ? (reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1 }) : undefined}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* over-tall inner wrapper so parallax y has room without showing gaps */}
        <motion.div className="hr-vert-media-inner" style={{ y: imgY }}>
          <img src={v.img} alt={`${v.cat}, Mastermind Brews`} loading="lazy" />
        </motion.div>
        <span className="hr-vert-num">{v.num}</span>
      </motion.div>
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.05
            }
          }
        }}
      >
        <motion.span 
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
          }}
          className="hr-vert-cat"
        >
          <v.icon size={13} style={{ display: 'inline', marginRight: 7, verticalAlign: '-2px' }} />
          {v.cat}
        </motion.span>
        
        <motion.h3 
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
          }}
          className="hr-vert-title"
        >
          {v.title}
        </motion.h3>
        
        <motion.p 
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
          }}
          className="hr-vert-body"
        >
          {v.body}
        </motion.p>
        
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
          }}
        >
          <Link to={v.to} className="hr-vert-link">
            {v.cta} <ArrowRight size={14} className="hr-link-arrow" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

/* RitualOvals, two capsule images that drift in opposite directions on scroll
   to give the section depth. */
function RitualOvals() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-12%' })
  const reduced = useReducedMotion()
  const yA = useParallax(ref, 70)
  const yB = useParallax(ref, -90)
  return (
    <div className="cap-ovals" ref={ref}>
      <motion.div
        className="cap-oval" style={{ y: yA }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86 }}
        animate={inView ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src="/pour-over-coffee.jpg" alt="A slow pour-over brew at Mastermind Brews" loading="lazy" />
      </motion.div>
      <motion.div
        className="cap-oval" style={{ y: yB }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86 }}
        animate={inView ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src="/offer-beans.jpg" alt="Single-origin Chikmagalur coffee beans" loading="lazy" />
      </motion.div>
    </div>
  )
}

/* ParallaxBand, cinematic background image that pans slowly as the band scrolls
   through the viewport (used by the "Visit the cafe" section). */
function ParallaxBand() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.18, 1.12])
  return (
    <motion.div
      ref={ref}
      className="hr-visit-bg"
      aria-hidden="true"
      style={reduced ? undefined : { y, scale }}
    />
  )
}

/* ScrollPill, the giant-wordmark section's inset image grows and lifts slightly
   as it crosses the viewport. */
function ScrollPill() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.82, 1, 0.92])
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  return (
    <motion.div
      ref={ref}
      className="cap-mark-pill"
      role="img"
      aria-label="Inside Mastermind Bicycle Cafe in Mulund"
      style={reduced ? { backgroundImage: 'url(/project-cafe.jpg)' } : { backgroundImage: 'url(/project-cafe.jpg)', scale, y }}
    >
      <span className="cap-mark-pill-scrim" aria-hidden="true" />
      <span className="cap-mark-pill-cap">Roastery &amp; Academy · Mulund</span>
    </motion.div>
  )
}

/* ScrollHero, single hero with an autoplaying video background. At the top
   it shows the brand logo + split "Buy / Learn" links; as you scroll they rise
   and fade out while the "The art of great coffee" headline block fades up into
   their place. Pure scroll-linked crossfade (sticky over a tall section). */
function ScrollHero() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  // Drive the crossfade off absolute window scroll (px), the hero sits at the
  // very top of the page, so this is unambiguous and frame-accurate.
  const { scrollY } = useScroll()

  const logoOpacity = useTransform(scrollY, [0, 150, 360], [1, 1, 0])
  const logoY = useTransform(scrollY, [0, 360], [0, -170])
  const textOpacity = useTransform(scrollY, [340, 520, 680], [0, 1, 1])
  const textY = useTransform(scrollY, [340, 560], [120, 0])
  const cueOpacity = useTransform(scrollY, [0, 130], [1, 0])

  return (
    <section className="hr-hero2" ref={ref}>
      <div className="hr-hero2-sticky">
        <video
          className="hr-hero2-video"
          src="/cafe-tour.mp4"
          poster="/hero-bg.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="hr-hero2-scrim" aria-hidden="true" />

        {/* Split links, rise & fade with the logo */}
        <motion.div className="hr-hero2-splits" style={{ opacity: logoOpacity, y: logoY }}>
          <Link to="/store" className="hero-split-link hero-split-link--left" aria-label="Buy Coffee">
            <span className="hero-split-hint"><ShoppingBag size={18} aria-hidden="true" /><span>Buy Coffee</span></span>
          </Link>
          <Link to="/workshop" className="hero-split-link hero-split-link--right" aria-label="Learn Coffee">
            <span className="hero-split-hint"><BookOpen size={18} aria-hidden="true" /><span>Learn Coffee</span></span>
          </Link>
        </motion.div>

        <div className="hr-hero2-stage">
          {/* Block A, logo + tagline pill */}
          <motion.div className="hr-hero2-block hr-hero2-logo" style={{ opacity: logoOpacity, y: logoY }}>
            <motion.div
              className="hero-logo-spotlight"
              initial={reduced ? false : { opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <span className="hero-logo-spotlight-aura" aria-hidden="true" />
              <span className="hero-logo-spotlight-halo" aria-hidden="true" />
              <span className="hero-logo-spotlight-ring hero-logo-spotlight-ring--1" aria-hidden="true" />
              <span className="hero-logo-spotlight-ring hero-logo-spotlight-ring--2" aria-hidden="true" />
              <span className="hero-logo-spotlight-shine" aria-hidden="true" />
              <img className="hero-logo-spotlight-img" src="/logo.png" alt="Mastermind Brews, specialty coffee roastery and academy" />
            </motion.div>
            <div className="hero-tagline-pill">
              <span className="hero-tagline-pill-dot" aria-hidden="true" />
              <span className="hero-tagline-pill-text">Specialty Coffee · Roastery &amp; Academy · Mumbai, India</span>
              <span className="hero-tagline-pill-dot" aria-hidden="true" />
            </div>
          </motion.div>

          {/* Block B, headline that takes the logo's place on scroll */}
          <motion.div className="hr-hero2-block hr-hero2-text" style={{ opacity: textOpacity, y: textY }}>
            <div className="hr-eyebrow">Mastermind Brews · Mumbai, India</div>
            <h1 className="hr-hero-head">A portfolio built for <em>every cup.</em></h1>
            <p className="hr-hero-sub">
              Single-origin Chikmagalur beans, an online barista academy, and a cafe in Mulund where it all began.
            </p>
            <div className="hr-hero-cta">
              <Magnetic><Link to="/store" className="hr-btn hr-btn-primary"><ShoppingBag size={16} /> Order Beans</Link></Magnetic>
              <Magnetic><Link to="/workshop" className="hr-btn hr-btn-ghost"><BookOpen size={16} /> Start Learning</Link></Magnetic>
            </div>
          </motion.div>
        </div>

        <motion.div className="hr-hero2-cue" style={{ opacity: cueOpacity }}>
          <span className="hr-scrollcue"><span className="hr-mouse" /> Scroll</span>
        </motion.div>
      </div>
    </section>
  )
}

/* FLOATING IMAGES — scattered draggable photo cluster above the "Visit Us" section */
const FLOAT_IMAGES = [
  { src: '/hero-bg.jpg',            x: '3%',  y: '8%',  rotate: -8, w: 195 },
  { src: '/pour-over-coffee.jpg',   x: '24%', y: '22%', rotate:  5, w: 225 },
  { src: '/namrata-thakkar.jpg',    x: '49%', y: '4%',  rotate: -3, w: 185 },
  { src: '/about-team.jpg',         x: '70%', y: '16%', rotate:  9, w: 210 },
  { src: '/cafe-food.png',          x: '84%', y: '36%', rotate: -6, w: 170 },
]

function FloatingImages() {
  return (
    <section className="hr-float-section" aria-hidden="true">
      <div className="hr-float-zone">
        {FLOAT_IMAGES.map((img, i) => (
          <motion.div
            key={i}
            className="hr-float-card"
            style={{ left: img.x, top: img.y, width: img.w }}
            drag
            dragConstraints={{ left: -90, right: 90, top: -90, bottom: 90 }}
            dragElastic={0.14}
            whileDrag={{ scale: 1.07, zIndex: 20 }}
            whileHover={{ scale: 1.04 }}
            initial={{ opacity: 0, scale: 0.82, rotate: img.rotate * 1.6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: img.rotate }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.85, delay: i * 0.11, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={img.src} alt="" loading="lazy" draggable="false" />
          </motion.div>
        ))}
      </div>
      <p className="hr-float-hint">grab &amp; move</p>
    </section>
  )
}


export default function Home() {
  usePageMeta({
    title: 'Specialty Coffee, Barista Academy & Cafe in Mulund, Mumbai',
    description: 'Single-origin Chikmagalur coffee, continental food, baked goods, and an online barista academy. Order beans online or visit Mastermind Bicycle Cafe & Bar in Mulund, Mumbai.',
    keywords: 'specialty coffee Mumbai, single origin coffee India, Chikmagalur coffee beans, cafe in Mulund, Mastermind Bicycle Cafe, online barista academy, buy coffee beans online India, espresso classes Mumbai, pour over coffee India',
    image: 'https://www.mastermindbrews.com/hero-bg.jpg',
  })
  const { addItem } = useCart()
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [openProduct, setOpenProduct] = useState(null)
  const prefersReducedMotion = useReducedMotion()
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('mm-intro') && !prefersReducedMotion,
  )

  useEffect(() => {
    let cancelled = false
    getFeaturedProducts(4)
      .then((data) => { if (!cancelled) setFeatured(data) })
      .catch((err) => console.error('Failed to load featured products:', err))
      .finally(() => { if (!cancelled) setFeaturedLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleVaporizeEnd = useCallback(() => {
    sessionStorage.setItem('mm-intro', '1')
    setShowIntro(false)
  }, [])

  return (
    <div className="home home--redesign">
      {/* ===== VAPOUR TEXT INTRO (preloader) ===== */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0908', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ width: '90vw', maxWidth: '900px', height: '100px' }}>
              <VaporizeTextCycle
                texts={['Ride Hard / Eat Easy']}
                font={{ fontFamily: "'Yanone Kaffeesatz', sans-serif", fontSize: '68px', fontWeight: 600 }}
                color="rgb(248, 245, 242)"
                spread={5}
                density={7}
                animation={{ vaporizeDuration: 0.7, fadeInDuration: 0.1, waitDuration: 0.05 }}
                direction="left-to-right"
                alignment="center"
                tag={Tag.H1}
                startDelay={400}
                loop={false}
                onVaporizeEnd={handleVaporizeEnd}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HERO, video bg; logo→headline scroll crossfade ===== */}
      <ScrollHero />

      <MarqueeStrip items={MARQUEE_TERMS} variant="paper" tall />

      {/* ===== THREE VERTICALS ===== */}
      <section className="hr-verticals">
        <ScrollFlowLines className="hr-vert-lines" stroke="rgba(176,116,51,0.22)" />
        <div className="hr-vert-head">
          <CoffeeBeans className="hr-vert-beans" />
          <AnimatedSection><div className="hr-label">What We Do</div></AnimatedSection>
          <WordReveal className="hr-section-title" text={[{ t: 'Three ways to ' }, { t: 'love coffee.', em: true }]} />
        </div>
        {VERTICALS.map((v) => <VerticalRow key={v.num} v={v} />)}
      </section>

      {/* ===== THE RITUAL, capsule-oval editorial (capsules.moyra.co-style) ===== */}
      <section className="cap-ritual">
        <ScrollFlowLines className="cap-ritual-lines" stroke="rgba(221,158,85,0.32)" />
        <div className="cap-wrap">
          <AnimatedSection>
            <div className="hr-label" style={{ color: 'var(--hr-accent-bright)' }}>The Ritual</div>
          </AnimatedSection>
          <AnimatedSection delay={0.08}>
            <h2 className="cap-ritual-head">Closer to the bean. <em>Closer to the cup.</em></h2>
            <p className="cap-ritual-kicker">Every cup is a small ceremony, from cherry to crema.</p>
          </AnimatedSection>
          <div className="cap-ritual-grid">
            <RitualOvals />
            <AnimatedSection className="cap-ritual-text" delay={0.15}>
              <p>A place to slow down, where single-origin beans, careful roasting, and a steady pour turn a simple cup into a small, daily ceremony.</p>
              <Link to="/store" className="cap-ritual-link">Discover the coffee <ArrowRight size={14} /></Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== FEATURED COFFEE ===== */}
      {(featuredLoading || featured.length > 0) && (
        <section className="featured-section featured-section--editorial" data-chapter="bestsellers" style={{ background: 'var(--bg-secondary, #f8f4ea)' }}>
          <div className="container">
            <div className="featured-header featured-header--editorial">
              <div className="section-header" style={{ marginBottom: 0 }}>
                <AnimatedSection><div className="hr-label">Best Sellers</div></AnimatedSection>
                <WordReveal className="hr-section-title" text={[{ t: 'Daily brews, ' }, { t: 'bagged.', em: true }]} />
              </div>
              <Magnetic strength={0.3}>
                <Link to="/store" className="hr-vert-link">View all <ArrowRight size={14} /></Link>
              </Magnetic>
            </div>
            {featuredLoading ? (
              <div className="featured-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="featured-product featured-product-skeleton">
                    <div className="featured-product-image skeleton-block" />
                    <div className="featured-product-info">
                      <div className="skeleton-line skeleton-line-sm" />
                      <div className="skeleton-line" />
                      <div className="skeleton-line skeleton-line-sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                className="featured-grid"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={staggerContainer}
              >
                {featured.map((product) => (
                  <motion.article
                    key={product.id}
                    className="featured-product has-sheen"
                    variants={fadeUp}
                    whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.015, boxShadow: '0 20px 48px rgba(80, 50, 10, 0.15)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={() => setOpenProduct(product)}
                  >
                    <div className="featured-product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} loading="lazy" />
                      ) : (
                        <div className="featured-product-placeholder"><Package size={36} /></div>
                      )}
                      <div className="featured-product-overlay" />
                      <div className="featured-product-quick">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-blue btn-sm full-width"
                          onClick={(e) => { e.stopPropagation(); addItem(product); toast.success(`${product.name} added`) }}
                        >
                          <ShoppingBag size={14} /> Add to cart
                        </motion.button>
                      </div>
                    </div>
                    <div className="featured-product-info">
                      <div className="featured-product-category">{product.category}</div>
                      <button
                        type="button"
                        className="featured-product-name"
                        onClick={(e) => { e.stopPropagation(); setOpenProduct(product) }}
                        style={{ appearance: 'none', background: 'none', border: 0, padding: 0, margin: 0, font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer', display: 'block', width: '100%' }}
                      >
                        {product.name}
                      </button>
                      {product.weight && <div className="featured-product-weight">{product.weight}</div>}
                      <div className="featured-product-bottom">
                        <span className="featured-product-price">₹{product.price}</span>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.94 }}
                          className="add-btn"
                          aria-label={`Add ${product.name} to cart`}
                          onClick={(e) => { e.stopPropagation(); addItem(product); toast.success(`${product.name} added`) }}
                        >
                          <ShoppingBag size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* ===== GIANT WORDMARK + INSET PILL (capsules.moyra.co-style) ===== */}
      <section className="cap-mark" aria-label="Mastermind Brews">
        <div className="cap-mark-track" aria-hidden="true">
          <span>Mastermind Brews ·</span>
          <span>Mastermind Brews ·</span>
          <span>Mastermind Brews ·</span>
          <span>Mastermind Brews ·</span>
        </div>
        <ScrollPill />
      </section>

      {/* ===== FLOATING IMAGES (draggable, above Visit section) ===== */}
      <FloatingImages />

      {/* ===== VISIT THE CAFE (cinematic band) ===== */}
      <section className="hr-visit">
        <ParallaxBand />
        <div className="hr-visit-scrim" aria-hidden="true" />
        <motion.div
          className="hr-visit-inner"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-15%' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
          }}
        >
          <motion.div
            className="hr-label"
            style={{ color: 'var(--hr-accent-bright)' }}
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            Visit Us
          </motion.div>
          <WordReveal as="h2" text={[{ t: 'A coffee house. ' }, { t: 'A community space.', em: true }]} />
          <motion.div
            className="hr-visit-meta"
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            <span><MapPin size={14} /> Avior Corporate Park, Mulund West</span>
          </motion.div>
          <motion.div
            className="hr-hero-cta"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            <Magnetic>
              <a href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund" target="_blank" rel="noopener noreferrer" className="hr-btn hr-btn-primary">
                Get Directions <ArrowUpRight size={15} />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="https://www.mastermindbrews.com/" target="_blank" rel="noopener noreferrer" className="hr-btn hr-btn-ghost">Cafe Website</a>
            </Magnetic>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section className="hr-cta">
        <span className="hr-steam" aria-hidden="true">
          <span className="hr-steam-wisp" />
          <span className="hr-steam-wisp" />
          <span className="hr-steam-wisp" />
        </span>
        <CoffeeBeans className="hr-cta-beans" aria-hidden="true" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-12%' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } }
          }}
        >
          <motion.div
            className="hr-label"
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            Start Here
          </motion.div>
          <WordReveal as="h2" text={[{ t: 'Your next great ' }, { t: 'cup', em: true }, { t: ' awaits.' }]} />
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            Order single-origin beans, book a workshop, or drop by the bar&mdash;wherever you are on the coffee journey, we&rsquo;ll meet you there.
          </motion.p>
          <motion.div
            className="hr-hero-cta"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            <Magnetic><Link to="/store" className="hr-btn hr-btn-primary"><ShoppingBag size={16} /> Explore the store</Link></Magnetic>
            <Magnetic><Link to="/about" className="hr-btn hr-btn-ghost">Our Story</Link></Magnetic>
          </motion.div>
        </motion.div>
      </section>

      {openProduct && (
        <ProductDetailModal
          product={openProduct}
          onClose={() => setOpenProduct(null)}
          allProducts={featured}
        />
      )}
    </div>
  )
}
