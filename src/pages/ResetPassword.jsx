import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, Coffee, ArrowRight, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  // Supabase's old recovery-link flow set a session via PASSWORD_RECOVERY.
  // The new flow uses our token query param, so any auto-login from a stale
  // recovery link should be cleared so we don't reset the wrong account.
  useEffect(() => {
    if (token) return
    // No token in URL: this page is reachable but useless. Keep state minimal.
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      toast.error('Reset link is missing or invalid')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.rpc('complete_password_reset', {
        p_token: token,
        p_new_password: password,
      })
      if (error) throw error
      toast.success('Password updated. Please sign in with your new password.')
      // Clear any stale session from old recovery link flow
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
      <div className="auth-split">
        <div className="auth-visual">
          <div className="auth-visual-bg" style={{
            backgroundImage: 'url(https://lh3.googleusercontent.com/2a1PknT-0zZ7ZMBKxxFRpT0Pv9k75IyIElNU5GtBd7sXY3tOFQ5xG5ozg_IijExfnzCJN30XUbOeXhide-INJTDxnaP4ToyG-XypCG_eig=w1200-rw)'
          }} />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-content">
            <Coffee size={40} />
            <h2>Set a new password</h2>
            <p>Choose a strong password to secure your account.</p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <Link to="/" className="auth-logo">
                <img src="/logo.png" alt="Mastermind Brews" />
              </Link>
              <h2>New password</h2>
              <p>Enter your new password below</p>
            </div>

            {!token ? (
              <div className="auth-success-state">
                <AlertTriangle size={40} style={{ color: 'var(--error)', marginBottom: 12 }} />
                <p>This reset link is missing or invalid.</p>
                <p className="text-muted">Please request a new password reset link.</p>
                <Link to="/forgot-password" className="btn btn-blue full-width auth-submit">
                  Request new link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>New password</label>
                  <div className="input-group">
                    <Lock size={16} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Confirm password</label>
                  <div className={`input-group ${confirm && password !== confirm ? 'input-error' : ''}`}>
                    <Lock size={16} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {confirm && password !== confirm && (
                    <span className="field-error">Passwords do not match</span>
                  )}
                </div>

                <button type="submit" className="btn btn-blue full-width auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-loading">
                      <span className="spinner" />
                      Updating...
                    </span>
                  ) : (
                    <>Update password <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
