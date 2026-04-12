import { create } from 'zustand'

const sampleCategories = [
  { id: 'c1', name: 'Burgers', color: '#e63946' },
  { id: 'c2', name: 'Chicken', color: '#f59e0b' },
  { id: 'c3', name: 'Sides', color: '#10b981' },
  { id: 'c4', name: 'Beverages', color: '#3b82f6' },
  { id: 'c5', name: 'Desserts', color: '#8b5cf6' },
  { id: 'c6', name: 'Combos', color: '#ec4899' }
]

const sampleMenuItems = [
  { id: 'm1', categoryId: 'c1', name: 'Zinger Burger', price: 249, isAvailable: 1 },
  { id: 'm2', categoryId: 'c1', name: 'Classic Burger', price: 199, isAvailable: 1 },
  { id: 'm3', categoryId: 'c1', name: 'Double Decker', price: 329, isAvailable: 1 },
  { id: 'm4', categoryId: 'c1', name: 'Veggie Burger', price: 179, isAvailable: 1 },
  { id: 'm5', categoryId: 'c2', name: 'Hot Wings (6pc)', price: 299, isAvailable: 1 },
  { id: 'm6', categoryId: 'c2', name: 'Hot Wings (12pc)', price: 449, isAvailable: 1 },
  { id: 'm7', categoryId: 'c2', name: 'Crispy Strips', price: 249, isAvailable: 1 },
  { id: 'm8', categoryId: 'c3', name: 'French Fries', price: 99, isAvailable: 1 },
  { id: 'm9', categoryId: 'c3', name: 'Coleslaw', price: 79, isAvailable: 1 },
  { id: 'm10', categoryId: 'c4', name: 'Pepsi (500ml)', price: 79, isAvailable: 1 },
  { id: 'm11', categoryId: 'c4', name: 'Masala Chai', price: 49, isAvailable: 1 },
  { id: 'm12', categoryId: 'c5', name: 'Choco Lava Cake', price: 149, isAvailable: 1 },
  { id: 'm13', categoryId: 'c6', name: 'Zinger Meal', price: 449, isAvailable: 1 }
]

export const useMenuStore = create((set, get) => ({
  categories: sampleCategories,
  menuItems: sampleMenuItems,
  loading: false,
  
  fetchCategories: async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : 'https://tdg-billing-production.up.railway.app'
      
      const res = await fetch(`${apiUrl}/api/menu/categories`)
      const data = await res.json()
      if (data && data.length > 0) {
        set({ categories: data })
        return
      }
    } catch (e) {
      console.log('Using local categories')
    }
    set({ categories: sampleCategories })
  },
  
  fetchMenuItems: async (categoryId) => {
    set({ loading: true })
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : 'https://tdg-billing-production.up.railway.app'
      
      const url = categoryId ? `${apiUrl}/api/menu/items?categoryId=${categoryId}` : `${apiUrl}/api/menu/items`
      const res = await fetch(url)
      const data = await res.json()
      if (data && data.length > 0) {
        set({ menuItems: data, loading: false })
        return
      }
    } catch (e) {
      console.log('Using local menu items')
    }
    if (categoryId) {
      set({ menuItems: sampleMenuItems.filter(i => i.categoryId === categoryId), loading: false })
    } else {
      set({ menuItems: sampleMenuItems, loading: false })
    }
  },
  
  toggleAvailability: async (itemId, isAvailable) => {
    set(state => ({
      menuItems: state.menuItems.map(item =>
        item.id === itemId ? { ...item, isAvailable } : item
      )
    }))
  }
}))