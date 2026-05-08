import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Coffee, Award, Users, Heart, ArrowRight } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import { AnimatedText } from '@/components/ui/animated-underline-text-one'
import { GridBackground } from '@/components/ui/grid-background'

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
    title: 'About Us',
    description: 'The story behind Mastermind Brews - born from a love for great coffee and a welcoming space.',
  })

  return (
    <div className="page-shell about-page">
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
            }}
          >
            <motion.div className="section-label" variants={fadeUp}>Our Story</motion.div>
            <motion.h1 className="page-title" variants={fadeUp}>About Mastermind Brews</motion.h1>
            <motion.p className="page-lede" variants={fadeUp}>
              Born from a dream of great coffee, welcoming spaces, and the slow art of doing things well.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="about-strip">
        <div className="container">
          <div className="about-grid">
            <AnimatedSection className="about-image">
              <img
                src="https://lh3.googleusercontent.com/fMDJUXTml2Oy7acthKsu7XcqBLyoqnlilQCJruYAFRpyvyAPX7gruOfHokGvUH1PxP5DdFm_oCgsPDsYOv-AGGl9rJQpBlc-GWRXHjQx=w1200-rw"
                alt="Mastermind Bicycle Cafe"
                loading="lazy"
              />
              <div className="accent-line" />
            </AnimatedSection>
            <AnimatedSection className="about-text" delay={0.2}>
              <div className="section-label">Who We Are</div>
              <AnimatedText
                text="A Cafe, An Academy, A Community"
                textClassName="text-foreground"
                underlineClassName="text-primary"
              />
              <p className="highlight" style={{ marginTop: '2rem' }}>
                Started by a businessman and his daughter who dreamt of a cafe that serves great coffee, always welcomes all, and makes one feel like in the by-lanes of Europe.
              </p>
              <p>
                We sit in the heart of Mulund, Mumbai. Our beans come direct from Chikmagalur, Karnataka. Our roast profiles are crafted with Bean Rove. Our space is open to anyone who wants a good cup and a quiet hour.
              </p>
              <p>
                Beyond serving coffee, we train baristas, consult with cafes, and now bring our beans, our courses, and our experience to readers and home brewers everywhere.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

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
                <p>Pet friendly, vegan friendly, gluten-free options - because hospitality should not be selective.</p>
              </motion.div>
              <motion.div className="value-card" variants={fadeUp}>
                <div className="value-icon"><Award size={22} /></div>
                <h3>Train Well</h3>
                <p>Great coffee starts with great baristas. We invest in the people who make the craft.</p>
              </motion.div>
              <motion.div className="value-card" variants={fadeUp}>
                <div className="value-icon"><Users size={22} /></div>
                <h3>Build Community</h3>
                <p>Cafes are third places. We work to keep ours warm, social, and a little bit unhurried.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </GridBackground>

      <section className="cta-section">
        <div className="container">
          <AnimatedSection className="cta-card">
            <h2>Want to Visit, Learn or Hire?</h2>
            <p>Drop by the cafe, browse the workshop, or get in touch for consultancy.</p>
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
