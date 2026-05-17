import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Coffee, Award, Trophy, MapPin, Clock, ArrowRight, ExternalLink, Sparkles, Heart, Users } from 'lucide-react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import { AnimatedText } from '@/components/ui/animated-underline-text-one'
import { GridBackground } from '@/components/ui/grid-background'

function InstagramIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

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

export default function AboutUs() {
  usePageMeta({
    title: 'About Mastermind Brews · Our Story, Team & Cafe in Mulund',
    description: 'Meet Mastermind Brews, founder Namrata Thakkar, and the Mastermind Bicycle Cafe & Bar in Mulund, Mumbai — the people and the place behind the coffee.',
    keywords: 'about Mastermind Brews, Namrata Thakkar, Mastermind Bicycle Cafe, coffee roastery Mumbai, specialty coffee brand India',
  })

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])

  return (
    <div className="page-shell about-page">
      {/* ===== PAGE HERO (100K PREMIUM UPGRADE) ===== */}
      <section className="page-hero about-hero" ref={heroRef}>
        <div className="hero-mesh-overlay" style={{ zIndex: 1 }} />
        <div className="container" style={{ zIndex: 2, position: 'relative' }}>
          <motion.div style={{ opacity: heroOpacity, y: heroY }}>
            <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
            }}
            className="about-hero-content"
          >
            <motion.div className="hero-badge" variants={fadeUp} style={{ marginBottom: 32 }}>
              <span className="dot" />
              <span className="hero-badge-text">Our Story</span>
            </motion.div>
            
            <motion.h1 className="page-title" variants={fadeUp}>
              The People, The Place,<br />The <span className="text-accent-glow">Coffee</span>.
            </motion.h1>
            
            <motion.p className="page-lede" variants={fadeUp} style={{ margin: '0 auto' }}>
              Three stories that make Mastermind Brews: the brand, the brewer, and the cafe where it all began.
            </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== INTRO 1 — MASTERMIND BREWS ===== */}
      <section className="about-intro about-intro-brews">
        <div className="container">
          <div className="about-intro-grid">
            <AnimatedSection className="about-intro-media">
              <div className="about-intro-frame">
                <img
                  src="https://lh3.googleusercontent.com/csYL5joKIL4Oz1VMMoGVBqLQMUwHqHLMVCmwzc_G8o_kddGd-uqCqyER8gXLs_oLgaQMnlIK-KQARysDbwXusuLWqK9I3zgauCwtLKvQKA=w1200-rw"
                  alt="Mastermind Brews coffee beans"
                  loading="lazy"
                />
                <span className="about-intro-chip"><Sparkles size={12} /> The Brand</span>
              </div>
            </AnimatedSection>
            <AnimatedSection className="about-intro-text" delay={0.15}>
              <div className="about-intro-label">01 / Mastermind Brews</div>
              <h2 className="about-intro-title">Specialty coffee, beyond the bar.</h2>
              <p className="about-intro-lede">
                Mastermind Brews is the online home for the beans, the brewing methods, and the barista craft we've been serving in Mumbai for years.
              </p>
              <p>
                We work with single-origin beans sourced directly from <strong>Chikmagalur, Karnataka</strong>, roasted with exclusive profiles by Bean Rove. The same coffee you'd order across our bar, now shipped to your kitchen.
              </p>
              <p>
                Alongside the beans, we run a barista academy of HD video courses, hands-on workshops, and a project arm that helps other cafes build coffee programs of their own.
              </p>
              <div className="about-intro-stats">
                <div>
                  <strong>3</strong>
                  <span>Beans · Academy · Projects</span>
                </div>
                <div>
                  <strong>Bean Rove</strong>
                  <span>Roast Partner</span>
                </div>
                <div>
                  <strong>Chikmagalur</strong>
                  <span>Single Origin</span>
                </div>
              </div>
              <div className="about-intro-actions">
                <Link to="/store" className="btn btn-primary">Shop Coffee <ArrowRight size={14} /></Link>
                <Link to="/workshop" className="btn btn-outline">Learn Coffee</Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== INTRO 2 — NAMRATA IS BREWING ===== */}
      <section className="about-intro about-intro-namrata">
        <div className="about-intro-glow" aria-hidden="true" />
        <div className="container">
          <div className="about-intro-grid reverse">
            <AnimatedSection className="about-intro-media">
              <div className="about-intro-frame portrait">
                <img
                  src="/namrata.jpg"
                  alt="Namrata Thakkar, founder of Mastermind Bicycle Cafe"
                  loading="lazy"
                />
                <span className="about-intro-chip"><Trophy size={12} /> The Brewer</span>
              </div>
              <motion.div
                className="about-namrata-badge"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 180 }}
              >
                <div className="about-namrata-badge-icon"><Award size={18} /></div>
                <div className="about-namrata-badge-body">
                  <div className="about-namrata-badge-num">4th Runner-Up</div>
                  <div className="about-namrata-badge-label">National Barista Championship 2026</div>
                </div>
              </motion.div>
            </AnimatedSection>
            <AnimatedSection className="about-intro-text" delay={0.15}>
              <div className="about-intro-label about-intro-label-pink">02 / Namrata Is Brewing</div>
              <h2 className="about-intro-title">From physiotherapy to championship coffee.</h2>
              <p className="about-intro-lede">
                Namrata Thakkar is the founder of Mastermind Bicycle Cafe, and a certified barista who placed <strong>4th Runner-Up at the National Barista Championship 2026</strong> at the India International Coffee Festival.
              </p>
              <p>
                A former physiotherapist, curiosity became learning, learning became obsession, and obsession became craft. She built her coffee from the bar up: extraction, flavour notes, balance, precision &mdash; the kind of details that quietly separate a good cup from a great one.
              </p>
              <p>
                On her handle <a href="https://www.instagram.com/namrata_is_brewing/" target="_blank" rel="noopener noreferrer" className="about-inline-link">@namrata_is_brewing</a>, she shares the techniques she teaches her own baristas, from dialing in espresso to pulling a clean pour-over at home.
              </p>
              <div className="about-namrata-creds">
                <div className="about-namrata-cred">
                  <Trophy size={16} />
                  <div>
                    <strong>National Barista Championship 2026</strong>
                    <span>4th Runner-Up &middot; IICF 2026</span>
                  </div>
                </div>
                <div className="about-namrata-cred">
                  <Coffee size={16} />
                  <div>
                    <strong>Founder, Mastermind Bicycle Cafe</strong>
                    <span>Specialty Coffee · Mumbai</span>
                  </div>
                </div>
                <div className="about-namrata-cred">
                  <InstagramIcon size={16} />
                  <div>
                    <strong>@namrata_is_brewing</strong>
                    <span>Coffee education & brewing tips</span>
                  </div>
                </div>
              </div>
              <div className="about-intro-actions">
                <a
                  href="https://www.instagram.com/namrata_is_brewing/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-blue"
                >
                  <InstagramIcon size={16} /> Follow @namrata_is_brewing
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== INTRO 3 — MASTERMIND CAFE ===== */}
      <section className="about-intro about-intro-cafe">
        <div className="container">
          <div className="about-intro-grid">
            <AnimatedSection className="about-intro-media">
              <div className="about-intro-frame">
                <img
                  src="https://lh3.googleusercontent.com/ObyGM3YfiJC4M2LPUP1rdV082_LsSN7ath2Sb3CRPa3rB5znuyR8orGk95j1OQcu-f1KxzfwDayEDvFFj8zmS8PxD6ZG_Oooc0HOAzDR=w1200-rw"
                  alt="Mastermind Bicycle Cafe interior"
                  loading="lazy"
                />
                <span className="about-intro-chip"><MapPin size={12} /> The Cafe</span>
              </div>
            </AnimatedSection>
            <AnimatedSection className="about-intro-text" delay={0.15}>
              <div className="about-intro-label about-intro-label-amber">03 / Mastermind Bicycle Cafe</div>
              <h2 className="about-intro-title">A specialty coffee house. A community space.</h2>
              <p className="about-intro-lede">
                A cozy, pet-friendly cafe in Mulund, where manual brews, authentic South Indian food, and an active cycling community share the same room.
              </p>
              <p>
                We're known for our <strong>manual brews, Malabar tiffins, matcha cocktails, gelato</strong>, and artisanal desserts. Espresso meets cycling culture, and the door is open to anyone who wants a good cup and a quiet hour.
              </p>
              <div className="about-cafe-grid">
                <div className="about-cafe-card">
                  <div className="about-cafe-card-icon"><MapPin size={16} /></div>
                  <div>
                    <strong>Mulund, Mumbai</strong>
                    <span>Avior Corporate Park, LBS Marg</span>
                  </div>
                </div>
                <div className="about-cafe-card">
                  <div className="about-cafe-card-icon"><Clock size={16} /></div>
                  <div>
                    <strong>Open All Days</strong>
                    <span>8:30 AM to 12 Midnight</span>
                  </div>
                </div>
                <div className="about-cafe-card">
                  <div className="about-cafe-card-icon"><Heart size={16} /></div>
                  <div>
                    <strong>Pet Friendly</strong>
                    <span>Vegan & gluten-free options</span>
                  </div>
                </div>
              </div>
              <div className="about-intro-actions">
                <a
                  href="https://www.mastermindcafe.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Visit Cafe Website <ExternalLink size={14} />
                </a>
                <a
                  href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Get Directions
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== VALUES ===== */}
      <GridBackground className="min-h-0">
        <section className="values-section" style={{ position: 'relative', zIndex: 1 }}>
          <div className="container">
            <AnimatedSection className="section-header center">
              <div className="section-label">What We Stand For</div>
              <AnimatedText
                text="Our Values"
                textClassName="text-foreground"
                underlineClassName="text-primary"
              />
            </AnimatedSection>
            <motion.div
              className="values-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerContainer}
            >
              <motion.div className="value-card" variants={fadeUp}>
                <div className="value-icon"><Coffee size={22} /></div>
                <h3>Specialty First</h3>
                <p>We do not compromise on bean quality, freshness, or the people who pour our cups.</p>
              </motion.div>
              <motion.div className="value-card" variants={fadeUp}>
                <div className="value-icon"><Heart size={22} /></div>
                <h3>Welcome All</h3>
                <p>Pet friendly, vegan friendly, gluten-free options, because hospitality should not be selective.</p>
              </motion.div>
              <motion.div className="value-card" variants={fadeUp}>
                <div className="value-icon"><Award size={22} /></div>
                <h3>Train Well</h3>
                <p>Great coffee starts with great baristas. We invest in the people who make the craft.</p>
              </motion.div>
              <motion.div className="value-card" variants={fadeUp}>
                <div className="value-icon"><Users size={22} /></div>
                <h3>Build Community</h3>
                <p>Cafes are third places. We keep ours warm, social, and a little bit unhurried.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </GridBackground>

      <section className="cta-section">
        <div className="container">
          <AnimatedSection className="cta-card">
            <h2>Want to Visit, Learn or Hire?</h2>
            <p>Drop by the cafe, browse the workshop, or get in touch about a project.</p>
            <div className="hero-btns">
              <Link to="/workshop" className="btn btn-primary">Browse Workshop <ArrowRight size={14} /></Link>
              <Link to="/contact" className="btn btn-outline">Contact Us</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
