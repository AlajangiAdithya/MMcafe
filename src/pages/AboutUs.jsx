import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Coffee, Award, Trophy, MapPin, Clock, ArrowRight, ExternalLink, Heart, Users, Sparkles } from 'lucide-react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import CountUp from '../components/CountUp'
import Magnetic from '../components/Magnetic'
import FloatingBeans from '../components/FloatingBeans'
import SteamWisps from '../components/SteamWisps'
import JsonLd from '../components/JsonLd'
import '../styles/about-editorial.css'

const ABOUT_ORG_ID = 'https://www.mastermindbrews.com/#organization'
const ABOUT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: 'https://www.mastermindbrews.com/about',
  name: 'About Mastermind Brews',
  about: { '@id': ABOUT_ORG_ID },
  mainEntity: {
    '@type': 'Person',
    name: 'Namrata Thakkar',
    jobTitle: 'Founder',
    worksFor: { '@id': ABOUT_ORG_ID },
    image: 'https://www.mastermindbrews.com/namrata.jpg',
  },
}
const ABOUT_CRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mastermindbrews.com/' },
    { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.mastermindbrews.com/about' },
  ],
}

function InstagramIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

/* ============================================================
   StoryPanel, Charmer-style full-bleed media panel with a serif
   title, monospace caption and a ghost name. The media clip-reveals
   on entry; the image + ghost word parallax as the panel scrolls.
   ============================================================ */
function StoryPanel({ id, tags, year, title, img, alt, tagline, ghost, lede, children }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-9%', '9%'])
  const ghostX = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['10%', '-10%'])

  return (
    <section className="ed-story">
      <div className="ed-container">
        <div className="ed-story-head">
          <span className="ed-story-index">({id})</span>
          <span className="ed-story-meta">{tags}<br />{year}</span>
          <h2 className="ed-story-title">{title}</h2>
        </div>

        <motion.div
          ref={ref}
          className="ed-story-media"
          initial={reduced ? { opacity: 0 } : { clipPath: 'inset(14% 14% 14% 14% round 16px)', opacity: 0.35 }}
          whileInView={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1 }}
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img src={img} alt={alt} style={{ y: imgY, scale: 1.14 }} loading="lazy" width="1600" height="900" />
          <span className="ed-story-tag">{tagline}</span>
          <motion.span className="ed-story-ghost" style={{ x: ghostX }} aria-hidden="true">{ghost}</motion.span>
        </motion.div>

        <div className="ed-story-grid">
          <p className="ed-story-lede">{lede}</p>
          <div>{children}</div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   PinLine / PinGhost, sub-pieces of the NRG-style pinned scrolly.
   Each fades/translates in for its slice of the scroll progress.
   ============================================================ */
function PinLine({ progress, index, total, children }) {
  const seg = 1 / total
  const s = index * seg
  const opacity = useTransform(progress, [s, s + 0.06, s + seg - 0.06, s + seg], [0, 1, 1, 0])
  const y = useTransform(progress, [s, s + 0.06, s + seg - 0.06, s + seg], [60, 0, 0, -60])
  return <motion.p className="ed-pin-line" style={{ opacity, y }}>{children}</motion.p>
}

function PinGhost({ progress, index, total, children }) {
  const seg = 1 / total
  const s = index * seg
  const opacity = useTransform(progress, [s, s + 0.08, s + seg - 0.08, s + seg], [0, 1, 1, 0])
  return <motion.span className="ed-pin-ghost" style={{ opacity }} aria-hidden="true">{children}</motion.span>
}

const PIN_STEPS = [
  { ghost: 'ORIGIN', line: <>From a single estate in <em>Chikmagalur</em>,</> },
  { ghost: 'ROAST', line: <>roasted to exclusive profiles with <em>Bean Rove</em>,</> },
  { ghost: 'BREW', line: <>dialed in by hand at the <em>bar</em>,</> },
  { ghost: 'SERVE', line: <>and poured into <em>your</em> cup.</> },
]

function PinnedStory() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const bgScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1.05, 1.18])
  const bgY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['0%', '-6%'])

  return (
    <section className="ed-pin" ref={ref}>
      <div className="ed-pin-sticky">
        <motion.div
          className="ed-pin-bg"
          style={{ backgroundImage: 'url(/project-cafe.jpg)', scale: bgScale, y: bgY }}
        />
        <div className="ed-pin-scrim" />
        {PIN_STEPS.map((step, i) => (
          <PinGhost key={step.ghost} progress={scrollYProgress} index={i} total={PIN_STEPS.length}>
            {step.ghost}
          </PinGhost>
        ))}
        <div className="ed-pin-inner">
          <div className="ed-pin-eyebrow">Bean to Cup</div>
          <div className="ed-pin-stage">
            {PIN_STEPS.map((step, i) => (
              <PinLine key={i} progress={scrollYProgress} index={i} total={PIN_STEPS.length}>
                {step.line}
              </PinLine>
            ))}
          </div>
        </div>
        <div className="ed-pin-cue">
          <span className="ed-scrollcue"><span className="ed-mouse" /> Keep scrolling</span>
        </div>
      </div>
    </section>
  )
}

