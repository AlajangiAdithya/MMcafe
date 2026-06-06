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
import Reveal from '../components/Reveal'
import Magnetic from '../components/Magnetic'
import TiltCard from '../components/TiltCard'
import Spotlight from '../components/Spotlight'
import DragScroller from '../components/DragScroller'
import HorizontalProjects from '../components/HorizontalProjects'
import ProjectSlides from '../components/ProjectSlides'
import StackCards from '../components/StackCards'
import ZoomCTA from '../components/ZoomCTA'
import SectionLabel from '../components/SectionLabel'
import MarqueeStrip from '../components/MarqueeStrip'
import ChapterRail from '../components/ChapterRail'
import KineticHeading from '../components/KineticHeading'
import FeaturedSlider from '../components/FeaturedSlider'
import TedyScroll from '../components/TedyScroll'
import PressReveal from '../components/PressReveal'
import CountUp from '../components/CountUp'
import ViewportVideo from '../components/ViewportVideo'
import MaskReveal from '../components/MaskReveal'
import FloatingBeans from '../components/FloatingBeans'
import SteamWisps from '../components/SteamWisps'
import { MOTION } from '../lib/motionConfig'
import toast from 'react-hot-toast'

import { AnimatedText } from '@/components/ui/animated-underline-text-one'
import { SocialLinks } from '@/components/ui/social-links'
import VaporizeTextCycle, { Tag } from '@/components/ui/vapour-text-effect'

const TESTIMONIALS = [
  { name: 'Aayushi Joshi', role: 'Google Review', initials: 'AJ', rating: 5, text: 'Loved that they offer gluten-free pizza options, vegan cheese, and a vegan menu. Highly recommended! 🌱 Special thanks to Deepak for his attentive service.' },
  { name: 'Tejal Rajak', role: 'Google Review', initials: 'TR', rating: 4, text: 'Visited this cute yet classy cafe. Ordered Mocha Cold and Peri Peri Paneer Pizza - both quite good. Staff is polite and chill, ambience is beautiful. A must visit in Mulund, and the best part is it being pet friendly. 😍' },
  { name: 'Rick Snyder', role: 'Google Review', initials: 'RS', rating: 5, text: 'The food was so good - huge variety on the menu. Iced matcha latte was perfect, the pesto & burrata pizza and nachos were fantastic. Shubham was our server and he was really friendly. Ask for him to serve you!' },
]

// Project case studies — each card carries a tag, a short summary, and
// three numeric facts. The numbers anchor the abstract claims and give
// the scroll-pinned cards something to read against the photo.
const PROJECTS = [
  {
    title: 'Mastermind Bicycle Cafe',
    location: 'Mulund, Mumbai',
    summary: 'Our flagship cafe: a full coffee program, European-inspired menu, and a community space built from the ground up. Open every day, 8:30 AM to midnight.',
    image: '/project-cafe.jpg',
    tag: 'Flagship',
    year: '2020',
    metrics: [
      { label: 'Seats', value: '64' },
      { label: 'Open', value: '7 days' },
      { label: 'Google', value: '4.5★' },
    ],
    chips: ['Specialty Coffee', 'European Menu', 'Pet Friendly'],
  },
  {
    title: 'Bean Rove Roast Profiles',
    location: 'Chikmagalur, Karnataka',
    summary: 'Exclusive single-origin profiles roasted in partnership with Bean Rove — the same beans we serve at the bar and ship to homes across India.',
    image: '/project-beans.jpg',
    tag: 'Sourcing',
    year: '2021',
    metrics: [
      { label: 'Altitude', value: '1,400m' },
      { label: 'Profiles', value: '04' },
      { label: 'Origin', value: 'Single' },
    ],
    chips: ['Hand-Picked', 'Honey & Washed', 'Small Batch'],
  },
  {
    title: 'Barista Training Program',
    location: 'Online & On-Site',
    summary: 'A structured curriculum used to onboard cafe partners and individual baristas. From the first espresso pull to latte art mastery and brewing science.',
    image: 'https://lh3.googleusercontent.com/2W1cw4DDp8TacRRBjH3H-MzLWOVy9G0KtXUwK6DFgFEGj7BSZflh05ehZYX6xBsl39qcqKzdFuDysC0J-m1J6Fy6af4sU-rCuFAQDmEo=w1200-rw',
    tag: 'Training',
    year: '2023',
    metrics: [
      { label: 'Format', value: 'HD Video' },
      { label: 'Tracks', value: '06' },
      { label: 'Access', value: 'Lifetime' },
    ],
    chips: ['Espresso', 'Milk Craft', 'Latte Art', 'Brewing Science'],
  },
]

