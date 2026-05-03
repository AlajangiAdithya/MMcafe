import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft, Coffee } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { sendPasswordResetEmail } from '../lib/email'
import { validateEmail } from '../lib/validateEmail'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    if (emailErr) {
      toast.error(emailErr)
      return
    }
    setLoading(true)
    try {
      const { data: token, error } = await supabase.rpc('request_password_reset', {
        p_email: email.trim(),
      })
      if (error) throw error

      // If the email isn't registered, the RPC returns null. To prevent
      // email enumeration we still show the success state, but only send
      // an email when there's a real token.
      if (token) {
        const resetLink = `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`

        // Best-effort name lookup for a friendlier email greeting
        let toName = ''
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle()
          if (profile) {
            toName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          }
        } catch {
          /* non-fatal */
        }

        await sendPasswordResetEmail({
          toEmail: email.trim(),
          toName,
          resetLink,
        })
      }

      setSent(true)
      toast.success('If an account exists, a reset link has been sent.')
    } catch (err) {
      toast.error(err.message || 'Could not send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-visual">
          <div className="auth-visual-bg" style={{
            backgroundImage: 'url(https://lh3.googleusercontent.com/ObyGM3YfiJC4M2LPUP1rdV082_LsSN7ath2Sb3CRPa3rB5znuyR8orGk95j1OQcu-f1KxzfwDayEDvFFj8zmS8PxD6ZG_Oooc0HOAzDR=w1200-rw)'
          }} />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-content">
            <Coffee size={40} />
            <h2>Forgot your password?</h2>
            <p>No problem. Enter your email and we'll send you a secure link to reset it.</p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <Link to="/" className="auth-logo">
                <img src="/logo.png" alt="Mastermind Brews" />
            </Link>
              <h2>Reset password</h2>
              <p>We'll email you a reset link</p>
            </div>

            {sent ? (
              <div className="auth-success-state">
                <p>If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
                <p className="text-muted">The link expires in 15 minutes. Check your spam folder if you don't see it within a few minutes.</p>
                <Link to="/login" className="btn btn-blue full-width auth-submit">
                  <ArrowLeft size={16} /> Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="input-group">
                    <Mail size={16} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-blue full-width auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading">
                      <span className="spinner" />
                      Sending...
                    </span>
                  ) : (
                    <>Send reset link <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            )}

            <p className="toggle-auth">
              Remembered it? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
