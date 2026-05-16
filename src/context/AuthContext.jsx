import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { upsertProfile, checkIsAdmin } from '../lib/database'
import { invalidateWishlistCache } from '../components/WishlistButton'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

// Wrap a promise with a timeout so a slow/hung Supabase call cannot
// block the whole app on first paint.
function withTimeout(promise, ms, fallback) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms)
    Promise.resolve(promise).then(
      (v) => { clearTimeout(timer); resolve(v) },
      () => { clearTimeout(timer); resolve(fallback) },
    )
  })
}

// Fire-and-forget profile bootstrapping; never throws.
async function ensureProfile(user) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!data) {
      await upsertProfile({
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
      })
    }
  } catch (err) {
    console.warn('ensureProfile non-fatal:', err)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Guard against race conditions: only the latest handleUser call wins
  const handleIdRef = useRef(0)

  // Apply user immediately, kick off profile/admin work in the background.
  // Never awaited by the caller; we don't want first paint to wait on these.
  const handleUser = useCallback((u) => {
    const id = ++handleIdRef.current
    setUser(u)

    if (!u) {
      if (handleIdRef.current === id) setIsAdmin(false)
      return
    }

    // Background: ensure profile + check admin, with timeouts so they
    // can never hang the UI.
    ;(async () => {
      await withTimeout(ensureProfile(u), 5000, undefined)
      const admin = await withTimeout(checkIsAdmin(u.id), 5000, false)
      if (handleIdRef.current === id) setIsAdmin(admin)
    })()
  }, [])

  useEffect(() => {
    let initialised = false
    let safetyTimer = null

    // Hard safety net: even if Supabase never responds, drop the loading
    // state after 3s so the app is interactive.
    safetyTimer = setTimeout(() => {
      if (!initialised) {
        initialised = true
        setLoading(false)
      }
    }, 3000)

    // 1. Restore session from storage
    withTimeout(supabase.auth.getSession(), 4000, { data: { session: null } })
      .then(({ data: { session } }) => {
        if (initialised) return
        initialised = true
        clearTimeout(safetyTimer)
        handleUser(session?.user ?? null)
        setLoading(false)
      })

    // 2. Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (initialised) return
        initialised = true
        clearTimeout(safetyTimer)
        handleUser(session?.user ?? null)
        setLoading(false)
        return
      }
      // For all other events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED)
      handleUser(session?.user ?? null)
    })

    return () => {
      if (safetyTimer) clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [handleUser])

  const signInWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUpWithEmail = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: metadata.firstName || '',
          last_name: metadata.lastName || '',
          full_name: `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim(),
        }
      }
    })
    if (error) throw error

    if (data.user) {
      try {
        await upsertProfile({
          id: data.user.id,
          email,
          firstName: metadata.firstName || '',
          lastName: metadata.lastName || '',
        })
      } catch (e) {
        console.error('Profile save error:', e)
      }
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
  }

  const signOut = async () => {
    // Clear cross-component caches before the auth state actually flips so
    // nothing reads the previous user's data on the way out.
    invalidateWishlistCache()
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('signOut error (clearing locally):', e)
    }
    // Manually clear any leftover Supabase auth tokens from storage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key)
      })
    } catch {}
    try { localStorage.removeItem('mmcafe.cart.v1') } catch {}
    setUser(null)
    setIsAdmin(false)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
