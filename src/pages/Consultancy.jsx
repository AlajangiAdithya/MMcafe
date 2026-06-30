import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, ArrowRight, Check, MapPin } from 'lucide-react'
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, AnimatePresence } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import Magnetic from '../components/Magnetic'
import JsonLd from '../components/JsonLd'
import CountUp from '../components/CountUp'
import KineticHeading from '../components/KineticHeading'
import '../styles/about-editorial.css'

const ORG_ID = 'https://www.mastermindbrews.com/#organization'
const CONS_SERVICE = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Cafe Consultancy',
  serviceType: ['Menu & beverage design', 'Cafe operations setup', 'Barista training', 'Cafe audits'],
  provider: { '@id': ORG_ID },
  areaServed: { '@type': 'Country', name: 'India' },
  url: 'https://www.mastermindbrews.com/consultancy',
  description: 'End-to-end cafe consultancy from the team behind Mastermind Brews: menu design, operations, barista training and quality audits for cafes across India.',
}
const CONS_CRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mastermindbrews.com/' },
    { '@type': 'ListItem', position: 2, name: 'Our Projects', item: 'https://www.mastermindbrews.com/consultancy' },
  ],
}

const EXPERTISE = [
  { title: 'Understanding Coffee', body: 'In-depth training on the basics of coffee and the principles of brewing, so your team works from real knowledge.' },
  { title: 'Procurement', body: 'Sourcing the finest beans and equipment that align with your budget and your goals.' },
  { title: 'Recipe Formulation & SOP', body: 'Developing signature recipes and Standard Operating Procedures for consistent quality, every single shift.' },
  { title: 'Cost Analysis', body: 'Tracking ingredient and recipe costs so your pricing decisions balance quality and profitability.' },
  { title: 'Staff Training', body: 'Hands-on sessions that empower your team to deliver impeccable service to every guest.' },
]

/* Real consulting projects, the cafes we've built coffee programs with. */
const PROJECTS = [
  { name: 'Cocoa Experience Cafe', loc: 'Virar', initial: 'C', img: '/hero-bg.jpg', tag: 'Manual Brew Bar', body: `Specialty coffee where no one expected it — a brew bar that turned curious locals into regulars.`, details: `Designed manual pour-over bar workflow, sourced specialty equipment, and trained six local baristas on calibration.` },
  { name: 'Grounded Cafe', loc: 'Bandra', initial: 'G', img: '/projects/grounded-bandra.jpg', tag: 'Menu Design', body: `A menu with a voice of its own — classics, healthier pours, and indulgent drinks built around the bakes.`, details: `Formulated custom espresso recipes matching the pastry lineup, and completed SOP documentation for cafe staff.` },
  { name: 'Affogato', loc: 'Khar', initial: 'A', img: '/projects/affogato-khar.jpg', tag: 'Coffee × Gelato', body: `Italian café culture, done right — espresso worthy of world-class gelato.`, details: `Calibrated a high-extraction roast profile to pair organically with milk-based gelato fats, balancing acidity.` },
  { name: "Churn'd", loc: 'Surat', initial: 'C', img: '/projects/churnd-surat.jpg', tag: 'Beverage Innovation', body: `No gimmicks, big ideas — like a Mango Sticky Rice Iced Latte and a Thai Boba soft serve.`, details: `Created and tested proprietary cold syrups, and engineered custom beverage presentation standards.` },
  { name: 'Indulge Creamery', loc: 'Bandra', initial: 'I', img: '/projects/indulge-creamery-bandra.jpg', tag: 'Espresso & Matcha', body: `Indulgence by design — an espresso- and matcha-led menu for a sweet-toothed crowd.`, details: `Sourced ceremonial-grade matcha, calibrated whisking speeds, and combined hot espresso beverages for a dual menu.` },
  { name: 'Geranium Haven', loc: 'Arambol, Goa', initial: 'G', img: '/projects/geranium-haven-goa.jpg', tag: 'Coffee Program', body: `Beachside coffee with intent — from piña colada cold coffee to proper espresso service.`, details: `Designed custom bar layout for beachside humidity, and established an end-to-end green bean procurement system.` },
]

