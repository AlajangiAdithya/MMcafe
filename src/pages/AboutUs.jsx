import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ArrowRight } from 'lucide-react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import Magnetic from '../components/Magnetic'
import JsonLd from '../components/JsonLd'
import DragScroller from '../components/DragScroller'
import KineticHeading from '../components/KineticHeading'
import InstagramTabs from '@/components/ui/instagram-tabs'
import '../styles/about-editorial.css'


/* Draggable journey timeline, physiotherapy → competition stage → the academy. */
const ABOUT_JOURNEY = [
  { year: 'BEFORE', title: 'Physiotherapy', body: 'A background in healing bodies, an eye for precision, patience, and care that would carry straight into the craft.' },
  { year: 'THE START', title: 'The Family Cafe', body: 'A cafe in Mulund beside my father’s bicycle studio. If we were going to serve coffee, I wanted to truly understand it.' },
  { year: 'SCA', title: 'Barista & Brewing', body: 'Professional SCA certifications in barista skills and brewing, learning the craft from the ground up.' },
  { year: 'THAILAND', title: 'CVA Sensory', body: 'A Coffee Value Assessment to read flavour, structure, and sensory evaluation properly.' },
  { year: 'ETHIOPIA', title: 'Q Processing', body: 'Learning how coffee is shaped at origin, from cherry to green bean, where flavour really begins.' },
  { year: '2026', title: '4th Runner-Up', body: 'Stepping onto the competition stage at the Indian Barista Championship.' },
  { year: 'TODAY', title: 'Mastermind Brews', body: 'A platform and a physical academy in Mulund, sharing coffees, knowledge, and hands-on workshops.' },
]

/* Editorial photo grid — 6 moments from the cafe, academy & journey. */
const ABOUT_GRID = [
  { src: '/namrata-thakkar.jpg',         alt: 'Namrata Thakkar, founder of Mastermind Brews' },
  { src: '/pour-over-coffee.jpg',        alt: 'Pour-over brewing at Mastermind Brews' },
  { src: '/about-team.jpg',              alt: 'The Mastermind Brews team' },
  { src: '/academy-feature.jpg',         alt: 'Barista academy session' },
  { src: '/project-cafe.jpg',            alt: 'Mastermind Bicycle Cafe & Bar, Mulund' },
  { src: '/cafe-food.png',               alt: 'Food at Mastermind Bicycle Cafe' },
]

/* Three founding principles, paradisoinstitute.org-style pillar structure. */
const ABOUT_PILLARS = [
  {
    num: '01',
    title: 'Source with Intention',
    body: 'Every bean traces back to its origin. Chikmagalur highlands, Ethiopian processing stations, Thailand—because where coffee begins determines what ends up in your cup.',
  },
  {
    num: '02',
    title: 'Brew with Precision',
    body: 'SCA certifications, a competition stage, and years of calibration. The science of extraction is not separate from the art of hospitality—they are the same discipline.',
  },
  {
    num: '03',
    title: 'Share with Purpose',
    body: 'Mastermind Brews exists so others can learn faster than we did. The academy, the workshops, the consultancy—all of it is about carrying the craft further than we can alone.',
  },
]

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
    image: 'https://www.mastermindbrews.com/namrata-thakkar.jpg',
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
   StoryPanel, a media panel with a serif title and monospace
   caption. The media clip-reveals on entry and the image drifts
   gently inside its frame as the panel scrolls (inner parallax).
   ============================================================ */
function StoryPanel({ kicker, tags, year, title, img, alt, tagline, lede, children }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-5%', '5%'])

  return (
    <section className="ed-story">
      <div className="ed-container">
        <div className="ed-story-head">
          {kicker && <span className="ed-story-index">{kicker}</span>}
          <span className="ed-story-meta">{tags}<br />{year}</span>
          <h2 className="ed-story-title">{title}</h2>
        </div>

        <div className="ed-story-intro">
          <motion.div
            ref={ref}
            className="ed-story-media"
            initial={reduced ? { opacity: 0 } : { clipPath: 'inset(10% 10% 10% 10% round 16px)', opacity: 0.4 }}
            whileInView={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1 }}
            viewport={{ once: true, margin: '-12%' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img src={img} alt={alt} style={reduced ? undefined : { y: imgY, scale: 1.1 }} loading="lazy" width="877" height="775" />
            <span className="ed-story-tag">{tagline}</span>
          </motion.div>
          <p className="ed-story-lede">{lede}</p>
        </div>

        <div className="ed-story-body">{children}</div>
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
          img="/namrata-thakkar.jpg"
          alt="Namrata Thakkar, founder of Mastermind Brews and certified barista, at the bar in Mulund, Mumbai"
          tagline="The Brewer"
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

      {/* ===== THREE PRINCIPLES (paradisoinstitute.org-style pillars) ===== */}
      <section className="ed-pillars">
        <div className="ed-container">
          <div className="ed-section-label">What Drives the Craft</div>
          <KineticHeading as="h2" className="ed-section-title">Three principles, <em>one cup.</em></KineticHeading>
          <div className="ed-pillars-list">
            {ABOUT_PILLARS.map((p, i) => (
              <motion.div
                key={p.num}
                className="ed-pillar"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="ed-pillar-num">{p.num}</span>
                <div>
                  <h3 className="ed-pillar-title">{p.title}</h3>
                  <p className="ed-pillar-body">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== THE JOURNEY (draggable timeline) ===== */}
      <section className="ed-journey">
        <div className="ed-container">
          <div className="ed-section-label">The Road Here</div>
          <KineticHeading as="h2" className="ed-section-title">From physiotherapy to the bar.</KineticHeading>
          <p className="ed-journey-kicker">Drag through the milestones&mdash;the certifications, the competition stage, and the cafe where it all began.</p>
        </div>
        <div data-cursor="drag">
          <DragScroller className="ed-journey-track">
            {ABOUT_JOURNEY.map((m, i) => (
              <article key={m.title} className="ed-jcard">
                <span className="ed-jcard-step">{String(i + 1).padStart(2, '0')}</span>
                <span className="ed-jcard-year">{m.year}</span>
                <h3 className="ed-jcard-title">{m.title}</h3>
                <p className="ed-jcard-body">{m.body}</p>
              </article>
            ))}
          </DragScroller>
        </div>
      </section>

      {/* ===== IN FRAME (editorial photo grid) ===== */}
      <section className="ed-gallery">
        <div className="ed-container ed-gallery-head">
          <div>
            <div className="ed-section-label">In Frame</div>
            <KineticHeading as="h2" className="ed-section-title">Moments from the journey.</KineticHeading>
          </div>
          <Link to="/workshop" className="ed-btn ed-btn-ghost">Learn with us <ArrowRight size={14} /></Link>
        </div>
        <div className="ed-photo-grid">
          {ABOUT_GRID.map((p, i) => (
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
