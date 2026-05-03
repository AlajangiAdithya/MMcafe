import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Menu, X, Shield, Package, BookOpen, ChevronDown, Heart, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { count, setIsOpen } = useCart()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close any open menus when the route changes. Defer to next microtask so the
  // effect body itself does not call setState synchronously.
  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(() => {
      if (cancelled) return
      setMenuOpen(false)
      setAccountOpen(false)
    })
    return () => { cancelled = true }
  }, [location])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('click', onClickOutside)
    return () => document.removeEventListener('click', onClickOutside)
  }, [])

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/store', label: 'Store' },
    { to: '/workshop', label: 'Workshop' },
    { to: '/consultancy', label: 'Consultancy' },
    { to: '/blog', label: 'Blog' },
    { to: '/baristas', label: 'Baristas' },
  ]

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="Mastermind Brews" />
          <div className="nav-logo-text">
            <span className="brand-name">Mastermind Brews</span>
            <span className="brand-sub">Coffee &middot; Academy &middot; Hire</span>
          </div>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-center ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <button className="cart-btn" onClick={() => setIsOpen(true)}>
            <ShoppingCart size={20} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>

          {user ? (
            <div className="user-menu" ref={accountRef}>
              {isAdmin && (
                <Link to="/admin" className="admin-link" title="Admin Panel">
                  <Shield size={16} />
                </Link>
              )}
              <button
                className="user-trigger"
                onClick={() => setAccountOpen(o => !o)}
              >
                <span className="user-email">
                  {user.user_metadata?.first_name || user.email?.split('@')[0]}
                </span>
                <ChevronDown size={14} />
              </button>
              {accountOpen && (
                <div className="user-dropdown">
                  <Link to="/my-orders" className="user-dropdown-item">
                    <Package size={14} /> My Orders
                  </Link>
                  <Link to="/my-courses" className="user-dropdown-item">
                    <BookOpen size={14} /> My Courses
                  </Link>
                  <Link to="/my-profile" className="user-dropdown-item">
                    <UserCircle size={14} /> My Profile
                  </Link>
                  <Link to="/wishlist" className="user-dropdown-item">
                    <Heart size={14} /> Wishlist
                  </Link>
                  <button
                    onClick={() => { setAccountOpen(false); signOut() }}
                    className="user-dropdown-item"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="login-btn">
                <User size={16} />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="signup-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