/* Animated impact counters for the consultancy work. */
const CONS_STATS = [
  { to: 6, label: 'Cafe programs built', sub: 'Across India' },
  { to: 5, label: 'Cities served', sub: 'Mumbai · Surat · Goa & more' },
  { to: 5, label: 'Areas of expertise', sub: 'Beans to SOPs' },
  { to: 100, suffix: '%', label: 'Hands-on delivery', sub: 'On-site & remote' },
]

/* Editorial photo grid — 6 shots from the cafes we've built programs with. */
const CONS_GRID = [
  { src: '/projects/grounded-bandra.jpg',        alt: 'Grounded Cafe, Bandra' },
  { src: '/projects/affogato-khar.jpg',           alt: 'Affogato Cafe, Khar' },
  { src: '/projects/churnd-surat.jpg',            alt: "Churn'd, Surat" },
  { src: '/pour-over-coffee.jpg',                 alt: 'Pour-over coffee service' },
  { src: '/hero-bg.jpg',                          alt: 'Mastermind specialty coffee' },
  { src: '/projects/geranium-haven-goa.jpg',      alt: 'Geranium Haven, Arambol, Goa' },
]

const PROCESS = [
  { ghost: 'LISTEN', num: '01', title: 'Discovery Call', body: 'We listen. Tell us about the space, the vision, and the constraints.' },
  { ghost: 'MAP', num: '02', title: 'Site & Concept Audit', body: 'A visit or remote review maps the gap between where you are and where you want to be.' },
  { ghost: 'PLAN', num: '03', title: 'Engagement Plan', body: 'A scoped proposal with timelines, deliverables, and a clear price.' },
  { ghost: 'BUILD', num: '04', title: 'Execution & Handover', body: 'We build it with you, then leave you with a team and a system that runs without us.' },
]

const SUITED = [
  'Owners building their first cafe',
  'Existing cafes hitting a plateau',
  'Restaurants adding a coffee program',
  'Hotels or co-working spaces serving in-house',
  'Brands wanting trained barista staff',
]

/* The pinned "How It Works" steps are driven by an ACTIVE INDEX derived from
   scroll progress, NOT by per-step scroll-linked opacity. This guarantees
   exactly one step is on screen at FULL opacity (always readable), and it only
   changes once its scroll band is actually reached, no early/partial fades and
   no out-of-[0,1] WAAPI offset risk. The crossfade itself is plain CSS. */
/* Accordion project listing — hupr.ca Spheres d'innovation pattern.
   Each row shows project name + tag + location; click to expand
   an image + description panel. One row open at a time. */
