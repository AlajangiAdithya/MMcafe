import { useEffect, useState, useRef } from 'react'

/**
 * PolicyLayout — editorial wrapper for legal pages (Privacy, Terms,
 * Refund, Shipping). Inspired by kamalaire.com: a clean two-column
 * layout with a sticky table-of-contents on the left and serif-like
 * body copy on the right.
 *
 * The TOC auto-builds from the rendered <h2> headings inside the
 * content slot, so the wrapper is drop-in for the existing pages —
 * no copy or markup changes required in the legal text itself.
 *
 * On scroll, the currently-visible section is highlighted in the TOC.
 */
export default function PolicyLayout({ eyebrow, title, updated, children }) {
  const contentRef = useRef(null)
  const [sections, setSections] = useState([])
  const [activeId, setActiveId] = useState('')

  // Build TOC from rendered headings on mount and any time the children change.
  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    const headings = Array.from(root.querySelectorAll('h2'))
    const items = headings.map((h, i) => {
      // Reuse an existing id if present, otherwise derive one from the text.
      if (!h.id) {
        h.id = `policy-section-${i + 1}-${(h.textContent || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 48)}`
      }
      return { id: h.id, label: h.textContent || `Section ${i + 1}` }
    })
    setSections(items)
  }, [children])

  // Scroll-spy: which section is currently in view? IntersectionObserver
  // with a top-anchored rootMargin gives a stable, jank-free highlight.
  useEffect(() => {
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        // Pick the topmost visible section.
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        setActiveId(visible[0].target.id)
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0.01 }
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sections])

  // Soft fade-up on scroll for every block inside the body. Adds the
  // `reveal-in` class once an element scrolls into view.
  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const targets = root.querySelectorAll('section, h2, h3, p, ul, ol, .policy-contact')
    targets.forEach((el) => el.classList.add('reveal'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [children])

  return (
    <div className="policy-editorial">
      <header className="policy-editorial-header">
        <div className="container">
          {eyebrow && <span className="policy-editorial-eyebrow">{eyebrow}</span>}
          <h1 className="policy-editorial-title">{title}</h1>
          {updated && <p className="policy-editorial-updated">{updated}</p>}
        </div>
      </header>

      <div className="policy-editorial-grid container">
        <aside className="policy-editorial-toc" aria-label="On this page">
          <span className="policy-editorial-toc-label">On this page</span>
          <nav>
            <ol>
              {sections.map((s, i) => (
                <li key={s.id} className={activeId === s.id ? 'is-active' : ''}>
                  <a href={`#${s.id}`}>
                    <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="toc-label">{s.label.replace(/^\d+[A-Z]?\.\s*/, '')}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="policy-editorial-body" ref={contentRef}>
          {children}
        </article>
      </div>
    </div>
  )
}
