import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { installGlobalErrorHandlers } from './lib/errorLogger.js'
import { installAnalytics } from './lib/analytics.js'

// Open the Supabase TCP/TLS connection in parallel with the rest of bootstrap
// so the first auth/data request doesn't pay the full RTT cost. Cheap, idempotent.
function preconnectSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL
  if (!url || typeof document === 'undefined') return
  try {
    const origin = new URL(url).origin
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    link.crossOrigin = ''
    document.head.appendChild(link)
  } catch { /* ignore bad URL */ }
}
preconnectSupabase()

installGlobalErrorHandlers()
installAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
