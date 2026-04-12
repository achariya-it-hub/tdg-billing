// Simple ID generator
const genId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

// Demo data for Vercel serverless
let categories = [
  { id: '1', name: 'Burgers', displayOrder: 1, color: '#ff6b6b', icon: 'utensils', isActive: 1 },
  { id: '2', name: 'Chicken', displayOrder: 2, color: '#feca57', icon: 'utensils', isActive: 1 },
  { id: '3', name: 'Sides', displayOrder: 3, color: '#48dbfb', icon: 'utensils', isActive: 1 },
  { id: '4', name: 'Beverages', displayOrder: 4, color: '#1dd1a1', icon: 'utensils', isActive: 1 },
  { id: '5', name: 'Desserts', displayOrder: 5, color: '#ff9ff3', icon: 'utensils', isActive: 1 },
  { id: '6', name: 'Combos', displayOrder: 6, color: '#5f27cd', icon: 'utensils', isActive: 1 }
]

let menuItems = [
  { id: '1', categoryId: '1', name: 'Classic Burger', description: 'Juicy beef patty with fresh veggies', price: 199, prepTime: 15, isAvailable: true, variants: [], addOns: [] },
  { id: '2', categoryId: '1', name: 'Chicken Burger', description: 'Crispy chicken with mayo', price: 179, prepTime: 12, isAvailable: true, variants: [], addOns: [] },
  { id: '3', categoryId: '1', name: 'Veggie Burger', description: 'Crispy vegetable patty', price: 149, prepTime: 10, isAvailable: true, variants: [], addOns: [] },
  { id: '4', categoryId: '1', name: 'Cheese Burger', description: 'Classic with melted cheese', price: 229, prepTime: 15, isAvailable: true, variants: [], addOns: [] },
  { id: '5', categoryId: '1', name: 'Double Burger', description: 'Double patty double fun', price: 299, prepTime: 18, isAvailable: true, variants: [], addOns: [] },
  { id: '6', categoryId: '2', name: 'Fried Chicken', description: 'Crispy golden fried', price: 250, prepTime: 15, isAvailable: true, variants: [], addOns: [] },
  { id: '7', categoryId: '2', name: 'Chicken Wings', description: 'Spicy wings', price: 199, prepTime: 12, isAvailable: true, variants: [], addOns: [] },
  { id: '8', categoryId: '2', name: 'Chicken Strips', description: 'Tender chicken strips', price: 220, prepTime: 12, isAvailable: true, variants: [], addOns: [] },
  { id: '9', categoryId: '3', name: 'French Fries', description: 'Crispy salted fries', price: 99, prepTime: 8, isAvailable: true, variants: [], addOns: [] },
  { id: '10', categoryId: '3', name: 'Onion Rings', description: 'Crunchy onion rings', price: 129, prepTime: 8, isAvailable: true, variants: [], addOns: [] },
  { id: '11', categoryId: '3', name: 'Coleslaw', description: 'Fresh creamy coleslaw', price: 79, prepTime: 5, isAvailable: true, variants: [], addOns: [] },
  { id: '12', categoryId: '4', name: 'Pepsi', description: 'Refreshing cola', price: 49, prepTime: 2, isAvailable: true, variants: [], addOns: [] },
  { id: '13', categoryId: '4', name: 'Mint Lemonade', description: 'Cool refreshing drink', price: 79, prepTime: 3, isAvailable: true, variants: [], addOns: [] },
  { id: '14', categoryId: '4', name: 'Coffee', description: 'Hot aromatic coffee', price: 89, prepTime: 3, isAvailable: true, variants: [], addOns: [] },
  { id: '15', categoryId: '5', name: 'Chocolate Lava Cake', description: 'Rich chocolate cake', price: 149, prepTime: 10, isAvailable: true, variants: [], addOns: [] },
  { id: '16', categoryId: '5', name: 'Ice Cream', description: 'Creamy vanilla ice cream', price: 99, prepTime: 3, isAvailable: true, variants: [], addOns: [] }
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
  
  // Categories endpoints
  if (path === '/categories' && method === 'GET') {
    return res.json(categories.sort((a, b) => a.displayOrder - b.displayOrder))
  }
  
  if (path === '/categories' && method === 'POST') {
    const { name, displayOrder, color, icon } = req.body
    const newCat = { id: genId(), name, displayOrder: displayOrder || categories.length + 1, color: color || '#ffffff', icon: icon || 'utensils', isActive: 1 }
    categories.push(newCat)
    return res.status(201).json(newCat)
  }
  
  // Menu items endpoints
  if (path === '/items' && method === 'GET') {
    const { categoryId } = req.query
    let items = menuItems
    if (categoryId) {
      items = menuItems.filter(item => item.categoryId === categoryId)
    }
    return res.json(items)
  }
  
  if (path === '/items' && method === 'POST') {
    const { categoryId, name, description, price, image, prepTime } = req.body
    const newItem = { id: genId(), categoryId, name, description: description || '', price, image: image || '', prepTime: prepTime || 15, isAvailable: true, variants: [], addOns: [] }
    menuItems.push(newItem)
    return res.status(201).json(newItem)
  }
  
  res.status(404).json({ error: 'Not found' })
}