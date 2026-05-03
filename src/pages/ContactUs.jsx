import { Mail, Phone, MapPin, Clock, Globe } from 'lucide-react'
import { usePageMeta } from '../lib/usePageMeta'

export default function ContactUs() {
  usePageMeta({
    title: 'Contact Us',
    description: 'Get in touch with Mastermind Brews in Mulund, Mumbai. Email, phone, address and hours.',
  })
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>Contact Us</h1>
        <p className="policy-updated">We'd love to hear from you!</p>

        <section>
          <h2>Get In Touch</h2>
          <p>
            Whether you have a question about our products, courses, orders, or anything else,
            our team is always happy to help.
          </p>
        </section>

        <section>
          <div className="contact-grid">
            <div className="contact-card">
              <Mail size={24} />
              <h3>Email</h3>
              <a href="mailto:hello@mastermindcafe.in">hello@mastermindcafe.in</a>
              <p>We typically respond within 24 hours</p>
            </div>

            <div className="contact-card">
              <Phone size={24} />
              <h3>Phone</h3>
              <a href="tel:+918591850161">+91 85918 50161</a>
              <p>Monday to Saturday, 10 AM – 7 PM IST</p>
            </div>

            <div className="contact-card">
              <MapPin size={24} />
              <h3>Visit Us</h3>
              <p>Mastermind Bicycle Cafe & Bar (Mastermind Brews)</p>
              <p>Avior Corporate Park, LBS Marg,<br />Mulund West, Mumbai - 400080,<br />Maharashtra, India</p>
            </div>

            <div className="contact-card">
              <Clock size={24} />
              <h3>Cafe Hours</h3>
              <p>Monday – Sunday</p>
              <p>11:00 AM – 11:00 PM</p>
            </div>
          </div>
        </section>

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
      </div>
    </div>
  )
}
