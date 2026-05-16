import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { addToWishlist, removeFromWishlist, getWishlist } from '../lib/database'
import toast from 'react-hot-toast'

// Lightweight in-memory cache so multiple buttons share a single wishlist load.
// Reset whenever the active userId changes so user A's IDs never leak to user B.
let cache = { userId: null, ids: null, promise: null }

async function loadIds(userId) {
  if (cache.userId !== userId) {
    cache = { userId, ids: null, promise: null }
  }
  if (cache.ids) return cache.ids
  if (cache.promise) return cache.promise
  cache.promise = getWishlist(userId)
    .then((rows) => {
      // Bail if a different user signed in while the request was in flight.
      if (cache.userId !== userId) return new Set()
      cache.ids = new Set(rows.map((r) => r.product_id))
      return cache.ids
    })
    .catch(() => new Set())
  return cache.promise
}

export function invalidateWishlistCache() { cache = { userId: null, ids: null, promise: null } }

export default function WishlistButton({ productId, className = '', size = 16, stopProp = true }) {
  const { user } = useAuth()
  const [active, setActive] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) {
      invalidateWishlistCache()
      setActive(false)
      return
    }
    let cancelled = false
    loadIds(user.id).then((ids) => {
      if (!cancelled) setActive(ids.has(productId))
    })
    return () => { cancelled = true }
  }, [user, productId])

  const toggle = async (e) => {
    if (stopProp) e.stopPropagation()
    if (!user) return toast.error('Login to save items')
    setBusy(true)
    try {
      if (active) {
        await removeFromWishlist(user.id, productId)
        cache.ids?.delete(productId)
        setActive(false)
      } else {
        await addToWishlist(user.id, productId)
        cache.ids?.add(productId)
        setActive(true)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={`wishlist-btn ${active ? 'active' : ''} ${className}`}
      onClick={toggle}
      disabled={busy}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      title={active ? 'Saved' : 'Save'}
    >
      <Heart size={size} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}
