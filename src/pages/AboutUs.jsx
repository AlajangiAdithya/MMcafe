import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import Magnetic from '../components/Magnetic'
import JsonLd from '../components/JsonLd'
import InstagramTabs from '@/components/ui/instagram-tabs'
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
          lede="I come from a background in physiotherapy. When my family set out to build a cafe in Mulund, Mumbai, alongside the bicycle studio my father had always dreamed of, I decided that if we were going to serve coffee, I wanted to truly understand it, as a craft, not just a menu item."
        >
          <div className="ed-story-text">
            <p>That took me into professional training, SCA certifications in <strong>Barista Skills &amp; Brewing</strong>, a <strong>CVA in Thailand</strong> to understand sensory evaluation and flavour, and <strong>Q Processing in Ethiopia</strong> to learn how coffee is shaped at origin. Along the way I stepped onto the competition stage, placing as <strong>4th Runner-Up at the 2026 Indian Barista Championship</strong>.</p>
            <p>Mastermind Brews was born from that journey. Today it is both a platform and a physical academy in Mulund, Mumbai, where I share coffees, brewing knowledge, and hands-on workshops, in the hope of making specialty coffee more approachable and helping others learn faster than I did.</p>
            <p>For me, coffee is no longer just a drink. It is craft, science, sport, and a way of bringing people together.</p>
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

      {/* ===== INSTAGRAM TABS ===== */}
      <section className="ed-ig">
        <div className="ed-container">
          <div className="ed-section-label">Follow the Journey</div>
          <h2 className="ed-section-title">Three places, <em>one craft.</em></h2>
          <InstagramTabs />
        </div>
      </section>
    </div>
  )
}
