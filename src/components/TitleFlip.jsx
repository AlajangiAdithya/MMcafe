import { useEffect } from 'react'

/**
 * TitleFlip, cravburgers.shop-style animated browser-tab title.
 *
 * While the tab is focused the real page title (set by usePageMeta) is
 * left untouched, so SEO / sharing / bookmarks stay correct. The moment
 * the visitor switches away, the tab text starts cycling through coffee
 * verbs ("Brewing…", "Roasting…", …) to pull them back. On return, the
 * exact title that was showing is restored.
 *
 * IMPORTANT: this drives entirely off the Page Visibility API and only ever
 * activates *after* the page has been genuinely visible to a real user. We
 * deliberately do NOT listen to window blur/focus: headless SEO/social
 * crawlers load pages without window focus, so a blur-driven flip would
 * overwrite every page's <title> with "☕ Brewing…" in the snapshot the
 * crawler captures — making every URL look like a duplicate title to Google
 * (and to audit tools). visibilitychange stays 'visible' for those crawlers,
 * so the real per-route title is what gets indexed. It also avoids false
 * flips when focus moves into an embedded iframe (e.g. Razorpay checkout).
 */
const PHRASES = [
  '☕ Brewing…',
  '☕ Roasting…',
  '☕ Steaming…',
  '☕ Pouring…',
  '☕ Frothing…',
  '☕ Come back ☕',
]

const STEP_MS = 2400

export default function TitleFlip() {
  useEffect(() => {
    if (typeof document === 'undefined') return

    let timer = null
    let savedTitle = document.title
    let i = 0
    // Only ever flip the title once a real user has actually seen the page.
    // Guards against crawlers/prerenders that snapshot before first paint.
    let hasBeenVisible = document.visibilityState === 'visible'

    const startCycling = () => {
      if (timer || !hasBeenVisible) return
      savedTitle = document.title
      i = 0
      // Show the first phrase immediately, then rotate.
      document.title = PHRASES[0]
      timer = window.setInterval(() => {
        i = (i + 1) % PHRASES.length
        document.title = PHRASES[i]
      }, STEP_MS)
    }

    const stopCycling = () => {
      if (timer) {
        window.clearInterval(timer)
        timer = null
        document.title = savedTitle
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        hasBeenVisible = true
        stopCycling()
      } else {
        startCycling()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stopCycling()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return null
}
