import { v4 as uuid } from 'uuid'

// Demo data for recipes
let recipes = [
  { id: '1', menuItemId: '1', menuItemName: 'Classic Burger', ingredients: [{ inventoryItemId: '1', itemName: 'Chicken Breast', quantity: 0.2, unit: 'kg' }, { inventoryItemId: '2', itemName: 'Burger Buns', quantity: 1, unit: 'pcs' }, { inventoryItemId: '4', itemName: 'Cooking Oil', quantity: 0.02, unit: 'liters' }] },
  { id: '2', menuItemId: '2', menuItemName: 'Chicken Burger', ingredients: [{ inventoryItemId: '6', itemName: 'Chicken Breast', quantity: 0.2, unit: 'kg' }, { inventoryItemId: '2', itemName: 'Burger Buns', quantity: 1, unit: 'pcs' }] },
  { id: '3', menuItemId: '9', menuItemName: 'French Fries', ingredients: [{ inventoryItemId: '3', itemName: 'Fries (Frozen)', quantity: 0.15, unit: 'kg' }, { inventoryItemId: '4', itemName: 'Cooking Oil', quantity: 0.03, unit: 'liters' }] }
]

let inventory = [
  { id: '1', name: 'Chicken Breast', category: 'Proteins', unit: 'kg', currentStock: 50, minimumStock: 20, costPerUnit: 180 },
  { id: '2', name: 'Burger Buns', category: 'Bakery', unit: 'pcs', currentStock: 200, minimumStock: 50, costPerUnit: 8 },
  { id: '3', name: 'Fries (Frozen)', category: 'Sides', unit: 'kg', currentStock: 30, minimumStock: 10, costPerUnit: 45 },
  { id: '4', name: 'Cooking Oil', category: 'Supplies', unit: 'liters', currentStock: 40, minimumStock: 15, costPerUnit: 120 },
  { id: '5', name: 'Pepsi Syrup', category: 'Beverages', unit: 'liters', currentStock: 5, minimumStock: 5, costPerUnit: 350 },
  { id: '6', name: 'Packaging Boxes', category: 'Supplies', unit: 'pcs', currentStock: 80, minimumStock: 100, costPerUnit: 5 }
]

export default async function handler(req, res) {
  const { method, url } = req
  const path = url?.split('?')[0] || ''
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  // Get all recipes
  if (path === '/' && method === 'GET') {
    return res.json(recipes)
  }
  
  // Get recipes for a specific menu item
  if (path.startsWith('/menu-item/') && method === 'GET') {
    const menuItemId = path.split('/')[2]
    const recipe = recipes.find(r => r.menuItemId === menuItemId)
    return res.json(recipe || { ingredients: [] })
  }
  
  // Deduct inventory for order (for POS)
  if (path === '/deduct' && method === 'POST') {
    const { orderItems } = req.body
    if (!orderItems) return res.json({ success: true })
    
    orderItems.forEach(orderItem => {
      const recipe = recipes.find(r => r.menuItemName === orderItem.menuItemName)
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          const invItem = inventory.find(i => i.id === ing.inventoryItemId)
          if (invItem) {
            invItem.currentStock -= (ing.quantity * orderItem.quantity)
          }
        })
      }
    })
    
    return res.json({ success: true })
  }
  
  // Get all inventory
  if (path === '/inventory' && method === 'GET') {
    return res.json(inventory)
  }
  
  // Update inventory stock
  if (path.startsWith('/inventory/') && method === 'PATCH') {
    const itemId = path.split('/')[2]
    const { currentStock } = req.body
    const item = inventory.find(i => i.id === itemId)
    if (item) {
      item.currentStock = currentStock
    }
    return res.json({ success: true })
  }
  
  res.status(404).json({ error: 'Not found' })
}