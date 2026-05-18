import { supabase } from './supabase'

// Best-effort, fire-and-forget error logger. Writes to the error_logs table.
// Failures are swallowed, logging must never break the app.

let lastSent = 0
let recentKeys = new Map() // key -> timestamp, for de-duping bursts

function shouldSend(key) {
  const now = Date.now()
  // Global throttle: max 1 log per 500ms
  if (now - lastSent < 500) return false
  // Per-key dedupe: same error/message within 10s -> drop
  const seen = recentKeys.get(key)
  if (seen && now - seen < 10_000) return false
  recentKeys.set(key, now)
  // Keep map small
  if (recentKeys.size > 50) {
    const cutoff = now - 60_000
    for (const [k, t] of recentKeys) if (t < cutoff) recentKeys.delete(k)
  }
  lastSent = now
  return true
}

export async function logError(source, error, context) {
  try {
    const message = error?.message || String(error || 'unknown')
    const stack = error?.stack || null
    const key = `${source}|${message}`
    if (!shouldSend(key)) return

    let userId = null
    try {
      const { data } = await supabase.auth.getUser()
      userId = data?.user?.id || null
    } catch (_) { /* ignore */ }

    await supabase.from('error_logs').insert({
      source,
      user_id: userId,
      message: String(message).slice(0, 2000),
      stack: stack ? String(stack).slice(0, 8000) : null,
      context: context || null,
      url: typeof window !== 'undefined' ? window.location.href : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    })
  } catch (_) {
    // Never throw from the logger
  }
}

let installed = false
export function installGlobalErrorHandlers() {
  if (installed || typeof window === 'undefined') return
  installed = true

  window.addEventListener('error', (e) => {
    logError('window.error', e.error || new Error(e.message), {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    })
  })

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason
    const err = reason instanceof Error ? reason : new Error(typeof reason === 'string' ? reason : JSON.stringify(reason))
    logError('unhandledrejection', err)
  })
}
