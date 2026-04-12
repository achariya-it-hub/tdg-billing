import { create } from 'zustand'

export const useOnlineOrderStore = create((set, get) => ({
  onlineOrders: [],
  aggregators: [],
  loading: false,
  
  fetchOnlineOrders: async (params = {}) => {
    set({ loading: true })
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`/api/aggregators/orders${query ? `?${query}` : ''}`)
    const data = await res.json()
    set({ onlineOrders: data, loading: false })
  },
  
  fetchAggregators: async () => {
    const res = await fetch('/api/aggregators')
    const data = await res.json()
    set({ aggregators: data })
  },
  
  acceptOrder: async (aggregatorId, orderId, estimatedTime) => {
    await fetch(`/api/aggregators/${aggregatorId}/accept/${orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimatedTime })
    })
    set(state => ({
      onlineOrders: state.onlineOrders.map(o =>
        o.id === orderId ? { ...o, platformStatus: 'accepted' } : o
      )
    }))
  },
  
  updateStatus: async (aggregatorId, orderId, status) => {
    await fetch(`/api/aggregators/${aggregatorId}/status/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    set(state => ({
      onlineOrders: state.onlineOrders.map(o =>
        o.id === orderId ? { ...o, platformStatus: status } : o
      )
    }))
  },
  
  toggleAggregatorStatus: async (id, isActive) => {
    await fetch(`/api/aggregators/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    })
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
