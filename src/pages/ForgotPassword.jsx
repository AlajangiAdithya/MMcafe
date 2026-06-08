import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { sendPasswordResetEmail } from '../lib/email'
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
      const { data: token, error } = await supabase.rpc('request_password_reset', {
        p_email: email.trim(),
      })
      if (error) throw error

      if (token) {
        const resetLink = `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`
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
        } catch { /* non-fatal */ }

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
      <div 
        className="auth-page-bg" 
        style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/ObyGM3YfiJC4M2LPUP1rdV082_LsSN7ath2Sb3CRPa3rB5znuyR8orGk95j1OQcu-f1KxzfwDayEDvFFj8zmS8PxD6ZG_Oooc0HOAzDR=w1200-rw)' }} 
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
