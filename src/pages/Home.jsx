import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, BookOpen, ArrowRight, Play, Star, Award, Coffee, Truck, ChevronDown, Clock, MapPin, Phone, Mail, Globe, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { getFeaturedProducts } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'
import toast from 'react-hot-toast'

const TESTIMONIALS = [
  { name: 'Aayushi Joshi', role: 'Google Review', initials: 'AJ', rating: 5, text: 'Loved that they offer gluten-free pizza options, vegan cheese, and a vegan menu. Highly recommended! 🌱 Special thanks to Deepak for his attentive service.' },
  { name: 'Tejal Rajak', role: 'Google Review', initials: 'TR', rating: 4, text: 'Visited this cute yet classy cafe. Ordered Mocha Cold and Peri Peri Paneer Pizza - both quite good. Staff is polite and chill, ambience is beautiful. A must visit in Mulund, and the best part is it being pet friendly. 😍' },
  { name: 'Rick Snyder', role: 'Google Review', initials: 'RS', rating: 5, text: 'The food was so good - huge variety on the menu. Iced matcha latte was perfect, the pesto & burrata pizza and nachos were fantastic. Shubham was our server and he was really friendly. Ask for him to serve you!' },
]

export default function Home() {
  usePageMeta({
    title: 'Home',
    description: 'Premium coffee, continental food, baked goods & an online cafe academy in Mulund, Mumbai. Order online or learn the craft of coffee.',
  })
  const { addItem } = useCart()
  const [featured, setFeatured] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getFeaturedProducts(4)
      .then(data => { if (!cancelled) setFeatured(data) })
      .catch(err => console.error('Failed to load featured products:', err))
      .finally(() => { if (!cancelled) setFeaturedLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-bg-image" style={{
            backgroundImage: 'url(https://lh3.googleusercontent.com/A959ZB5laMMAwx3johfA0IdN0LMU0pdhL9EmXBWTkEyVu1erfFJy4p7kJhUN4dzVZLPOTQWQ6-_PeE6Q-UwwbhnOooY2s1UXjLvE-xBZSw=w1920-rw)'
          }} />
          <div className="hero-gradient" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot" />
            From Mastermind Bicycle Cafe & Bar, Mumbai
          </div>
          <h1>
            Specialty Coffee<br />
            <span className="text-blue">Beans</span> &{' '}
            <span className="text-pink">Academy</span>
          </h1>
          <p className="hero-desc">
            Directly sourced beans from Chikmagalur, Karnataka. The same specialty coffee that powers Mastermind Bicycle Cafe - now delivered to your doorstep, with barista training to match.
          </p>
          <div className="hero-btns">
            <Link to="/store" className="btn btn-primary">
              <ShoppingBag size={16} /> Shop Beans
            </Link>
            <Link to="/workshop" className="btn btn-outline">
              <BookOpen size={16} /> Join Workshop
            </Link>
          </div>
        </div>
        <div className="hero-scroll">
          Scroll
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ===== TAGLINE MARQUEE ===== */}
      <section className="tagline-marquee" aria-hidden="true">
        <div className="tagline-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="tagline-item">
              Ride Hard <span className="tagline-sep">/</span> Eat Easy <span className="tagline-dot">●</span>
            </span>
          ))}
        </div>
      </section>

      {/* ===== ABOUT STRIP ===== */}
      <section className="about-strip">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <img
                src="https://lh3.googleusercontent.com/fMDJUXTml2Oy7acthKsu7XcqBLyoqnlilQCJruYAFRpyvyAPX7gruOfHokGvUH1PxP5DdFm_oCgsPDsYOv-AGGl9rJQpBlc-GWRXHjQx=w1200-rw"
                alt="Mastermind Bicycle Cafe interior"
                loading="lazy"
              />
              <div className="accent-line" />
            </div>
            <div className="about-text">
              <div className="section-label">Our Story</div>
              <h2>Born From A Dream Of Great Coffee</h2>
              <p className="highlight">
                Started by a businessman and his daughter who dreamt of a cafe that serves great coffee, always welcomes all, and makes one feel like in the by-lanes of Europe.
              </p>
              <p>
                At Mastermind Bicycle Cafe & Bar in Mulund, Mumbai, we've been elevating the coffee experience with top-of-the-line equipment, exclusive roast profiles by Bean Rove, and beans directly sourced from Chikmagalur, Karnataka.
              </p>
              <p>
                Now we're bringing that same passion online - premium coffee beans and powders delivered fresh, plus a barista academy to train the next generation of coffee artisans.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <div className="stat-number">4.4<span className="stat-accent">★</span></div>
                  <div className="stat-label">Google Rating</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">500<span className="stat-accent">+</span></div>
                  <div className="stat-label">Reviews</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">6</div>
                  <div className="stat-label">Expert Courses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="categories-band">
        <div className="container">
          <div className="section-header center">
            <div className="section-label">What We Offer</div>
            <h2 className="section-title">From Our Cafe To Your Cup</h2>
          </div>
          <div className="categories-grid">
            <Link to="/store" className="category-card">
              <img
                src="https://lh3.googleusercontent.com/csYL5joKIL4Oz1VMMoGVBqLQMUwHqHLMVCmwzc_G8o_kddGd-uqCqyER8gXLs_oLgaQMnlIK-KQARysDbwXusuLWqK9I3zgauCwtLKvQKA=w1200-rw"
                alt="Coffee at Mastermind"
                loading="lazy"
              />
              <div className="category-card-content">
                <span>Store</span>
                <h3>Coffee Beans</h3>
                <p>Single-origin Karnataka beans, freshly roasted</p>
              </div>
            </Link>
            <Link to="/store" className="category-card">
              <img
                src="https://lh3.googleusercontent.com/9NODaqOMcC9h2RNX0RzGciKNPeG8QNL_TgiIamED8u_oSuzVZ4TYc_zWSr0_MgKg7tzxSDsNlNH9UrTZlbu9LY45cKuWOZGssx_ZDT_Cpg=w1200-rw"
                alt="Coffee Powder"
                loading="lazy"
              />
              <div className="category-card-content">
                <span>Store</span>
                <h3>Coffee Powder</h3>
                <p>Ground for every brewing method</p>
              </div>
            </Link>
            <Link to="/workshop" className="category-card">
              <img
                src="https://lh3.googleusercontent.com/2W1cw4DDp8TacRRBjH3H-MzLWOVy9G0KtXUwK6DFgFEGj7BSZflh05ehZYX6xBsl39qcqKzdFuDysC0J-m1J6Fy6af4sU-rCuFAQDmEo=w1200-rw"
                alt="Barista at Mastermind"
                loading="lazy"
              />
              <div className="category-card-content">
                <span>Academy</span>
                <h3>Barista Training</h3>
                <p>Learn from our certified baristas</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      {(featuredLoading || featured.length > 0) && (
        <section className="featured-section">
          <div className="container">
            <div className="featured-header">
              <div className="section-header" style={{ marginBottom: 0 }}>
                <div className="section-label">Featured</div>
                <h2 className="section-title">Best Sellers</h2>
              </div>
              <Link to="/store" className="btn btn-ghost">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="featured-grid">
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
                    <div key={product.id} className="featured-product">
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
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}


      {/* ===== ACADEMY PREVIEW ===== */}
      <section className="academy-preview">
        <div className="academy-preview-glow" aria-hidden="true" />
        <div className="container">
          <div className="academy-preview-grid">
            <div className="academy-preview-visual">
              <div className="academy-visual-frame">
                <img
                  src="https://lh3.googleusercontent.com/2W1cw4DDp8TacRRBjH3H-MzLWOVy9G0KtXUwK6DFgFEGj7BSZflh05ehZYX6xBsl39qcqKzdFuDysC0J-m1J6Fy6af4sU-rCuFAQDmEo=w1000-rw"
                  alt="Barista at Mastermind Brews"
                  loading="lazy"
                />
                <div className="academy-image-tint" />

                <div className="academy-floating-card">
                  <div className="academy-floating-card-icon"><Award size={18} /></div>
                  <div className="academy-floating-card-body">
                    <div className="academy-floating-card-num">6</div>
                    <div className="academy-floating-card-label">Expert Modules</div>
                  </div>
                </div>
              </div>

              <div className="academy-floating-stats">
                <div className="academy-mini-stat">
                  <Star size={14} fill="currentColor" />
                  <span><strong>4.8</strong> Rating</span>
                </div>
                <div className="academy-mini-stat">
                  <Award size={14} />
                  <span><strong>Certified</strong> Baristas</span>
                </div>
                <div className="academy-mini-stat">
                  <Play size={14} fill="currentColor" />
                  <span><strong>HD</strong> Lessons</span>
                </div>
              </div>
            </div>

            <div className="academy-preview-content">
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

              <div className="academy-features">
                <div className="academy-feature">
                  <div className="academy-feature-icon"><Award size={20} /></div>
                  <div className="academy-feature-text">
                    <h4>Trained Baristas</h4>
                    <p>Techniques from our certified coffee team</p>
                  </div>
                </div>
                <div className="academy-feature">
                  <div className="academy-feature-icon"><Play size={20} fill="currentColor" /></div>
                  <div className="academy-feature-text">
                    <h4>HD Video Lessons</h4>
                    <p>Pre-recorded courses, watch anywhere</p>
                  </div>
                </div>
                <div className="academy-feature">
                  <div className="academy-feature-icon"><Coffee size={20} /></div>
                  <div className="academy-feature-text">
                    <h4>Bean Rove Profiles</h4>
                    <p>Our exclusive roasting methodology</p>
                  </div>
                </div>
                <div className="academy-feature">
                  <div className="academy-feature-icon"><BookOpen size={20} /></div>
                  <div className="academy-feature-text">
                    <h4>Lifetime Access</h4>
                    <p>Buy once, learn forever - on any device</p>
                  </div>
                </div>
              </div>

              <div className="academy-cta-row">
                <Link to="/workshop" className="btn btn-blue">
                  Browse Courses <ArrowRight size={14} />
                </Link>
                <Link to="/store" className="btn btn-ghost academy-ghost">
                  Shop Beans <ArrowRight size={14} />
                </Link>
              </div>

              <div className="academy-chips">
                <span className="academy-chip">Beginner Friendly</span>
                <span className="academy-chip">Latte Art</span>
                <span className="academy-chip">Espresso</span>
                <span className="academy-chip">Brewing Science</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header center">
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">What Our Community Says</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VISIT US ===== */}
      <section className="visit-section">
        <div className="container">
          <div className="visit-grid">
            <div className="visit-info">
              <div className="section-label">Visit The Cafe</div>
              <h2 className="section-title">Drop By In Mulund</h2>
              <p className="section-desc">
                One of the best cafes in Mulund - doors open every day, with European cafe vibes, specialty coffee and a menu that goes deep.
              </p>
              <div className="visit-details">
                <div className="visit-detail">
                  <div className="visit-detail-icon"><Clock size={18} /></div>
                  <div>
                    <h4>Open All Days</h4>
                    <p>8:30 AM to 12 Midnight</p>
                  </div>
                </div>
                <div className="visit-detail">
                  <div className="visit-detail-icon"><MapPin size={18} /></div>
                  <div>
                    <h4>Find Us</h4>
                    <p>Avior Corporate Park, Mulund West, Mumbai</p>
                  </div>
                </div>
                <div className="visit-detail">
                  <div className="visit-detail-icon"><Phone size={18} /></div>
                  <div>
                    <h4>Call</h4>
                    <p><a href="tel:+918591850161">+91 85918 50161</a></p>
                  </div>
                </div>
                <div className="visit-detail">
                  <div className="visit-detail-icon"><Mail size={18} /></div>
                  <div>
                    <h4>Email</h4>
                    <p><a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a></p>
                  </div>
                </div>
              </div>
              <div className="visit-socials">
                <a href="https://www.instagram.com/mastermindbicyclecafe/" target="_blank" rel="noopener noreferrer" className="visit-social">
                  <Globe size={16} /> @mastermindbicyclecafe
                </a>
                <a href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  Get Directions <ArrowRight size={14} />
                </a>
              </div>
            </div>
            <div className="visit-card">
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
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER / CTA ===== */}
      <section className="newsletter-section">
        <div className="newsletter-bg" />
        <div className="container">
          <div className="newsletter-content">
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
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="categories-band" style={{ padding: '48px 0' }}>
        <div className="container">
          <div className="about-stats" style={{ borderTop: 'none', paddingTop: 0, justifyContent: 'center', gap: '80px' }}>
            <div className="stat-item" style={{ textAlign: 'center' }}>
              <div className="stat-number"><Truck size={24} style={{ display: 'inline' }} /></div>
              <div className="stat-label">Free Shipping Above ₹999</div>
            </div>
            <div className="stat-item" style={{ textAlign: 'center' }}>
              <div className="stat-number"><Coffee size={24} style={{ display: 'inline' }} /></div>
              <div className="stat-label">Roasted in Chikmagalur</div>
            </div>
            <div className="stat-item" style={{ textAlign: 'center' }}>
              <div className="stat-number"><Award size={24} style={{ display: 'inline' }} /></div>
              <div className="stat-label">Bean Rove Profiles</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
