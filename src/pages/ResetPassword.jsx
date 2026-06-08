import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import SteamWisps from '../components/SteamWisps'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) return
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
        style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/2a1PknT-0zZ7ZMBKxxFRpT0Pv9k75IyIElNU5GtBd7sXY3tOFQ5xG5ozg_IijExfnzCJN30XUbOeXhide-INJTDxnaP4ToyG-XypCG_eig=w1200-rw)' }} 
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

        {!token ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-300)' }}>
            <AlertTriangle size={40} style={{ color: 'var(--accent-deep)', marginBottom: '16px', display: 'inline-block' }} />
            <p style={{ marginBottom: '24px', fontWeight: '500' }}>This reset link is missing or invalid.</p>
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
