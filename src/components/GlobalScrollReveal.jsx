import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * GlobalScrollReveal, automatically tags common content elements with a
 * scroll-reveal class and animates them into view via IntersectionObserver.
 *
 * - Runs synchronously via useLayoutEffect so elements are hidden before
 *   first paint (no flash of unanimated content).
 * - A MutationObserver re-tags any nodes added later (lazy products,
 *   async fetched content, route changes).
 *
 * Opt out per element with `data-no-reveal`.
 */

const SELECTORS = [
  // Headings (any inside <main>)
  'main h1', 'main h2', 'main h3',
  // Generic body copy
  'main p',
  // Section-level grids and groups
  '.products-grid > *', '.courses-grid > *', '.blog-grid > *',
  '.featured-grid > *', '.mycourses-grid > *', '.contact-grid > *',
  '.values-grid > *', '.testimonials-grid > *',
  '.offer-pillars > *', '.offer-trust-strip > *', '.about-stats > *',
  '.academy-features > *', '.academy-floating-stats > *', '.academy-chips > *',
  '.visit-details > *', '.about-cafe-grid > *', '.about-namrata-creds > *',
  '.recently-viewed-row > *',
  // Cards (in case they appear outside the grids above)
  '.product-card', '.course-card', '.blog-card', '.featured-product',
  '.mycourse-card', '.myorders-card', '.testimonial-card', '.value-card',
  '.contact-card', '.recently-viewed-card', '.offer-pillar',
  '.offer-trust-item', '.stat-item', '.visit-detail', '.academy-feature',
  '.academy-mini-stat', '.academy-chip', '.about-cafe-card',
  '.about-namrata-cred', '.feature-card',
  // Other prominent blocks
  '.section-header', '.section-label', '.section-desc', '.section-title',
  // Editorial sections (About / Consultancy): eyebrow labels + checklist
  '.ed-section-label', '.ed-suited-list > *', '.ed-projects-lede', '.ed-badge',
  '.about-intro-grid', '.about-intro-media', '.about-intro-text',
  '.visit-card', '.visit-info', '.press-row', '.press-copy',
  '.press-clipping-wrap', '.newsletter-content', '.hero-btns',
  '.cta-card', '.categories-band .stat-item',
  // Images inside main content
  'main img:not(.no-reveal)',
]

const ZOOM_CLASS_HINTS = [
  'product-card', 'course-card', 'blog-card', 'featured-product',
  'mycourse-card', 'testimonial-card', 'value-card', 'contact-card',
  'recently-viewed-card', 'offer-pillar', 'offer-trust-item', 'stat-item',
  'academy-feature', 'academy-mini-stat', 'about-cafe-card',
  'about-namrata-cred', 'feature-card', 'visit-detail', 'visit-card',
  'cta-card',
]

const SKIP_ANCESTORS = [
  '.navbar', '.footer', '.cart-drawer', '.command-palette',
  '.modal-overlay', '.detail-modal', '.hero', '.page-hero',
  '.about-hero', '.store-hero', '.academy-hero', '.intro-overlay',
]

function isInsideSkipped(el) {
  for (const sel of SKIP_ANCESTORS) {
    if (el.closest(sel)) return true
  }
  return false
}

function pickVariant(el) {
  const cls = el.classList
  for (const z of ZOOM_CLASS_HINTS) if (cls.contains(z)) return 'sr-zoom-in'
  if (el.tagName === 'IMG' || el.tagName === 'PICTURE') return 'sr-image-clip'
  if (el.tagName === 'H1' || el.tagName === 'H2') return 'sr-fade-up sr-strong'
  return 'sr-fade-up'
}

function tagElements(root, io) {
  if (!root) return
  const found = new Set()
  for (const sel of SELECTORS) {
    try {
      root.querySelectorAll(sel).forEach((el) => {
        if (el.dataset.srTagged) return
        if (el.hasAttribute('data-no-reveal')) return
        if (el.classList.contains('sr')) return
        if (el.classList.contains('reveal')) return
        // Skip anything framer-motion is already animating (it sets inline
        // transform/opacity styles which would fight ours).
        if (el.style && (el.style.opacity !== '' || el.style.transform !== '')) return
        // Also skip elements whose ancestor is being animated by motion,
        // animating both parent and child causes visual jitter.
        const motionAncestor = el.closest('[style*="opacity"], [style*="transform"]')
        if (motionAncestor && motionAncestor !== el && motionAncestor.contains(el)) return
        if (isInsideSkipped(el)) return
        found.add(el)
      })
    } catch {
      /* ignore */
    }
  }
  if (found.size === 0) return

  // Group by parent for staggered delays.
  const grouped = new Map()
  found.forEach((el) => {
    const parent = el.parentElement || document.body
    if (!grouped.has(parent)) grouped.set(parent, [])
    grouped.get(parent).push(el)
  })

  grouped.forEach((children) => {
    children.forEach((el, idx) => {
      const variant = pickVariant(el)
      el.classList.add('sr', ...variant.split(' '))
      el.dataset.srTagged = '1'
      const delay = Math.min(idx * 70, 420)
      if (delay > 0) el.style.setProperty('--sr-delay', `${delay}ms`)
      io.observe(el)
    })
  })
}

export default function GlobalScrollReveal() {
  const location = useLocation()

  // Tag synchronously before paint so users never see unanimated content.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('sr-in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -4% 0px' },
    )

    const main = document.querySelector('main') || document.body
    tagElements(main, io)

    return () => io.disconnect()
  }, [location.pathname])

  // Watch for late-arriving DOM nodes (async fetches, lazy-loaded chunks).
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('sr-in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -4% 0px' },
    )

    const main = document.querySelector('main') || document.body
    let queued = false
    const mo = new MutationObserver(() => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        tagElements(main, io)
      })
    })
    mo.observe(main, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
    }
  }, [location.pathname])

  return null
}
