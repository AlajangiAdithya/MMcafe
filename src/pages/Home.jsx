import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, BookOpen, ArrowRight, ArrowUpRight, MapPin, Clock, Package, Coffee, GraduationCap, Briefcase } from 'lucide-react'
import { motion, useInView, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion'
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
    img: '/offer-beans.jpg', to: '/store', cta: 'Buy Coffee',
  },
  {
    num: '02', cat: 'The Academy', icon: GraduationCap,
    title: <>Learn the craft, <em>on any screen.</em></>,
    body: 'HD video courses from certified, competition-placed baristas. From your first espresso pull to latte-art mastery, learn at your own pace, anywhere in India.',
    img: '/offer-academy.png', to: '/workshop', cta: 'Learn Coffee',
  },
  {
    num: '03', cat: 'The Projects', icon: Briefcase,
    title: <>We help cafes <em>get better.</em></>,
    body: 'Menu and beverage design, operations, barista training and quality audits, the same team that runs Mastermind, available to build your coffee program.',
    img: '/project-cafe.jpg', to: '/consultancy', cta: 'Our Projects',
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
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const reduced = useReducedMotion()
  return (
    <div className="hr-vert" ref={ref}>
      <motion.div
        className="hr-vert-media"
        initial={reduced ? { opacity: 0 } : { clipPath: 'inset(12% 12% 12% 12% round 16px)', opacity: 0.4 }}
        animate={inView ? (reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1 }) : undefined}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={v.img} alt={`${v.cat}, Mastermind Brews`} loading="lazy" />
        <span className="hr-vert-num">{v.num}</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="hr-vert-cat"><v.icon size={13} style={{ display: 'inline', marginRight: 7, verticalAlign: '-2px' }} />{v.cat}</span>
        <h3 className="hr-vert-title">{v.title}</h3>
        <p className="hr-vert-body">{v.body}</p>
        <Link to={v.to} className="hr-vert-link">{v.cta} <ArrowRight size={14} /></Link>
      </motion.div>
    </div>
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
            <span className="hero-split-hint"><ShoppingBag size={18} aria-hidden="true" /><span>Click here to Buy Coffee</span></span>
          </Link>
          <Link to="/workshop" className="hero-split-link hero-split-link--right" aria-label="Learn Coffee">
            <span className="hero-split-hint"><BookOpen size={18} aria-hidden="true" /><span>Click here to Learn Coffee</span></span>
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
            <h1 className="hr-hero-head">The art of <em>great coffee.</em></h1>
            <p className="hr-hero-sub">
              Single-origin Chikmagalur beans, an online barista academy, and a cafe in Mulund where it all began.
            </p>
            <div className="hr-hero-cta">
              <Magnetic><Link to="/store" className="hr-btn hr-btn-primary"><ShoppingBag size={16} /> Buy Coffee</Link></Magnetic>
              <Magnetic><Link to="/workshop" className="hr-btn hr-btn-ghost"><BookOpen size={16} /> Learn Coffee</Link></Magnetic>
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
        <AnimatedSection className="hr-vert-head">
          <div className="hr-label">What We Do</div>
          <h2 className="hr-section-title">Three ways to <em>love coffee.</em></h2>
        </AnimatedSection>
        {VERTICALS.map((v) => <VerticalRow key={v.num} v={v} />)}
      </section>

      {/* ===== THE RITUAL, capsule-oval editorial (capsules.moyra.co-style) ===== */}
      <section className="cap-ritual">
        <div className="cap-wrap">
          <AnimatedSection>
            <div className="hr-label" style={{ color: 'var(--hr-accent-bright)' }}>The Ritual</div>
            <h2 className="cap-ritual-head">Closer to the bean. <em>Closer to the cup.</em></h2>
          </AnimatedSection>
          <div className="cap-ritual-grid">
            <AnimatedSection className="cap-ovals">
              <div className="cap-oval"><img src="/pour-over-coffee.jpg" alt="A slow pour-over brew at Mastermind Brews" loading="lazy" /></div>
              <div className="cap-oval"><img src="/offer-beans.jpg" alt="Single-origin Chikmagalur coffee beans" loading="lazy" /></div>
            </AnimatedSection>
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
              <AnimatedSection className="section-header" style={{ marginBottom: 0 }}>
                <div className="hr-label">Best Sellers</div>
                <h2 className="hr-section-title">Daily brews, <em>bagged.</em></h2>
              </AnimatedSection>
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
                        <button
                          type="button"
                          className="btn btn-blue btn-sm full-width"
                          onClick={(e) => { e.stopPropagation(); addItem(product); toast.success(`${product.name} added`) }}
                        >
                          <ShoppingBag size={14} /> Add to cart
                        </button>
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
                        <button
                          type="button"
                          className="add-btn"
                          aria-label={`Add ${product.name} to cart`}
                          onClick={(e) => { e.stopPropagation(); addItem(product); toast.success(`${product.name} added`) }}
                        >
                          <ShoppingBag size={16} />
                        </button>
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
        <div
          className="cap-mark-pill"
          role="img"
          aria-label="Inside Mastermind Bicycle Cafe in Mulund"
          style={{ backgroundImage: 'url(/project-cafe.jpg)' }}
        >
          <span className="cap-mark-pill-scrim" aria-hidden="true" />
          <span className="cap-mark-pill-cap">Roastery &amp; Academy · Mulund</span>
        </div>
      </section>

      {/* ===== VISIT THE CAFE (cinematic band) ===== */}
      <section className="hr-visit">
        <div className="hr-visit-bg" aria-hidden="true" />
        <div className="hr-visit-scrim" aria-hidden="true" />
        <AnimatedSection className="hr-visit-inner">
          <div className="hr-label" style={{ color: 'var(--hr-accent-bright)' }}>Visit Us</div>
          <h2>A coffee house. <em>A community space.</em></h2>
          <div className="hr-visit-meta">
            <span><MapPin size={14} /> Avior Corporate Park, Mulund West</span>
            <span><Clock size={14} /> Open daily · 8:30 AM – 12 AM</span>
          </div>
          <div className="hr-hero-cta">
            <Magnetic>
              <a href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund" target="_blank" rel="noopener noreferrer" className="hr-btn hr-btn-primary">
                Get Directions <ArrowUpRight size={15} />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="https://www.mastermindbrews.com/" target="_blank" rel="noopener noreferrer" className="hr-btn hr-btn-ghost">Cafe Website</a>
            </Magnetic>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section className="hr-cta">
        <AnimatedSection>
          <div className="hr-label">Start Here</div>
          <h2>Your next great <em>cup</em> awaits.</h2>
          <p>Order single-origin beans, book a workshop, or drop by the bar, wherever you are on the coffee journey, we&rsquo;ll meet you there.</p>
          <div className="hr-hero-cta">
            <Magnetic><Link to="/store" className="hr-btn hr-btn-primary"><ShoppingBag size={16} /> Shop Coffee</Link></Magnetic>
            <Magnetic><Link to="/about" className="hr-btn hr-btn-ghost">Our Story</Link></Magnetic>
          </div>
        </AnimatedSection>
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
