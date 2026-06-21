import { create } from 'zustand'

export const useOnlineOrderStore = create((set, get) => ({
  onlineOrders: [],
  aggregators: [],
  loading: false,

  getApiUrl: () => {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : window.location.origin
  },

  fetchOnlineOrders: async () => {
    try {
      const res = await fetch(`${get().getApiUrl()}/api/online-orders`)
      if (res.ok) set({ onlineOrders: await res.json(), loading: false })
    } catch (err) {
      console.error('Failed to fetch online orders:', err)
      set({ loading: false })
    }
  },

  fetchAggregators: async () => {
    try {
      const res = await fetch(`${get().getApiUrl()}/api/online-orders/aggregators`)
      if (res.ok) set({ aggregators: await res.json() })
    } catch (err) {
      console.error('Failed to fetch aggregators:', err)
    }
  },

  acceptOrder: async (aggregator, orderId, estimatedTime) => {
    try {
      const res = await fetch(`${get().getApiUrl()}/api/online-orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimatedTime })
      })
      if (res.ok) {
        const updated = await res.json()
        set(state => ({
          onlineOrders: state.onlineOrders.map(o => o.id === orderId ? updated : o)
        }))
      }
    } catch (err) {
      console.error('Failed to accept order:', err)
    }
  },

  updateStatus: async (aggregator, orderId, status) => {
    try {
      const res = await fetch(`${get().getApiUrl()}/api/online-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformStatus: status })
      })
      if (res.ok) {
        const updated = await res.json()
        set(state => ({
          onlineOrders: state.onlineOrders.map(o => o.id === orderId ? updated : o)
        }))
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  },

  submitManualOrder: async (orderData) => {
    try {
      const res = await fetch(`${get().getApiUrl()}/api/online-orders/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      if (res.ok) {
        const created = await res.json()
        set(state => ({ onlineOrders: [created, ...state.onlineOrders] }))
        return created
      }
    } catch (err) {
      console.error('Failed to submit manual order:', err)
    }
    return null
  },

  toggleAggregatorStatus: async (id, isActive) => {
    try {
      const res = await fetch(`${get().getApiUrl()}/api/online-orders/aggregators/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive })
      })
      if (res.ok) set({ aggregators: await res.json() })
    } catch (err) {
      console.error('Failed to toggle aggregator:', err)
    }
  },

  getOrdersByStatus: (status) => {
    return get().onlineOrders.filter(o => o.platformStatus === status)
  },

  getNewOrders: () => {
    return get().onlineOrders.filter(o => o.platformStatus === 'received')
  }
}))