// Curated "A Look Inside" gallery — each card represents a chapter of the
// Mastermind story. Title, kicker, and longer caption together carry the
// editorial voice from estate to espresso to cup.
const TEDY_GALLERY = [
  {
    image: '/hero-bg.jpg',
    kicker: 'The Origin',
    title: 'Chikmagalur Elevation',
    caption: 'Sourced from pristine altitudes in Karnataka\'s coffee belt. Cultivated under natural shade, deeply rooted in Indian coffee heritage.',
    meta: 'CH. 01',
  },
  {
    image: '/offer-beans.jpg',
    kicker: 'The Harvest',
    title: 'Hand-Picked Precision',
    caption: 'Only the deepest crimson cherries make the cut. Washed, honey-processed, and sun-dried to lock in maximum sweetness.',
    meta: 'CH. 02',
  },
  {
    image: '/mastermind-times.jpg',
    kicker: 'The Roast',
    title: 'Bean Rove Profiles',
    caption: 'Small-batch roasting designed to articulate unique terroir. Cupped rigorously in our lab before it ever hits the hopper.',
    meta: 'CH. 03',
  },
  {
    image: '/project-beans.jpg',
    kicker: 'The Craft',
    title: 'Surgical Extraction',
    caption: 'Dialled in line with the day\'s ambient humidity. From precise 9-bar espressos to slow V60 pours, every parameter is controlled.',
    meta: 'CH. 04',
  },
  {
    image: '/offer-academy.png',
    kicker: 'The Academy',
    title: 'Next Gen Baristas',
    caption: 'Passing on the craft through high-definition modules. We train the next generation of competitive professionals and home brewers.',
    meta: 'CH. 05',
  },
  {
    image: '/project-cafe.jpg',
    kicker: 'The Cafe',
    title: 'Mulund\'s Quiet Corner',
    caption: 'A slice of European hospitality in Mumbai. Sip your brew beneath bicycle rafters and let the afternoon stretch into evening.',
    meta: 'CH. 06',
  },
]

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

const MARQUEE_TERMS = [
  { en: 'ROASTED IN CHIKMAGALUR' },
  { en: 'SPECIALTY COFFEE' },
  { en: 'ONE CUP AT A TIME' },
  { en: 'BEAN ROVE PROFILES' },
  { en: 'OPEN ALL DAYS · 08:30 – 24:00' },
  { en: 'CRAFTED BY HAND' },
]

