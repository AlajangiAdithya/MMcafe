import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Globe, Mail, Phone, MapPin, Clock, ArrowRight, Send } from 'lucide-react'
import toast from 'react-hot-toast'

function InstagramIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06z" />
    </svg>
  )
}

function XIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')

  const onSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success("Thanks — we'll keep you posted.")
    setEmail('')
  }

  return (
    <footer className="footer">
      <div className="footer-newsletter">
        <div className="footer-newsletter-inner">
          <div className="footer-newsletter-copy">
            <span className="eyebrow">The Brew Letter</span>
            <h3 className="footer-newsletter-title">Coffee notes from the bar.</h3>
            <p>New roasts, lesson drops, and the occasional cafe story — once a month, never more.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={onSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              aria-label="Email address"
            />
            <button type="submit" className="footer-newsletter-submit" aria-label="Subscribe">
              <span>Subscribe</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-brand-logo">
            <img src="/logo.png" alt="Mastermind Brews" />
            <span>Mastermind Brews</span>
          </Link>
          <p className="footer-brand-blurb">
            Single-origin specialty coffee from Chikmagalur, roasted in partnership with Bean Rove. By the team behind Mastermind Bicycle Cafe &amp; Bar, Mulund.
          </p>
          <div className="footer-social">
            <a href="https://www.instagram.com/mastermindbicyclecafe/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon size={16} /></a>
            <a href="https://www.facebook.com/mastermindbicyclecafe/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon size={16} /></a>
            <a href="https://x.com/cafemastermind" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><XIcon size={14} /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/store">Buy Coffee</Link>
          <Link to="/workshop">Learn Coffee</Link>
          <Link to="/consultancy">Our Projects</Link>
          <Link to="/baristas">Hire Baristas</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/blog">Journal</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/barista-signup">Join the Network</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Sign In</Link>
          <Link to="/signup">Create Account</Link>
          <Link to="/my-orders">My Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
        </div>

        <aside className="footer-cafe-card">
          <span className="eyebrow">Visit the Cafe</span>
          <h4 className="footer-cafe-title">Mastermind<br/>Bicycle Cafe &amp; Bar</h4>
          <div className="footer-cafe-meta">
            <div className="footer-cafe-row">
              <MapPin size={14} />
              <span>Avior Corporate Park, LBS Marg, Mulund West, Mumbai</span>
            </div>
            <div className="footer-cafe-row">
              <Clock size={14} />
              <span>Open daily &middot; 11 AM &ndash; 11 PM</span>
            </div>
            <div className="footer-cafe-row">
              <Phone size={14} />
              <a href="tel:+918591850161">+91 85918 50161</a>
            </div>
            <div className="footer-cafe-row">
              <Mail size={14} />
              <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a>
            </div>
          </div>
          <a
            href="https://maps.google.com/?q=Mastermind+Bicycle+Cafe+Mulund"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-cafe-map"
          >
            Open in Maps <ArrowRight size={12} />
          </a>
        </aside>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Mastermind Bicycle Cafe &amp; Bar. Crafted in Mulund, Mumbai.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/refund-policy">Refunds</Link>
          <Link to="/shipping">Shipping</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  )
}
