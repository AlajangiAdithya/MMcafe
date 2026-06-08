import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { validateEmail } from '../lib/validateEmail'
import { usePageMeta } from '../lib/usePageMeta'
import SteamWisps from '../components/SteamWisps'

export default function Signup() {
  usePageMeta({
    title: 'Create Your Account',
    description: 'Create a Mastermind Brews account to order specialty coffee, enroll in barista academy courses, and save your favorite blends.',
  })
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})
  const { signUpWithEmail } = useAuth()
  const navigate = useNavigate()

  const emailError = touched.email && email ? validateEmail(email) : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter your full name')
      return
    }
    const emailErr = validateEmail(email)
    if (emailErr) {
      setTouched(t => ({ ...t, email: true }))
      toast.error(emailErr)
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await signUpWithEmail(email, password, { firstName: firstName.trim(), lastName: lastName.trim() })
      toast.success('Welcome to Mastermind Brews!')
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
        style={{ backgroundImage: 'url(/cafe-press-bg.jpg)' }} 
      />
      <div className="auth-page-overlay" />
      
      <SteamWisps count={6} seed={88} />

      <div className="auth-glass-card" style={{ maxWidth: '520px' }}>
        <div className="auth-glass-header">
          <Link to="/" className="auth-glass-logo">
            <img src="/logo.png" alt="Mastermind Brews" />
          </Link>
          <h1>Join the Community</h1>
          <p>Start your Mastermind experience today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-glass-form" noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="auth-glass-input-group">
              <label>First Name</label>
              <div className="auth-glass-input-wrapper">
                <User className="icon" size={18} />
                <input
                  type="text"
                  placeholder="Fill first name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
            <div className="auth-glass-input-group">
              <label>Last Name</label>
              <div className="auth-glass-input-wrapper">
                <User className="icon" size={18} />
                <input
                  type="text"
                  placeholder="Fill last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
          </div>

          <div className="auth-glass-input-group">
            <label>Email Address</label>
            <div className="auth-glass-input-wrapper">
              <Mail className="icon" size={18} />
              <input
                type="email"
                placeholder="Fill email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                required
              />
            </div>
            {emailError && <span className="field-error" style={{ color: '#d9534f', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: '600' }}>{emailError}</span>}
          </div>

          <div className="auth-glass-input-group">
            <label>Password</label>
            <div className="auth-glass-input-wrapper">
              <Lock className="icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Fill password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle-glass" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn auth-glass-submit" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-glass-footer">
          Already have an account?
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}
