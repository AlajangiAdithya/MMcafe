import { useEffect, useState } from 'react'

/**
 * ChapterRail — fixed vertical indicator on the right edge that shows
 * which "chapter" of the page the user is currently scrolled into.
 *
 * Hidden on small screens, and skipped under reduced motion.
 *
 * Props:
 *   chapters — array of { id, num, label } where id matches a section's
 *              `data-chapter` attribute.
 */
export default function ChapterRail({ chapters }) {
  const [activeId, setActiveId] = useState(chapters[0]?.id)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const els = chapters
      .map((c) => document.querySelector(`[data-chapter="${c.id}"]`))
      .filter(Boolean)

    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry whose top is closest to the viewport's upper third.
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) {
          const top = visible.reduce((best, cur) =>
            cur.boundingClientRect.top < best.boundingClientRect.top ? cur : best,
          )
          setActiveId(top.target.getAttribute('data-chapter'))
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))

    // Hide rail when near the footer to avoid colliding with CTAs.
    const onScroll = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - window.innerHeight
      const ratio = total > 0 ? window.scrollY / total : 0
      setHidden(ratio > 0.94)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [chapters])

  return (
    <aside className={`chapter-rail ${hidden ? 'is-hidden' : ''}`} aria-hidden="true">
      <span className="chapter-rail-bar" />
      <ol className="chapter-rail-list">
        {chapters.map((c) => (
          <li
            key={c.id}
            className={`chapter-rail-item ${activeId === c.id ? 'is-active' : ''}`}
          >
            <span className="chapter-rail-ja">{c.num}</span>
            <span className="chapter-rail-label">{c.label}</span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
