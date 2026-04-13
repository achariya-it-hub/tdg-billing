import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuid } from 'uuid'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

app.use(cors())
app.use(express.json())

// In-memory database
let orders = []
let orderNumber = 1000
let categories = [
  { id: 'c1', name: 'Gyros', displayOrder: 1, color: '#e63946' },
  { id: 'c2', name: 'Burger', displayOrder: 2, color: '#f59e0b' },
  { id: 'c3', name: 'Fried items', displayOrder: 3, color: '#10b981' },
  { id: 'c4', name: 'Golden crunchy chicken', displayOrder: 4, color: '#dc2626' },
  { id: 'c5', name: 'Golden Glaze Chicken', displayOrder: 5, color: '#fbbf24' },
  { id: 'c6', name: 'Thick Shakes', displayOrder: 6, color: '#8b5cf6' },
  { id: 'c7', name: 'Ice Cream', displayOrder: 7, color: '#ec4899' },
  { id: 'c8', name: 'Desserts', displayOrder: 8, color: '#f472b6' },
  { id: 'c9', name: 'Beverages', displayOrder: 9, color: '#3b82f6' }
]

let menuItems = [
  { id: 'm1', categoryId: 'c1', name: 'Veg - BBQ Paneer', price: 100, isAvailable: true },
  { id: 'm2', categoryId: 'c1', name: 'Veg - Beetroot Falafal', price: 100, isAvailable: true },
  { id: 'm3', categoryId: 'c1', name: 'Veg - Mushroom Falafal', price: 100, isAvailable: true },
  { id: 'm4', categoryId: 'c1', name: 'Non-Veg - Sour Cream Chicken', price: 100, isAvailable: true },
  { id: 'm5', categoryId: 'c1', name: 'Non-Veg - BBQ Chicken', price: 100, isAvailable: true },
  { id: 'm6', categoryId: 'c1', name: 'Non-Veg - Peri Peri Chicken', price: 100, isAvailable: true },
  { id: 'm7', categoryId: 'c1', name: 'Non-Veg - Crunchy Chicken', price: 100, isAvailable: true },
  { id: 'm8', categoryId: 'c1', name: 'Non-Veg - Fried Fish', price: 100, isAvailable: true },
  { id: 'm9', categoryId: 'c1', name: 'Non-Veg - BBQ Prawn', price: 100, isAvailable: true },
  { id: 'm10', categoryId: 'c2', name: 'Veg - Spinach (veg meat)', price: 100, isAvailable: true },
  { id: 'm11', categoryId: 'c2', name: 'Veg - Beetroot', price: 100, isAvailable: true },
  { id: 'm12', categoryId: 'c2', name: 'Non-Veg - Fried Chicken', price: 100, isAvailable: true },
  { id: 'm13', categoryId: 'c2', name: 'Non-Veg - Sourcream Chicken', price: 100, isAvailable: true },
  { id: 'm14', categoryId: 'c2', name: 'Non-Veg - BBQ Chicken', price: 100, isAvailable: true },
  { id: 'm15', categoryId: 'c2', name: 'Non-Veg - Fish with Egg', price: 100, isAvailable: true },
  { id: 'm16', categoryId: 'c3', name: 'Veg Nuggets', price: 100, isAvailable: true },
  { id: 'm17', categoryId: 'c3', name: 'French Fries', price: 100, isAvailable: true },
  { id: 'm18', categoryId: 'c3', name: 'Chicken Nuggets', price: 100, isAvailable: true },
  { id: 'm19', categoryId: 'c3', name: 'Fish Finger', price: 100, isAvailable: true },
  { id: 'm20', categoryId: 'c4', name: 'Fried Chicken (1pc)', price: 69, isAvailable: true },
  { id: 'm21', categoryId: 'c4', name: 'Fried Chicken (2pc)', price: 129, isAvailable: true },
  { id: 'm22', categoryId: 'c4', name: 'Fried Chicken (4pc)', price: 249, isAvailable: true },
  { id: 'm23', categoryId: 'c4', name: 'Fried Chicken (8pc)', price: 499, isAvailable: true },
  { id: 'm24', categoryId: 'c4', name: 'Strips (3pc)', price: 119, isAvailable: true },
  { id: 'm25', categoryId: 'c4', name: 'Strips (6pc)', price: 229, isAvailable: true },
  { id: 'm26', categoryId: 'c4', name: 'Strips (9pc)', price: 349, isAvailable: true },
  { id: 'm27', categoryId: 'c4', name: 'Strips (12pc)', price: 479, isAvailable: true },
  { id: 'm28', categoryId: 'c4', name: 'Wings (3pc)', price: 109, isAvailable: true },
  { id: 'm29', categoryId: 'c4', name: 'Wings (6pc)', price: 219, isAvailable: true },
  { id: 'm30', categoryId: 'c4', name: 'Wings (9pc)', price: 329, isAvailable: true },
  { id: 'm31', categoryId: 'c4', name: 'Wings (12pc)', price: 429, isAvailable: true },
  { id: 'm32', categoryId: 'c5', name: 'Glaze Strips (3pc)', price: 149, isAvailable: true },
  { id: 'm33', categoryId: 'c5', name: 'Glaze Strips (6pc)', price: 299, isAvailable: true },
  { id: 'm34', categoryId: 'c5', name: 'Glaze Wings (3pc)', price: 149, isAvailable: true },
  { id: 'm35', categoryId: 'c5', name: 'Glaze Wings (6pc)', price: 299, isAvailable: true },
  { id: 'm36', categoryId: 'c6', name: 'Chocolate Blizzard', price: 100, isAvailable: true },
  { id: 'm37', categoryId: 'c6', name: 'Vanilla Blizzard', price: 100, isAvailable: true },
  { id: 'm38', categoryId: 'c6', name: 'Strawberry Blizzard', price: 100, isAvailable: true },
  { id: 'm39', categoryId: 'c7', name: 'Bourbon Softy', price: 59, isAvailable: true },
  { id: 'm40', categoryId: 'c7', name: 'Vanila Softy', price: 49, isAvailable: true },
  { id: 'm41', categoryId: 'c7', name: 'Choco Dip Softy', price: 89, isAvailable: true },
  { id: 'm42', categoryId: 'c7', name: 'Caramel Sundae', price: 69, isAvailable: true },
  { id: 'm43', categoryId: 'c7', name: 'Strawberry Sundae', price: 69, isAvailable: true },
  { id: 'm44', categoryId: 'c7', name: 'Chocolate Sundae', price: 69, isAvailable: true },
  { id: 'm45', categoryId: 'c8', name: 'Chocolate Donuts', price: 119, isAvailable: true },
  { id: 'm46', categoryId: 'c8', name: 'Vanila Donuts', price: 99, isAvailable: true },
  { id: 'm47', categoryId: 'c8', name: 'Tiramissu', price: 249, isAvailable: true },
  { id: 'm48', categoryId: 'c8', name: 'Redvelvet Cake', price: 249, isAvailable: true },
  { id: 'm49', categoryId: 'c8', name: 'Banoffee', price: 249, isAvailable: true },
  { id: 'm50', categoryId: 'c8', name: 'Caramel Hazelnut', price: 249, isAvailable: true },
  { id: 'm51', categoryId: 'c8', name: 'Chocolate Dome', price: 249, isAvailable: true },
  { id: 'm52', categoryId: 'c9', name: 'Coke', price: 39, isAvailable: true },
  { id: 'm53', categoryId: 'c9', name: 'Lemonade', price: 39, isAvailable: true },
  { id: 'm54', categoryId: 'c9', name: 'Kombhucha', price: 99, isAvailable: true }
]

