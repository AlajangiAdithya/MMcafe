import { lazy, Suspense } from 'react'
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
import Home from './pages/Home'
import './App.css'

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
  // Mirror the typical page header + content rhythm so swapping in the real
  // page doesn't cause a layout shift. Height matches `100vh - nav` so the
  // footer doesn't pop into view, then back out, when the chunk arrives.
  return (
    <div className="route-fallback">
      <div className="route-fallback-spinner" aria-label="Loading">
        <span /><span /><span />
      </div>
    </div>
  )
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
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
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
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isAdmin && <Footer />}
      <CartDrawer />
      <CookieConsent />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1a1a2e', color: '#fff', border: '1px solid #2a2a4a' },
          duration: 3500,
        }}
        containerClassName="mm-toaster"
        containerStyle={{ bottom: 24, right: 16 }}
      />
    </div>
  )
}
