import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import CookieConsent from './components/CookieConsent'
import ErrorBoundary from './components/ErrorBoundary'
import CommandPalette from './components/CommandPalette'
import CoffeeLoader from './components/CoffeeLoader'
import CursorTrail from './components/CursorTrail'
import ContextCursor from './components/ContextCursor'
import ScrollProgress from './components/ScrollProgress'
import GlobalScrollReveal from './components/GlobalScrollReveal'
import FloatingBeans from './components/FloatingBeans'
import SmoothScroll from './components/SmoothScroll'
import TitleFlip from './components/TitleFlip'
import ScrollDockLogo from './components/ScrollDockLogo'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import './App.css'
import './styles/scroll-effects.css'
import './styles/animation-tokens.css'
import './styles/espresso-theme.css'
import './styles/books.css'

// Lazy-load every non-critical route. Home stays eager because it's the
// landing page; everything else is split into its own chunk so the initial
// payload only ships what's needed for first paint.
const Store = lazy(() => import('./pages/Store'))
const Academy = lazy(() => import('./pages/Academy'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const Admin = lazy(() => import('./pages/Admin'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const MyCourses = lazy(() => import('./pages/MyCourses'))
const MyLibrary = lazy(() => import('./pages/MyLibrary'))
const MyProfile = lazy(() => import('./pages/MyProfile'))
const CoursePlayer = lazy(() => import('./pages/CoursePlayer'))
const CourseDetail = lazy(() => import('./pages/CourseDetail'))
const CourseCheckout = lazy(() => import('./pages/CourseCheckout'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'))
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'))
const ContactUs = lazy(() => import('./pages/ContactUs'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const Consultancy = lazy(() => import('./pages/Consultancy'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Baristas = lazy(() => import('./pages/Baristas'))
const BaristaSignup = lazy(() => import('./pages/BaristaSignup'))

function RouteFallback() {
  return <CoffeeLoader label="Brewing your page…" />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function AppShell() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const isHome = location.pathname === '/'
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Global ⌘K / Ctrl+K to open the search palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className="app"
      style={{ position: 'relative' }}
      data-theme={isHome || isAdmin ? undefined : 'espresso'}
    >
      <a href="#main-content" className="skip-link">Skip to content</a>
      <SmoothScroll />
      <TitleFlip />
      <ScrollProgress />
      <GlobalScrollReveal />
      <CursorTrail />
      <ContextCursor />
      <Navbar onOpenSearch={() => setPaletteOpen(true)} />
      <ScrollDockLogo />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/store" element={<Store />} />
              <Route path="/workshop" element={<Academy />} />
              <Route path="/academy" element={<Navigate to="/workshop" replace />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/consultancy" element={<Consultancy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/baristas" element={<Baristas />} />
              <Route path="/barista-signup" element={<BaristaSignup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/my-library" element={<MyLibrary />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/course/:courseId/checkout" element={<CourseCheckout />} />
              <Route path="/learn/:courseId" element={<CoursePlayer />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/shipping" element={<ShippingPolicy />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAdmin && <Footer />}
      <CartDrawer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <CookieConsent />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#241712', color: '#F7EDDE', border: '1px solid rgba(216, 154, 82, 0.30)' },
          duration: 3500,
        }}
        containerClassName="mm-toaster"
        containerStyle={{ bottom: 24, right: 16 }}
      />
    </div>
  )
}
