import { useEffect } from 'react'

const BRAND = 'Mastermind Brews'
export const SITE_ORIGIN = 'https://www.mastermindbrews.com'
// Default social-share image. 1024x682 (~1.5:1) renders cleanly on every
// platform; declaring the real dimensions lets the first scrape render the
// large card without a re-fetch. (The logo is 789x364 and was wrongly declared
// 1200x630, which broke card rendering.)
const DEFAULT_IMAGE = `${SITE_ORIGIN}/hero-bg.jpg`
const DEFAULT_IMAGE_W = 1024
const DEFAULT_IMAGE_H = 682
const DEFAULT_IMAGE_ALT = 'Inside Mastermind Bicycle Cafe & Bar, Mulund, Mumbai'

function setMeta(name, content, { property = false } = {}) {
  if (!content) return
  const attr = property ? 'property' : 'name'
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setLink(rel, href, extraAttrs = {}) {
  if (!href) return
  // Match by rel + any hreflang qualifier so we can manage <link rel="alternate" hreflang="…">
  // without clobbering siblings that target a different language.
  const selectorParts = [`link[rel="${rel}"]`]
  if (extraAttrs.hreflang) selectorParts.push(`[hreflang="${extraAttrs.hreflang}"]`)
  const selector = selectorParts.join('')
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
  for (const [k, v] of Object.entries(extraAttrs)) tag.setAttribute(k, v)
}

/**
 * Updates document.title + the common SEO + OG tags whenever the deps change.
 *
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.description]
 * @param {string} [opts.image]       Absolute URL recommended for OG
 * @param {string} [opts.keywords]    Comma-separated keywords for this page
 * @param {string} [opts.canonical]   Absolute URL; defaults to current pathname under SITE_ORIGIN
 * @param {string} [opts.type]        OG type, 'website' (default) or 'article'
 */
export function usePageMeta({ title, description, image, keywords, canonical, type = 'website', noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${BRAND}` : BRAND
    document.title = fullTitle

    // Robots: set explicitly on every route so SPA navigation between an
    // indexable page and a noindex page always resets correctly (the static
    // index.html ships index,follow, which would otherwise "stick").
    const robots = noindex
      ? 'noindex, follow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    setMeta('robots', robots)
    setMeta('googlebot', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1')

    // Canonical: per-route, defaults to current pathname so SPA pages don't all
    // collapse onto the homepage canonical declared in index.html.
    const url = canonical
      || (typeof window !== 'undefined' ? `${SITE_ORIGIN}${window.location.pathname}` : SITE_ORIGIN)
    setLink('canonical', url)
    setLink('alternate', url, { hreflang: 'en-IN' })
    setLink('alternate', url, { hreflang: 'x-default' })

    if (description) setMeta('description', description)
    if (keywords) setMeta('keywords', keywords)

    // Social image: fall back to a known-good default so every route shares a
    // proper card. Only declare width/height/type for the default (whose exact
    // dimensions we know); a custom per-page image declares alt only.
    const ogImage = image || DEFAULT_IMAGE
    const isDefaultImage = !image

    setMeta('og:site_name', BRAND, { property: true })
    setMeta('og:type', type, { property: true })
    setMeta('og:title', fullTitle, { property: true })
    if (description) setMeta('og:description', description, { property: true })
    setMeta('og:image', ogImage, { property: true })
    setMeta('og:image:alt', isDefaultImage ? DEFAULT_IMAGE_ALT : fullTitle, { property: true })
    if (isDefaultImage) {
      setMeta('og:image:secure_url', ogImage, { property: true })
      setMeta('og:image:type', 'image/jpeg', { property: true })
      setMeta('og:image:width', String(DEFAULT_IMAGE_W), { property: true })
      setMeta('og:image:height', String(DEFAULT_IMAGE_H), { property: true })
    }
    setMeta('og:url', url, { property: true })
    setMeta('og:locale', 'en_IN', { property: true })

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    if (description) setMeta('twitter:description', description)
    setMeta('twitter:image', ogImage)
    setMeta('twitter:image:alt', isDefaultImage ? DEFAULT_IMAGE_ALT : fullTitle)
    setMeta('twitter:url', url)
  }, [title, description, image, keywords, canonical, type, noindex])
}
