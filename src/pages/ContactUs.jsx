import { useRef } from 'react'
import { Mail, Phone, MapPin, Clock, Globe } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { usePageMeta } from '../lib/usePageMeta'
import { AnimatedText } from '@/components/ui/animated-underline-text-one'
import { HeroDockLogo } from '../components/ScrollDockLogo'
import RotatingWord from '../components/RotatingWord'

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
    description: 'Get in touch with Mastermind Brews and Mastermind Bicycle Cafe & Bar in Mulund West, Mumbai. Email, phone, address, opening hours and directions.',
    keywords: 'contact Mastermind Brews, Mastermind Bicycle Cafe contact, cafe in Mulund West, coffee shop near me Mumbai',
  })
  return (
    <div className="policy-page">
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
              <p>Monday to Saturday, 10 AM – 7 PM IST</p>
            </motion.div>

            <motion.div className="contact-card" variants={fadeUp}>
              <MapPin size={24} />
              <h3>Visit Us</h3>
              <p>Mastermind Bicycle Cafe & Bar (Mastermind Brews)</p>
              <p>Avior Corporate Park, LBS Marg,<br />Mulund West, Mumbai - 400080,<br />Maharashtra, India</p>
            </motion.div>

            <motion.div className="contact-card" variants={fadeUp}>
              <Clock size={24} />
              <h3>Cafe Hours</h3>
              <p>Monday – Sunday</p>
              <p>11:00 AM – 11:00 PM</p>
            </motion.div>
          </motion.div>
        </section>

        <AnimatedSection>
          <section>
            <h2>Follow Us</h2>
            <div className="contact-socials">
              <a href="https://www.instagram.com/mastermindbicyclecafe/" target="_blank" rel="noopener noreferrer">
                <Globe size={16} /> Instagram
              </a>
              <a href="https://www.facebook.com/mastermindbicyclecafe/" target="_blank" rel="noopener noreferrer">
                <Globe size={16} /> Facebook
              </a>
              <a href="https://x.com/cafemastermind" target="_blank" rel="noopener noreferrer">
                <Globe size={16} /> X (Twitter)
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
              <p><strong>Website:</strong> <a href="https://www.mastermindcafe.in/" target="_blank" rel="noopener noreferrer">mastermindcafe.in</a></p>
            </div>
          </section>
        </AnimatedSection>
      </div>
    </div>
  )
}