const VALUES = [
  { icon: Coffee, title: 'Specialty First', body: 'We do not compromise on bean quality, freshness, or the people who pour our cups.' },
  { icon: Heart, title: 'Welcome All', body: 'Pet friendly, vegan friendly, gluten-free options, hospitality should never be selective.' },
  { icon: Award, title: 'Train Well', body: 'Great coffee starts with great baristas. We invest in the people who make the craft.' },
  { icon: Users, title: 'Build Community', body: 'Cafes are third places. We keep ours warm, social, and a little bit unhurried.' },
]

export default function AboutUs() {
  usePageMeta({
    title: 'About Mastermind Brews · Our Story, Team & Cafe in Mulund',
    description: 'Meet Mastermind Brews, founder Namrata Thakkar, and the Mastermind Bicycle Cafe & Bar in Mulund, Mumbai, the people and the place behind the coffee.',
    keywords: 'about Mastermind Brews, Namrata Thakkar, Mastermind Bicycle Cafe, coffee roastery Mumbai, specialty coffee brand India',
  })

  const heroRef = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 90])

  return (
    <div className="page-shell about-page about-editorial">
      <JsonLd id="about-page" data={ABOUT_SCHEMA} />
      <JsonLd id="about-breadcrumb" data={ABOUT_CRUMB} />
      {/* ===== HERO ===== */}
      <section className="page-hero about-hero" ref={heroRef}>
        <div className="hero-mesh-overlay" style={{ zIndex: 1 }} />
        <SteamWisps count={4} seed={9} />
        <FloatingBeans count={8} seed={5} />
        <div className="container" style={{ zIndex: 2, position: 'relative' }}>
          <motion.div style={{ opacity: heroOpacity, y: heroY }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.15 } } }}
              className="about-hero-content"
            >
              <motion.div
                className="hero-badge"
                variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                style={{ marginBottom: 32 }}
              >
                <span className="dot" />
                <span className="hero-badge-text">Our Story</span>
              </motion.div>

              <motion.h1
                className="page-title"
                variants={{ hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
              >
                The People, The Place,<br />The <span className="text-accent-glow">Coffee</span>.
              </motion.h1>

              <motion.p
                className="page-lede"
                variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
                style={{ margin: '0 auto' }}
              >
                Three chapters make Mastermind Brews, the brand, the brewer, and the cafe where it all began.
              </motion.p>

              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } } }}>
                <span className="ed-scrollcue"><span className="ed-mouse" /> Scroll to explore</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== STORY PANELS (Charmer-style) ===== */}
      <div className="ed-stories">
        <StoryPanel
          id="01"
          tags="ROASTING · ACADEMY · CONSULTING"
          year="EST. 2023"
          title={<>Specialty coffee, <em>beyond the bar.</em></>}
          img="/pour-over-coffee.jpg"
          alt="Barista pouring a slow Chemex brew with single-origin Chikmagalur coffee at Mastermind Brews"
          tagline="The Brand"
          ghost="BREWS"
          lede="Everything we serve at the counter, carried into your kitchen, single-origin beans, the kit to brew them, and the craft behind a properly pulled cup."
        >
          <div className="ed-story-text">
            <p>Our beans travel directly from estates in <strong>Chikmagalur, Karnataka</strong>, roasted to exclusive profiles by Bean Rove. The same coffee that lands in our portafilters, sealed fresh, shipped to your door.</p>
            <p>Beyond the bag, a barista academy: HD video lessons, hands-on workshops in Mulund, and a consulting arm helping cafes across India build their coffee programs from the ground up.</p>
          </div>
          <div className="ed-stats">
            <div className="ed-stat"><strong><CountUp to={3} /></strong><span>Verticals · Beans, Academy, Projects</span></div>
            <div className="ed-stat"><strong><CountUp to={100} suffix="%" /></strong><span>Single-Origin Chikmagalur</span></div>
            <div className="ed-stat"><strong><CountUp to={48} suffix="h" /></strong><span>Roasted & shipped within</span></div>
          </div>
          <div className="ed-actions">
            <Magnetic><Link to="/store" className="ed-btn ed-btn-primary">Shop Coffee <ArrowRight size={14} /></Link></Magnetic>
            <Magnetic><Link to="/workshop" className="ed-btn ed-btn-ghost">Learn Coffee</Link></Magnetic>
          </div>
        </StoryPanel>

        <StoryPanel
          id="02"
          tags="FOUNDER · HEAD BARISTA"
          year="NBC 2026"
          title={<>From physiotherapy to <em>championship coffee.</em></>}
          img="/namrata.jpg"
          alt="Namrata Thakkar, founder and head roaster of Mastermind Brews and Mastermind Bicycle Cafe in Mulund, Mumbai"
          tagline="The Brewer"
          ghost="NAMRATA"
          lede="Namrata Thakkar is the founder of Mastermind Bicycle Cafe, and a certified barista who placed 4th Runner-Up at the National Barista Championship 2026."
        >
          <div className="ed-story-text">
            <p>A former physiotherapist, curiosity became learning, learning became obsession, and obsession became craft. She built her coffee from the bar up, extraction, flavour notes, balance, precision, the details that quietly separate a good cup from a great one.</p>
            <p>On her handle <a href="https://www.instagram.com/namrata_is_brewing/" target="_blank" rel="noopener noreferrer">@namrata_is_brewing</a>, she shares the techniques she teaches her own baristas, from dialing in espresso to pulling a clean pour-over at home.</p>
          </div>
          <div className="ed-badge">
            <span className="ed-badge-icon"><Trophy size={18} /></span>
            <span>
              <span className="ed-badge-num">4th Runner-Up</span><br />
              <span className="ed-badge-label">National Barista Championship 2026 · IICF</span>
            </span>
          </div>
          <div className="ed-actions">
            <Magnetic>
              <a href="https://www.instagram.com/namrata_is_brewing/" target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn-primary">
                <InstagramIcon size={15} /> Follow @namrata_is_brewing
              </a>
            </Magnetic>
          </div>
        </StoryPanel>

        <StoryPanel
          id="03"
          tags="HOSPITALITY · KITCHEN · COMMUNITY"
          year="MULUND, MUMBAI"
          title={<>A coffee house. <em>A community space.</em></>}
          img="/project-cafe.jpg"
          alt="Interior view of Mastermind Bicycle Cafe & Bar in Mulund, Mumbai with warm lighting and community seating"
          tagline="The Cafe"
          ghost="CAFE"
          lede="In Mulund, the espresso machine and the bike rack share equal billing, a third place open from breakfast through midnight, every day of the week."
        >
          <div className="ed-story-text">
            <p>The kitchen leans South Indian: <strong>Malabar tiffins</strong> at dawn, gelato in the afternoon, matcha cocktails after dark. Pets are welcome, conversations stay slow, and the cycling crew rolls in every weekend.</p>
          </div>
          <div className="ed-stats">
            <div className="ed-stat"><strong><MapPin size={22} /></strong><span>Avior Corporate Park · LBS Marg</span></div>
            <div className="ed-stat"><strong><CountUp to={7} /></strong><span>Days open · 8:30 AM–12 AM</span></div>
            <div className="ed-stat"><strong><Heart size={22} /></strong><span>Pet friendly · Vegan options</span></div>
          </div>
          <div className="ed-actions">
            <Magnetic><a href="https://www.mastermindbrews.com/" target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn-primary">Visit Cafe Website <ExternalLink size={14} /></a></Magnetic>
            <Magnetic><a href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund" target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn-ghost">Get Directions</a></Magnetic>
          </div>
        </StoryPanel>
      </div>

      {/* ===== NRG-STYLE PINNED SCROLLY ===== */}
      <PinnedStory />

      {/* ===== VALUES ===== */}
      <section className="ed-values">
        <div className="ed-container">
          <div className="ed-section-label">What We Stand For</div>
          <h2 className="ed-section-title">Our Values</h2>
          <div className="ed-values-grid">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                className="ed-value"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="ed-value-num">0{i + 1}</span>
                <div className="ed-value-icon"><v.icon size={24} /></div>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section className="ed-cta">
        <div className="ed-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ed-section-label" style={{ marginBottom: 18 }}><Sparkles size={13} style={{ display: 'inline', marginRight: 6 }} /> Come Say Hi</div>
            <h2>Want to visit, learn or <em>hire?</em></h2>
            <p>Drop by the cafe, browse the workshop, or get in touch about a project.</p>
            <div className="ed-actions">
              <Magnetic><Link to="/workshop" className="ed-btn ed-btn-primary">Browse Workshop <ArrowRight size={14} /></Link></Magnetic>
              <Magnetic><Link to="/contact" className="ed-btn ed-btn-ghost">Contact Us</Link></Magnetic>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
