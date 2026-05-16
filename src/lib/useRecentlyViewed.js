import { useCallback, useEffect, useState } from 'react'

// Tracks the last N products a visitor opened, in localStorage. Used by Home
// to surface a "Recently viewed" strip and by the command palette as a small
// recency boost. Lives entirely on the client — no DB roundtrip.

const KEY = 'mm.recent.v1'
const MAX = 8

function read() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Number.isFinite) : []
  } catch {
    return []
  }
}

function write(ids) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* ignore */ }
}

export function pushRecentProduct(id) {
  const num = Number(id)
  if (!Number.isFinite(num)) return
  const current = read().filter((x) => x !== num)
  current.unshift(num)
  write(current.slice(0, MAX))
}

export function useRecentlyViewed() {
  const [ids, setIds] = useState(() => read())

  // Sync between tabs so opening a product in one updates Home in the other.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY) setIds(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const push = useCallback((id) => {
    pushRecentProduct(id)
    setIds(read())
  }, [])

  const clear = useCallback(() => {
    write([])
    setIds([])
  }, [])

  return { ids, push, clear }
}
