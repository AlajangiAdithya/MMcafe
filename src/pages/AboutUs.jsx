import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import Magnetic from '../components/Magnetic'
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
   StoryPanel, a full-bleed media panel with a serif title,
   monospace caption and a ghost name. The media clip-reveals on
   entry; the image + ghost word parallax as the panel scrolls.
   ============================================================ */
function StoryPanel({ kicker, tags, year, title, img, alt, tagline, ghost, lede, children }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-9%', '9%'])
  const ghostX = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['10%', '-10%'])

  return (
    <section className="ed-story">
      <div className="ed-container">
        <div className="ed-story-head">
          {kicker && <span className="ed-story-index">{kicker}</span>}
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

const VALUES = [
  { title: 'Specialty First', body: 'We do not compromise on bean quality, freshness, or the people who pour our cups.' },
  { title: 'Welcome All', body: 'Pet friendly, vegan friendly, gluten-free options, hospitality should never be selective.' },
  { title: 'Train Well', body: 'Great coffee starts with great baristas. We invest in the people who make the craft.' },
  { title: 'Build Community', body: 'Cafes are third places. We keep ours warm, social, and a little bit unhurried.' },
]

const IG_TABS = [
  { role: 'The Brand', name: 'Mastermind Brews', handle: '@mastermindbrews', url: 'https://www.instagram.com/mastermindbrews/' },
  { role: 'The Brewer', name: 'Namrata is Brewing', handle: '@namrata_is_brewing', url: 'https://www.instagram.com/namrata_is_brewing/' },
  { role: 'The Cafe', name: 'Mastermind Bicycle Cafe', handle: '@mastermindbicyclecafe', url: 'https://www.instagram.com/mastermindbicyclecafe/' },
]

export default function AboutUs() {
  usePageMeta({
    title: 'About Mastermind Brews · Namrata Thakkar & the Coffee Academy',
    description: 'How coffee became craft for founder Namrata Thakkar, from physiotherapy to SCA, CVA and Q Processing certifications and the 2026 Indian Barista Championship, and how it grew into Mastermind Brews, a specialty coffee academy in Mulund, Mumbai.',
    keywords: 'about Mastermind Brews, Namrata Thakkar, barista academy Mumbai, specialty coffee India, Indian Barista Championship, coffee courses Mulund',
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
                The journey, the craft,<br />and the <span className="text-accent-glow">coffee</span>.
              </motion.h1>

              <motion.p
                className="page-lede"
                variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
                style={{ margin: '0 auto' }}
              >
                Hi, I&rsquo;m Namrata Thakkar. This is how coffee became craft, and craft became purpose through Mastermind Brews.
              </motion.p>

              <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8, delay: 0.2 } } }}>
                <span className="ed-scrollcue"><span className="ed-mouse" /> Scroll to explore</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== ONE INTRODUCTION ===== */}
      <div className="ed-stories">
        <StoryPanel
          kicker="ABOUT"
          tags="FOUNDER · ACADEMY"
          year="MULUND, MUMBAI"
          title={<>Coffee was never <em>the plan.</em></>}
          img="/namrata.jpg"
          alt="Namrata Thakkar, founder of Mastermind Brews and certified barista, at the bar in Mulund, Mumbai"
          tagline="The Brewer"
          ghost="NAMRATA"
          lede="I come from physiotherapy. When my family set out to build a cafe in Mulund, I decided that if we were going to serve coffee, I wanted to truly understand it, as a craft, not just a menu item."
        >
          <div className="ed-story-text">
            <p>That took me from <strong>SCA Barista &amp; Brewing</strong> certifications to a <strong>CVA in Thailand</strong> and <strong>Q Processing</strong> at origin in Ethiopia, and onto the competition stage as <strong>4th Runner-Up at the 2026 Indian Barista Championship</strong>. Somewhere along the way, coffee stopped being a drink and became craft, science, sport, and a way of bringing people together.</p>
            <p>Everything coffee has taught us behind the bar now lives in the academy, from single-origin beans and brewing methods to the craft, technique, and understanding behind every cup.</p>
            <p>Beyond the beans, our e-books and coffee courses make specialty coffee easier to learn, whether you&rsquo;re an aspiring barista, cafe owner, home brewer, or simply curious. We also host hands-on workshops and barista training at our academy in Mumbai: a space to brew, taste, ask questions, and learn coffee in a way that is visual, approachable, and easy to apply.</p>
          </div>
          <div className="ed-badge">
            <span className="ed-badge-icon"><Trophy size={18} /></span>
            <span>
              <span className="ed-badge-num">4th Runner-Up</span><br />
              <span className="ed-badge-label">Indian Barista Championship 2026</span>
            </span>
          </div>
          <div className="ed-actions">
            <Magnetic><Link to="/store" className="ed-btn ed-btn-primary">Shop Coffee <ArrowRight size={14} /></Link></Magnetic>
            <Magnetic><Link to="/workshop" className="ed-btn ed-btn-ghost">Learn Coffee</Link></Magnetic>
          </div>
        </StoryPanel>
      </div>

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
                <div className="ed-value-head">
                  <span className="ed-value-num">0{i + 1}</span>
                  <h3>{v.title}</h3>
                </div>
                <p>{v.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INSTAGRAM TABS ===== */}
      <section className="ed-ig">
        <div className="ed-container">
          <div className="ed-section-label">Follow the Journey</div>
          <h2 className="ed-section-title">Three places, <em>one craft.</em></h2>
          <div className="ed-ig-grid">
            {IG_TABS.map((t) => (
              <Magnetic key={t.handle}>
                <a className="ed-ig-card" href={t.url} target="_blank" rel="noopener noreferrer">
                  <span className="ed-ig-icon"><InstagramIcon size={20} /></span>
                  <span className="ed-ig-role">{t.role}</span>
                  <h3 className="ed-ig-name">{t.name}</h3>
                  <span className="ed-ig-handle"><InstagramIcon size={13} /> {t.handle}</span>
                </a>
              </Magnetic>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
