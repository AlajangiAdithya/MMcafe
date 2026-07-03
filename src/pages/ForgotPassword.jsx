import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { validateEmail } from '../lib/validateEmail'
import toast from 'react-hot-toast'
import SteamWisps from '../components/SteamWisps'

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
      // Supabase's built-in recovery flow: the reset token is generated AND
      // emailed server-side, so it is never exposed to whoever typed the
      // email address. (The old RPC flow returned the token to the caller,
      // which allowed takeover of any account — never reintroduce it.)
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error

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
      <div
        className="auth-page-bg"
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
      />
      <div className="auth-page-overlay" />
      <SteamWisps count={4} seed={99} />

      <div className="auth-glass-card">
        <div className="auth-glass-header">
          <Link to="/" className="auth-glass-logo">
            <img src="/logo.png" alt="Mastermind Brews" />
          </Link>
          <h1>Reset Password</h1>
          <p>Request a secure key for your account</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-300)' }}>
            <p style={{ marginBottom: '24px', fontWeight: '500' }}>If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
            <Link to="/login" className="btn auth-glass-submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ArrowLeft size={16} /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-glass-form">
            <div className="auth-glass-input-group">
              <label>Email Address</label>
              <div className="auth-glass-input-wrapper">
                <Mail className="icon" size={18} />
                <input
                  type="email"
                  placeholder="Fill email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn auth-glass-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-glass-footer">
          Remembered it? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
