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
  { id: '1', name: 'Burgers', displayOrder: 1, color: '#ff6b6b' },
  { id: '2', name: 'Chicken', displayOrder: 2, color: '#feca57' },
  { id: '3', name: 'Sides', displayOrder: 3, color: '#48dbfb' },
  { id: '4', name: 'Beverages', displayOrder: 4, color: '#1dd1a1' },
  { id: '5', name: 'Desserts', displayOrder: 5, color: '#ff9ff3' }
]

let menuItems = [
  { id: '1', categoryId: '1', name: 'Classic Burger', price: 199, isAvailable: true },
  { id: '2', categoryId: '1', name: 'Chicken Burger', price: 179, isAvailable: true },
  { id: '3', categoryId: '1', name: 'Zinger Burger', price: 249, isAvailable: true },
  { id: '4', categoryId: '2', name: 'Fried Chicken', price: 250, isAvailable: true },
  { id: '5', categoryId: '2', name: 'Chicken Wings', price: 199, isAvailable: true },
  { id: '6', categoryId: '3', name: 'French Fries', price: 99, isAvailable: true },
  { id: '7', categoryId: '4', name: 'Pepsi', price: 49, isAvailable: true },
  { id: '8', categoryId: '5', name: 'Chocolate Cake', price: 149, isAvailable: true }
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