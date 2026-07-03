import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import SteamWisps from '../components/SteamWisps'

export default function ResetPassword() {
  const navigate = useNavigate()

  // Supabase's native recovery: clicking the emailed link lands here with a
  // recovery token in the URL that supabase-js exchanges into a short-lived
  // session (and fires PASSWORD_RECOVERY). We only let the user set a new
  // password once that recovery session exists — the token is never exposed
  // to the page, so it can't be forged.
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let done = false
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        done = true
        setReady(true)
        setChecking(false)
      }
    })
    // Fallback: the session may already be established by the time we subscribe.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setReady(true) }
      if (!done) setChecking(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!ready) {
      toast.error('Reset link is missing or invalid')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated. Please sign in with your new password.')
      try { await supabase.auth.signOut() } catch { /* ignore */ }
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Could not reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div
        className="auth-page-bg"
        style={{ backgroundImage: 'url(/pour-over-coffee.jpg)' }}
      />
      <div className="auth-page-overlay" />
      <SteamWisps count={5} seed={77} />

      <div className="auth-glass-card">
        <div className="auth-glass-header">
          <Link to="/" className="auth-glass-logo">
            <img src="/logo.png" alt="Mastermind Brews" />
          </Link>
          <h1>Secure Account</h1>
          <p>Set your new secure password</p>
        </div>

        {checking ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-300)' }}>
            <p style={{ fontWeight: '500' }}>Verifying your reset link…</p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-300)' }}>
            <AlertTriangle size={40} style={{ color: 'var(--accent-deep)', marginBottom: '16px', display: 'inline-block' }} />
            <p style={{ marginBottom: '24px', fontWeight: '500' }}>This reset link is missing, expired or invalid.</p>
            <Link to="/forgot-password" className="btn auth-glass-submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Request New Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-glass-form">
            <div className="auth-glass-input-group">
              <label>New Password</label>
              <div className="auth-glass-input-wrapper">
                <Lock className="icon" size={18} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Fill new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="password-toggle-glass" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-glass-input-group">
              <label>Confirm Password</label>
              <div className="auth-glass-input-wrapper">
                <Lock className="icon" size={18} />
                <input
                  type="password"
                  placeholder="Fill confirm password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>
              {confirm && password !== confirm && (
                <span className="field-error" style={{ color: '#d9534f', fontSize: '11px', marginTop: '6px', display: 'block', fontWeight: '600' }}>Passwords do not match</span>
              )}
            </div>

            <button type="submit" className="btn auth-glass-submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
