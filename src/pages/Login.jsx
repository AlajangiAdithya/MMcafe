import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Coffee, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { validateEmail } from '../lib/validateEmail'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const { signInWithEmail, signInWithGoogle } = useAuth()
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

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left - Visual Panel */}
        <div className="auth-visual">
          <div className="auth-visual-bg" style={{
            backgroundImage: 'url(https://lh3.googleusercontent.com/A959ZB5laMMAwx3johfA0IdN0LMU0pdhL9EmXBWTkEyVu1erfFJy4p7kJhUN4dzVZLPOTQWQ6-_PeE6Q-UwwbhnOooY2s1UXjLvE-xBZSw=w1920-rw)'
          }} />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-content">
            <Coffee size={40} />
            <h2>Welcome Back</h2>
            <p>Sign in to access your orders, track deliveries, and continue your barista academy courses.</p>
          </div>
        </div>

        {/* Right - Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <Link to="/" className="auth-logo">
                <img src="/logo.png" alt="Mastermind Brews" />
              </Link>
              <h2>Sign In</h2>
              <p>Welcome back to Mastermind Brews</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="auth-input-group">
                <label htmlFor="login-email">Email Address</label>
                <div className={`input-group ${emailError ? 'input-error' : ''}`}>
                  <Mail size={16} aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? 'login-email-error' : undefined}
                    required
                  />
                </div>
                {emailError && <span id="login-email-error" className="field-error" role="alert">{emailError}</span>}
              </div>

              <div className="auth-input-group">
                <div className="auth-label-row">
                  <label htmlFor="login-password">Password</label>
                  <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
                </div>
                <div className="input-group">
                  <Lock size={16} aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-blue full-width auth-submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    Signing In...
                  </span>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="divider"><span>or</span></div>

            <button type="button" className="google-btn" onClick={handleGoogle} aria-label="Continue with Google">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="toggle-auth">
              Don't have an account?
              <Link to="/signup">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
