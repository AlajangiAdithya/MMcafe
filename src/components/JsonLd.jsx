import { useEffect } from 'react'

/**
 * Injects a per-page JSON-LD <script> into <head>, keyed by `id` so it updates
 * on data change and is removed on unmount (clean SPA route transitions).
 * `data` is a plain JS object (the schema graph for this page).
 */
export default function JsonLd({ id, data }) {
  useEffect(() => {
    if (!data) return undefined
    const sid = `jsonld-${id}`
    let el = document.getElementById(sid)
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = sid
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)
    return () => { el.remove() }
  }, [id, data])
  return null
}
