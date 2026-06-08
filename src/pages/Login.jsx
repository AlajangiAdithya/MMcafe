import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { validateEmail } from '../lib/validateEmail'
import { usePageMeta } from '../lib/usePageMeta'
import SteamWisps from '../components/SteamWisps'

export default function Login() {
  usePageMeta({
    title: 'Sign In',
    description: 'Sign in to your Mastermind Brews account to track orders, manage your barista academy courses, and access your wishlist.',
  })
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const { signInWithEmail } = useAuth()
  const navigate = useNavigate()

  const emailError = emailTouched && email ? validateEmail(email) : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    if (emailErr) {
      setEmailTouched(true)
      toast.error(emailErr)
      return
    }
    setLoading(true)
    try {
      await signInWithEmail(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div 
        className="auth-page-bg" 
        style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/A959ZB5laMMAwx3johfA0IdN0LMU0pdhL9EmXBWTkEyVu1erfFJy4p7kJhUN4dzVZLPOTQWQ6-_PeE6Q-UwwbhnOooY2s1UXjLvE-xBZSw=w1920-rw)' }} 
      />
      <div className="auth-page-overlay" />
      
      <SteamWisps count={6} seed={42} />

      <div className="auth-glass-card">
        <div className="auth-glass-header">
          <Link to="/" className="auth-glass-logo">
            <img src="/logo.png" alt="Mastermind Brews" />
          </Link>
          <h1>Welcome Back</h1>
          <p>Please enter your credentials to resume</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-glass-form" noValidate>
          <div className="auth-glass-input-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="auth-glass-input-wrapper">
              <Mail className="icon" size={18} />
              <input
                id="login-email"
                type="email"
                placeholder="Fill email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                autoComplete="email"
                required
              />
            </div>
            {emailError && (
              <span className="field-error" style={{ color: '#d9534f', fontSize: '11px', marginTop: '6px', display: 'block', fontWeight: '600' }}>
                {emailError}
              </span>
            )}
          </div>

          <div className="auth-glass-input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="login-password" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ color: 'var(--ink-400)', fontSize: '11px', textDecoration: 'none', fontWeight: '600' }}>
                Forgot Password?
              </Link>
            </div>
            <div className="auth-glass-input-wrapper">
              <Lock className="icon" size={18} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Fill password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-glass"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn auth-glass-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-glass-footer">
          Don't have an account?
          <Link to="/signup">Create Account</Link>
        </div>
      </div>
    </div>
  )
}
