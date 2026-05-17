import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Coffee, ClipboardList, BarChart3, Users, ArrowRight, Check } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import { AnimatedText } from '@/components/ui/animated-underline-text-one'
import { GridBackground } from '@/components/ui/grid-background'

const SERVICES = [
  {
    icon: Coffee,
    title: 'Menu & Beverage Design',
    body: 'Build a coffee program that fits your space, your guests, and your margins.',
  },
  {
    icon: ClipboardList,
    title: 'Operations Setup',
    body: 'SOPs, equipment selection, supplier sourcing, and kitchen-bar workflow design.',
  },
  {
    icon: Users,
    title: 'Staff Training',
    body: 'Onboard your baristas with hands-on programs run by our team or at our Mulund cafe.',
  },
  {
    icon: BarChart3,
    title: 'Audits & Health Checks',
    body: 'Honest, on-the-ground reviews of an existing cafe with a written report and action plan.',
  },
]

const PROCESS = [
  { step: '01', title: 'Discovery Call', body: 'We listen. Tell us about the space, the vision, and the constraints.' },
  { step: '02', title: 'Site & Concept Audit', body: 'A visit (or remote review) to map the gap between where you are and where you want to be.' },
  { step: '03', title: 'Engagement Plan', body: 'A scoped proposal with timelines, deliverables, and a clear price.' },
  { step: '04', title: 'Execution & Handover', body: 'We build it with you - then leave you with a team and a system that runs without us.' },
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

export default function Consultancy() {
  usePageMeta({
    title: 'Cafe Consultancy · Menu Design, Operations & Barista Training',
    description: 'End-to-end cafe consultancy from the team behind Mastermind Brews — menu design, operations, barista training and quality audits for cafes across India.',
    keywords: 'cafe consultancy India, restaurant consultant, menu design, cafe setup, barista training program, coffee shop consulting Mumbai',
  })

  return (
    <div className="page-shell consultancy-page">
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
            <motion.div className="section-label" variants={fadeUp}>Consultancy</motion.div>
            <motion.h1 className="page-title" variants={fadeUp}>We Help Cafes Get Better</motion.h1>
            <motion.p className="page-lede" variants={fadeUp}>
              From a single beverage menu refresh to a full operations rebuild - the same team that runs Mastermind Brews is available to work with yours.
            </motion.p>
            <motion.div className="hero-btns" style={{ marginTop: 24 }} variants={fadeUp}>
              <Link to="/contact" className="btn btn-primary">Start a Conversation <ArrowRight size={14} /></Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <GridBackground className="min-h-0">
        <section className="consult-services" style={{ position: 'relative', zIndex: 1 }}>
          <div className="container">
            <AnimatedSection className="section-header center">
              <div className="section-label">What We Do</div>
              <AnimatedText
                text="Our Services"
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
              {SERVICES.map(s => (
                <motion.div key={s.title} className="value-card" variants={fadeUp}>
                  <div className="value-icon"><s.icon size={22} /></div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </GridBackground>

      <section className="consult-process">
        <div className="container">
          <AnimatedSection className="section-header center">
            <div className="section-label">How It Works</div>
            <AnimatedText
              text="A Clear Engagement"
              textClassName="text-foreground"
              underlineClassName="text-primary"
            />
          </AnimatedSection>
          <motion.div
            className="process-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {PROCESS.map(p => (
              <motion.div key={p.step} className="process-card" variants={fadeUp}>
                <div className="process-step">{p.step}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="consult-suited">
        <div className="container">
          <div className="suited-grid">
            <AnimatedSection>
              <div className="section-label"><Briefcase size={14} style={{ display: 'inline', marginRight: 6 }} /> Who This Is For</div>
              <AnimatedText
                text="Cafes At Every Stage"
                textClassName="text-foreground"
                underlineClassName="text-primary"
              />
              <motion.ul
                className="suited-list"
                style={{ marginTop: '1.5rem' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.li variants={fadeUp}><Check size={16} /> Owners building their first cafe</motion.li>
                <motion.li variants={fadeUp}><Check size={16} /> Existing cafes hitting a plateau</motion.li>
                <motion.li variants={fadeUp}><Check size={16} /> Restaurants adding a coffee program</motion.li>
                <motion.li variants={fadeUp}><Check size={16} /> Hotels or co-working spaces serving in-house</motion.li>
                <motion.li variants={fadeUp}><Check size={16} /> Brands wanting trained barista staff</motion.li>
              </motion.ul>
            </AnimatedSection>
            <AnimatedSection className="suited-card" delay={0.2}>
              <h3>Tell us what you are building.</h3>
              <p>We will reply within two working days with a fit assessment and next steps.</p>
              <Link to="/contact" className="btn btn-primary full-width">Contact Us <ArrowRight size={14} /></Link>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
