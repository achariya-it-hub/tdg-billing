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
    const items = order.items || []
    
    if (items.length === 0) {
      throw new Error('No items in order')
    }
    
    const subtotal = get().getSubtotal()
    const tax = get().getTax()
    const total = get().getTotal()
    
    // Use demo mode (local storage) since Vercel API is not working properly
    // This allows orders to work offline and without backend
    const newOrder = {
      id: `ORD-${Date.now()}`,
      orderNumber: Date.now() % 10000 + 1000,
      type: order.type || 'dine-in',
      tableNumber: order.tableNumber || '',
      customerName: order.customerName || '',
      notes: order.notes || '',
      items: items.map(item => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes || '',
        status: 'pending'
      })),
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      source: 'pos',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    set(state => ({ orders: [newOrder, ...state.orders] }))
    get().clearOrder()
    return newOrder
  },
  
  fetchOrders: async () => {
    // Demo mode - just use local orders from storage
    // No API call needed since we're using local storage
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
