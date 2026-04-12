import { create } from 'zustand'

const sampleOrders = [
  { id: 'on1', aggregatorId: 'swiggy', aggregatorName: 'Swiggy', orderNumber: 'SW-12345', customerName: 'John Doe', items: [{ name: 'Zinger Burger', quantity: 2 }, { name: 'Pepsi', quantity: 2 }], total: 656, platformStatus: 'received', createdAt: new Date().toISOString() },
  { id: 'on2', aggregatorId: 'zomato', aggregatorName: 'Zomato', orderNumber: 'ZM-98765', customerName: 'Jane Smith', items: [{ name: 'Chicken Burger', quantity: 1 }, { name: 'Fries', quantity: 1 }], total: 278, platformStatus: 'accepted', createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 'on3', aggregatorId: 'zepto', aggregatorName: 'Zepto', orderNumber: 'ZT-45678', customerName: 'Mike Johnson', items: [{ name: 'Choco Lava Cake', quantity: 2 }], total: 298, platformStatus: 'preparing', createdAt: new Date(Date.now() - 600000).toISOString() }
]

const sampleAggregators = [
  { id: 'swiggy', name: 'Swiggy', isActive: true, icon: '🟠', color: '#ff6600' },
  { id: 'zomato', name: 'Zomato', isActive: true, icon: '#cb202d', color: '#cb202d' },
  { id: 'zepto', name: 'Zepto', isActive: true, icon: '🟢', color: '#00a86b' }
]

export const useOnlineOrderStore = create((set, get) => ({
  onlineOrders: sampleOrders,
  aggregators: sampleAggregators,
  loading: false,
  
  fetchOnlineOrders: async () => {
    // Use local sample data
    set({ onlineOrders: sampleOrders, loading: false })
  },
  
  fetchAggregators: async () => {
    // Use local sample data
    set({ aggregators: sampleAggregators })
  },
  
  acceptOrder: async (aggregatorId, orderId, estimatedTime) => {
    // Local only
    set(state => ({
      onlineOrders: state.onlineOrders.map(o =>
        o.id === orderId ? { ...o, platformStatus: 'accepted' } : o
      )
    }))
  },
  
  updateStatus: async (aggregatorId, orderId, status) => {
    // Local only
    set(state => ({
      onlineOrders: state.onlineOrders.map(o =>
        o.id === orderId ? { ...o, platformStatus: status } : o
      )
    }))
  },
  
  toggleAggregatorStatus: async (id, isActive) => {
    // Local only
    set(state => ({
      aggregators: state.aggregators.map(a =>
        a.id === id ? { ...a, isActive } : a
      )
    }))
  },
  
  getOrdersByStatus: (status) => {
    return get().onlineOrders.filter(o => o.platformStatus === status)
  },
  
  getNewOrders: () => {
    return get().onlineOrders.filter(o => o.platformStatus === 'received')
  }
}))