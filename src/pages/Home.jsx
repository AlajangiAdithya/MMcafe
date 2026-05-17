import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, BookOpen, ArrowRight, Play, Star, Award, Coffee, Truck, ChevronDown, Clock, MapPin, Phone, Mail, Globe, Package, History, Check, Flame, Sparkles } from 'lucide-react'

function Instagram({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { getFeaturedProducts, getProducts } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'
import { useRecentlyViewed } from '../lib/useRecentlyViewed'
import ProductDetailModal from '../components/ProductDetailModal'
import toast from 'react-hot-toast'

import { AnimatedText } from '@/components/ui/animated-underline-text-one'
import { SocialLinks } from '@/components/ui/social-links'
import VaporizeTextCycle, { Tag } from '@/components/ui/vapour-text-effect'

const TESTIMONIALS = [
  { name: 'Aayushi Joshi', role: 'Google Review', initials: 'AJ', rating: 5, text: 'Loved that they offer gluten-free pizza options, vegan cheese, and a vegan menu. Highly recommended! 🌱 Special thanks to Deepak for his attentive service.' },
  { name: 'Tejal Rajak', role: 'Google Review', initials: 'TR', rating: 4, text: 'Visited this cute yet classy cafe. Ordered Mocha Cold and Peri Peri Paneer Pizza - both quite good. Staff is polite and chill, ambience is beautiful. A must visit in Mulund, and the best part is it being pet friendly. 😍' },
  { name: 'Rick Snyder', role: 'Google Review', initials: 'RS', rating: 5, text: 'The food was so good - huge variety on the menu. Iced matcha latte was perfect, the pesto & burrata pizza and nachos were fantastic. Shubham was our server and he was really friendly. Ask for him to serve you!' },
]

// Placeholder content — client will replace with real project case studies.
const PROJECTS = [
  {
    title: 'Mastermind Bicycle Cafe',
    location: 'Mulund, Mumbai',
    summary: 'Our flagship cafe: a full coffee program, European-inspired menu, and a community space built from the ground up.',
    image: 'https://lh3.googleusercontent.com/ObyGM3YfiJC4M2LPUP1rdV082_LsSN7ath2Sb3CRPa3rB5znuyR8orGk95j1OQcu-f1KxzfwDayEDvFFj8zmS8PxD6ZG_Oooc0HOAzDR=w1200-rw',
    tag: 'Flagship',
  },
  {
    title: 'Bean Rove Roast Profiles',
    location: 'Chikmagalur, Karnataka',
    summary: 'Exclusive single-origin profiles roasted in partnership with Bean Rove, the same beans we serve and ship.',
    image: 'https://lh3.googleusercontent.com/csYL5joKIL4Oz1VMMoGVBqLQMUwHqHLMVCmwzc_G8o_kddGd-uqCqyER8gXLs_oLgaQMnlIK-KQARysDbwXusuLWqK9I3zgauCwtLKvQKA=w1200-rw',
    tag: 'Sourcing',
  },
  {
    title: 'Barista Training Program',
    location: 'Online & On-Site',
    summary: 'Structured curriculum used to onboard cafe partners and individual baristas: espresso, milk craft, brewing science.',
    image: 'https://lh3.googleusercontent.com/2W1cw4DDp8TacRRBjH3H-MzLWOVy9G0KtXUwK6DFgFEGj7BSZflh05ehZYX6xBsl39qcqKzdFuDysC0J-m1J6Fy6af4sU-rCuFAQDmEo=w1200-rw',
    tag: 'Training',
  },
]

// Placeholder grid for the Instagram strip — client can swap these with
// real post thumbnails or wire up the IG Basic Display API later.
const INSTAGRAM_TILES = [
  'https://lh3.googleusercontent.com/ObyGM3YfiJC4M2LPUP1rdV082_LsSN7ath2Sb3CRPa3rB5znuyR8orGk95j1OQcu-f1KxzfwDayEDvFFj8zmS8PxD6ZG_Oooc0HOAzDR=w600-rw',
  'https://lh3.googleusercontent.com/A959ZB5laMMAwx3johfA0IdN0LMU0pdhL9EmXBWTkEyVu1erfFJy4p7kJhUN4dzVZLPOTQWQ6-_PeE6Q-UwwbhnOooY2s1UXjLvE-xBZSw=w600-rw',
  'https://lh3.googleusercontent.com/fMDJUXTml2Oy7acthKsu7XcqBLyoqnlilQCJruYAFRpyvyAPX7gruOfHokGvUH1PxP5DdFm_oCgsPDsYOv-AGGl9rJQpBlc-GWRXHjQx=w600-rw',
  'https://lh3.googleusercontent.com/csYL5joKIL4Oz1VMMoGVBqLQMUwHqHLMVCmwzc_G8o_kddGd-uqCqyER8gXLs_oLgaQMnlIK-KQARysDbwXusuLWqK9I3zgauCwtLKvQKA=w600-rw',
  'https://lh3.googleusercontent.com/9NODaqOMcC9h2RNX0RzGciKNPeG8QNL_TgiIamED8u_oSuzVZ4TYc_zWSr0_MgKg7tzxSDsNlNH9UrTZlbu9LY45cKuWOZGssx_ZDT_Cpg=w600-rw',
  'https://lh3.googleusercontent.com/2W1cw4DDp8TacRRBjH3H-MzLWOVy9G0KtXUwK6DFgFEGj7BSZflh05ehZYX6xBsl39qcqKzdFuDysC0J-m1J6Fy6af4sU-rCuFAQDmEo=w600-rw',
]

const SOCIAL_LINKS = [
  { platform: 'instagram', href: 'https://www.instagram.com/mastermindbicyclecafe/' },
  { platform: 'mail', href: 'mailto:hello@mastermindcafe.in' },
  { platform: 'website', href: 'https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

function AnimatedSection({ children, className, delay = 0, style }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  usePageMeta({
    title: 'Specialty Coffee, Barista Academy & Cafe in Mulund, Mumbai',
    description: 'Single-origin Chikmagalur coffee, continental food, baked goods & an online barista academy. Order online or visit Mastermind Bicycle Cafe & Bar in Mulund, Mumbai.',
    keywords: 'specialty coffee Mumbai, single origin coffee India, Chikmagalur coffee beans, cafe in Mulund, Mastermind Bicycle Cafe, online barista academy, buy coffee beans online India',
  })
  const { addItem } = useCart()
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const prefersReducedMotion = useReducedMotion()
  // Skip the vapor intro entirely for users who opt out of motion.
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('mm-intro') && !prefersReducedMotion,
  )
  const [allProducts, setAllProducts] = useState([])
  const [openProduct, setOpenProduct] = useState(null)
  const { ids: recentIds } = useRecentlyViewed()

  useEffect(() => {
    let cancelled = false
    getFeaturedProducts(4)
      .then(data => { if (!cancelled) setFeatured(data) })
      .catch(err => console.error('Failed to load featured products:', err))
      .finally(() => { if (!cancelled) setFeaturedLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Only fetch the full product list when we actually have something to show.
  useEffect(() => {
    if (recentIds.length < 3 || allProducts.length > 0) return
    let cancelled = false
    getProducts()
      .then((rows) => { if (!cancelled) setAllProducts(rows) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [recentIds.length, allProducts.length])

  const recentProducts = useMemo(() => {
    if (allProducts.length === 0) return []
    const map = new Map(allProducts.map((p) => [p.id, p]))
    return recentIds.map((id) => map.get(id)).filter(Boolean)
  }, [recentIds, allProducts])

  const handleVaporizeEnd = useCallback(() => {
    sessionStorage.setItem('mm-intro', '1')
    setShowIntro(false)
  }, [])

  return (
    <div className="home">
      {/* ===== VAPOUR TEXT INTRO ===== */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#0a0908',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '90vw', maxWidth: '900px', height: '100px' }}>
              <VaporizeTextCycle
                texts={["Ride Hard / Eat Easy"]}
                font={{
                  fontFamily: "'Yanone Kaffeesatz', sans-serif",
                  fontSize: "68px",
                  fontWeight: 600,
                }}
                color="rgb(248, 245, 242)"
                spread={5}
                density={7}
                animation={{
                  vaporizeDuration: 0.7,
                  fadeInDuration: 0.1,
                  waitDuration: 0.05,
                }}
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

      {/* ===== HERO (100K PREMIUM UPGRADE) ===== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-bg-image" style={{
            backgroundImage: 'url(/hero-bg.jpg)'
          }} />
          <div className="hero-mesh-overlay" />
          <div className="hero-gradient" />
        </div>
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
          }}
        >
          <motion.div
            className="hero-badge"
            variants={{ hidden: { opacity: 0, y: 30, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
          >
            <span className="dot" />
            <span className="hero-badge-text">From Mastermind Bicycle Cafe & Bar, Mumbai</span>
          </motion.div>
          
          <motion.div
            className="hero-logo-wrap"
            variants={{ hidden: { opacity: 0, y: 40, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}
          >
            <img src="/logo.png" alt="Mastermind Brews" className="hero-logo" />
          </motion.div>

          <motion.h1
            className="hero-tagline"
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}
          >
            <span className="hero-tagline-line">Master Your <span className="text-blue-glow">Mind</span>,</span>
            <span className="hero-tagline-line">Master Your <span className="text-pink-glow">Brews</span></span>
          </motion.h1>

          <motion.p
            className="hero-kicker"
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
          >
            Specialty single-origin beans from Chikmagalur, roasted with Bean Rove, plus a barista academy from the team behind Mumbai's Mastermind Bicycle Cafe.
          </motion.p>

          <motion.div
            className="hero-btns"
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
          >
            <Link to="/store" className="btn btn-premium-primary">
              <ShoppingBag size={18} /> Shop Coffee
            </Link>
            <Link to="/workshop" className="btn btn-premium-outline">
              <BookOpen size={18} /> Learn Coffee
            </Link>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="hero-scroll"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="scroll-indicator">
            <div className="scroll-dot" />
          </div>
        </motion.div>
      </section>


      {/* ===== ABOUT STRIP ===== */}
      <section className="about-strip">
        <div className="container">
          <div className="about-grid">
            <AnimatedSection className="about-image about-image--video">
              <video
                src="/cafe-tour.mp4"
                poster="/hero-bg.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="A tour through Mastermind Bicycle Cafe"
              />
              <div className="accent-line" />
            </AnimatedSection>
            <AnimatedSection className="about-text" delay={0.2}>
              <div className="section-label">Our Story</div>
              <AnimatedText
                text="Born From A Dream Of Great Coffee"
                textClassName="text-foreground"
                underlineClassName="text-primary"
                style={{ marginBottom: '2rem' }}
              />
              <p className="highlight" style={{ marginTop: '2rem' }}>
                Started by a businessman and his daughter who dreamt of a cafe that serves great coffee, always welcomes all, and makes one feel like in the by-lanes of Europe.
              </p>
              <p>
                At Mastermind Bicycle Cafe & Bar in Mulund, Mumbai, we've been elevating the coffee experience with top-of-the-line equipment, exclusive roast profiles by Bean Rove, and beans directly sourced from Chikmagalur, Karnataka.
              </p>
              <p>
                Now we're bringing that same passion online - premium coffee beans and powders delivered fresh, plus a barista academy to train the next generation of coffee artisans.
              </p>
              <div className="about-stats">
                <motion.div className="stat-item" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <div className="stat-number"><Coffee size={24} style={{ display: 'inline' }} /></div>
                  <div className="stat-label">Chikmagalur Single Origin</div>
                </motion.div>
                <motion.div className="stat-item" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <div className="stat-number"><Award size={24} style={{ display: 'inline' }} /></div>
                  <div className="stat-label">Bean Rove Roast Profiles</div>
                </motion.div>
                <motion.div className="stat-item" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="stat-number"><BookOpen size={24} style={{ display: 'inline' }} /></div>
                  <div className="stat-label">Online Barista Academy</div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== WHAT WE OFFER ===== */}
      <section className="offer-section">
        <div className="offer-section-glow" aria-hidden="true" />
        <div className="container">
          <AnimatedSection className="section-header center">
            <div className="section-label">What We Offer</div>
            <h2 className="section-title">
              Two Crafts. <span className="text-gradient">One Standard.</span>
            </h2>
            <p className="section-desc" style={{ margin: '14px auto 0', maxWidth: 620 }}>
              Specialty coffee in a bag, and a barista academy in your pocket. Both built from the same Mulund bar that pours them daily.
            </p>
          </AnimatedSection>

          <motion.div
            className="offer-pillars"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.article className="offer-pillar offer-pillar-pink" variants={fadeUp}>
              <div className="offer-pillar-media">
                <img
                  src="https://lh3.googleusercontent.com/csYL5joKIL4Oz1VMMoGVBqLQMUwHqHLMVCmwzc_G8o_kddGd-uqCqyER8gXLs_oLgaQMnlIK-KQARysDbwXusuLWqK9I3zgauCwtLKvQKA=w1200-rw"
                  alt="Coffee beans being roasted"
                  loading="lazy"
                />
                <span className="offer-pillar-index">01</span>
                <span className="offer-pillar-tag"><Coffee size={12} /> Beans &amp; Powder</span>
                <div className="offer-pillar-media-fade" />
              </div>
              <div className="offer-pillar-body">
                <h3 className="offer-pillar-title">Single-Origin From Chikmagalur</h3>
                <p className="offer-pillar-desc">
                  Specialty coffee from Chikmagalur, roasted with exclusive Bean Rove profiles. Whole bean or ground to your brew method.
                </p>
                <div className="offer-pillar-specs">
                  <div className="offer-spec">
                    <span className="offer-spec-label">Origin</span>
                    <span className="offer-spec-value">Chikmagalur</span>
                  </div>
                  <div className="offer-spec">
                    <span className="offer-spec-label">Roast</span>
                    <span className="offer-spec-value">Bean Rove</span>
                  </div>
                  <div className="offer-spec">
                    <span className="offer-spec-label">Grind</span>
                    <span className="offer-spec-value">Custom</span>
                  </div>
                </div>
                <ul className="offer-pillar-features">
                  <li><Check size={14} /> Single-origin from Chikmagalur, Karnataka</li>
                  <li><Check size={14} /> Roasted with Bean Rove profiles</li>
                  <li><Check size={14} /> Espresso, filter, French press grinds</li>
                  <li><Check size={14} /> Free shipping above ₹999</li>
                </ul>
                <Link to="/store" className="btn btn-primary offer-pillar-cta">
                  <ShoppingBag size={16} /> Shop Coffee <ArrowRight size={14} />
                </Link>
              </div>
            </motion.article>

            <motion.article className="offer-pillar offer-pillar-blue" variants={fadeUp}>
              <div className="offer-pillar-media">
                <img
                  src="https://lh3.googleusercontent.com/2W1cw4DDp8TacRRBjH3H-MzLWOVy9G0KtXUwK6DFgFEGj7BSZflh05ehZYX6xBsl39qcqKzdFuDysC0J-m1J6Fy6af4sU-rCuFAQDmEo=w1200-rw"
                  alt="Barista pulling an espresso shot"
                  loading="lazy"
                />
                <span className="offer-pillar-index">02</span>
                <span className="offer-pillar-tag"><BookOpen size={12} /> Barista Academy</span>
                <div className="offer-pillar-media-fade" />
              </div>
              <div className="offer-pillar-body">
                <h3 className="offer-pillar-title">Train With Our Professional Baristas</h3>
                <p className="offer-pillar-desc">
                  HD video lessons from the team behind Mastermind Brews. From your first pull to latte art mastery, on any device, anytime.
                </p>
                <div className="offer-pillar-specs">
                  <div className="offer-spec">
                    <span className="offer-spec-label">Format</span>
                    <span className="offer-spec-value">HD Video</span>
                  </div>
                  <div className="offer-spec">
                    <span className="offer-spec-label">Access</span>
                    <span className="offer-spec-value">30 Days</span>
                  </div>
                </div>
                <ul className="offer-pillar-features">
                  <li><Check size={14} /> Beginner to advanced tracks</li>
                  <li><Check size={14} /> Espresso, milk craft, latte art, brewing</li>
                  <li><Check size={14} /> Built by championship-trained baristas</li>
                  <li><Check size={14} /> Watch on phone, tablet, or laptop</li>
                </ul>
                <Link to="/workshop" className="btn btn-blue offer-pillar-cta">
                  <BookOpen size={16} /> Start Learning <ArrowRight size={14} />
                </Link>
              </div>
            </motion.article>
          </motion.div>

          <motion.div
            className="offer-trust-strip"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            <motion.div className="offer-trust-item" variants={fadeUp}>
              <div className="offer-trust-icon"><MapPin size={18} /></div>
              <div className="offer-trust-text">
                <div className="offer-trust-num">Chikmagalur</div>
                <div className="offer-trust-label">Single Origin</div>
              </div>
            </motion.div>
            <motion.div className="offer-trust-item" variants={fadeUp}>
              <div className="offer-trust-icon"><Flame size={18} /></div>
              <div className="offer-trust-text">
                <div className="offer-trust-num">Bean Rove</div>
                <div className="offer-trust-label">Roast Partner</div>
              </div>
            </motion.div>
            <motion.div className="offer-trust-item" variants={fadeUp}>
              <div className="offer-trust-icon"><Award size={18} /></div>
              <div className="offer-trust-text">
                <div className="offer-trust-num">4th Runner-Up</div>
                <div className="offer-trust-label">National Barista Championship 2026</div>
              </div>
            </motion.div>
            <motion.div className="offer-trust-item" variants={fadeUp}>
              <div className="offer-trust-icon"><Sparkles size={18} /></div>
              <div className="offer-trust-text">
                <div className="offer-trust-num">Mulund</div>
                <div className="offer-trust-label">Open every day</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      {(featuredLoading || featured.length > 0) && (
        <section className="featured-section">
          <div className="container">
            <div className="featured-header">
              <AnimatedSection className="section-header" style={{ marginBottom: 0 }}>
                <div className="section-label">Featured</div>
                <h2 className="section-title">Best Sellers</h2>
              </AnimatedSection>
              <Link to="/store" className="btn btn-ghost">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <motion.div
              className="featured-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerContainer}
            >
              {featuredLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="featured-product featured-product-skeleton">
                      <div className="featured-product-image skeleton-block" />
                      <div className="featured-product-info">
                        <div className="skeleton-line skeleton-line-sm" />
                        <div className="skeleton-line" />
                        <div className="skeleton-line skeleton-line-sm" />
                      </div>
                    </div>
                  ))
                : featured.map(product => (
                    <motion.div key={product.id} className="featured-product" variants={fadeUp}>
                      <div className="featured-product-image">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="featured-product-placeholder"><Package size={32} /></div>
                        )}
                        <div className="featured-product-overlay" />
                        <div className="featured-product-quick">
                          <button
                            className="btn btn-primary btn-sm full-width"
                            onClick={() => { addItem(product); toast.success(`${product.name} added`) }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                      <div className="featured-product-info">
                        <div className="featured-product-category">{product.category}</div>
                        <div className="featured-product-name">{product.name}</div>
                        <div className="featured-product-weight">{product.weight}</div>
                        <div className="featured-product-bottom">
                          <span className="featured-product-price">₹{product.price}</span>
                          <button
                            className="add-btn"
                            onClick={() => { addItem(product); toast.success(`Added to cart`) }}
                          >
                            <ShoppingBag size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== RECENTLY VIEWED ===== */}
      {recentProducts.length >= 3 && (
        <section className="recently-viewed-section">
          <div className="container">
            <div className="featured-header">
              <AnimatedSection className="section-header" style={{ marginBottom: 0 }}>
                <div className="section-label"><History size={12} style={{ display: 'inline', marginRight: 6 }} /> For You</div>
                <h2 className="section-title">Recently Viewed</h2>
              </AnimatedSection>
              <Link to="/store" className="btn btn-ghost">
                Back to Store <ArrowRight size={14} />
              </Link>
            </div>
            <div className="recently-viewed-row">
              {recentProducts.slice(0, 6).map((product) => (
                <button
                  type="button"
                  key={product.id}
                  className="recently-viewed-card"
                  onClick={() => setOpenProduct(product)}
                >
                  <div className="recently-viewed-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} loading="lazy" />
                    ) : (
                      <div className="featured-product-placeholder"><Package size={28} /></div>
                    )}
                  </div>
                  <div className="recently-viewed-info">
                    <span className="recently-viewed-category">{product.category}</span>
                    <span className="recently-viewed-name">{product.name}</span>
                    <span className="recently-viewed-price">₹{product.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {openProduct && (
        <ProductDetailModal
          product={openProduct}
          onClose={() => setOpenProduct(null)}
          allProducts={allProducts}
        />
      )}

      {/* ===== ACADEMY PREVIEW ===== */}
      <section className="academy-preview">
        <div className="academy-preview-glow" aria-hidden="true" />
        <div className="container">
          <div className="academy-preview-grid">
            <AnimatedSection className="academy-preview-visual">
              <div className="academy-visual-frame">
                <img
                  src="https://lh3.googleusercontent.com/2W1cw4DDp8TacRRBjH3H-MzLWOVy9G0KtXUwK6DFgFEGj7BSZflh05ehZYX6xBsl39qcqKzdFuDysC0J-m1J6Fy6af4sU-rCuFAQDmEo=w1000-rw"
                  alt="Barista at Mastermind Brews"
                  loading="lazy"
                />
                <div className="academy-image-tint" />
                <motion.div
                  className="academy-floating-card"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <div className="academy-floating-card-icon"><Award size={18} /></div>
                  <div className="academy-floating-card-body">
                    <div className="academy-floating-card-num">6</div>
                    <div className="academy-floating-card-label">Expert Modules</div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="academy-floating-stats"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div className="academy-mini-stat" variants={fadeUp}>
                  <Award size={14} />
                  <span><strong>Certified</strong> Baristas</span>
                </motion.div>
                <motion.div className="academy-mini-stat" variants={fadeUp}>
                  <Play size={14} fill="currentColor" />
                  <span><strong>HD</strong> Lessons</span>
                </motion.div>
                <motion.div className="academy-mini-stat" variants={fadeUp}>
                  <BookOpen size={14} />
                  <span><strong>Self-paced</strong> Learning</span>
                </motion.div>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection className="academy-preview-content" delay={0.15}>
              <div className="section-label">
                <span className="section-label-bar" /> Barista Academy
              </div>
              <h2 className="section-title academy-title">
                Master The Art<br />
                Of <span className="text-gradient">Specialty Coffee</span>
              </h2>
              <p className="section-desc academy-desc">
                Learn from the same baristas behind Mastermind Brews' specialty coffee program. Professional video courses for every skill level, from your first pull to latte art mastery.
              </p>

              <motion.div
                className="academy-features"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div className="academy-feature" variants={fadeUp}>
                  <div className="academy-feature-icon"><Award size={20} /></div>
                  <div className="academy-feature-text">
                    <h4>Trained Baristas</h4>
                    <p>Techniques from our certified coffee team</p>
                  </div>
                </motion.div>
                <motion.div className="academy-feature" variants={fadeUp}>
                  <div className="academy-feature-icon"><Play size={20} fill="currentColor" /></div>
                  <div className="academy-feature-text">
                    <h4>HD Video Lessons</h4>
                    <p>Pre-recorded courses, watch anywhere</p>
                  </div>
                </motion.div>
                <motion.div className="academy-feature" variants={fadeUp}>
                  <div className="academy-feature-icon"><Coffee size={20} /></div>
                  <div className="academy-feature-text">
                    <h4>Bean Rove Profiles</h4>
                    <p>Our exclusive roasting methodology</p>
                  </div>
                </motion.div>
                <motion.div className="academy-feature" variants={fadeUp}>
                  <div className="academy-feature-icon"><BookOpen size={20} /></div>
                  <div className="academy-feature-text">
                    <h4>Lifetime Access</h4>
                    <p>Buy once, learn forever - on any device</p>
                  </div>
                </motion.div>
              </motion.div>

              <div className="academy-cta-row">
                <Link to="/workshop" className="btn btn-blue">
                  Browse Courses <ArrowRight size={14} />
                </Link>
              </div>

              <motion.div
                className="academy-chips"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {['Beginner Friendly', 'Latte Art', 'Espresso', 'Brewing Science'].map(chip => (
                  <motion.span key={chip} className="academy-chip" variants={fadeUp}>{chip}</motion.span>
                ))}
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== OUR PROJECTS ===== */}
      <section className="projects-section">
        <div className="container">
          <AnimatedSection className="section-header center">
            <div className="section-label">Our Projects</div>
            <h2 className="section-title">What We've Built</h2>
            <p className="section-desc" style={{ margin: '12px auto 0', maxWidth: 600 }}>
              From our flagship cafe to sourcing partnerships and training programs. A few of the projects that shape Mastermind Brews today.
            </p>
          </AnimatedSection>
          <motion.div
            className="projects-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {PROJECTS.map((p, i) => (
              <motion.article key={i} className="project-card" variants={fadeUp}>
                <div className="project-card-image">
                  <img src={p.image} alt={p.title} loading="lazy" />
                  <span className="project-card-tag">{p.tag}</span>
                </div>
                <div className="project-card-body">
                  <div className="project-card-location"><MapPin size={12} /> {p.location}</div>
                  <h3 className="project-card-title">{p.title}</h3>
                  <p className="project-card-summary">{p.summary}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/consultancy" className="btn btn-ghost">
              See All Projects <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials hidden for now — client wants Our Projects to take this slot. */}
      {false && (
        <section className="testimonials-section">
          <div className="container">
            <AnimatedSection className="section-header center">
              <div className="section-label">Testimonials</div>
              <h2 className="section-title">What Our Community Says</h2>
            </AnimatedSection>
            <motion.div
              className="testimonials-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerContainer}
            >
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={i} className="testimonial-card" variants={fadeUp}>
                  <div className="testimonial-stars">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.initials}</div>
                    <div className="testimonial-author-info">
                      <div className="name">{t.name}</div>
                      <div className="role">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== FROM THE PRESS — Newspaper Menu Clipping ===== */}
      <section className="press-section">
        <div className="container">
          <AnimatedSection className="press-row">
            <motion.div
              className="press-clipping-wrap"
              initial={{ opacity: 0, y: 24, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: -1.8 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="press-tape press-tape-tl" aria-hidden="true" />
              <span className="press-tape press-tape-tr" aria-hidden="true" />
              <a
                href="/mastermind-times.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="press-clipping"
                aria-label="Open full Mastermind Times menu poster"
              >
                <img
                  src="/mastermind-times.jpg"
                  alt="Mastermind Times — a global culinary revolution menu poster"
                  loading="lazy"
                />
              </a>
            </motion.div>
            <div className="press-copy">
              <div className="section-label">From the Press</div>
              <h2 className="press-title">
                The <span className="text-gradient">Mastermind Times</span>
              </h2>
              <p className="press-desc">
                A menu that travels &mdash; Asian, European, American, Mediterranean &mdash; all under one bicycle-cafe roof.
              </p>
              <a
                href="/mastermind-times.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="press-cta"
              >
                Read the full edition <ArrowRight size={14} />
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== VISIT US ===== */}
      <section className="visit-section">
        <div className="container">
          <div className="visit-grid">
            <AnimatedSection className="visit-info">
              <div className="section-label">Our Cafe</div>
              <h2 className="section-title">Mastermind Bicycle Cafe, Mulund</h2>
              <p className="section-desc">
                One of the best cafes in Mulund. Doors open every day, with European cafe vibes, specialty coffee and a menu that goes deep. Visit us in person or explore the full cafe online.
              </p>
              <div className="visit-details">
                <motion.div className="visit-detail" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <div className="visit-detail-icon"><Clock size={18} /></div>
                  <div>
                    <h4>Open All Days</h4>
                    <p>8:30 AM to 12 Midnight</p>
                  </div>
                </motion.div>
                <motion.div className="visit-detail" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <div className="visit-detail-icon"><MapPin size={18} /></div>
                  <div>
                    <h4>Find Us</h4>
                    <p>Avior Corporate Park, Mulund West, Mumbai</p>
                  </div>
                </motion.div>
                <motion.div className="visit-detail" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="visit-detail-icon"><Phone size={18} /></div>
                  <div>
                    <h4>Call</h4>
                    <p><a href="tel:+918591850161">+91 85918 50161</a></p>
                  </div>
                </motion.div>
                <motion.div className="visit-detail" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <div className="visit-detail-icon"><Mail size={18} /></div>
                  <div>
                    <h4>Email</h4>
                    <p><a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a></p>
                  </div>
                </motion.div>
              </div>
              <div className="visit-socials">
                <a href="https://www.mastermindcafe.in/" target="_blank" rel="noopener noreferrer" className="visit-social">
                  <Globe size={16} /> mastermindcafe.in
                </a>
                <a href="https://www.mastermindcafe.in/" target="_blank" rel="noopener noreferrer" className="btn btn-blue btn-sm">
                  Visit Cafe Website <ArrowRight size={14} />
                </a>
                <a href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  Get Directions <ArrowRight size={14} />
                </a>
              </div>
            </AnimatedSection>
            <AnimatedSection className="visit-card" delay={0.2}>
              <div className="visit-card-image">
                <img src="https://lh3.googleusercontent.com/ObyGM3YfiJC4M2LPUP1rdV082_LsSN7ath2Sb3CRPa3rB5znuyR8orGk95j1OQcu-f1KxzfwDayEDvFFj8zmS8PxD6ZG_Oooc0HOAzDR=w1200-rw" alt="Mastermind Bicycle Cafe" loading="lazy" />
                <div className="visit-card-rating">
                  <div className="visit-card-rating-stars">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <div className="visit-card-rating-score">4.5 / 5</div>
                  <div className="visit-card-rating-label">On Google</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== INSTAGRAM ===== */}
      <section className="instagram-section">
        <div className="container">
          <AnimatedSection className="section-header center">
            <div className="section-label"><Instagram size={12} style={{ display: 'inline', marginRight: 6 }} /> Instagram</div>
            <h2 className="section-title">Follow @mastermindbicyclecafe</h2>
            <p className="section-desc" style={{ margin: '12px auto 0', maxWidth: 560 }}>
              Behind the bar, on the bike, behind the beans. Catch our daily moments and brew inspiration.
            </p>
          </AnimatedSection>
          <motion.div
            className="instagram-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {INSTAGRAM_TILES.map((src, i) => (
              <motion.a
                key={i}
                href="https://www.instagram.com/mastermindbicyclecafe/"
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-tile"
                variants={fadeUp}
                aria-label="Open Instagram"
              >
                <img src={src} alt="" loading="lazy" />
                <span className="instagram-tile-overlay">
                  <Instagram size={22} />
                </span>
              </motion.a>
            ))}
          </motion.div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <a
              href="https://www.instagram.com/mastermindbicyclecafe/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Instagram size={16} /> Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="newsletter-section">
        <div className="newsletter-bg" />
        <div className="container">
          <AnimatedSection className="newsletter-content">
            <div className="section-label">Get Started</div>
            <h2>Ready To Brew Like A Pro?</h2>
            <p>The same specialty coffee from Mastermind Bicycle Cafe - now available online, with courses to level up your skills.</p>
            <div className="hero-btns">
              <Link to="/store" className="btn btn-primary">
                <ShoppingBag size={16} /> Shop Store
              </Link>
              <Link to="/workshop" className="btn btn-outline">
                <BookOpen size={16} /> Start Learning
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="categories-band" style={{ padding: '48px 0' }}>
        <div className="container">
          <motion.div
            className="about-stats"
            style={{ borderTop: 'none', paddingTop: 0, justifyContent: 'center', gap: '80px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="stat-item" style={{ textAlign: 'center' }} variants={fadeUp}>
              <div className="stat-number"><Truck size={24} style={{ display: 'inline' }} /></div>
              <div className="stat-label">Free Shipping Above ₹999</div>
            </motion.div>
            <motion.div className="stat-item" style={{ textAlign: 'center' }} variants={fadeUp}>
              <div className="stat-number"><Coffee size={24} style={{ display: 'inline' }} /></div>
              <div className="stat-label">Roasted in Chikmagalur</div>
            </motion.div>
            <motion.div className="stat-item" style={{ textAlign: 'center' }} variants={fadeUp}>
              <div className="stat-number"><Award size={24} style={{ display: 'inline' }} /></div>
              <div className="stat-label">Bean Rove Profiles</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
