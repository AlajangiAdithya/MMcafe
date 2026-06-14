import { useEffect } from 'react'

/**
 * TitleFlip, cravburgers.shop-style animated browser-tab title.
 *
 * While the tab is focused the real page title (set by usePageMeta) is
 * left untouched, so SEO / sharing / bookmarks stay correct. The moment
 * the visitor switches away, the tab text starts cycling through coffee
 * verbs ("Brewing…", "Roasting…", …) to pull them back. On return, the
 * exact title that was showing is restored.
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

    const startCycling = () => {
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
      if (document.hidden) startCycling()
      else stopCycling()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', startCycling)
    window.addEventListener('focus', stopCycling)

    return () => {
      stopCycling()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', startCycling)
      window.removeEventListener('focus', stopCycling)
    }
  }, [])

  return null
}
