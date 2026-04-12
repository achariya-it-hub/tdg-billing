import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useOrderStore = create(
  persist(
    (set, get) => ({
  currentOrder: {
    items: [],
    type: 'dine-in',
    tableNumber: '',
    customerName: '',
    notes: ''
  },
  orders: [],
  heldOrders: [],
  
  addItem: (item) => {
    set(state => {
      const existingIndex = state.currentOrder.items.findIndex(
        i => i.menuItemId === item.menuItemId && i.variantId === item.variantId
      )
      
      if (existingIndex >= 0) {
        const newItems = [...state.currentOrder.items]
        newItems[existingIndex].quantity += 1
        newItems[existingIndex].totalPrice = newItems[existingIndex].unitPrice * newItems[existingIndex].quantity
        return { currentOrder: { ...state.currentOrder, items: newItems } }
      }
      
      return {
        currentOrder: {
          ...state.currentOrder,
          items: [...state.currentOrder.items, { ...item, quantity: 1 }]
        }
      }
    })
  },
  
  updateItemQuantity: (index, quantity) => {
    if (quantity <= 0) {
      get().removeItem(index)
      return
    }
    set(state => {
      const newItems = [...state.currentOrder.items]
      newItems[index].quantity = quantity
      newItems[index].totalPrice = newItems[index].unitPrice * quantity
      return { currentOrder: { ...state.currentOrder, items: newItems } }
    })
  },
  
  removeItem: (index) => {
    set(state => ({
      currentOrder: {
        ...state.currentOrder,
        items: state.currentOrder.items.filter((_, i) => i !== index)
      }
    }))
  },
  
  setOrderType: (type) => {
    set(state => ({ currentOrder: { ...state.currentOrder, type } }))
  },
  
  setTableNumber: (tableNumber) => {
    set(state => ({ currentOrder: { ...state.currentOrder, tableNumber } }))
  },
  
  setCustomerName: (customerName) => {
    set(state => ({ currentOrder: { ...state.currentOrder, customerName } }))
  },
  
  setNotes: (notes) => {
    set(state => ({ currentOrder: { ...state.currentOrder, notes } }))
  },
  
  clearOrder: () => {
    set({
      currentOrder: {
        items: [],
        type: 'dine-in',
        tableNumber: '',
        customerName: '',
        notes: ''
      }
    })
  },
  
  holdOrder: () => {
    const order = get().currentOrder
    if (order.items.length === 0) return
    set(state => ({
      heldOrders: [...state.heldOrders, { ...order, id: Date.now() }]
    }))
    get().clearOrder()
  },
  
  recallOrder: (index) => {
    const order = get().heldOrders[index]
    if (!order) return
    set(state => ({
      currentOrder: order,
      heldOrders: state.heldOrders.filter((_, i) => i !== index)
    }))
  },
  
  getSubtotal: () => {
    return get().currentOrder.items.reduce((sum, item) => sum + item.totalPrice, 0)
  },
  
  getTax: () => {
    return get().getSubtotal() * 0.18
  },
  
  getTotal: () => {
    return get().getSubtotal() + get().getTax()
  },
  
  placeOrder: async (paymentMethod) => {
    const order = get().currentOrder
    const subtotal = get().getSubtotal()
    const tax = get().getTax()
    const total = get().getTotal()
    
    // Try API first, fall back to demo mode
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...order,
          subtotal,
          tax,
          total,
          paymentMethod
        })
      })
      
      if (!res.ok) throw new Error('API failed')
      const newOrder = await res.json()
      set(state => ({ orders: [newOrder, ...state.orders] }))
    } catch (err) {
      // Demo mode - create local order
      const demoOrder = {
        id: `ORD-${Date.now()}`,
        ...order,
        subtotal,
        tax,
        total,
        paymentMethod,
        status: 'ready',
        createdAt: new Date().toISOString()
      }
      set(state => ({ orders: [demoOrder, ...state.orders] }))
    }
    
    try {
      const orderItems = order.items.map(item => ({
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        quantity: item.quantity
      }))
      
      await fetch('/api/recipes/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderItems })
      })
      
      // Send KOT to kitchen via WebSocket
      const io = await import('../lib/socket')
      if (io.default) {
        io.default.emit('kot:create', {
          ...order,
          items: order.items.map(item => ({
            name: item.menuItemName,
            quantity: item.quantity,
            notes: item.notes || ''
          }))
        })
      }
    } catch (err) {
      console.warn('Failed to process order:', err)
    }
    
    get().clearOrder()
    return get().orders[0]
  },
  
  fetchOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`/api/orders${query ? `?${query}` : ''}`)
    const data = await res.json()
    set({ orders: data })
  }
}),
    {
      name: 'tdg-orders-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        currentOrder: state.currentOrder,
        orders: state.orders,
        heldOrders: state.heldOrders
      })
    }
  )
)
