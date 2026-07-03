import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, MapPin } from 'lucide-react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import JsonLd from '../components/JsonLd'
import Magnetic from '../components/Magnetic'
import VelocityMarquee from '../components/VelocityMarquee'
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


const PROCESS = [
  { num: '01', title: 'Discovery Call', body: 'We listen. Tell us about the space, the vision, and the constraints.' },
  { num: '02', title: 'Site & Concept Audit', body: 'A visit or remote review maps the gap between where you are and where you want to be.' },
  { num: '03', title: 'Engagement Plan', body: 'A scoped proposal with timelines, deliverables, and a clear price.' },
  { num: '04', title: 'Execution & Handover', body: 'We build it with you, then leave you with a team and a system that runs without us.' },
]

const SUITED = [
  'Owners building their first cafe',
  'Existing cafes hitting a plateau',
  'Restaurants adding a coffee program',
  'Hotels or co-working spaces serving in-house',
  'Brands wanting trained barista staff',
]

/* MosaicCard — one project card in the staggered editorial grid. The whole
   card drifts a few px against scroll (opposite directions per column) and
   the photo clip-reveals on entry. */
function MosaicCard({ p, i }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const dir = i % 2 === 0 ? 1 : -1
  const y = useTransform(scrollYProgress, [0, 1], [26 * dir, -26 * dir])

  return (
    <motion.article ref={ref} className="cons-mosaic-item" style={reduced ? undefined : { y }}>
      <motion.div
        className="cons-mosaic-media"
        initial={reduced ? { opacity: 0 } : { clipPath: 'inset(8% 8% 8% 8% round 18px)', opacity: 0.4 }}
        whileInView={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0% round 18px)', opacity: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={p.img} alt={`${p.name}, ${p.loc}, a Mastermind Brews cafe project`} loading="lazy" />
        <span className="cons-mosaic-index">0{i + 1}</span>
        <span className="cons-mosaic-loc"><MapPin size={11} /> {p.loc}</span>
      </motion.div>
      <motion.div
        className="cons-mosaic-body"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-8%' }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="cons-mosaic-tag">{p.tag}</span>
        <h3 className="cons-mosaic-title">{p.name}</h3>
        <p className="cons-mosaic-desc">{p.body}</p>
        <div className="cons-mosaic-scope">
          <span className="cons-mosaic-scope-label">Scope of Delivery</span>
          <p>{p.details}</p>
        </div>
      </motion.div>
    </motion.article>
  )
}

/* How It Works — a plain numbered list of the four steps. No pinning,
   no scroll-jacking; the content is the section. */
function ProcessSection() {
  return (
    <section className="ed-pillars cons-process">
      <div className="ed-container">
        <div className="ed-section-label">How It Works</div>
        <KineticHeading as="h2" className="ed-section-title">Four steps, start to handover.</KineticHeading>
        <div className="ed-pillars-list">
          {PROCESS.map((step, i) => (
            <motion.div
              key={step.num}
              className="ed-pillar"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="ed-pillar-num">{step.num}</span>
              <div>
                <h3 className="ed-pillar-title">{step.title}</h3>
                <p className="ed-pillar-body">{step.body}</p>
              </div>
            </motion.div>
          ))}
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
          </motion.div>
        </div>
      </header>

      {/* ===== SCROLL-VELOCITY MARQUEE — the cafes we've worked with ===== */}
      <VelocityMarquee className="vmq--outline vmq--cons" baseVelocity={2}>
        Cocoa Experience · Grounded · Affogato · Churn&rsquo;d · <em>Indulge Creamery</em> · Geranium Haven ·{' '}
      </VelocityMarquee>

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
      <section className="ed-values cons-expertise">
        <div className="ed-container">
          <div className="ed-section-label">Where We Help</div>
          <KineticHeading as="h2" className="ed-section-title">Our Expertise</KineticHeading>
          <div className="ed-values-grid cons-expertise-grid">
            {EXPERTISE.map((s, i) => (
              <motion.div
                key={s.title}
                className="ed-value cons-expertise-card"
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

      {/* ===== OUR PROJECTS (staggered editorial mosaic) ===== */}
      <section className="ed-projects cons-projects">
        <div className="ed-container">
          <div className="ed-section-label">Our Projects</div>
          <KineticHeading as="h2" className="ed-section-title">Spaces we&rsquo;ve shaped.</KineticHeading>
          <p className="ed-journey-kicker">Six cafes, six different briefs&mdash;each card carries its own scope of delivery.</p>
          <div className="cons-mosaic">
            {PROJECTS.map((p, i) => (
              <MosaicCard key={p.name} p={p} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <ProcessSection />

      {/* ===== WHO IT'S FOR ===== */}
      <SuitedPanel />

      {/* ===== CLOSING CTA ===== */}
      <section className="ed-cta">
        <div className="ed-container">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ed-section-label">Let&rsquo;s Build</div>
            <KineticHeading as="h2" className="ed-section-title">Have a space <em>in mind?</em></KineticHeading>
            <p className="ed-cta-lede">
              Tell us about the site, the vision, and the constraints. We&rsquo;ll come back
              with honest next steps&mdash;usually within 48 hours.
            </p>
            <div className="ed-actions">
              <Magnetic><Link to="/contact" className="ed-btn ed-btn-primary">Start a Conversation <ArrowRight size={14} /></Link></Magnetic>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
