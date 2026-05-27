import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../lib/analytics'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Lenis (when present) owns the scroll position. Reset via its API so
    // momentum/inertia don't fight the jump. Falls back to native otherwise.
    if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
      window.__lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
    trackPageView(pathname)
  }, [pathname])

  return null
}
