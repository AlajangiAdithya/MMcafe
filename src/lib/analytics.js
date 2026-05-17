// GA4 + Google Consent Mode v2.
//
// Loads gtag.js on boot with default consent denied for all four v2
// parameters, then sends a consent('update', ...) once the user clicks
// Accept/Reject in the cookie banner. This is the consent-mode flow Google
// requires for EEA traffic — see:
// https://developers.google.com/tag-platform/security/guides/consent

import { hasAnalyticsConsent } from '../components/CookieConsent'

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-3GKT443PLT'

let installed = false

export function installAnalytics() {
  if (installed || typeof window === 'undefined') return
  if (!GA_ID) return
  installed = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }

  // Default-deny must run BEFORE the gtag.js script tag, or the early
  // pageview leaves the page in an unknown consent state.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  })

  if (hasAnalyticsConsent()) {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    })
  }

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: true })
}

export function setAnalyticsConsent(granted) {
  if (typeof window === 'undefined' || !window.gtag) return
  const value = granted ? 'granted' : 'denied'
  window.gtag('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  })
}

export function track(event, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', event, params)
}

export function trackPageView(path) {
  if (typeof window === 'undefined' || !window.gtag || !GA_ID) return
  window.gtag('config', GA_ID, { page_path: path })
}