const CHAPTERS = [
  { id: 'origin', num: '01', label: 'Origin' },
  { id: 'offer', num: '02', label: 'Offer' },
  { id: 'bestsellers', num: '03', label: 'Bestsellers' },
  { id: 'projects', num: '04', label: 'Projects' },
  { id: 'academy', num: '05', label: 'Academy' },
  { id: 'visit', num: '06', label: 'Visit' },
  { id: 'gram', num: '07', label: 'Gram' },
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

  // Hero parallax — translate the background image and steam motif at
  // different speeds so the scene feels layered. Pure rAF + transform,
  // GPU-friendly. Intensities live in MOTION.parallax (motionConfig.js).
  // Disabled when user prefers reduced motion.
  useEffect(() => {
    if (prefersReducedMotion) return
    if (typeof window === 'undefined') return
    let raf = 0
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        const bg = document.querySelector('.hero-parallax')
        const steam = document.querySelector('.hero-steam-motif')
        const fg = document.querySelector('.hero-content--ed')
        if (bg) bg.style.transform = `translate3d(0, ${y * MOTION.parallax.intensity}px, 0) scale(1.08)`
        if (steam) steam.style.transform = `translate3d(0, ${y * -MOTION.parallax.steamIntensity}px, 0)`
        // Subtle counter-parallax on the foreground content — it drifts UP
        // slightly slower than the page so the scene feels layered.
        if (fg) fg.style.transform = `translate3d(0, ${y * -MOTION.parallax.foregroundIntensity}px, 0)`
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [prefersReducedMotion])

  // Add `.is-in` to .about-intro-frame and .section-vignette nodes as they
  // scroll into view so CSS-only effects (Ken Burns, vignette) can fire.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (prefersReducedMotion) return
    const targets = document.querySelectorAll('.about-intro-frame, .section-vignette')
    if (targets.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in', 'in-view')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [prefersReducedMotion])

  return (
    <div className="home home--editorial">
      <ChapterRail chapters={CHAPTERS} />
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
      {/* ===== HERO — Logo Spotlight ===== */}
      <section className="hero hero--editorial hero--cinematic hero--split hero--v2 hero--logo-only" data-chapter="hero">
        <div className="hero-v2-bg" aria-hidden="true">
          <img src="/hero-bg.jpg" alt="" className="hero-v2-bg-img" />
          <div className="hero-v2-bg-vignette" />
          <div className="hero-v2-bg-gradient" />
          <div className="hero-v2-bg-grain" />
        </div>

        <Link to="/store" className="hero-split-link hero-split-link--left" aria-label="Buy Coffee">
          <span className="hero-split-hint">
            <ShoppingBag size={18} aria-hidden="true" />
            <span>Click here to Buy Coffee</span>
          </span>
        </Link>

        <Link to="/workshop" className="hero-split-link hero-split-link--right" aria-label="Learn Coffee">
          <span className="hero-split-hint">
            <BookOpen size={18} aria-hidden="true" />
            <span>Click here to Learn Coffee</span>
          </span>
        </Link>

        <motion.div
          className="hero-content hero-v2-content hero-logo-only-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="hero-logo-spotlight"
            initial={{ opacity: 0, scale: 0.88, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <span className="hero-logo-spotlight-aura" aria-hidden="true" />
            <span className="hero-logo-spotlight-halo" aria-hidden="true" />
            <span className="hero-logo-spotlight-ring hero-logo-spotlight-ring--1" aria-hidden="true" />
            <span className="hero-logo-spotlight-ring hero-logo-spotlight-ring--2" aria-hidden="true" />
            <span className="hero-logo-spotlight-shine" aria-hidden="true" />
            <img className="hero-logo-spotlight-img" src="/logo.png" alt="Mastermind Brews" />
          </motion.div>
        </motion.div>
      </section>


      <MarqueeStrip items={MARQUEE_TERMS} variant="paper" tall />

      {/* ===== ABOUT STRIP ===== */}
      <section className="about-strip about-strip--editorial">
        <div className="container">
          <div className="about-grid">
            <AnimatedSection className="about-image about-image--video">
              <MaskReveal variant="up">
                <ViewportVideo
                  src="/cafe-tour.mp4"
                  poster="/hero-bg.jpg"
                  autoPlay
                  loop
                  preload="metadata"
                  aria-label="A tour through Mastermind Bicycle Cafe"
                />
              </MaskReveal>
              <div className="accent-line" />
            </AnimatedSection>
            <AnimatedSection className="about-text" delay={0.2}>
              <SectionLabel number="001" label="OUR STORY" />
              <KineticHeading as="h2" className="ed-display ed-display--lg">
                Born From A Dream Of Great Coffee
              </KineticHeading>
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
      <section className="offer-section section-vignette" data-chapter="offer">
        <div className="offer-section-glow" aria-hidden="true" />
        <FloatingBeans count={6} seed={21} />
        <Spotlight color="rgba(201, 151, 74, 0.10)" size={760} />
        <div className="container">
          <AnimatedSection className="section-header center">
            <SectionLabel number="002" label="WHAT WE OFFER" align="center" />
            <KineticHeading as="h2" className="ed-display ed-display--xl">
              Two Crafts. One Standard.
            </KineticHeading>
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
            <TiltCard as={motion.article} className="offer-pillar offer-pillar-pink" max={7} variants={fadeUp}>
              <div className="offer-pillar-media">
                  <motion.img
                    src="/offer-beans.jpg"
                    alt="Coffee estate in Chikmagalur, Karnataka"
                    loading="lazy"
                    initial={{ opacity: 0, scale: 1.1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                <Magnetic strength={0.3}>
                  <Link to="/store" className="btn btn-primary offer-pillar-cta">
                    <ShoppingBag size={16} /> Shop Coffee <ArrowRight size={14} />
                  </Link>
                </Magnetic>
              </div>
            </TiltCard>

            <TiltCard as={motion.article} className="offer-pillar offer-pillar-blue" max={7} variants={fadeUp}>
              <div className="offer-pillar-media">
                  <motion.img
                    src="/offer-academy.png"
                    alt="Barista pouring a tasting brew into a cup"
                    loading="lazy"
                    initial={{ opacity: 0, scale: 1.1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                <Magnetic strength={0.3}>
                  <Link to="/workshop" className="btn btn-blue offer-pillar-cta">
                    <BookOpen size={16} /> Start Learning <ArrowRight size={14} />
                  </Link>
                </Magnetic>
              </div>
            </TiltCard>
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
        <section className="featured-section featured-section--editorial" data-chapter="bestsellers">
          <div className="container">
            <div className="featured-header featured-header--editorial">
              <AnimatedSection className="section-header" style={{ marginBottom: 0 }}>
                <SectionLabel number="003" label="BEST SELLERS" />
                <KineticHeading as="h2" className="ed-display ed-display--lg">
                  Daily Brews · Bagged
                </KineticHeading>
              </AnimatedSection>
              <Magnetic strength={0.3}>
                <Link to="/store" className="btn btn-ghost">
                  View All <ArrowRight size={14} />
                </Link>
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
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setOpenProduct(product)
                      }
                    }}
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
                          onClick={(e) => {
                            e.stopPropagation()
                            addItem(product)
                            toast.success(`${product.name} added`)
                          }}
                        >
                          <ShoppingBag size={14} /> Add to cart
                        </button>
                      </div>
                    </div>
                    <div className="featured-product-info">
                      <div className="featured-product-category">{product.category}</div>
                      <div className="featured-product-name">{product.name}</div>
                      {product.weight && <div className="featured-product-weight">{product.weight}</div>}
                      <div className="featured-product-bottom">
                        <span className="featured-product-price">₹{product.price}</span>
                        <button
                          type="button"
                          className="add-btn"
                          aria-label={`Add ${product.name} to cart`}
                          onClick={(e) => {
                            e.stopPropagation()
                            addItem(product)
                            toast.success(`${product.name} added`)
                          }}
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

      {/* ===== TEDY-STYLE PINNED GALLERY ===== */}
      <TedyScroll
        items={TEDY_GALLERY}
        eyebrow="A LOOK INSIDE"
        heading={<>From estate to <em>espresso</em>.</>}
      />

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
            <Reveal as="div" className="recently-viewed-row">
              {recentProducts.slice(0, 6).map((product) => (
                <button
                  type="button"
                  key={product.id}
                  className="recently-viewed-card has-sheen"
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
            </Reveal>
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





      {/* ===== FROM THE PRESS — two-act scroll choreography ===== */}
      <PressReveal image="/mastermind-times.jpg" />



      <ZoomCTA
        pre="Follow the daily brew"
        handle="@mastermindbicyclecafe"
        post="for cafe, coffee & community"
        photos={INSTAGRAM_TILES}
      />

      {/* ===== CAFE INVITATION — full-bleed image with overlay copy ===== */}
      <section className="cafe-block-section" data-chapter="gram">
        <div
          className="cafe-block-bg"
          style={{ backgroundImage: 'url(/cafe-press-bg.jpg)' }}
          aria-hidden="true"
        />
        <div className="cafe-block-overlay" aria-hidden="true" />
        <motion.div
          className="cafe-block-inner"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="cafe-block-eyebrow" style={{ color: 'var(--accent)' }}>A Visit Worth Bookmarking</span>
          <h2 className="cafe-block-title" style={{ color: '#c9974a' }}>
            Mulund&rsquo;s quiet <em>European</em> corner.
          </h2>
          <p className="cafe-block-desc" style={{ color: 'rgba(251, 245, 235, 0.8)' }}>
            Step inside the bicycle cafe &mdash; a marble counter, slow mornings, evenings that stretch. We pour what we roast and feed what we love.
          </p>
          <div className="cafe-block-meta" style={{ color: 'rgba(251, 245, 235, 0.8)' }}>
            <div className="cafe-block-meta-item">
              <Clock size={14} />
              <span>Open Daily · 8:30 AM &ndash; 12 Midnight</span>
            </div>
            <div className="cafe-block-meta-item">
              <MapPin size={14} />
              <span>Avior Corporate Park, Mulund West</span>
            </div>
            <div className="cafe-block-meta-item">
              <Star size={14} fill="currentColor" />
              <span>4.5 / 5 · Google · 2,400+ reviews</span>
            </div>
          </div>
          <div className="cafe-block-ctas">
            <a
              href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund"
              target="_blank"
              rel="noopener noreferrer"
              className="cafe-block-cta cafe-block-cta--primary"
            >
              Get Directions <ArrowRight size={14} />
            </a>
            <a
              href="https://www.instagram.com/mastermindbicyclecafe/"
              target="_blank"
              rel="noopener noreferrer"
              className="cafe-block-cta cafe-block-cta--ghost"
            >
              <Instagram size={14} /> @mastermindbicyclecafe
            </a>
          </div>
        </motion.div>
      </section>


    </div>
  )
}
