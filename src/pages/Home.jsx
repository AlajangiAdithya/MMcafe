import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, BookOpen, ArrowRight, Play, Star, Award, Coffee, Truck, ChevronDown, Clock, MapPin, Phone, Mail, Globe, Package } from 'lucide-react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { getFeaturedProducts } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'
import toast from 'react-hot-toast'

import { GridBackground } from '@/components/ui/grid-background'
import { AnimatedText } from '@/components/ui/animated-underline-text-one'
import { ParallaxFeatureSection } from '@/components/ui/parallax-scroll-feature-section'
import { SocialLinks } from '@/components/ui/social-links'
import VaporizeTextCycle, { Tag } from '@/components/ui/vapour-text-effect'

const TESTIMONIALS = [
  { name: 'Aayushi Joshi', role: 'Google Review', initials: 'AJ', rating: 5, text: 'Loved that they offer gluten-free pizza options, vegan cheese, and a vegan menu. Highly recommended! 🌱 Special thanks to Deepak for his attentive service.' },
  { name: 'Tejal Rajak', role: 'Google Review', initials: 'TR', rating: 4, text: 'Visited this cute yet classy cafe. Ordered Mocha Cold and Peri Peri Paneer Pizza - both quite good. Staff is polite and chill, ambience is beautiful. A must visit in Mulund, and the best part is it being pet friendly. 😍' },
  { name: 'Rick Snyder', role: 'Google Review', initials: 'RS', rating: 5, text: 'The food was so good - huge variety on the menu. Iced matcha latte was perfect, the pesto & burrata pizza and nachos were fantastic. Shubham was our server and he was really friendly. Ask for him to serve you!' },
]

const PARALLAX_FEATURES = [
  {
    id: 1,
    title: 'Coffee Beans',
    description: 'Single-origin beans directly sourced from Chikmagalur, Karnataka. Freshly roasted with exclusive Bean Rove profiles for a rich, complex flavour that elevates every cup.',
    imageUrl: 'https://lh3.googleusercontent.com/csYL5joKIL4Oz1VMMoGVBqLQMUwHqHLMVCmwzc_G8o_kddGd-uqCqyER8gXLs_oLgaQMnlIK-KQARysDbwXusuLWqK9I3zgauCwtLKvQKA=w1200-rw',
    reverse: false,
    link: '/store',
    ctaText: 'Shop Beans'
  },
  {
    id: 2,
    title: 'Coffee Powder',
    description: 'Ground precisely for every brewing method — from espresso to French press. The same premium blends that power Mastermind Bicycle Cafe, now in your kitchen.',
    imageUrl: 'https://lh3.googleusercontent.com/9NODaqOMcC9h2RNX0RzGciKNPeG8QNL_TgiIamED8u_oSuzVZ4TYc_zWSr0_MgKg7tzxSDsNlNH9UrTZlbu9LY45cKuWOZGssx_ZDT_Cpg=w1200-rw',
    reverse: true,
    link: '/store',
    ctaText: 'Shop Powder'
  },
  {
    id: 3,
    title: 'Barista Training',
    description: 'Learn from our certified baristas through professional HD video courses. From your first pull to latte art mastery — lifetime access on any device.',
    imageUrl: 'https://lh3.googleusercontent.com/2W1cw4DDp8TacRRBjH3H-MzLWOVy9G0KtXUwK6DFgFEGj7BSZflh05ehZYX6xBsl39qcqKzdFuDysC0J-m1J6Fy6af4sU-rCuFAQDmEo=w1200-rw',
    reverse: false,
    link: '/workshop',
    ctaText: 'View Academy'
  },
]

