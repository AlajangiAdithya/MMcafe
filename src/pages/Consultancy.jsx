import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Coffee, ClipboardList, BarChart3, Users, ArrowRight, Check } from 'lucide-react'
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import Magnetic from '../components/Magnetic'
import JsonLd from '../components/JsonLd'
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

const SERVICES = [
  { icon: Coffee, title: 'Menu & Beverage Design', body: 'Build a coffee program that fits your space, your guests, and your margins.' },
  { icon: ClipboardList, title: 'Operations Setup', body: 'SOPs, equipment selection, supplier sourcing, and kitchen-bar workflow design.' },
  { icon: Users, title: 'Staff Training', body: 'Onboard your baristas with hands-on programs run by our team or at our Mulund cafe.' },
  { icon: BarChart3, title: 'Audits & Health Checks', body: 'Honest, on-the-ground reviews of an existing cafe with a written report and action plan.' },
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
        <motion.div className="ed-pin-bg" style={{ backgroundImage: 'url(/pour-over-coffee.jpg)', scale: bgScale }} />
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
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-8%', '8%'])
  return (
    <section className="ed-story">
      <div className="ed-container">
        <div className="ed-story-head">
          <span className="ed-story-index">(04)</span>
          <span className="ed-story-meta">WHO IT&rsquo;S FOR</span>
          <h2 className="ed-story-title">Cafes at <em>every stage.</em></h2>
        </div>
        <motion.div
          ref={ref}
          className="ed-story-media"
          initial={reduced ? { opacity: 0 } : { clipPath: 'inset(14% 14% 14% 14% round 16px)', opacity: 0.35 }}
          whileInView={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1 }}
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img src="/project-cafe.jpg" alt="A cafe consulting project by Mastermind Brews" style={{ y: imgY, scale: 1.14 }} loading="lazy" />
          <span className="ed-story-tag">In the Field</span>
        </motion.div>
        <div className="ed-story-grid">
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
          style={{ backgroundImage: 'url(/project-cafe.jpg)' }}
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
              We help cafes <em>get better.</em>
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

      {/* ===== SERVICES ===== */}
      <section className="ed-values">
        <div className="ed-container">
          <div className="ed-section-label">What We Do</div>
          <h2 className="ed-section-title">Our Services</h2>
          <div className="ed-values-grid">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.title}
                className="ed-value"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="ed-value-num">0{i + 1}</span>
                <div className="ed-value-icon"><s.icon size={24} /></div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS (pinned scrollytelling, like About's Bean-to-Cup) ===== */}
      <PinnedProcess />

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
            <p>We&rsquo;ll reply within two working days with a fit assessment and clear next steps.</p>
            <div className="ed-actions">
              <Magnetic><Link to="/contact" className="ed-btn ed-btn-primary">Contact Us <ArrowRight size={14} /></Link></Magnetic>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
