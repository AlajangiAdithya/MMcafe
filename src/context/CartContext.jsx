import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { getServerCart, syncServerCart, getProducts } from '../lib/database'

const CartContext = createContext({})

export const useCart = () => useContext(CartContext)

const STORAGE_KEY = 'mmcafe.cart.v1'

function loadInitial() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState(loadInitial)
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const lastUserIdRef = useRef(null)

  // Persist locally on every change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch { /* quota errors ignored */ }
  }, [items])

  // Hydrate from server when user signs in; merge with local cart
  useEffect(() => {
    if (!user) {
      lastUserIdRef.current = null
      setHydrated(true)
      return
    }
    if (lastUserIdRef.current === user.id) return
    lastUserIdRef.current = user.id

    let cancelled = false
    // Safety: even if server is slow/unreachable, mark hydrated after 6s
    // so adds-to-cart will sync going forward.
    const safety = setTimeout(() => { if (!cancelled) setHydrated(true) }, 6000)
    ;(async () => {
      try {
        const [serverRows, allProducts] = await Promise.all([
          getServerCart(user.id).catch(() => []),
          getProducts().catch(() => []),
        ])
        if (cancelled) return

        const productMap = new Map(allProducts.map((p) => [p.id, p]))
        const serverItems = serverRows
          .map((r) => {
            const p = r.products || productMap.get(r.product_id)
            if (!p) return null
            return {
              id: p.id, name: p.name, price: p.price, image: p.image,
              category: p.category, weight: p.weight, qty: r.qty,
            }
          })
          .filter(Boolean)

        // Merge: max qty wins for duplicates
        setItems((local) => {
          const map = new Map()
          for (const it of serverItems) map.set(it.id, it)
          for (const it of local) {
            const existing = map.get(it.id)
            map.set(it.id, existing
              ? { ...existing, qty: Math.max(existing.qty, it.qty) }
              : it)
          }
          const merged = Array.from(map.values())
          // Push merged back to the server (fire-and-forget)
          syncServerCart(user.id, merged.map((i) => ({ id: i.id, qty: i.qty }))).catch(() => {})
          return merged
        })
      } finally {
        clearTimeout(safety)
        if (!cancelled) setHydrated(true)
      }
    })()

    return () => { cancelled = true; clearTimeout(safety) }
  }, [user])

  // Whenever items change AND user is signed in, debounce-sync to server
  useEffect(() => {
    if (!user || !hydrated) return
    const t = setTimeout(() => {
      syncServerCart(user.id, items.map((i) => ({ id: i.id, qty: i.qty }))).catch(() => {})
    }, 600)
    return () => clearTimeout(t)
  }, [items, user, hydrated])

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
  }

  const clearCart = () => {
    setItems([])
    try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* noop */ }
    if (user) syncServerCart(user.id, []).catch(() => {})
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      total, count, isOpen, setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}
