import { Link } from 'react-router-dom'
import { Coffee, Award, Users, Heart, ArrowRight } from 'lucide-react'
import { usePageMeta } from '../lib/usePageMeta'

export default function AboutUs() {
  usePageMeta({
    title: 'About Us',
    description: 'The story behind Mastermind Brews - born from a love for great coffee and a welcoming space.',
  })

  return (
    <div className="page-shell about-page">
      <section className="page-hero">
        <div className="container">
          <div className="section-label">Our Story</div>
          <h1 className="page-title">About Mastermind Brews</h1>
          <p className="page-lede">
            Born from a dream of great coffee, welcoming spaces, and the slow art of doing things well.
          </p>
        </div>
      </section>

      <section className="about-strip">
        <div className="container">
          <div className="about-grid">
            <div className="about-image">
              <img
                src="https://lh3.googleusercontent.com/fMDJUXTml2Oy7acthKsu7XcqBLyoqnlilQCJruYAFRpyvyAPX7gruOfHokGvUH1PxP5DdFm_oCgsPDsYOv-AGGl9rJQpBlc-GWRXHjQx=w1200-rw"
                alt="Mastermind Bicycle Cafe"
                loading="lazy"
              />
              <div className="accent-line" />
            </div>
            <div className="about-text">
              <div className="section-label">Who We Are</div>
              <h2>A Cafe, An Academy, A Community</h2>
              <p className="highlight">
                Started by a businessman and his daughter who dreamt of a cafe that serves great coffee, always welcomes all, and makes one feel like in the by-lanes of Europe.
              </p>
              <p>
                We sit in the heart of Mulund, Mumbai. Our beans come direct from Chikmagalur, Karnataka. Our roast profiles are crafted with Bean Rove. Our space is open to anyone who wants a good cup and a quiet hour.
              </p>
              <p>
                Beyond serving coffee, we train baristas, consult with cafes, and now bring our beans, our courses, and our experience to readers and home brewers everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <div className="section-header center">
            <div className="section-label">What We Stand For</div>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon"><Coffee size={22} /></div>
              <h3>Specialty First</h3>
              <p>We do not compromise on bean quality, freshness, or the people who pour our cups.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><Heart size={22} /></div>
              <h3>Welcome All</h3>
              <p>Pet friendly, vegan friendly, gluten-free options - because hospitality should not be selective.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><Award size={22} /></div>
              <h3>Train Well</h3>
              <p>Great coffee starts with great baristas. We invest in the people who make the craft.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><Users size={22} /></div>
              <h3>Build Community</h3>
              <p>Cafes are third places. We work to keep ours warm, social, and a little bit unhurried.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Want to Visit, Learn or Hire?</h2>
            <p>Drop by the cafe, browse the workshop, or get in touch for consultancy.</p>
            <div className="hero-btns">
              <Link to="/workshop" className="btn btn-primary">Browse Workshop <ArrowRight size={14} /></Link>
              <Link to="/contact" className="btn btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
