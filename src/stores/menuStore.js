import { create } from 'zustand'

const sampleCategories = [
  { id: 'c1', name: 'Gyros', color: '#e63946' },
  { id: 'c2', name: 'Burger', color: '#f59e0b' },
  { id: 'c3', name: 'Salads', color: '#10b981' },
  { id: 'c4', name: 'Sides', color: '#dc2626' },
  { id: 'c5', name: 'TDG Crispy Chicken', color: '#fbbf24' },
  { id: 'c6', name: 'Thick Shakes', color: '#8b5cf6' },
  { id: 'c7', name: 'Softy', color: '#ec4899' },
  { id: 'c8', name: 'Desserts', color: '#f472b6' },
  { id: 'c9', name: 'Beverages', color: '#3b82f6' }
]

const sampleMenuItems = [
  // Gyros (c1)
  { id: 'm1', categoryId: 'c1', name: 'Non-Veg - Spicy Chicken Gyro (Regular)', price: 99, isAvailable: 1 },
  { id: 'm2', categoryId: 'c1', name: 'Non-Veg - Spicy Chicken Gyro (Large)', price: 249, isAvailable: 1 },
  { id: 'm3', categoryId: 'c1', name: 'Non-Veg - Cream Chicken Gyro (Regular)', price: 99, isAvailable: 1 },
  { id: 'm4', categoryId: 'c1', name: 'Non-Veg - Cream Chicken Gyro (Large)', price: 249, isAvailable: 1 },
  { id: 'm5', categoryId: 'c1', name: 'Non-Veg - BBQ Chicken Gyro (Regular)', price: 99, isAvailable: 1 },
  { id: 'm6', categoryId: 'c1', name: 'Non-Veg - BBQ Chicken Gyro (Large)', price: 249, isAvailable: 1 },
  { id: 'm7', categoryId: 'c1', name: 'Non-Veg - Pesto Chicken Gyro (Regular)', price: 99, isAvailable: 1 },
  { id: 'm8', categoryId: 'c1', name: 'Non-Veg - Pesto Chicken Gyro (Large)', price: 249, isAvailable: 1 },
  { id: 'm9', categoryId: 'c1', name: 'Veg - Spicy Paneer Gyro (Regular)', price: 99, isAvailable: 1 },
  { id: 'm10', categoryId: 'c1', name: 'Veg - Spicy Paneer Gyro (Large)', price: 249, isAvailable: 1 },
  { id: 'm11', categoryId: 'c1', name: 'Veg - Cream Paneer Gyro (Regular)', price: 99, isAvailable: 1 },
  { id: 'm12', categoryId: 'c1', name: 'Veg - Cream Paneer Gyro (Large)', price: 249, isAvailable: 1 },
  { id: 'm13', categoryId: 'c1', name: 'Veg - BBQ Paneer Gyro (Regular)', price: 99, isAvailable: 1 },
  { id: 'm14', categoryId: 'c1', name: 'Veg - BBQ Paneer Gyro (Large)', price: 249, isAvailable: 1 },
  { id: 'm15', categoryId: 'c1', name: 'Veg - Pesto Paneer Gyro (Regular)', price: 99, isAvailable: 1 },
  { id: 'm16', categoryId: 'c1', name: 'Veg - Pesto Paneer Gyro (Large)', price: 249, isAvailable: 1 },

  // Burgers (c2)
  { id: 'm17', categoryId: 'c2', name: 'Non-Veg - Spicy Egg Burger', price: 79, isAvailable: 1 },
  { id: 'm18', categoryId: 'c2', name: 'Non-Veg - Crispy Chicken Burger', price: 99, isAvailable: 1 },
  { id: 'm19', categoryId: 'c2', name: 'Veg - Spicy Paneer Burger', price: 99, isAvailable: 1 },

  // Salads (c3)
  { id: 'm20', categoryId: 'c3', name: 'Non-Veg - Chicken Salad', price: 99, isAvailable: 1 },
  { id: 'm21', categoryId: 'c3', name: 'Veg - Paneer Salad', price: 99, isAvailable: 1 },

  // Sides (c4)
  { id: 'm22', categoryId: 'c4', name: 'Non-Veg - Loaded Chicken Fries', price: 199, isAvailable: 1 },
  { id: 'm23', categoryId: 'c4', name: 'Veg - Fries (Salted, Peri Peri Or Cajun)', price: 99, isAvailable: 1 },
  { id: 'm24', categoryId: 'c4', name: 'Veg - Loaded Paneer Fries', price: 199, isAvailable: 1 },
  { id: 'm25', categoryId: 'c4', name: 'Veg - 6 pcs Halloumi Strips', price: 149, isAvailable: 1 },

  // TDG Crispy Chicken (c5)
  // Leg & Thigh
  { id: 'm26', categoryId: 'c5', name: 'Non-Veg - 1 Pc Crispy Chicken (1 Dip)', price: 70, isAvailable: 1 },
  { id: 'm27', categoryId: 'c5', name: 'Non-Veg - 2 Pc Crispy Chicken (1 Dip)', price: 140, isAvailable: 1 },
  { id: 'm28', categoryId: 'c5', name: 'Non-Veg - 4 Pc Crispy Chicken (2 Dip)', price: 280, isAvailable: 1 },
  { id: 'm29', categoryId: 'c5', name: 'Non-Veg - 8 Pc Crispy Chicken (4 Dip)', price: 560, isAvailable: 1 },
  { id: 'm30', categoryId: 'c5', name: 'Non-Veg - 12 Pc Crispy Chicken (6 Dip)', price: 840, isAvailable: 1 },
  // Wings
  { id: 'm31', categoryId: 'c5', name: 'Non-Veg - 3 Pc Crispy Wings (1 Dip)', price: 90, isAvailable: 1 },
  { id: 'm32', categoryId: 'c5', name: 'Non-Veg - 6 Pc Crispy Wings (2 Dip)', price: 180, isAvailable: 1 },
  { id: 'm33', categoryId: 'c5', name: 'Non-Veg - 9 Pc Crispy Wings (3 Dip)', price: 270, isAvailable: 1 },
  { id: 'm34', categoryId: 'c5', name: 'Non-Veg - 20 Pc Crispy Wings (6 Dip)', price: 600, isAvailable: 1 },
  { id: 'm35', categoryId: 'c5', name: 'Non-Veg - 60 Pc Crispy Wings (12 Dip)', price: 1500, isAvailable: 1 },
  // Strips
  { id: 'm36', categoryId: 'c5', name: 'Non-Veg - 3 Pc Crispy Strips (1 Dip)', price: 120, isAvailable: 1 },
  { id: 'm37', categoryId: 'c5', name: 'Non-Veg - 6 Pc Crispy Strips (2 Dip)', price: 240, isAvailable: 1 },
  { id: 'm38', categoryId: 'c5', name: 'Non-Veg - 9 Pc Crispy Strips (3 Dip)', price: 360, isAvailable: 1 },
  { id: 'm39', categoryId: 'c5', name: 'Non-Veg - 20 Pc Crispy Strips (6 Dip)', price: 800, isAvailable: 1 },
  { id: 'm40', categoryId: 'c5', name: 'Non-Veg - 60 Pc Crispy Strips (12 Dip)', price: 2400, isAvailable: 1 },

  // Thick Shakes (c6)
  { id: 'm41', categoryId: 'c6', name: 'Veg - Vanilla Shake (Regular)', price: 79, isAvailable: 1 },
  { id: 'm42', categoryId: 'c6', name: 'Veg - Vanilla Shake (Large)', price: 139, isAvailable: 1 },
  { id: 'm43', categoryId: 'c6', name: 'Veg - Strawberry Shake (Regular)', price: 79, isAvailable: 1 },
  { id: 'm44', categoryId: 'c6', name: 'Veg - Strawberry Shake (Large)', price: 139, isAvailable: 1 },
  { id: 'm45', categoryId: 'c6', name: 'Veg - Biscoff Shake (Regular)', price: 79, isAvailable: 1 },
  { id: 'm46', categoryId: 'c6', name: 'Veg - Biscoff Shake (Large)', price: 139, isAvailable: 1 },
  { id: 'm47', categoryId: 'c6', name: 'Veg - Oreo Shake (Regular)', price: 79, isAvailable: 1 },
  { id: 'm48', categoryId: 'c6', name: 'Veg - Oreo Shake (Large)', price: 139, isAvailable: 1 },
  { id: 'm49', categoryId: 'c6', name: 'Veg - Kunafa Pistachio Shake (Regular)', price: 79, isAvailable: 1 },
  { id: 'm50', categoryId: 'c6', name: 'Veg - Kunafa Pistachio Shake (Large)', price: 139, isAvailable: 1 },

  // Softy (c7)
  { id: 'm51', categoryId: 'c7', name: 'Veg - Vanilla Softy', price: 39, isAvailable: 1 },

  // Desserts (c8)
  { id: 'm52', categoryId: 'c8', name: 'Veg - Chocolate Brownie', price: 99, isAvailable: 1 },
  { id: 'm53', categoryId: 'c8', name: 'Veg - Blondy Cake', price: 99, isAvailable: 1 },

  // Beverages (c9)
  { id: 'm54', categoryId: 'c9', name: 'Veg - Sprite / Coca-Cola (Regular)', price: 59, isAvailable: 1 },
  { id: 'm55', categoryId: 'c9', name: 'Veg - Sprite / Coca-Cola (Large)', price: 99, isAvailable: 1 },
  { id: 'm56', categoryId: 'c9', name: 'Veg - Ice Tea (Peach / Lime) (Regular)', price: 59, isAvailable: 1 },
  { id: 'm57', categoryId: 'c9', name: 'Veg - Ice Tea (Peach / Lime) (Large)', price: 99, isAvailable: 1 },
  { id: 'm58', categoryId: 'c9', name: 'Veg - Hot Chocolate', price: 99, isAvailable: 1 },
  { id: 'm59', categoryId: 'c9', name: 'Veg - Signature Tea', price: 99, isAvailable: 1 }
]

export const useMenuStore = create((set, get) => ({
  categories: sampleCategories,
  menuItems: sampleMenuItems,
  loading: false,
  
  fetchCategories: async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : window.location.origin
      
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
        : window.location.origin
      
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