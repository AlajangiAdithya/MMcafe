import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Coffee, Send, Check, Plus, X, ShieldCheck, Sparkles } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { submitBarista } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'
import { validateEmail, suggestEmailFix } from '../lib/validateEmail'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
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

const EMPTY = {
  full_name: '',
  phone: '',
  email: '',
  experience_years: '',
  experience_summary: '',
  skills: '',
  current_location: '',
}

const newCaptcha = () => {
  const a = 1 + Math.floor(Math.random() * 8)
  const b = 1 + Math.floor(Math.random() * 8)
  return { a, b, answer: '' }
}

export default function BaristaSignup() {
  usePageMeta({
    title: 'Get Discovered: Join the Barista Directory',
    description: 'Are you a barista? Submit your details and get discovered by hiring cafes. No fees, no resume needed.',
  })

  const [form, setForm] = useState(EMPTY)
  const [education, setEducation] = useState([''])
  const [captcha, setCaptcha] = useState(newCaptcha)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState({})

  const change = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const touch = (k) => () => setTouched(t => ({ ...t, [k]: true }))

  const emailError = touched.email && form.email ? validateEmail(form.email) : null
  const emailFix = useMemo(
    () => (touched.email && form.email && !emailError ? suggestEmailFix(form.email) : null),
    [touched.email, form.email, emailError]
  )

  const updateEducation = (idx, value) => {
    setEducation(list => list.map((v, i) => (i === idx ? value : v)))
  }
  const addEducation = () => setEducation(list => [...list, ''])
  const removeEducation = (idx) => {
    setEducation(list => (list.length === 1 ? [''] : list.filter((_, i) => i !== idx)))
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!form.full_name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number (at least 10 digits)')
      return
    }
    if (form.email.trim()) {
      const emailErr = validateEmail(form.email)
      if (emailErr) {
        setTouched(t => ({ ...t, email: true }))
        toast.error(emailErr)
        return
      }
    }
    if (Number(captcha.answer) !== captcha.a + captcha.b) {
      toast.error('Captcha answer is wrong. Try again.')
      setCaptcha(newCaptcha())
      return
    }

    setSubmitting(true)
    try {
      const educationText = education
        .map(s => s.trim())
        .filter(Boolean)
        .join('\n')

      await submitBarista({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() ? form.email.trim().toLowerCase() : null,
        experience_years: parseInt(form.experience_years) || 0,
        experience_summary: form.experience_summary.trim(),
        education: educationText,
        skills: form.skills.trim(),
        current_location: form.current_location.trim(),
        photo_url: null,
      })
      setSubmitted(true)
      toast.success('Profile submitted!')
    } catch (err) {
      toast.error(err.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="page-shell">
        <div className="container narrow" style={{ padding: '80px 0' }}>
          <motion.div
            className="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="success-icon"><Check size={28} /></div>
            <h2>You&rsquo;re in.</h2>
            <p>
              Thanks for sharing your details. Our team checks every profile before
              it goes live so cafes only see real, working baristas. We&rsquo;ll email
              you when a hiring cafe wants to connect.
            </p>
            <Link to="/" className="btn btn-primary">Back to home</Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell barista-signup-page">
      <section className="page-hero">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
            }}
          >
            <motion.div className="section-label" variants={fadeUp}><Coffee size={14} style={{ display: 'inline', marginRight: 6 }} /> For Baristas</motion.div>
            <motion.h1 className="page-title" variants={fadeUp}>Get discovered. It&rsquo;s free.</motion.h1>
            <motion.p className="page-lede" variants={fadeUp}>
              Fill this short form and your profile goes into our directory. Cafe owners
              who are hiring will reach you directly on your phone or email. No fees, no
              resume needed.
            </motion.p>
            <motion.div className="signup-trust-row" variants={staggerContainer}>
              <motion.span className="signup-trust" variants={fadeUp}><ShieldCheck size={14} /> Free to list, free forever</motion.span>
              <motion.span className="signup-trust" variants={fadeUp}><Sparkles size={14} /> Takes about 3 minutes</motion.span>
              <motion.span className="signup-trust" variants={fadeUp}><Coffee size={14} /> No middleman &mdash; cafes call you directly</motion.span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="form-section">
        <div className="container narrow">
          <AnimatedSection>
            <form className="form-card barista-form" onSubmit={submit} noValidate>
              <div className="form-step">
                <span className="form-step-tag">Step 1 &middot; Your details</span>
              </div>

              <div className="form-row">
                <label className="form-field">
                  <span>Your full name <em>*</em></span>
                  <input
                    value={form.full_name}
                    onChange={change('full_name')}
                    required
                    maxLength={120}
                    placeholder="e.g. Rahul Kumar"
                    autoComplete="name"
                  />
                </label>
                <label className="form-field">
                  <span>Which city? <em>*</em></span>
                  <input
                    value={form.current_location}
                    onChange={change('current_location')}
                    placeholder="e.g. Mumbai, Maharashtra"
                    maxLength={120}
                    required
                    autoComplete="address-level2"
                  />
                </label>
              </div>

              <div className="form-row">
                <label className="form-field">
                  <span>Phone number <em>*</em></span>
                  <input
                    value={form.phone}
                    onChange={change('phone')}
                    required
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g. 98765 43210"
                    maxLength={20}
                    autoComplete="tel"
                  />
                  <span className="field-hint">Cafes will call you on this number directly.</span>
                </label>
                <label className="form-field">
                  <span>Email <small style={{ opacity: 0.6, fontWeight: 400 }}>(optional)</small></span>
                  <input
                    value={form.email}
                    onChange={change('email')}
                    onBlur={touch('email')}
                    type="email"
                    inputMode="email"
                    maxLength={120}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={emailError ? 'input-error' : ''}
                  />
                  {emailError && <span className="field-error">{emailError}</span>}
                  {!emailError && emailFix && (
                    <button
                      type="button"
                      className="field-suggestion"
                      onClick={() => setForm(f => ({ ...f, email: emailFix }))}
                    >
                      Did you mean <strong>{emailFix}</strong>? Tap to use this.
                    </button>
                  )}
                  <span className="field-hint">Skip if you don&rsquo;t have one. Cafes will call your phone instead.</span>
                </label>
              </div>

              <div className="form-step">
                <span className="form-step-tag">Step 2 &middot; Your work</span>
              </div>

              <label className="form-field">
                <span>How many years have you worked as a barista?</span>
                <input
                  value={form.experience_years}
                  onChange={change('experience_years')}
                  type="number"
                  min="0"
                  max="60"
                  inputMode="numeric"
                  placeholder="e.g. 3"
                />
                <span className="field-hint">Put 0 if you just finished training.</span>
              </label>

              <label className="form-field">
                <span>Tell cafes about your work</span>
                <textarea
                  value={form.experience_summary}
                  onChange={change('experience_summary')}
                  rows={4}
                  placeholder="Where have you worked before? Cafes? Hotels? What did you do there? Write in simple words, even one or two lines is fine."
                  maxLength={1000}
                />
                <span className="field-hint">Don&rsquo;t worry about grammar. Just tell us your story.</span>
              </label>

              <label className="form-field">
                <span>What can you do?</span>
                <textarea
                  value={form.skills}
                  onChange={change('skills')}
                  rows={3}
                  placeholder="e.g. Espresso, Latte art, Pour-over, Manual brewing, Cleaning machines, Customer service"
                  maxLength={500}
                />
                <span className="field-hint">List anything you know how to do. Separate by commas.</span>
              </label>

              <div className="form-step">
                <span className="form-step-tag">Step 3 &middot; Training (optional)</span>
              </div>

              <div className="form-field">
                <span>Any training or certificates? <small style={{ opacity: 0.6, fontWeight: 400 }}>(optional)</small></span>
                <span className="field-hint" style={{ marginTop: 0, marginBottom: 8 }}>
                  If you took any course or workshop, list them here. Add more if you have many. Skip if none.
                </span>
                <div className="education-list">
                  {education.map((value, idx) => (
                    <div className="education-row" key={idx}>
                      <input
                        value={value}
                        onChange={(e) => updateEducation(idx, e.target.value)}
                        placeholder={idx === 0
                          ? 'e.g. Mastermind Brews Academy: Barista Foundation'
                          : 'e.g. SCA Foundation, Hotel Management Diploma…'}
                        maxLength={200}
                      />
                      {education.length > 1 && (
                        <button
                          type="button"
                          className="education-remove"
                          onClick={() => removeEducation(idx)}
                          aria-label="Remove this entry"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="education-add" onClick={addEducation}>
                  <Plus size={14} /> Add another
                </button>
              </div>

              <div className="form-step">
                <span className="form-step-tag">Quick check</span>
              </div>

              <label className="form-field captcha-field">
                <span>What is {captcha.a} + {captcha.b}? <em>*</em></span>
                <input
                  value={captcha.answer}
                  onChange={(e) => setCaptcha(c => ({ ...c, answer: e.target.value }))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  required
                  placeholder="Type the answer here"
                />
                <span className="field-hint">This stops spam from filling our directory.</span>
              </label>

              <div className="form-actions">
                <button type="submit" disabled={submitting} className="btn btn-primary btn-lg full-width">
                  {submitting ? 'Submitting…' : <>Submit my profile <Send size={14} /></>}
                </button>
              </div>
              <p className="form-note">
                By submitting, you agree that <strong>Mastermind Brews</strong> may share the
                details on this form &mdash; including your name, phone, email, location,
                experience, training and skills &mdash; with cafes who pay for directory access.
                Cafes contact you directly. We don&rsquo;t take any commission from your hire.
                See our{' '}
                <Link to="/privacy">Privacy Policy</Link>{' '}
                for full details.
              </p>
            </form>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
