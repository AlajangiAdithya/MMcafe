import { useEffect } from 'react'

const BRAND = 'Mastermind Brews'

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

/**
 * Updates document.title + the common SEO + OG tags whenever the deps change.
 *
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.description]
 * @param {string} [opts.image]      Absolute URL recommended for OG
 */
export function usePageMeta({ title, description, image }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${BRAND}` : BRAND
    document.title = fullTitle

    if (description) setMeta('description', description)
    setMeta('og:title', fullTitle, { property: true })
    if (description) setMeta('og:description', description, { property: true })
    if (image) setMeta('og:image', image, { property: true })
    setMeta('og:type', 'website', { property: true })
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    if (description) setMeta('twitter:description', description)
    if (image) setMeta('twitter:image', image)
  }, [title, description, image])
}