function ProjectAccordion({ projects }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="cons-accordion">
      {projects.map((p, i) => {
        const isOpen = open === i
        return (
          <div key={p.name} className={`cons-acc-item${isOpen ? ' is-open' : ''}`}>
            <button
              className="cons-acc-trigger"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="cons-acc-num">0{i + 1}</span>
              <div className="cons-acc-meta">
                <span className="cons-acc-tag">{p.tag}</span>
                <h3 className="cons-acc-name">{p.name}</h3>
              </div>
              <span className="cons-acc-loc"><MapPin size={11} /> {p.loc}</span>
              <motion.span
                className="cons-acc-arrow"
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <ArrowRight size={16} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  className="cons-acc-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="cons-acc-inner">
                    <div className="cons-acc-img-wrap">
                      <img src={p.img} alt={`${p.name}, ${p.loc}`} loading="lazy" />
                    </div>
                    <div>
                      <p className="cons-acc-desc">{p.body}</p>
                      <div className="cons-acc-scope">
                        <span className="cons-acc-scope-label">Scope of Delivery</span>
                        <p className="cons-acc-scope-body">{p.details}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

function PinnedProcess() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const bgScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1.05, 1.18])
  const [active, setActive] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(PROCESS.length - 1, Math.max(0, Math.floor(v * PROCESS.length)))
    setActive((prev) => (prev === idx ? prev : idx))
  })

  return (
    <section className="ed-pin" ref={ref}>
      <div className="ed-pin-sticky">
        <motion.div className="ed-pin-bg" style={{ backgroundImage: 'url(/about-team.jpg)', scale: bgScale }} />
        <div className="ed-pin-scrim" />
        {PROCESS.map((step, i) => (
          <span key={step.ghost} className={`ed-pin-ghost${i === active ? ' is-active' : ''}`} aria-hidden="true">{step.ghost}</span>
        ))}
        <div className="ed-pin-inner">
          <div className="ed-pin-eyebrow">How It Works</div>
          <div className="ed-pin-stage">
            {PROCESS.map((step, i) => (
              <div key={step.num} className={`ed-pin-line${i === active ? ' is-active' : ''}`}>
                <span className="ed-pin-step-num">{step.num}</span>
                <span className="ed-pin-step-title">{step.title}</span>
                <span className="ed-pin-step-body">{step.body}</span>
              </div>
            ))}
          </div>
          <div className="ed-pin-dots" aria-hidden="true">
            {PROCESS.map((step, i) => (
              <span key={step.num} className={i === active ? 'is-active' : ''} />
            ))}
          </div>
        </div>
        <div className="ed-pin-cue">
          <span className="ed-scrollcue"><span className="ed-mouse" /> Scroll through the process</span>
        </div>
      </div>
    </section>
  )
}

