import { create } from 'zustand'

const STORAGE_KEY = 'tdg_cart_items'
const DETAILS_KEY = 'tdg_cart_details'

// Helper to parse price string e.g. "₹199", "199", "₹1,200" to number
export const parsePrice = (priceVal) => {
  if (typeof priceVal === 'number') return priceVal
  if (!priceVal) return 0
  const cleaned = String(priceVal).replace(/[^0-9.]/g, '')
  return parseFloat(cleaned) || 0
}

const loadInitialCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Failed to load cart from localStorage:', e)
  }
  return []
}

const loadInitialDetails = () => {
  try {
    const raw = localStorage.getItem(DETAILS_KEY)
    if (raw) return JSON.parse(raw)

    const custRaw = localStorage.getItem('customer_user')
    if (custRaw) {
      const cust = JSON.parse(custRaw)
      return {
        name: cust.name || '',
        phone: cust.phone || '',
        orderType: 'delivery',
        address: '',
        landmark: '',
        tableNo: '',
        notes: ''
      }
    }
  } catch (e) {}

  return {
    name: '',
    phone: '',
    orderType: 'delivery',
    address: '',
    landmark: '',
    tableNo: '',
    notes: ''
  }
}

export const useCartStore = create((set, get) => ({
  items: loadInitialCart(),
  details: loadInitialDetails(),
  lastAddedItem: null,

  addItem: (item) => {
    const numPrice = parsePrice(item.price)
    const currentItems = get().items
    const itemId = item.id || `item_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    const variant = item.variant || ''

    const existingIndex = currentItems.findIndex(
      (i) => i.id === itemId && (i.variant || '') === variant
    )

    let updated
    if (existingIndex > -1) {
      updated = currentItems.map((i, idx) =>
        idx === existingIndex
          ? { ...i, quantity: i.quantity + (item.quantity || 1) }
          : i
      )
    } else {
      const newItem = {
        id: itemId,
        name: item.name,
        price: numPrice,
        priceFormatted: `₹${numPrice}`,
        image: item.image || '/hero_wide_gyro.png',
        variant: variant,
        badge: item.badge || '',
        quantity: item.quantity || 1
      }
      updated = [...currentItems, newItem]
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {}

    set({ items: updated, lastAddedItem: { name: item.name, time: Date.now() } })
    return updated
  },

  updateQuantity: (id, variant, delta) => {
    const current = get().items
    const updated = current
      .map((item) => {
        if (item.id === id && (item.variant || '') === (variant || '')) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      })
      .filter(Boolean)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {}
    set({ items: updated })
  },

  removeItem: (id, variant) => {
    const updated = get().items.filter(
      (item) => !(item.id === id && (item.variant || '') === (variant || ''))
    )
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {}
    set({ items: updated })
  },

  clearCart: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {}
    set({ items: [] })
  },

  setDetails: (patch) => {
    const current = get().details
    const merged = { ...current, ...patch }
    try {
      localStorage.setItem(DETAILS_KEY, JSON.stringify(merged))
      if (patch.name || patch.phone) {
        const custRaw = localStorage.getItem('customer_user')
        const cust = custRaw ? JSON.parse(custRaw) : {}
        localStorage.setItem(
          'customer_user',
          JSON.stringify({ ...cust, name: merged.name, phone: merged.phone })
        )
      }
    } catch (e) {}
    set({ details: merged })
  },

  getTotalCount: () => {
    return get().items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  },

  getTotalAmount: () => {
    return get().items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  }
}))

