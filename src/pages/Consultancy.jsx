import { Link } from 'react-router-dom'
import { Briefcase, Coffee, ClipboardList, BarChart3, Users, ArrowRight, Check } from 'lucide-react'
import { usePageMeta } from '../lib/usePageMeta'

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

export default function Consultancy() {
  usePageMeta({
    title: 'Consultancy',
    description: 'Cafe consultancy from the team behind Mastermind Brews - menu design, operations, training and audits.',
  })

  return (
    <div className="page-shell consultancy-page">
      <section className="page-hero">
        <div className="container">
          <div className="section-label">Consultancy</div>
          <h1 className="page-title">We Help Cafes Get Better</h1>
          <p className="page-lede">
            From a single beverage menu refresh to a full operations rebuild - the same team that runs Mastermind Brews is available to work with yours.
          </p>
          <div className="hero-btns" style={{ marginTop: 24 }}>
            <Link to="/contact" className="btn btn-primary">Start a Conversation <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      <section className="consult-services">
        <div className="container">
          <div className="section-header center">
            <div className="section-label">What We Do</div>
            <h2 className="section-title">Our Services</h2>
          </div>
          <div className="values-grid">
            {SERVICES.map(s => (
              <div key={s.title} className="value-card">
                <div className="value-icon"><s.icon size={22} /></div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="consult-process">
        <div className="container">
          <div className="section-header center">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">A Clear Engagement</h2>
          </div>
          <div className="process-grid">
            {PROCESS.map(p => (
              <div key={p.step} className="process-card">
                <div className="process-step">{p.step}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="consult-suited">
        <div className="container">
          <div className="suited-grid">
            <div>
              <div className="section-label"><Briefcase size={14} style={{ display: 'inline', marginRight: 6 }} /> Who This Is For</div>
              <h2 className="section-title">Cafes At Every Stage</h2>
              <ul className="suited-list">
                <li><Check size={16} /> Owners building their first cafe</li>
                <li><Check size={16} /> Existing cafes hitting a plateau</li>
                <li><Check size={16} /> Restaurants adding a coffee program</li>
                <li><Check size={16} /> Hotels or co-working spaces serving in-house</li>
                <li><Check size={16} /> Brands wanting trained barista staff</li>
              </ul>
            </div>
            <div className="suited-card">
              <h3>Tell us what you are building.</h3>
              <p>We will reply within two working days with a fit assessment and next steps.</p>
              <Link to="/contact" className="btn btn-primary full-width">Contact Us <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
