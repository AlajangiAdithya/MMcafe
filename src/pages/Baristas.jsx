import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Coffee, Lock, Mail, Phone, MapPin, GraduationCap, Briefcase, Sparkles, ShieldCheck, ArrowRight, UserPlus, Search, BookOpen, Building2, Eye, Award, Users, Hourglass, UserCheck, ClipboardList, Pencil, Send } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  hasBaristaAccess, grantBaristaAccess, getMyAssignedBaristas, markBaristaHired,
  getMyCafeBrief, upsertCafeBrief, SHIFT_TYPES, BARISTA_SLOTS_PER_CAFE,
  getBaristaAccessStatus, accessStatus, CAFE_ACCESS_DAYS,
} from '../lib/database'
import { openRazorpay } from '../lib/razorpay'
import { usePageMeta } from '../lib/usePageMeta'
import { confirmAction } from '../components/ConfirmDialog'
import toast from 'react-hot-toast'
import Loader from '@/components/ui/loader-4'

const ACCESS_PRICE = 500

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

export default function Baristas() {
  usePageMeta({
    title: 'Hire Trained Baristas in India · Barista Directory',
    description: 'Browse profiles of trained baristas available for hire across India. One-time access pass for cafes, hotels and restaurants looking to staff up.',
    keywords: 'hire baristas India, barista directory, cafe staffing, barista jobs, hire trained barista Mumbai, barista recruitment India',
  })

  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [hasAccess, setHasAccess] = useState(false)
  const [accessLoading, setAccessLoading] = useState(true)
  const [accessRecord, setAccessRecord] = useState(null)
  const [baristas, setBaristas] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [hiringId, setHiringId] = useState(null)
  const [brief, setBrief] = useState(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [briefEditing, setBriefEditing] = useState(false)

  // Check access + load brief whenever user changes. Brief must be loaded for
  // logged-out gating decisions (brief form gates the payment step).
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setAccessLoading(false)
      setHasAccess(false)
      setBrief(null)
      setBriefLoading(false)
      return
    }
    let cancelled = false
    setAccessLoading(true)
    setBriefLoading(true)

    getBaristaAccessStatus(user.id)
      .then(status => {
        if (cancelled) return
        setAccessRecord(status)
        setHasAccess(!!status?.active)
      })
      .finally(() => { if (!cancelled) setAccessLoading(false) })

    getMyCafeBrief()
      .then(b => {
        if (cancelled) return
        setBrief(b)
        setBriefEditing(!b)
      })
      .catch(err => {
        console.error('brief load failed', err)
        if (!cancelled) setBriefEditing(true)
      })
      .finally(() => { if (!cancelled) setBriefLoading(false) })

    return () => { cancelled = true }
  }, [user, authLoading])

  // Load assigned baristas only after access is granted.
  useEffect(() => {
    if (!hasAccess) return
    let cancelled = false
    setListLoading(true)
    getMyAssignedBaristas()
      .then(rows => { if (!cancelled) setBaristas(rows) })
      .catch(err => {
        console.error('directory load failed', err)
        if (!cancelled) toast.error('Could not load directory')
      })
      .finally(() => { if (!cancelled) setListLoading(false) })
    return () => { cancelled = true }
  }, [hasAccess])

  const handleSaveBrief = async (form) => {
    try {
      const saved = await upsertCafeBrief(form)
      const isFirstSave = !brief
      setBrief(saved)
      setBriefEditing(false)
      if (isFirstSave) {
        toast.success(hasAccess ? 'Brief saved. We\u2019ll match within 24 hours' : 'Brief saved. Pay to unlock your matches')
      } else {
        toast.success('Brief updated')
      }
    } catch (err) {
      toast.error(err.message || 'Could not save brief')
    }
  }

  const handleHire = async (b) => {
    const ok = await confirmAction({
      title: `Mark ${b.full_name} as hired?`,
      message:
        `Save their phone (${b.phone}) and email before continuing. Once you confirm, ` +
        `they'll be removed from your directory and won't be available to other cafes anymore. ` +
        `(Our team keeps the record for our books.) This can't be undone.`,
      confirmLabel: 'Mark as hired',
      danger: true,
    })
    if (!ok) return
    setHiringId(b.id)
    try {
      await markBaristaHired(b.id)
      setBaristas(prev => prev.filter(x => x.id !== b.id))
      toast.success(`${b.full_name} marked as hired. Best of luck!`)
    } catch (err) {
      toast.error(err.message || 'Could not mark as hired')
    } finally {
      setHiringId(null)
    }
  }

  const handlePay = () => {
    if (!user) {
      toast('Please log in to continue')
      navigate('/login?redirect=/baristas')
      return
    }
    setPaying(true)
    // SECURITY: amount + payment_id are not yet server-verified for this flow.
    // The corresponding `payment-order` / `payment-verify` edge-function branch
    // for `kind: 'barista_access'` is pending. Once that ships, switch this
    // call to `payAndVerify({ kind: 'barista_access' })` and delete
    // grantBaristaAccess + its RPC.
    openRazorpay({
      amount: ACCESS_PRICE,
      name: 'Mastermind Brews',
      description: 'Barista Directory Access',
      email: user.email,
      notes: { kind: 'barista_directory_access', user_id: user.id },
      onSuccess: async (resp) => {
        try {
          await grantBaristaAccess({
            userId: user.id,
            paymentId: resp?.razorpay_payment_id || null,
            amount: ACCESS_PRICE,
          })
          setHasAccess(true)
          toast.success('Access unlocked!')
        } catch (err) {
          toast.error(err.message || 'Could not save access')
        } finally {
          setPaying(false)
        }
      },
      onFailure: (msg) => {
        setPaying(false)
        if (msg !== 'Payment cancelled') toast.error(msg || 'Payment failed')
      },
    })
  }

  // ---- LOADING STATE ----
  if (authLoading || accessLoading) {
    return (
      <div className="page-shell">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader />
        </div>
      </div>
    )
  }

  // Shared sections used by both gated and unlocked views
  const HeroSection = (
    <section className="page-hero baristas-hero">
      <div className="container">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
          }}
        >
          <motion.div className="section-label" variants={fadeUp}><Coffee size={14} style={{ display: 'inline', marginRight: 6 }} /> The Barista Directory</motion.div>
          <motion.h1 className="page-title" variants={fadeUp}>Where trained baristas meet hiring cafes.</motion.h1>
          <motion.p className="page-lede" variants={fadeUp}>
            A curated bridge between India&rsquo;s working baristas and the cafes that need them.
            Baristas list themselves once and stay discoverable. Cafes pay a one-time fee to
            browse verified profiles and reach out directly &mdash; no agencies, no commission.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )

  const GetDiscoveredSection = (
    <section className="dual-section get-discovered-section">
      <div className="container">
        <div className="dual-header">
          <span className="dual-tag dual-tag-baristas"><UserPlus size={12} /> For Baristas</span>
          <h2>Get discovered by hiring cafes.</h2>
          <p>
            Submit your profile once. Cafe owners and managers across the country browse this
            directory when they&rsquo;re hiring &mdash; your name, experience and skills land
            in front of real opportunities, not job-board noise.
          </p>
        </div>

        <AnimatedSection className="discovered-card">
          <motion.ul
            className="discovered-perks"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.li variants={fadeUp}>
              <div className="perk-icon"><Eye size={18} /></div>
              <div>
                <strong>Stay visible</strong>
                <span>Your profile sits in front of cafes actively looking to hire.</span>
              </div>
            </motion.li>
            <motion.li variants={fadeUp}>
              <div className="perk-icon"><Award size={18} /></div>
              <div>
                <strong>Showcase your craft</strong>
                <span>Highlight your experience, training and skills &mdash; in plain words, no resume needed.</span>
              </div>
            </motion.li>
            <motion.li variants={fadeUp}>
              <div className="perk-icon"><Briefcase size={18} /></div>
              <div>
                <strong>Direct contact, no middleman</strong>
                <span>Cafes reach you on your own email and phone. We don&rsquo;t take a cut.</span>
              </div>
            </motion.li>
            <motion.li variants={fadeUp}>
              <div className="perk-icon"><ShieldCheck size={18} /></div>
              <div>
                <strong>Vetted listing &mdash; free to join</strong>
                <span>We review every submission before it goes live. Listing is and stays free for baristas.</span>
              </div>
            </motion.li>
          </motion.ul>

          <div className="discovered-cta">
            <Link to="/barista-signup" className="btn btn-primary btn-lg">
              Get discovered &mdash; submit your profile <ArrowRight size={16} />
            </Link>
            <p className="discovered-foot">Takes about 3 minutes. We&rsquo;ll email you once you&rsquo;re live.</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )

  const CrossLinksSection = (
    <section className="cross-links-section">
      <div className="container">
        <div className="cross-links-header">
          <h3>Keep exploring Mastermind Brews</h3>
          <p>The directory is one piece of what we do. Here&rsquo;s the rest.</p>
        </div>
        <motion.div
          className="cross-links-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <Link to="/blog" className="cross-link-card">
              <div className="cross-link-icon"><BookOpen size={20} /></div>
              <h4>Read the blog</h4>
              <p>Brewing guides, industry notes and stories from working baristas.</p>
              <span className="cross-link-cta">Open blog <ArrowRight size={14} /></span>
            </Link>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Link to="/consultancy" className="cross-link-card">
              <div className="cross-link-icon"><Building2 size={20} /></div>
              <h4>Open or upgrade your cafe</h4>
              <p>Hands-on consultancy for new cafes and existing teams that want to level up.</p>
              <span className="cross-link-cta">See consultancy <ArrowRight size={14} /></span>
            </Link>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Link to="/academy" className="cross-link-card">
              <div className="cross-link-icon"><GraduationCap size={20} /></div>
              <h4>Train at the academy</h4>
              <p>Structured barista courses &mdash; the same training many of these baristas took.</p>
              <span className="cross-link-cta">Browse courses <ArrowRight size={14} /></span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )

  // ---- BRIEF + PAYWALL FLOW (logged out → login, no brief → form, has brief → pay) ----
  if (!hasAccess) {
    const step = !user ? 'login' : (briefLoading ? 'loading' : (brief ? 'pay' : 'brief'))

    return (
      <div className="page-shell baristas-page">
        {HeroSection}
        {GetDiscoveredSection}

        <div className="dual-divider container">
          <span>or, if you&rsquo;re hiring</span>
        </div>

        <section className="dual-section hiring-cafes-section">
          <div className="container narrow">
            <div className="dual-header">
              <span className="dual-tag dual-tag-cafes"><Search size={12} /> For Hiring Cafes</span>
              <h2>Get {BARISTA_SLOTS_PER_CAFE} hand-picked baristas, matched by our team.</h2>
              <p>
                Tell us what you need, pay once, and our team hand-picks
                <strong> {BARISTA_SLOTS_PER_CAFE} verified barista profiles</strong> for your cafe
                &mdash; full name, phone, email, location, experience, training and skills.
                No browsing through hundreds of resumes.
              </p>
            </div>

            <ol className="hire-steps">
              <li className={step === 'brief' ? 'active' : (brief ? 'done' : '')}>
                <span className="hire-step-num">1</span>
                <div><strong>Tell us what you need</strong><span>Short brief: city, shift, budget</span></div>
              </li>
              <li className={step === 'pay' ? 'active' : (hasAccess ? 'done' : '')}>
                <span className="hire-step-num">2</span>
                <div><strong>Pay ₹{ACCESS_PRICE} once</strong><span>Unlock your {BARISTA_SLOTS_PER_CAFE} matches</span></div>
              </li>
              <li>
                <span className="hire-step-num">3</span>
                <div><strong>Get your matches</strong><span>Within 24 hours, hand-picked</span></div>
              </li>
            </ol>

            {step === 'login' && (
              <div className="paywall-card">
                <div className="paywall-icon"><Lock size={26} /></div>
                <h2>Login to start</h2>
                <p>Create an account or log in &mdash; takes seconds. Then tell us what you need and we&rsquo;ll match {BARISTA_SLOTS_PER_CAFE} baristas for you.</p>
                <Link to="/login?redirect=/baristas" className="btn btn-primary full-width">
                  Login to continue <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {step === 'loading' && (
              <div className="paywall-card">
                <div className="skeleton-line" style={{ width: '60%' }} />
                <div className="skeleton-line" style={{ marginTop: 14 }} />
              </div>
            )}

            {step === 'brief' && (
              <BriefForm
                initial={null}
                onSave={handleSaveBrief}
                onCancel={null}
                heading="Step 1: Tell us what you need"
                subheading={`A quick brief so our team can hand-pick the right ${BARISTA_SLOTS_PER_CAFE} baristas for you. You'll pay on the next step.`}
                submitLabel="Save brief & continue"
              />
            )}

            {step === 'pay' && (
              <>
                <BriefSummary brief={brief} onEdit={() => setBriefEditing(true)} />
                {briefEditing && (
                  <BriefForm
                    initial={brief}
                    onSave={handleSaveBrief}
                    onCancel={() => setBriefEditing(false)}
                  />
                )}
                <div className="paywall-card">
                  <div className="paywall-icon"><Lock size={26} /></div>
                  <h2>Step 2: Unlock your {BARISTA_SLOTS_PER_CAFE} matches</h2>
                  <p>
                    Your brief is saved. Pay once and our team will hand-pick
                    {' '}{BARISTA_SLOTS_PER_CAFE} verified baristas for your cafe.
                  </p>
                  <ul className="paywall-benefits">
                    <li><Users size={16} /> {BARISTA_SLOTS_PER_CAFE} hand-picked profiles matched to your brief</li>
                    <li><ShieldCheck size={16} /> Every barista vetted before assignment</li>
                    <li><Briefcase size={16} /> Direct phone &amp; email &mdash; no middleman</li>
                    <li><Sparkles size={16} /> {CAFE_ACCESS_DAYS}-day window to finalise your hire</li>
                  </ul>
                  <div className="paywall-price">
                    <span className="paywall-amount">₹{ACCESS_PRICE}</span>
                    <span className="paywall-period">for {BARISTA_SLOTS_PER_CAFE} profiles</span>
                  </div>
                  <button className="btn btn-primary full-width" onClick={handlePay} disabled={paying}>
                    {paying ? 'Opening checkout…' : <>Unlock for ₹{ACCESS_PRICE} <ArrowRight size={14} /></>}
                  </button>
                  <p className="paywall-foot">
                    Not hiring? Just curious about training?{' '}
                    <Link to="/academy">See our academy</Link>.
                  </p>
                  <p className="paywall-fineprint">
                    Access lasts {CAFE_ACCESS_DAYS} days from payment. If you don&rsquo;t finalise a hire
                    in that window, you&rsquo;ll need to pay again to refresh your matches.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {CrossLinksSection}
      </div>
    )
  }

  // ---- LIST (post-payment; brief already exists from step 1) ----
  let matchHeading
  let matchSubcopy
  if (baristas.length === 0) {
    matchHeading = `Brief received. We're matching now.`
    matchSubcopy = `Our team is hand-picking ${BARISTA_SLOTS_PER_CAFE} verified baristas for your cafe. They'll appear here as soon as we assign them, usually within 24 hours.`
  } else {
    matchHeading = `${baristas.length} of ${BARISTA_SLOTS_PER_CAFE} baristas matched for you.`
    matchSubcopy = `Phone and email are below each profile. Tap to call or write directly. No middleman, no commission.`
  }

  return (
    <div className="page-shell baristas-page">
      {HeroSection}
      {GetDiscoveredSection}

      <div className="dual-divider container">
        <span>your matched baristas</span>
      </div>

      <section className="dual-section">
        <div className="container">
          <div className="dual-header">
            <span className="dual-tag dual-tag-cafes"><ShieldCheck size={12} /> For Hiring Cafes</span>
            <h2>{matchHeading}</h2>
            <p>{matchSubcopy}</p>
          </div>

          {accessRecord?.expiresAt && <AccessExpiryBanner record={accessRecord} />}

          {!briefLoading && brief && !briefEditing && (
            <BriefSummary brief={brief} onEdit={() => setBriefEditing(true)} />
          )}
          {!briefLoading && briefEditing && (
            <BriefForm
              initial={brief}
              onSave={handleSaveBrief}
              onCancel={brief ? () => setBriefEditing(false) : null}
            />
          )}
        </div>
      </section>

      <section className="baristas-list-section">
        <div className="container">
          {listLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <Loader />
            </div>
          ) : baristas.length === 0 ? (
            <div className="empty-state">
              <Hourglass size={32} />
              <h3>Matching in progress</h3>
              <p>
                We received your access payment. Our team is reviewing baristas and will
                assign your {BARISTA_SLOTS_PER_CAFE} profiles shortly. You&rsquo;ll see them
                here on this page &mdash; no need to refresh repeatedly.
              </p>
            </div>
          ) : (
            <div className="baristas-grid">
              {baristas.map(b => (
                <div key={b.id} className="barista-card barista-card-text">
                  <div className="barista-card-body">
                    <h3 className="barista-card-name">{b.full_name}</h3>
                    {b.current_location && (
                      <div className="barista-card-meta">
                        <MapPin size={12} /> {b.current_location}
                      </div>
                    )}
                    <div className="barista-card-stats">
                      <div className="barista-stat">
                        <Briefcase size={12} /> {b.experience_years || 0} yr{b.experience_years === 1 ? '' : 's'}
                      </div>
                    </div>
                    {b.experience_summary && (
                      <div className="barista-section">
                        <h4>Experience</h4>
                        <p>{b.experience_summary}</p>
                      </div>
                    )}
                    {b.education && (
                      <div className="barista-section">
                        <h4><GraduationCap size={12} /> Training</h4>
                        {b.education.includes('\n') ? (
                          <ul className="barista-edu-list">
                            {b.education.split('\n').filter(Boolean).map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{b.education}</p>
                        )}
                      </div>
                    )}
                    {b.skills && (
                      <div className="barista-section">
                        <h4><Sparkles size={12} /> Skills</h4>
                        <p>{b.skills}</p>
                      </div>
                    )}
                    <div className="barista-contact-block">
                      <h4>Contact directly</h4>
                      <a className="barista-contact-row" href={`tel:${b.phone}`}>
                        <Phone size={14} />
                        <span>{b.phone}</span>
                      </a>
                      {b.email && (
                        <a className="barista-contact-row" href={`mailto:${b.email}`}>
                          <Mail size={14} />
                          <span>{b.email}</span>
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      className="barista-hire-btn"
                      onClick={() => handleHire(b)}
                      disabled={hiringId === b.id}
                    >
                      <UserCheck size={14} />
                      {hiringId === b.id ? 'Marking as hired…' : 'I hired this barista'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {CrossLinksSection}
    </div>
  )
}

function AccessExpiryBanner({ record }) {
  const status = accessStatus({ expires_at: record.expiresAt, revoked_at: record.revokedAt })
  if (status.kind === 'active' && status.daysLeft > 5) {
    return (
      <p className="access-fineprint">
        Your access is active for <strong>{status.daysLeft} more day{status.daysLeft === 1 ? '' : 's'}</strong>.
        Finalise your hire within this window. After that, you&rsquo;ll need to pay again to refresh your matches.
      </p>
    )
  }
  if (status.kind === 'expiring') {
    return (
      <div className="access-banner access-banner-warn">
        <strong>Heads up: only {status.daysLeft} day{status.daysLeft === 1 ? '' : 's'} left on your access.</strong>
        <span>Finalise your hire soon, or you&rsquo;ll need to pay again to refresh your matches.</span>
      </div>
    )
  }
  return null
}

function BriefForm({ initial, onSave, onCancel, heading, subheading, submitLabel }) {
  const [form, setForm] = useState({
    city: initial?.city || '',
    shift_type: initial?.shift_type || '',
    min_experience_years: initial?.min_experience_years ?? '',
    budget_monthly: initial?.budget_monthly ?? '',
    notes: initial?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.city.trim()) {
      toast.error('City is needed so we match locally')
      return
    }
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <form className="brief-form" onSubmit={submit}>
      <div className="brief-form-head">
        <ClipboardList size={18} />
        <div>
          <h3>{heading || (initial ? 'Update your brief' : 'Tell us what you need')}</h3>
          <p>{subheading || 'Takes a minute. The more we know, the better we match.'}</p>
        </div>
      </div>
      <div className="brief-form-grid">
        <label className="brief-field">
          <span>City <em>*</em></span>
          <input
            type="text"
            value={form.city}
            onChange={e => update('city', e.target.value)}
            placeholder="e.g. Bengaluru, HSR Layout"
            required
          />
        </label>
        <label className="brief-field">
          <span>Shift type</span>
          <select
            value={form.shift_type}
            onChange={e => update('shift_type', e.target.value)}
          >
            <option value="">No preference</option>
            {SHIFT_TYPES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="brief-field">
          <span>Minimum experience (years)</span>
          <input
            type="number"
            min="0"
            value={form.min_experience_years}
            onChange={e => update('min_experience_years', e.target.value)}
            placeholder="0"
          />
        </label>
        <label className="brief-field">
          <span>Monthly budget (₹)</span>
          <input
            type="number"
            min="0"
            value={form.budget_monthly}
            onChange={e => update('budget_monthly', e.target.value)}
            placeholder="e.g. 18000"
          />
        </label>
        <label className="brief-field brief-field-full">
          <span>Anything else? (optional)</span>
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Specialty cafe, latte-art focus, late-night shifts, etc."
          />
        </label>
      </div>
      <div className="brief-form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Send size={14} /> {saving ? 'Saving…' : (submitLabel || (initial ? 'Save changes' : 'Send brief'))}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function BriefSummary({ brief, onEdit }) {
  const shiftLabel = SHIFT_TYPES.find(s => s.id === brief.shift_type)?.label
  return (
    <div className="brief-summary">
      <div className="brief-summary-head">
        <ClipboardList size={16} />
        <strong>Your brief</strong>
        <button type="button" className="brief-summary-edit" onClick={onEdit}>
          <Pencil size={12} /> Edit
        </button>
      </div>
      <div className="brief-summary-grid">
        {brief.city && <div><span>City</span><strong>{brief.city}</strong></div>}
        {shiftLabel && <div><span>Shift</span><strong>{shiftLabel}</strong></div>}
        {brief.min_experience_years > 0 && (
          <div><span>Min experience</span><strong>{brief.min_experience_years} yr{brief.min_experience_years === 1 ? '' : 's'}</strong></div>
        )}
        {brief.budget_monthly && (
          <div><span>Budget</span><strong>₹{brief.budget_monthly.toLocaleString('en-IN')}/mo</strong></div>
        )}
      </div>
      {brief.notes && <p className="brief-summary-notes">{brief.notes}</p>}
    </div>
  )
}
