import { useEffect } from 'react'

const BRAND = 'Mastermind Brews'
const SITE_ORIGIN = 'https://www.mastermindcafe.in'

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
 * @param {string} [opts.type]        OG type — 'website' (default) or 'article'
 */
export function usePageMeta({ title, description, image, keywords, canonical, type = 'website' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${BRAND}` : BRAND
    document.title = fullTitle

    // Canonical: per-route, defaults to current pathname so SPA pages don't all
    // collapse onto the homepage canonical declared in index.html.
    const url = canonical
      || (typeof window !== 'undefined' ? `${SITE_ORIGIN}${window.location.pathname}` : SITE_ORIGIN)
    setLink('canonical', url)
    setLink('alternate', url, { hreflang: 'en-IN' })
    setLink('alternate', url, { hreflang: 'x-default' })

    if (description) setMeta('description', description)
    if (keywords) setMeta('keywords', keywords)

    setMeta('og:site_name', BRAND, { property: true })
    setMeta('og:type', type, { property: true })
    setMeta('og:title', fullTitle, { property: true })
    if (description) setMeta('og:description', description, { property: true })
    if (image) setMeta('og:image', image, { property: true })
    setMeta('og:url', url, { property: true })
    setMeta('og:locale', 'en_IN', { property: true })

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    if (description) setMeta('twitter:description', description)
    if (image) setMeta('twitter:image', image)
    setMeta('twitter:url', url)
  }, [title, description, image, keywords, canonical, type])
}
