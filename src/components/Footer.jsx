import { Link } from 'react-router-dom'

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
  return (
    <footer className="footer footer--editorial footer--v2">
      {/* Large email CTA */}
      <div className="ftr2-cta">
        <div className="ftr2-inner">
          <span className="ftr2-cta-label">Start a conversation</span>
          <a href="mailto:hello@mastermindcafe.in" className="ftr2-email">
            hello@mastermindcafe.in
          </a>
        </div>
      </div>

      {/* Three-col info grid */}
      <div className="ftr2-body">
        <div className="ftr2-inner">
          <div className="ftr2-brand">
            <Link to="/" className="ftr2-logo">
              <img src="/logo.png" alt="Mastermind Brews" />
              <span>Mastermind Brews</span>
            </Link>
            <p className="ftr2-tagline">Specialty coffee · Barista academy · Cafe consultancy · Mumbai, India</p>
            <div className="ftr2-social">
              <a href="https://www.instagram.com/mastermindbicyclecafe/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon size={16} /></a>
              <a href="https://www.facebook.com/mastermindbicyclecafe/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon size={16} /></a>
              <a href="https://x.com/cafemastermind" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><XIcon size={14} /></a>
            </div>
          </div>

          <nav className="ftr2-nav">
            <h4 className="ftr2-col-title">Navigate</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/store">Buy Coffee</Link>
            <Link to="/workshop">Learn Coffee</Link>
            <Link to="/consultancy">Our Projects</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="ftr2-contact">
            <h4 className="ftr2-col-title">Find Us</h4>
            <p>Mastermind Bicycle Cafe &amp; Bar</p>
            <p>Avior Corporate Park<br />Mulund West, Mumbai</p>
            <a href="tel:+918591850161">+91 85918 50161</a>
            <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="ftr2-legal">
        <div className="ftr2-inner ftr2-legal-inner">
          <p>&copy; 2026 Mastermind Brews &middot; Mulund, Mumbai</p>
          <div className="ftr2-legal-links">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/refund-policy">Refunds</Link>
            <Link to="/shipping">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
