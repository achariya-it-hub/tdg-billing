import { create } from 'zustand'

const sampleCategories = [
  { id: 'c1', name: 'Gyros', color: '#e63946' },
  { id: 'c2', name: 'Burger', color: '#f59e0b' },
  { id: 'c3', name: 'Fried items', color: '#10b981' },
  { id: 'c4', name: 'Golden crunchy chicken', color: '#dc2626' },
  { id: 'c5', name: 'Golden Glaze Chicken', color: '#fbbf24' },
  { id: 'c6', name: 'Thick Shakes', color: '#8b5cf6' },
  { id: 'c7', name: 'Ice Cream', color: '#ec4899' },
  { id: 'c8', name: 'Desserts', color: '#f472b6' },
  { id: 'c9', name: 'Beverages', color: '#3b82f6' }
]

const sampleMenuItems = [
  { id: 'm1', categoryId: 'c1', name: 'Veg - BBQ Paneer', price: 100, isAvailable: 1 },
  { id: 'm2', categoryId: 'c1', name: 'Veg - Beetroot Falafal', price: 100, isAvailable: 1 },
  { id: 'm3', categoryId: 'c1', name: 'Veg - Mushroom Falafal', price: 100, isAvailable: 1 },
  { id: 'm4', categoryId: 'c1', name: 'Non-Veg - Sour Cream Chicken', price: 100, isAvailable: 1 },
  { id: 'm5', categoryId: 'c1', name: 'Non-Veg - BBQ Chicken', price: 100, isAvailable: 1 },
  { id: 'm6', categoryId: 'c1', name: 'Non-Veg - Peri Peri Chicken', price: 100, isAvailable: 1 },
  { id: 'm7', categoryId: 'c1', name: 'Non-Veg - Crunchy Chicken', price: 100, isAvailable: 1 },
  { id: 'm8', categoryId: 'c1', name: 'Non-Veg - Fried Fish', price: 100, isAvailable: 1 },
  { id: 'm9', categoryId: 'c1', name: 'Non-Veg - BBQ Prawn', price: 100, isAvailable: 1 },
  { id: 'm10', categoryId: 'c2', name: 'Veg - Spinach (veg meat)', price: 100, isAvailable: 1 },
  { id: 'm11', categoryId: 'c2', name: 'Veg - Beetroot', price: 100, isAvailable: 1 },
  { id: 'm12', categoryId: 'c2', name: 'Non-Veg - Fried Chicken', price: 100, isAvailable: 1 },
  { id: 'm13', categoryId: 'c2', name: 'Non-Veg - Sourcream Chicken', price: 100, isAvailable: 1 },
  { id: 'm14', categoryId: 'c2', name: 'Non-Veg - BBQ Chicken', price: 100, isAvailable: 1 },
  { id: 'm15', categoryId: 'c2', name: 'Non-Veg - Fish with Egg', price: 100, isAvailable: 1 },
  { id: 'm16', categoryId: 'c3', name: 'Veg Nuggets', price: 100, isAvailable: 1 },
  { id: 'm17', categoryId: 'c3', name: 'French Fries', price: 100, isAvailable: 1 },
  { id: 'm18', categoryId: 'c3', name: 'Chicken Nuggets', price: 100, isAvailable: 1 },
  { id: 'm19', categoryId: 'c3', name: 'Fish Finger', price: 100, isAvailable: 1 },
  { id: 'm20', categoryId: 'c4', name: 'Fried Chicken (1pc)', price: 69, isAvailable: 1 },
  { id: 'm21', categoryId: 'c4', name: 'Fried Chicken (2pc)', price: 129, isAvailable: 1 },
  { id: 'm22', categoryId: 'c4', name: 'Fried Chicken (4pc)', price: 249, isAvailable: 1 },
  { id: 'm23', categoryId: 'c4', name: 'Fried Chicken (8pc)', price: 499, isAvailable: 1 },
  { id: 'm24', categoryId: 'c4', name: 'Strips (3pc)', price: 119, isAvailable: 1 },
  { id: 'm25', categoryId: 'c4', name: 'Strips (6pc)', price: 229, isAvailable: 1 },
  { id: 'm26', categoryId: 'c4', name: 'Strips (9pc)', price: 349, isAvailable: 1 },
  { id: 'm27', categoryId: 'c4', name: 'Strips (12pc)', price: 479, isAvailable: 1 },
  { id: 'm28', categoryId: 'c4', name: 'Wings (3pc)', price: 109, isAvailable: 1 },
  { id: 'm29', categoryId: 'c4', name: 'Wings (6pc)', price: 219, isAvailable: 1 },
  { id: 'm30', categoryId: 'c4', name: 'Wings (9pc)', price: 329, isAvailable: 1 },
  { id: 'm31', categoryId: 'c4', name: 'Wings (12pc)', price: 429, isAvailable: 1 },
  { id: 'm32', categoryId: 'c5', name: 'Glaze Strips (3pc)', price: 149, isAvailable: 1 },
  { id: 'm33', categoryId: 'c5', name: 'Glaze Strips (6pc)', price: 299, isAvailable: 1 },
  { id: 'm34', categoryId: 'c5', name: 'Glaze Wings (3pc)', price: 149, isAvailable: 1 },
  { id: 'm35', categoryId: 'c5', name: 'Glaze Wings (6pc)', price: 299, isAvailable: 1 },
  { id: 'm36', categoryId: 'c6', name: 'Chocolate Blizzard', price: 100, isAvailable: 1 },
  { id: 'm37', categoryId: 'c6', name: 'Vanilla Blizzard', price: 100, isAvailable: 1 },
  { id: 'm38', categoryId: 'c6', name: 'Strawberry Blizzard', price: 100, isAvailable: 1 },
  { id: 'm39', categoryId: 'c7', name: 'Bourbon Softy', price: 59, isAvailable: 1 },
  { id: 'm40', categoryId: 'c7', name: 'Vanila Softy', price: 49, isAvailable: 1 },
  { id: 'm41', categoryId: 'c7', name: 'Choco Dip Softy', price: 89, isAvailable: 1 },
  { id: 'm42', categoryId: 'c7', name: 'Caramel Sundae', price: 69, isAvailable: 1 },
  { id: 'm43', categoryId: 'c7', name: 'Strawberry Sundae', price: 69, isAvailable: 1 },
  { id: 'm44', categoryId: 'c7', name: 'Chocolate Sundae', price: 69, isAvailable: 1 },
  { id: 'm45', categoryId: 'c8', name: 'Chocolate Donuts', price: 119, isAvailable: 1 },
  { id: 'm46', categoryId: 'c8', name: 'Vanila Donuts', price: 99, isAvailable: 1 },
  { id: 'm47', categoryId: 'c8', name: 'Tiramissu', price: 249, isAvailable: 1 },
  { id: 'm48', categoryId: 'c8', name: 'Redvelvet Cake', price: 249, isAvailable: 1 },
  { id: 'm49', categoryId: 'c8', name: 'Banoffee', price: 249, isAvailable: 1 },
  { id: 'm50', categoryId: 'c8', name: 'Caramel Hazelnut', price: 249, isAvailable: 1 },
  { id: 'm51', categoryId: 'c8', name: 'Chocolate Dome', price: 249, isAvailable: 1 },
  { id: 'm52', categoryId: 'c9', name: 'Coke', price: 39, isAvailable: 1 },
  { id: 'm53', categoryId: 'c9', name: 'Lemonade', price: 39, isAvailable: 1 },
  { id: 'm54', categoryId: 'c9', name: 'Kombhucha', price: 99, isAvailable: 1 }
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