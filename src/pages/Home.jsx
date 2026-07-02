import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, BookOpen, ArrowRight, ArrowUpRight, MapPin, Package, Coffee, GraduationCap, Briefcase } from 'lucide-react'
import { motion, useInView, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { getFeaturedProducts } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'
import ProductDetailModal from '../components/ProductDetailModal'
import toast from 'react-hot-toast'
import '../styles/home-redesign.css'

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

/* Hero — one full-viewport screen: video background, logo, headline, CTAs.
   No scroll-linked crossfade, no split links, no decorative layers. */
function Hero() {
  const reduced = useReducedMotion()
  return (
    <section className="hr-hero3">
      <video
        className="hr-hero3-video"
        src="/cafe-tour.mp4"
        poster="/hero-bg.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="hr-hero3-scrim" aria-hidden="true" />
      <motion.div
        className="hr-hero3-inner"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <img className="hr-hero3-logo" src="/logo.png" alt="Mastermind Brews, specialty coffee roastery and academy" />
        <p className="hero-tagline-pill">
          <span className="hero-tagline-pill-text">Specialty Coffee · Roastery &amp; Academy · Mumbai, India</span>
        </p>
        <h1 className="hr-hero-head">A portfolio built for <em>every cup.</em></h1>
        <p className="hr-hero-sub">
          Single-origin Chikmagalur beans, an online barista academy, and a cafe in Mulund where it all began.
        </p>
        <div className="hr-hero-cta">
          <Link to="/store" className="hr-btn hr-btn-primary"><ShoppingBag size={16} /> Order Beans</Link>
          <Link to="/workshop" className="hr-btn hr-btn-ghost"><BookOpen size={16} /> Start Learning</Link>
        </div>
      </motion.div>
    </section>
  )
}

/* ===== OUR STANDARDS — bento craft grid ===== */
const CRAFT_ITEMS = [
  {
    num: '01',
    title: 'Single-Origin,\nAlways.',
    body: 'Every bag traces to a named Chikmagalur estate — no blends, no filler. One farmer, one terroir, one honest cup.',
    color: '#b07433',
    img: '/offer-beans.jpg',
  },
  {
    num: '02',
    title: 'Roasted\nto Profile.',
    body: 'We partner with Bean Rove to develop exclusive roast curves for each lot — consistent down to the gram, every batch.',
    color: '#c27840',
    img: '/hero-bg.jpg',
  },
  {
    num: '03',
    title: 'Taught by\nChampions.',
    body: 'Our academy is built by competition-placed baristas. Practical, technical, and career-ready — not just hobbyist content.',
    color: '#9a6b2a',
    img: '/offer-academy.png',
  },
  {
    num: '04',
    title: 'Bar-Quality\nat Home.',
    body: "What ships to your door is what we pour at Mulund. If it doesn't pass our bar, it never leaves our roastery.",
    color: '#d4894e',
    img: '/project-cafe.jpg',
  },
]

function CraftCard({ item, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const [hovered, setHovered] = useState(false)
  const reduced = useReducedMotion()
  return (
    <motion.div
      ref={ref}
      className="craft-card"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="craft-card-bg" style={{ backgroundImage: `url(${item.img})` }} />
      <motion.div
        className="craft-card-glow"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.55 }}
        style={{ background: `radial-gradient(ellipse at 30% 90%, ${item.color}30, transparent 62%)` }}
      />
      <div className="craft-card-content">
        <span className="craft-card-num">{item.num}</span>
        <motion.h3
          className="craft-card-title"
          animate={reduced ? undefined : { y: hovered ? -6 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {item.title.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </motion.h3>
        <p className="craft-card-body">{item.body}</p>
        <motion.div
          className="craft-card-rule"
          animate={{ scaleX: hovered ? 1 : 0 }}
          style={{ originX: 0, backgroundColor: item.color }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  )
}

function CraftSection() {
  return (
    <section className="craft-section">
      <div className="craft-intro">
        <AnimatedSection><div className="hr-label">Our Standards</div></AnimatedSection>
        <WordReveal
          className="craft-heading"
          text={[{ t: 'Coffee done ' }, { t: 'the right way.', em: true }]}
        />
      </div>
      <div className="craft-grid">
        {CRAFT_ITEMS.map((item, i) => (
          <CraftCard key={item.num} item={item} index={i} />
        ))}
      </div>
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

  useEffect(() => {
    let cancelled = false
    getFeaturedProducts(4)
      .then((data) => { if (!cancelled) setFeatured(data) })
      .catch((err) => console.error('Failed to load featured products:', err))
      .finally(() => { if (!cancelled) setFeaturedLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="home home--redesign">
      {/* ===== HERO ===== */}
      <Hero />

      {/* ===== THREE VERTICALS ===== */}
      <section className="hr-verticals">
        <div className="hr-vert-head">
          <AnimatedSection><div className="hr-label">What We Do</div></AnimatedSection>
          <WordReveal className="hr-section-title" text={[{ t: 'Three ways to ' }, { t: 'love coffee.', em: true }]} />
        </div>
        {VERTICALS.map((v) => <VerticalRow key={v.num} v={v} />)}
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
              <Link to="/store" className="hr-vert-link">View all <ArrowRight size={14} /></Link>
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

      {/* ===== VISIT THE CAFE ===== */}
      <section className="hr-visit">
        <div className="hr-visit-bg" aria-hidden="true" />
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
            <a href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund" target="_blank" rel="noopener noreferrer" className="hr-btn hr-btn-primary">
              Get Directions <ArrowUpRight size={15} />
            </a>
            <a href="https://www.mastermindbrews.com/" target="_blank" rel="noopener noreferrer" className="hr-btn hr-btn-ghost">Cafe Website</a>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== OUR STANDARDS (bento craft grid) ===== */}
      <CraftSection />

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