function SuitedPanel() {
  return (
    <section className="ed-story cons-suited">
      <div className="ed-container">
        <div className="ed-section-label">Who It&rsquo;s For</div>
        <h2 className="ed-section-title">Cafes at <em>every stage.</em></h2>
        <div className="ed-story-grid cons-suited-grid">
          <p className="ed-story-lede">From first-time owners to established cafes hitting a plateau, if coffee is on your menu, we can help.</p>
          <ul className="ed-suited-list">
            {SUITED.map((item) => (
              <li key={item}><Check size={16} /> {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function Consultancy() {
  usePageMeta({
    title: 'Cafe Consultancy · Menu Design, Operations & Barista Training',
    description: 'End-to-end cafe consultancy from the team behind Mastermind Brews, menu design, operations, barista training and quality audits for cafes across India.',
    keywords: 'cafe consultancy India, restaurant consultant, menu design, cafe setup, barista training program, coffee shop consulting Mumbai',
  })

  return (
    <div className="page-shell consultancy-page about-editorial">
      <JsonLd id="consultancy-service" data={CONS_SERVICE} />
      <JsonLd id="consultancy-breadcrumb" data={CONS_CRUMB} />
      {/* ===== HERO (premium cinematic, scoped to .consultancy-page) ===== */}
      <header className="ed-hero cons-hero">
        <motion.div
          className="cons-hero-bg"
          aria-hidden="true"
          style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
          initial={{ scale: 1.14, opacity: 0 }}
          animate={{ scale: 1.08, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="cons-hero-scrim" aria-hidden="true" />
        <div className="ed-container cons-hero-inner">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.2 } } }}
          >
            <motion.div className="cons-eyebrow" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>
              Consultancy
            </motion.div>
            <motion.h1
              className="ed-section-title ed-hero-title cons-hero-title"
              variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } } }}
            >
              We help cafes <em>brew better.</em>
            </motion.h1>
            <motion.p
              className="ed-story-lede ed-hero-lede cons-hero-lede"
              variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
            >
              From a single beverage-menu refresh to a full operations rebuild, the same team that runs Mastermind Brews is available to work with yours.
            </motion.p>
            <motion.div className="cons-hero-cta" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}>
              <Magnetic><Link to="/contact" className="ed-btn ed-btn-primary">Start a Conversation <ArrowRight size={14} /></Link></Magnetic>
            </motion.div>
            <motion.div className="cons-hero-cue" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } } }}>
              <span className="ed-scrollcue"><span className="ed-mouse" /> Scroll to explore</span>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* ===== FOUNDER INTRO ===== */}
      <section className="cons-intro">
        <div className="ed-container">
          <div className="ed-section-label">A Note from the Founder</div>
          <div className="cons-intro-body">
            <p>
              Having personally experienced the balance between passion and profession, I understand the significance of designing a cafe that resonates and speaks your vision and values. My journey as the Founder of Mastermind Bicycle Cafe, along with my certifications as an SCA Barista and Brewer, Bartender, and Gelatiere, has equipped me with a holistic skill to guide you through this endeavor.
            </p>
            <p>
              While opening a cafe can seem really simple, it&rsquo;s the meticulous attention to detail that defines us from the rest and helps succeed. Drawing from my experience in running Mastermind Bicycle Cafe, I bring a hands-on approach to every aspect of Cafe Management.
            </p>
          </div>
        </div>
      </section>

      {/* ===== EXPERTISE ===== */}
      <section className="ed-values">
        <div className="ed-container">
          <div className="ed-section-label">Where We Help</div>
          <KineticHeading as="h2" className="ed-section-title">Our Expertise</KineticHeading>
          <div className="ed-values-grid">
            {EXPERTISE.map((s, i) => (
              <motion.div
                key={s.title}
                className="ed-value"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="ed-value-head">
                  <span className="ed-value-num">0{i + 1}</span>
                  <h3>{s.title}</h3>
                </div>
                <p>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUR PROJECTS (accordion, hupr.ca Spheres style) ===== */}
      <section className="ed-projects cons-projects">
        <div className="ed-container">
          <div className="ed-section-label">Our Projects</div>
          <KineticHeading as="h2" className="ed-section-title">Spaces we&rsquo;ve shaped.</KineticHeading>
          <p className="ed-journey-kicker">Six cafes, six coffee programs built from the ground up. Click any row to open the full story.</p>
        </div>
        <ProjectAccordion projects={PROJECTS} />
      </section>

      {/* ===== IMPACT (animated counters) ===== */}
      <section className="ed-stats cons-stats">
        <div className="ed-container">
          <div className="ed-section-label">The Work, in Numbers</div>
          <div className="ed-stats-grid">
            {CONS_STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className="ed-stat"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="ed-stat-num"><CountUp to={s.to} suffix={s.suffix || ''} separator={s.separator ?? ','} /></span>
                <span className="ed-stat-label">{s.label}</span>
                {s.sub && <span className="ed-stat-sub">{s.sub}</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS (pinned scrollytelling) ===== */}
      <PinnedProcess />

      {/* ===== IN THEIR SPACES (editorial photo grid) ===== */}
      <section className="ed-gallery cons-gallery">
        <div className="ed-container ed-gallery-head">
          <div>
            <div className="ed-section-label">In Their Spaces</div>
            <KineticHeading as="h2" className="ed-section-title">Coffee, on the ground.</KineticHeading>
          </div>
          <Magnetic><Link to="/contact" className="ed-btn ed-btn-ghost">Start a project <ArrowRight size={14} /></Link></Magnetic>
        </div>
        <div className="ed-photo-grid">
          {CONS_GRID.map((p, i) => (
            <motion.div
              key={i}
              className="ed-photo-grid-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src={p.src} alt={p.alt} loading="lazy" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== WHO IT'S FOR ===== */}
      <SuitedPanel />

      {/* ===== CLOSING CTA ===== */}
      <section className="ed-cta">
        <div className="ed-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ed-section-label" style={{ marginBottom: 18 }}>
              <Briefcase size={13} style={{ display: 'inline', marginRight: 6 }} /> Let&rsquo;s Build
            </div>
            <h2>Tell us what you&rsquo;re <em>building.</em></h2>
            <div className="ed-actions">
              <Magnetic><Link to="/contact" className="ed-btn ed-btn-primary">Contact Us <ArrowRight size={14} /></Link></Magnetic>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
