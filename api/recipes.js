// Simple ID generator
const genId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

// In-memory data
let inventory = [
  { id: '1', name: 'Chicken Breast', category: 'Proteins', unit: 'kg', currentStock: 50, minimumStock: 20, costPerUnit: 180 },
  { id: '2', name: 'Burger Buns', category: 'Bakery', unit: 'pcs', currentStock: 200, minimumStock: 50, costPerUnit: 8 },
  { id: '3', name: 'Fries (Frozen)', category: 'Sides', unit: 'kg', currentStock: 30, minimumStock: 10, costPerUnit: 45 }
]

let recipes = [
  { id: '1', menuItemId: '1', menuItemName: 'Classic Burger', ingredients: [{ inventoryItemId: '1', itemName: 'Chicken Breast', quantity: 0.2, unit: 'kg' }] }
]

export default function handler(req, res) {
  const { method, url } = req
  const path = url?.split('?')[0] || ''
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  
  console.log('Recipes API:', method, path)
  
  // GET /recipes - List recipes
  if (path === '/recipes' || path === '/api/recipes') {
    if (method === 'GET') return res.json(recipes)
  }
  
  // POST /recipes/deduct - Deduct inventory
  if (path === '/deduct' || path === '/recipes/deduct' || path === '/api/recipes/deduct') {
    if (method === 'POST') {
      const { orderItems } = req.body || {}
      console.log('Deduct inventory for:', orderItems)
      return res.json({ success: true })
    }
  }
  
  res.status(404).json({ error: 'Not found', path })
}