let inventory = [
  { id: '1', name: 'Chicken Breast', currentStock: 50, minimumStock: 20 },
  { id: '2', name: 'Burger Buns', currentStock: 200, minimumStock: 50 },
  { id: '3', name: 'Fries', currentStock: 30, minimumStock: 10 }
]

// ============ API ROUTES ============

// Menu Categories
app.get('/api/menu/categories', (req, res) => {
  res.json(categories.sort((a, b) => a.displayOrder - b.displayOrder))
})

// Menu Items
app.get('/api/menu/items', (req, res) => {
  const { categoryId } = req.query
  let items = menuItems
  if (categoryId) {
    items = menuItems.filter(item => item.categoryId === categoryId)
  }
  res.json(items)
})

// Orders
app.get('/api/orders', (req, res) => {
  const { status, source } = req.query
  let filtered = [...orders]
  if (status) filtered = filtered.filter(o => o.status === status)
  if (source) filtered = filtered.filter(o => o.source === source)
  res.json(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
})

app.post('/api/orders', (req, res) => {
  const { type, source, items, subtotal, tax, total, tableNumber, customerName, notes, paymentMethod } = req.body
  
  const id = uuid()
  const orderNum = ++orderNumber
  const now = new Date().toISOString()
  
  const order = {
    id,
    orderNumber: orderNum,
    type: type || 'dine-in',
    status: 'pending',
    source: source || 'pos',
    subtotal: subtotal || 0,
    tax: tax || 0,
    total: total || 0,
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: 'pending',
    tableNumber: tableNumber || '',
    customerName: customerName || '',
    notes: notes || '',
    createdAt: now,
    updatedAt: now,
    items: items?.map(item => ({
      id: uuid(),
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      status: 'pending'
    })) || []
  }
  
  orders.unshift(order)
  
  // Emit to connected clients
  io.emit('order:created', order)
  io.to('kitchen').emit('kot:created', { id, orderNumber: `K${orderNum}`, items: order.items, createdAt: now })
  
  res.status(201).json(order)
})

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params
  const { status } = req.body
  
  const order = orders.find(o => o.id === id)
  if (order) {
    order.status = status
    order.updatedAt = new Date().toISOString()
    io.emit('order:updated', order)
  }
  
  res.json({ success: true })
})

// Inventory
app.get('/api/inventory', (req, res) => {
  res.json(inventory)
})

app.patch('/api/inventory/:id', (req, res) => {
  const { id } = req.params
  const { currentStock } = req.body
  
  const item = inventory.find(i => i.id === id)
  if (item) {
    item.currentStock = currentStock
  }
  
  res.json({ success: true })
})

// Recipes / Inventory deduction
app.post('/api/recipes/deduct', (req, res) => {
  const { orderItems } = req.body
  
  orderItems?.forEach(orderItem => {
    // Simple deduction - in production, would use recipe mapping
    console.log('Deduct inventory for:', orderItem)
  })
  
  res.json({ success: true })
})

// ============ WEBSOCKET ============
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.on('join-kitchen', () => {
    socket.join('kitchen')
  })
  
  socket.on('join-pos', () => {
    socket.join('pos')
  })
  
  socket.on('kot:bump', (kotId) => {
    io.emit('kot:bumped', kotId)
  })
})

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app