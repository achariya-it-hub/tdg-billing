import { create } from 'zustand'

export const useOfflineStore = create((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingRequests: [],
  
  init: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        set({ isOnline: true })
        get().syncPending()
      })
      
      window.addEventListener('offline', () => {
        set({ isOnline: false })
      })
    }
  },
  
  addPending: (request) => {
    set(state => ({ pendingRequests: [...state.pendingRequests, request] }))
  },
  
  syncPending: async () => {
    const { pendingRequests } = get()
    if (pendingRequests.length === 0) return
    
    for (const req of pendingRequests) {
      try {
        await fetch(req.url, req.options)
      } catch (e) {
        console.log('Failed to sync:', req)
      }
    }
    set({ pendingRequests: [] })
  },
  
  queueRequest: async (url, options) => {
    if (navigator.onLine) {
      try {
        return await fetch(url, options)
      } catch (e) {
        get().addPending({ url, options })
        throw e
      }
    } else {
      get().addPending({ url, options })
      return { ok: true, json: () => Promise.resolve({ offline: true }) }
    }
  }
}))

if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('SW registered:', registration.scope)
    }).catch((error) => {
      console.log('SW registration failed:', error)
    })
  }
}