const SOCIAL_LINKS = [
  { platform: 'instagram', href: 'https://www.instagram.com/mastermindbicyclecafe/' },
  { platform: 'mail', href: 'mailto:hello@mastermindcafe.in' },
  { platform: 'website', href: 'https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund' },
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

export default function Home() {
  usePageMeta({
    title: 'Home',
    description: 'Premium coffee, continental food, baked goods & an online cafe academy in Mulund, Mumbai. Order online or learn the craft of coffee.',
  })
  const { addItem } = useCart()
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('mm-intro'))

  useEffect(() => {
    let cancelled = false
    getFeaturedProducts(4)
      .then(data => { if (!cancelled) setFeatured(data) })
      .catch(err => console.error('Failed to load featured products:', err))
      .finally(() => { if (!cancelled) setFeaturedLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleVaporizeEnd = useCallback(() => {
    sessionStorage.setItem('mm-intro', '1')
    setShowIntro(false)
  }, [])

  return (
    <div className="home">
      {/* ===== VAPOUR TEXT INTRO ===== */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#0a0908',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '90vw', maxWidth: '900px', height: '100px' }}>
              <VaporizeTextCycle
                texts={["Ride Hard / Eat Easy"]}
                font={{
                  fontFamily: "'Yanone Kaffeesatz', sans-serif",
                  fontSize: "68px",
                  fontWeight: 600,
                }}
                color="rgb(248, 245, 242)"
                spread={5}
                density={7}
                animation={{
                  vaporizeDuration: 0.7,
                  fadeInDuration: 0.1,
                  waitDuration: 0.05,
                }}
                direction="left-to-right"
                alignment="center"
                tag={Tag.H1}
                startDelay={400}
                loop={false}
                onVaporizeEnd={handleVaporizeEnd}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== SOCIAL LINKS (fixed sidebar) ===== */}
      <SocialLinks links={SOCIAL_LINKS} floatingButtonColor="bg-zinc-800" />

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-bg-image" style={{
            backgroundImage: 'url(https://lh3.googleusercontent.com/A959ZB5laMMAwx3johfA0IdN0LMU0pdhL9EmXBWTkEyVu1erfFJy4p7kJhUN4dzVZLPOTQWQ6-_PeE6Q-UwwbhnOooY2s1UXjLvE-xBZSw=w1920-rw)'
          }} />
          <div className="hero-gradient" />
        </div>
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
          }}
        >
          <motion.div
            className="hero-badge"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            <span className="dot" />
            From Mastermind Bicycle Cafe & Bar, Mumbai
          </motion.div>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
          >
            Specialty Coffee<br />
            <span className="text-blue">Beans</span> &{' '}
            <span className="text-pink">Academy</span>
          </motion.h1>
          <motion.p
            className="hero-desc"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            Directly sourced beans from Chikmagalur, Karnataka. The same specialty coffee that powers Mastermind Bicycle Cafe — now delivered to your doorstep, with barista training to match.
          </motion.p>
          <motion.div
            className="hero-btns"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          >
            <Link to="/store" className="btn btn-primary">
              <ShoppingBag size={16} /> Shop Beans
            </Link>
            <Link to="/workshop" className="btn btn-outline">
              <BookOpen size={16} /> Join Workshop
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          className="hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          Scroll
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* ===== ABOUT STRIP ===== */}
      <section className="about-strip">
        <div className="container">
          <div className="about-grid">
            <AnimatedSection className="about-image">
              <img
                src="https://lh3.googleusercontent.com/fMDJUXTml2Oy7acthKsu7XcqBLyoqnlilQCJruYAFRpyvyAPX7gruOfHokGvUH1PxP5DdFm_oCgsPDsYOv-AGGl9rJQpBlc-GWRXHjQx=w1200-rw"
                alt="Mastermind Bicycle Cafe interior"
                loading="lazy"
              />
              <div className="accent-line" />
            </AnimatedSection>
            <AnimatedSection className="about-text" delay={0.2}>
              <div className="section-label">Our Story</div>
              <AnimatedText
                text="Born From A Dream Of Great Coffee"
                textClassName="text-foreground"
                underlineClassName="text-primary"
                style={{ marginBottom: '2rem' }}
              />
              <p className="highlight" style={{ marginTop: '2rem' }}>
                Started by a businessman and his daughter who dreamt of a cafe that serves great coffee, always welcomes all, and makes one feel like in the by-lanes of Europe.
              </p>
              <p>
                At Mastermind Bicycle Cafe & Bar in Mulund, Mumbai, we've been elevating the coffee experience with top-of-the-line equipment, exclusive roast profiles by Bean Rove, and beans directly sourced from Chikmagalur, Karnataka.
              </p>
              <p>
                Now we're bringing that same passion online - premium coffee beans and powders delivered fresh, plus a barista academy to train the next generation of coffee artisans.
              </p>
              <div className="about-stats">
                <motion.div className="stat-item" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <div className="stat-number">4.4<span className="stat-accent">★</span></div>
                  <div className="stat-label">Google Rating</div>
                </motion.div>
                <motion.div className="stat-item" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <div className="stat-number">500<span className="stat-accent">+</span></div>
                  <div className="stat-label">Reviews</div>
                </motion.div>
                <motion.div className="stat-item" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="stat-number">6</div>
                  <div className="stat-label">Expert Courses</div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== PARALLAX FEATURE CATEGORIES ===== */}
      <GridBackground className="min-h-0">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AnimatedSection style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div className="section-label" style={{ textAlign: 'center' }}>What We Offer</div>
            <AnimatedText
              text="From Our Cafe To Your Cup"
              textClassName="text-foreground"
              underlineClassName="text-primary"
            />
          </AnimatedSection>
          <ParallaxFeatureSection sections={PARALLAX_FEATURES} />
        </div>
      </GridBackground>

      {/* ===== FEATURED PRODUCTS ===== */}
      {(featuredLoading || featured.length > 0) && (
        <section className="featured-section">
          <div className="container">
            <div className="featured-header">
              <AnimatedSection className="section-header" style={{ marginBottom: 0 }}>
                <div className="section-label">Featured</div>
                <h2 className="section-title">Best Sellers</h2>
              </AnimatedSection>
              <Link to="/store" className="btn btn-ghost">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <motion.div
              className="featured-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={staggerContainer}
            >
              {featuredLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="featured-product featured-product-skeleton">
                      <div className="featured-product-image skeleton-block" />
                      <div className="featured-product-info">
                        <div className="skeleton-line skeleton-line-sm" />
                        <div className="skeleton-line" />
                        <div className="skeleton-line skeleton-line-sm" />
                      </div>
                    </div>
                  ))
                : featured.map(product => (
                    <motion.div key={product.id} className="featured-product" variants={fadeUp}>
                      <div className="featured-product-image">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="featured-product-placeholder"><Package size={32} /></div>
                        )}
                        <div className="featured-product-overlay" />
                        <div className="featured-product-quick">
                          <button
                            className="btn btn-primary btn-sm full-width"
                            onClick={() => { addItem(product); toast.success(`${product.name} added`) }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                      <div className="featured-product-info">
                        <div className="featured-product-category">{product.category}</div>
                        <div className="featured-product-name">{product.name}</div>
                        <div className="featured-product-weight">{product.weight}</div>
                        <div className="featured-product-bottom">
                          <span className="featured-product-price">₹{product.price}</span>
                          <button
                            className="add-btn"
                            onClick={() => { addItem(product); toast.success(`Added to cart`) }}
                          >
                            <ShoppingBag size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== ACADEMY PREVIEW ===== */}
      <section className="academy-preview">
        <div className="academy-preview-glow" aria-hidden="true" />
        <div className="container">
          <div className="academy-preview-grid">
            <AnimatedSection className="academy-preview-visual">
              <div className="academy-visual-frame">
                <img
                  src="https://lh3.googleusercontent.com/2W1cw4DDp8TacRRBjH3H-MzLWOVy9G0KtXUwK6DFgFEGj7BSZflh05ehZYX6xBsl39qcqKzdFuDysC0J-m1J6Fy6af4sU-rCuFAQDmEo=w1000-rw"
                  alt="Barista at Mastermind Brews"
                  loading="lazy"
                />
                <div className="academy-image-tint" />
                <motion.div
                  className="academy-floating-card"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <div className="academy-floating-card-icon"><Award size={18} /></div>
                  <div className="academy-floating-card-body">
                    <div className="academy-floating-card-num">6</div>
                    <div className="academy-floating-card-label">Expert Modules</div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="academy-floating-stats"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div className="academy-mini-stat" variants={fadeUp}>
                  <Star size={14} fill="currentColor" />
                  <span><strong>4.8</strong> Rating</span>
                </motion.div>
                <motion.div className="academy-mini-stat" variants={fadeUp}>
                  <Award size={14} />
                  <span><strong>Certified</strong> Baristas</span>
                </motion.div>
                <motion.div className="academy-mini-stat" variants={fadeUp}>
                  <Play size={14} fill="currentColor" />
                  <span><strong>HD</strong> Lessons</span>
                </motion.div>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection className="academy-preview-content" delay={0.15}>
              <div className="section-label">
                <span className="section-label-bar" /> Barista Academy
              </div>
              <h2 className="section-title academy-title">
                Master The Art<br />
                Of <span className="text-gradient">Specialty Coffee</span>
              </h2>
              <p className="section-desc academy-desc">
                Learn from the same baristas behind Mastermind Brews' acclaimed specialty coffee program. Professional video courses for every skill level, from your first pull to latte art mastery.
              </p>

              <motion.div
                className="academy-features"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div className="academy-feature" variants={fadeUp}>
                  <div className="academy-feature-icon"><Award size={20} /></div>
                  <div className="academy-feature-text">
                    <h4>Trained Baristas</h4>
                    <p>Techniques from our certified coffee team</p>
                  </div>
                </motion.div>
                <motion.div className="academy-feature" variants={fadeUp}>
                  <div className="academy-feature-icon"><Play size={20} fill="currentColor" /></div>
                  <div className="academy-feature-text">
                    <h4>HD Video Lessons</h4>
                    <p>Pre-recorded courses, watch anywhere</p>
                  </div>
                </motion.div>
                <motion.div className="academy-feature" variants={fadeUp}>
                  <div className="academy-feature-icon"><Coffee size={20} /></div>
                  <div className="academy-feature-text">
                    <h4>Bean Rove Profiles</h4>
                    <p>Our exclusive roasting methodology</p>
                  </div>
                </motion.div>
                <motion.div className="academy-feature" variants={fadeUp}>
                  <div className="academy-feature-icon"><BookOpen size={20} /></div>
                  <div className="academy-feature-text">
                    <h4>Lifetime Access</h4>
                    <p>Buy once, learn forever - on any device</p>
                  </div>
                </motion.div>
              </motion.div>

              <div className="academy-cta-row">
                <Link to="/workshop" className="btn btn-blue">
                  Browse Courses <ArrowRight size={14} />
                </Link>
              </div>

              <motion.div
                className="academy-chips"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {['Beginner Friendly', 'Latte Art', 'Espresso', 'Brewing Science'].map(chip => (
                  <motion.span key={chip} className="academy-chip" variants={fadeUp}>{chip}</motion.span>
                ))}
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="testimonials-section">
        <div className="container">
          <AnimatedSection className="section-header center">
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">What Our Community Says</h2>
          </AnimatedSection>
          <motion.div
            className="testimonials-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} className="testimonial-card" variants={fadeUp}>
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div className="testimonial-author-info">
                    <div className="name">{t.name}</div>
                    <div className="role">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== VISIT US ===== */}
      <section className="visit-section">
        <div className="container">
          <div className="visit-grid">
            <AnimatedSection className="visit-info">
              <div className="section-label">Visit The Cafe</div>
              <h2 className="section-title">Drop By In Mulund</h2>
              <p className="section-desc">
                One of the best cafes in Mulund - doors open every day, with European cafe vibes, specialty coffee and a menu that goes deep.
              </p>
              <div className="visit-details">
                <motion.div className="visit-detail" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <div className="visit-detail-icon"><Clock size={18} /></div>
                  <div>
                    <h4>Open All Days</h4>
                    <p>8:30 AM to 12 Midnight</p>
                  </div>
                </motion.div>
                <motion.div className="visit-detail" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <div className="visit-detail-icon"><MapPin size={18} /></div>
                  <div>
                    <h4>Find Us</h4>
                    <p>Avior Corporate Park, Mulund West, Mumbai</p>
                  </div>
                </motion.div>
                <motion.div className="visit-detail" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="visit-detail-icon"><Phone size={18} /></div>
                  <div>
                    <h4>Call</h4>
                    <p><a href="tel:+918591850161">+91 85918 50161</a></p>
                  </div>
                </motion.div>
                <motion.div className="visit-detail" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <div className="visit-detail-icon"><Mail size={18} /></div>
                  <div>
                    <h4>Email</h4>
                    <p><a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a></p>
                  </div>
                </motion.div>
              </div>
              <div className="visit-socials">
                <a href="https://www.instagram.com/mastermindbicyclecafe/" target="_blank" rel="noopener noreferrer" className="visit-social">
                  <Globe size={16} /> @mastermindbicyclecafe
                </a>
                <a href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  Get Directions <ArrowRight size={14} />
                </a>
              </div>
            </AnimatedSection>
            <AnimatedSection className="visit-card" delay={0.2}>
              <div className="visit-card-image">
                <img src="https://lh3.googleusercontent.com/ObyGM3YfiJC4M2LPUP1rdV082_LsSN7ath2Sb3CRPa3rB5znuyR8orGk95j1OQcu-f1KxzfwDayEDvFFj8zmS8PxD6ZG_Oooc0HOAzDR=w1200-rw" alt="Mastermind Bicycle Cafe" loading="lazy" />
                <div className="visit-card-rating">
                  <div className="visit-card-rating-stars">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <div className="visit-card-rating-score">4.5 / 5</div>
                  <div className="visit-card-rating-label">From 500+ guests</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="newsletter-section">
        <div className="newsletter-bg" />
        <div className="container">
          <AnimatedSection className="newsletter-content">
            <div className="section-label">Get Started</div>
            <h2>Ready To Brew Like A Pro?</h2>
            <p>The same specialty coffee from Mastermind Bicycle Cafe - now available online, with courses to level up your skills.</p>
            <div className="hero-btns">
              <Link to="/store" className="btn btn-primary">
                <ShoppingBag size={16} /> Shop Store
              </Link>
              <Link to="/workshop" className="btn btn-outline">
                <BookOpen size={16} /> Start Learning
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="categories-band" style={{ padding: '48px 0' }}>
        <div className="container">
          <motion.div
            className="about-stats"
            style={{ borderTop: 'none', paddingTop: 0, justifyContent: 'center', gap: '80px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="stat-item" style={{ textAlign: 'center' }} variants={fadeUp}>
              <div className="stat-number"><Truck size={24} style={{ display: 'inline' }} /></div>
              <div className="stat-label">Free Shipping Above ₹999</div>
            </motion.div>
            <motion.div className="stat-item" style={{ textAlign: 'center' }} variants={fadeUp}>
              <div className="stat-number"><Coffee size={24} style={{ display: 'inline' }} /></div>
              <div className="stat-label">Roasted in Chikmagalur</div>
            </motion.div>
            <motion.div className="stat-item" style={{ textAlign: 'center' }} variants={fadeUp}>
              <div className="stat-number"><Award size={24} style={{ display: 'inline' }} /></div>
              <div className="stat-label">Bean Rove Profiles</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
