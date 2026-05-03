import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'mmcafe_consent_v1'

export function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    return JSON.parse(raw)?.analytics === true
  } catch {
    return false
  }
}

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  function save(decision) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...decision, ts: new Date().toISOString() }),
      )
    } catch { /* ignore */ }
    setShow(false)
    // Reload so analytics scripts can pick up the new consent state.
    if (decision.analytics) window.location.reload()
  }

  if (!show) return null

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite">
      <div className="cookie-consent-inner">
        <p className="cookie-consent-text">
          We use cookies for essential site features and, with your consent,
          analytics to improve our service. Read our{' '}
          <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>
        <div className="cookie-consent-actions">
          <button
            className="btn btn-ghost"
            onClick={() => save({ essential: true, analytics: false })}
          >
            Reject non-essential
          </button>
          <button
            className="btn btn-blue"
            onClick={() => save({ essential: true, analytics: true })}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
