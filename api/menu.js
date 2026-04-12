// Simple ID generator
const genId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

// Demo data
let categories = [
  { id: '1', name: 'Burgers', displayOrder: 1, color: '#ff6b6b', icon: 'utensils', isActive: 1 },
  { id: '2', name: 'Chicken', displayOrder: 2, color: '#feca57', icon: 'utensils', isActive: 1 },
  { id: '3', name: 'Sides', displayOrder: 3, color: '#48dbfb', icon: 'utensils', isActive: 1 },
  { id: '4', name: 'Beverages', displayOrder: 4, color: '#1dd1a1', icon: 'utensils', isActive: 1 },
  { id: '5', name: 'Desserts', displayOrder: 5, color: '#ff9ff3', icon: 'utensils', isActive: 1 }
]

let menuItems = [
  { id: '1', categoryId: '1', name: 'Classic Burger', description: 'Juicy beef patty', price: 199, prepTime: 15, isAvailable: true },
  { id: '2', categoryId: '1', name: 'Chicken Burger', description: 'Crispy chicken', price: 179, prepTime: 12, isAvailable: true },
  { id: '3', categoryId: '1', name: 'Cheese Burger', description: 'With melted cheese', price: 229, prepTime: 15, isAvailable: true },
  { id: '6', categoryId: '2', name: 'Fried Chicken', description: 'Crispy golden', price: 250, prepTime: 15, isAvailable: true },
  { id: '7', categoryId: '2', name: 'Chicken Wings', description: 'Spicy wings', price: 199, prepTime: 12, isAvailable: true },
  { id: '9', categoryId: '3', name: 'French Fries', description: 'Crispy salted', price: 99, prepTime: 8, isAvailable: true },
  { id: '12', categoryId: '4', name: 'Pepsi', description: 'Refreshing cola', price: 49, prepTime: 2, isAvailable: true },
  { id: '15', categoryId: '5', name: 'Chocolate Cake', description: 'Rich chocolate', price: 149, prepTime: 10, isAvailable: true }
]

export default function handler(req, res) {
  const { method, url, query } = req
  const path = url?.split('?')[0] || ''
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  
  console.log('Menu API:', method, path)
  
  // Categories
  if (path === '/categories' || path === '/api/categories') {
    if (method === 'GET') {
      return res.json(categories.sort((a, b) => a.displayOrder - b.displayOrder))
    }
    if (method === 'POST') {
      const { name, displayOrder, color, icon } = req.body || {}
      const newCat = { id: genId(), name, displayOrder: displayOrder || categories.length + 1, color: color || '#ffffff', icon: icon || 'utensils', isActive: 1 }
      categories.push(newCat)
      return res.status(201).json(newCat)
    }
  }
  
  // Menu items
  if (path === '/items' || path === '/api/items') {
    if (method === 'GET') {
      const { categoryId } = query
      let items = menuItems
      if (categoryId) {
        items = menuItems.filter(item => item.categoryId === categoryId)
      }
      return res.json(items)
    }
  }
  
  res.status(404).json({ error: 'Not found', path })
}