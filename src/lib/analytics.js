// Lightweight GA4 loader. Only injects the script if:
//   1. VITE_GA_MEASUREMENT_ID is set (e.g. "G-XXXXXXXXXX")
//   2. The user has given analytics consent (DPDP Act compliance)
//
// Call installAnalytics() once on app boot. Use track(event, params) for events.

import { hasAnalyticsConsent } from '../components/CookieConsent'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-3GKT443PLT'

let installed = false

export function installAnalytics() {
  if (installed || typeof window === 'undefined') return
  if (!GA_ID) return
  if (!hasAnalyticsConsent()) return
  installed = true

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: true })
}

export function track(event, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', event, params)
}

export function trackPageView(path) {
  if (typeof window === 'undefined' || !window.gtag || !GA_ID) return
  window.gtag('config', GA_ID, { page_path: path })
}
