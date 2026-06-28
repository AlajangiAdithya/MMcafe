import { useRef } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'

function InstagramIcon({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
import { motion, useInView } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import JsonLd from '../components/JsonLd'
import { AnimatedText } from '@/components/ui/animated-underline-text-one'
import { HeroDockLogo } from '../components/ScrollDockLogo'
import RotatingWord from '../components/RotatingWord'

const CONTACT_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  url: 'https://www.mastermindbrews.com/contact',
  name: 'Contact Mastermind Brews',
  description: 'Contact Mastermind Brews and Mastermind Bicycle Cafe & Bar in Mulund West, Mumbai.',
  about: { '@id': 'https://www.mastermindbrews.com/#cafe' },
  mainEntity: { '@id': 'https://www.mastermindbrews.com/#cafe' },
}
const CONTACT_CRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mastermindbrews.com/' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://www.mastermindbrews.com/contact' },
  ],
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

export default function ContactUs() {
  usePageMeta({
    title: 'Contact Mastermind Brews · Mulund, Mumbai',
    description: 'Get in touch with Mastermind Brews and Mastermind Bicycle Cafe & Bar in Mulund West, Mumbai. Email, phone, address and directions.',
    keywords: 'contact Mastermind Brews, Mastermind Bicycle Cafe contact, cafe in Mulund West, coffee shop near me Mumbai',
  })
  return (
    <div className="policy-page">
      <JsonLd id="contact-page" data={CONTACT_PAGE_SCHEMA} />
      <JsonLd id="contact-breadcrumb" data={CONTACT_CRUMB} />
      <div className="policy-container">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
          }}
        >
          <motion.div variants={fadeUp}><HeroDockLogo /></motion.div>
          <motion.div variants={fadeUp}>
            <AnimatedText
              as="h1"
              text="Contact Us"
              textClassName="text-foreground"
              underlineClassName="text-primary"
            />
          </motion.div>
          <motion.p className="policy-updated" variants={fadeUp}>
            Let&rsquo;s talk coffee, courses or{' '}
            <RotatingWord words={['orders', 'projects', 'careers', 'collabs']} />.
          </motion.p>
        </motion.div>

        <AnimatedSection>
          <section>
            <h2>Get In Touch</h2>
            <p>
              Whether you have a question about our products, courses, orders, or anything else,
              our team is always happy to help.
            </p>
          </section>
        </AnimatedSection>

        <section>
          <motion.div
            className="contact-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.div className="contact-card" variants={fadeUp}>
              <Mail size={24} />
              <h3>Email</h3>
              <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a>
              <p>We typically respond within 24 hours</p>
            </motion.div>

            <motion.div className="contact-card" variants={fadeUp}>
              <Phone size={24} />
              <h3>Phone</h3>
              <a href="tel:+918591850161">+91 85918 50161</a>
              <p>Call or WhatsApp the team</p>
            </motion.div>

            <motion.div className="contact-card" variants={fadeUp}>
              <MapPin size={24} />
              <h3>Visit Us</h3>
              <p>Mastermind Bicycle Cafe &amp; Bar, LG 38, 39</p>
              <p>Mastermind Brews, LG 06</p>
              <p>Avior Corporate Park,<br />Mulund West, Mumbai</p>
            </motion.div>
          </motion.div>
        </section>

        <AnimatedSection>
          <section>
            <h2>Follow Us</h2>
            <div className="contact-ig-grid">
              <a className="contact-card contact-ig-card" href="https://www.instagram.com/mastermindbicyclecafe/" target="_blank" rel="noopener noreferrer">
                <InstagramIcon size={24} />
                <h3>Mastermind Bicycle Cafe</h3>
                <span>@mastermindbicyclecafe</span>
              </a>
              <a className="contact-card contact-ig-card" href="https://www.instagram.com/namrata_is_brewing/" target="_blank" rel="noopener noreferrer">
                <InstagramIcon size={24} />
                <h3>Namrata is Brewing</h3>
                <span>@namrata_is_brewing</span>
              </a>
              <a className="contact-card contact-ig-card" href="https://www.instagram.com/mastermindbrews/" target="_blank" rel="noopener noreferrer">
                <InstagramIcon size={24} />
                <h3>Mastermind Brews</h3>
                <span>@mastermindbrews</span>
              </a>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section>
            <h2>Business Details</h2>
            <div className="policy-contact">
              <p><strong>Legal Entity:</strong> Mastermind Bicycle Cafe & Bar</p>
              <p><strong>Trading Name:</strong> Mastermind Brews</p>
              <p><strong>Registered Address:</strong> Avior Corporate Park, LBS Marg, Mulund West, Mumbai - 400080, Maharashtra, India</p>
              <p><strong>Email:</strong> <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a></p>
              <p><strong>Phone:</strong> <a href="tel:+918591850161">+91 85918 50161</a></p>
              <p><strong>Website:</strong> <a href="https://www.mastermindbrews.com/" target="_blank" rel="noopener noreferrer">mastermindbrews.com</a></p>
            </div>
          </section>
        </AnimatedSection>
      </div>
    </div>
  )
}
