import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Menu, X, Shield, Package, BookOpen, ChevronDown, Heart, UserCircle, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

export default function Navbar({ onOpenSearch }) {
  const { user, isAdmin, signOut } = useAuth()
  const { count, setIsOpen } = useCart()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [menuOpen])

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

  // Client scope: only show Home, About, Buy Coffee, Learn Coffee, Our Projects.
  // Blog/Baristas routes still exist — just hidden from primary nav for now.
  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/store', label: 'Buy Coffee' },
    { to: '/workshop', label: 'Learn Coffee' },
    { to: '/consultancy', label: 'Our Projects' },
  ]

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="Mastermind Brews" />
          <div className="nav-logo-text">
            <span className="brand-name">Mastermind Brews</span>
            <span className="brand-sub">Est. Mulund, Mumbai</span>
          </div>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop nav (hidden on mobile via CSS) */}
        <div className="nav-center">
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

        {/* Mobile drawer: animated slide-in from the right */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                key="mobile-backdrop"
                className="nav-mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                key="mobile-drawer"
                className="nav-mobile-drawer"
                initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
                animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
                transition={{ type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="nav-mobile-head">
                  <span className="brand-name">Menu</span>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                  >
                    <X size={22} />
                  </button>
                </div>
                <nav className="nav-mobile-links">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
                {user ? (
                  <div className="nav-mobile-account">
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
                    {isAdmin && (
                      <Link to="/admin" className="user-dropdown-item">
                        <Shield size={14} /> Admin panel
                      </Link>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); signOut() }}
                      className="user-dropdown-item"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                ) : (
                  <div className="nav-mobile-auth">
                    <Link to="/login" className="btn btn-ghost full-width">
                      <User size={16} /> Login
                    </Link>
                    <Link to="/signup" className="btn btn-blue full-width">
                      Sign Up
                    </Link>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="nav-actions">
          {onOpenSearch && (
            <button
              className="cart-btn nav-search-btn"
              onClick={onOpenSearch}
              aria-label="Search (Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              <Search size={18} />
            </button>
          )}
          <button className="cart-btn" onClick={() => setIsOpen(true)} aria-label="Open cart">
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
