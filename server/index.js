import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const JWT_SECRET = process.env.JWT_SECRET || 'tdg_secret_key_123'
const DB_PATH = join(__dirname, 'db.json')

function readDb() {
  try {
    if (existsSync(DB_PATH)) {
      return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
    }
  } catch (e) {
    console.error('Error reading db.json:', e.message)
  }
  return { users: [], orders: [], transactions: [], menu: null }
}

function writeDb(data) {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('Error writing db.json:', e.message)
  }
}

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

// ============ LOYALTY SYSTEM ============
// Tiers: Bronze(0) < Silver(1k) < Gold(3k) < Platinum(6k) < Diamond(15k) < Emerald(25k)
// Ruby Crown: special status at 25k points
const TIER_THRESHOLDS = [
  { name: 'Bronze', minPoints: 0, color: '#cd7f32' },
  { name: 'Silver', minPoints: 1000, color: '#c0c0c0' },
  { name: 'Gold', minPoints: 3000, color: '#ffd700' },
  { name: 'Platinum', minPoints: 6000, color: '#e5e4e2' },
  { name: 'Diamond', minPoints: 15000, color: '#b9f2ff' },
  { name: 'Emerald', minPoints: 25000, color: '#50c878' }
]

function getTier(points) {
  let tier = TIER_THRESHOLDS[0].name
  for (const t of TIER_THRESHOLDS) {
    if (points >= t.minPoints) tier = t.name
  }
  return tier
}

let loyaltyUsers = []
let dens = []
let pointTransactions = []
let usedReferralCodes = new Set()
let registrationCount = 0
const MAX_FREE_REGISTRATIONS = 1000
const MAX_DEN_MEMBERS = 10

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  while (true) {
    let code = ''
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    if (!usedReferralCodes.has(code)) {
      usedReferralCodes.add(code)
      return code
    }
  }
}

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// ============ MOBILE APP API ROUTES ============

// Auth - Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const db = readDb()
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = {
      id: 'u_' + Date.now(),
      name, email, phone,
      password: hashedPassword,
      rubyBalance: 2450,
      denLevel: 'Gold',
      completedDens: 4,
      denProgress: 6,
      scratchCards: [
        { id: 's_' + Date.now() + '_1', title: 'Welcome Scratch Card', subtitle: 'Tap to scratch', amount: 100, claimed: false },
        { id: 's_' + Date.now() + '_2', title: 'New Member Gift', subtitle: 'Tap to scratch', amount: 200, claimed: false }
      ],
      denId: null,
      createdAt: new Date().toISOString()
    }
    db.users.push(newUser)
    writeDb(db)
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = newUser
    res.status(201).json({ token, user: userWithoutPassword })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ message: 'Server error during signup' })
  }
})

// Auth - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const db = readDb()
    const clean = email.trim().toLowerCase()
    const user = db.users.find(u => u.email.toLowerCase() === clean || u.phone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, ''))
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...userWithoutPassword } = user
    res.status(200).json({ token, user: userWithoutPassword })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// Auth - Profile
app.get('/api/auth/profile', auth, (req, res) => {
  const db = readDb()
  const user = db.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const { password: _, ...userWithoutPassword } = user
  res.json(userWithoutPassword)
})

// Auth - Update Profile
app.put('/api/auth/profile', auth, (req, res) => {
  const { name, phone, email } = req.body
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === req.userId)
  if (idx === -1) return res.status(404).json({ message: 'User not found' })
  if (name) db.users[idx].name = name
  if (phone) db.users[idx].phone = phone
  if (email) {
    const other = db.users.find(u => u.id !== req.userId && u.email.toLowerCase() === email.toLowerCase())
    if (other) return res.status(400).json({ message: 'Email already in use' })
    db.users[idx].email = email
  }
  writeDb(db)
  const { password: _, ...userWithoutPassword } = db.users[idx]
  res.json(userWithoutPassword)
})

// Menu (mobile format)
app.get('/api/menu', (req, res) => {
  const db = readDb()
  if (db.menu) return res.json(db.menu)
  // Build from existing categories + menuItems
  res.json({
    categories: categories.map(c => c.name),
    items: menuItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: categories.find(c => c.id === item.categoryId)?.name || 'Other',
      tag: item.isAvailable ? 'Popular' : '',
      image: null,
      isAvailable: item.isAvailable
    }))
  })
})

// Wallet
app.get('/api/wallet', auth, (req, res) => {
  const db = readDb()
  const user = db.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const transactions = db.transactions.filter(t => t.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ rubyBalance: user.rubyBalance, scratchCards: user.scratchCards || [], transactions })
})

// Wallet - Scratch card
app.post('/api/wallet/scratch', auth, (req, res) => {
  const { cardId } = req.body
  if (!cardId) return res.status(400).json({ message: 'Card ID is required' })
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === req.userId)
  if (idx === -1) return res.status(404).json({ message: 'User not found' })
  const user = db.users[idx]
  const cardIdx = (user.scratchCards || []).findIndex(c => c.id === cardId)
  if (cardIdx === -1) return res.status(404).json({ message: 'Scratch card not found' })
  if (user.scratchCards[cardIdx].claimed) return res.status(400).json({ message: 'Already claimed' })
  user.scratchCards[cardIdx].claimed = true
  user.scratchCards[cardIdx].subtitle = 'Claimed'
  user.rubyBalance += user.scratchCards[cardIdx].amount
  db.transactions.push({ id: 't_' + Date.now(), userId: user.id, type: 'credit', amount: user.scratchCards[cardIdx].amount, description: 'Scratch Card: ' + user.scratchCards[cardIdx].title, createdAt: new Date().toISOString() })
  writeDb(db)
  const transactions = db.transactions.filter(t => t.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ message: 'Claimed!', rubyBalance: user.rubyBalance, scratchCards: user.scratchCards, transactions })
})

// Wallet - Add rubies
app.post('/api/wallet/add', auth, (req, res) => {
  const { amount } = req.body
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required' })
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === req.userId)
  if (idx === -1) return res.status(404).json({ message: 'User not found' })
  db.users[idx].rubyBalance += Number(amount)
  db.transactions.push({ id: 't_' + Date.now(), userId: db.users[idx].id, type: 'credit', amount: Number(amount), description: 'Purchased Rubies', createdAt: new Date().toISOString() })
  writeDb(db)
  const transactions = db.transactions.filter(t => t.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ message: `Added ${amount} Rubies!`, rubyBalance: db.users[idx].rubyBalance, scratchCards: db.users[idx].scratchCards || [], transactions })
})

// Den progress
app.get('/api/den', auth, (req, res) => {
  const db = readDb()
  const user = db.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({
    denLevel: user.denLevel || 'Gold',
    completedDens: user.completedDens !== undefined ? user.completedDens : 4,
    denProgress: user.denProgress !== undefined ? user.denProgress : 6
  })
})

// Mobile orders - get user's orders
app.get('/api/orders', auth, (req, res) => {
  const db = readDb()
  const userOrders = db.orders.filter(o => o.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json(userOrders)
})

// Mobile orders - create order
app.post('/api/orders', auth, (req, res) => {
  const { items, subtotal, tax, deliveryFee, total, paymentMethod, deliveryAddress } = req.body
  if (!items || !items.length || subtotal === undefined || total === undefined || !paymentMethod || !deliveryAddress) {
    return res.status(400).json({ message: 'Order data incomplete' })
  }
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === req.userId)
  if (idx === -1) return res.status(404).json({ message: 'User not found' })
  const user = db.users[idx]
  if (paymentMethod === 'wallet') {
    if (user.rubyBalance < total) return res.status(400).json({ message: 'Insufficient Rubies' })
    user.rubyBalance -= total
    db.transactions.push({ id: 't_' + Date.now(), userId: user.id, type: 'debit', amount: total, description: 'Order Payment', createdAt: new Date().toISOString() })
  }
  const nextNum = 10000 + db.orders.length + 1
  const order = { id: 'ORD' + nextNum, userId: user.id, items, subtotal, tax, deliveryFee, total, status: 'Placed', paymentMethod, deliveryAddress, createdAt: new Date().toISOString() }
  db.orders.push(order)
  writeDb(db)
  res.status(201).json({ message: 'Order placed!', order, rubyBalance: user.rubyBalance })
})

// ============ MENU API ROUTES ============
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

// POS Orders (no auth)
app.get('/api/pos/orders', (req, res) => {
  const { status, source } = req.query
  let inMemory = [...orders]
  if (status) inMemory = inMemory.filter(o => o.status === status)
  if (source) inMemory = inMemory.filter(o => o.source === source)
  res.json(inMemory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
})

app.post('/api/pos/orders', (req, res) => {
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

app.patch('/api/pos/orders/:id/status', (req, res) => {
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

// ============ LOYALTY API ROUTES ============

// Get tier info
app.get('/api/loyalty/tiers', (req, res) => {
  res.json(TIER_THRESHOLDS)
})

// Register new user
app.post('/api/loyalty/register', (req, res) => {
  const { name, phone, email, referralCode } = req.body
  
  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Name, phone, and email are required' })
  }
  
  if (loyaltyUsers.find(u => u.phone === phone)) {
    return res.status(400).json({ error: 'Phone number already registered' })
  }
  
  // Validate referral code
  let referrer = null
  if (referralCode) {
    referrer = loyaltyUsers.find(u => u.referralCode === referralCode)
    if (!referrer) {
      return res.status(400).json({ error: 'Invalid referral code' })
    }
  }
  
  const id = uuid()
  const code = generateReferralCode()
  const now = new Date().toISOString()
  const isFreeAccount = registrationCount < MAX_FREE_REGISTRATIONS
  
  const user = {
    id,
    referralCode: code,
    name,
    phone,
    email,
    rubyPoints: 0,
    tier: 'Bronze',
    referredBy: referralCode || null,
    denId: null,
    createdAt: now
  }
  
  // Add referral bonus points
  if (referrer && isFreeAccount) {
    // 50 points to new user (referred person)
    addPoints(user.id, 50, 'Referral bonus - account opening')
    // 25 points to referrer
    addPoints(referrer.id, 25, 'Referral reward - referred ' + name)
  }
  
  // Free account opening bonus (first 1000 only)
  if (isFreeAccount) {
    addPoints(user.id, 400, 'Account opening bonus')
    registrationCount++
  }
  
  loyaltyUsers.push(user)
  
  res.status(201).json({ user, isFreeAccount })
})

// Get user by phone
app.get('/api/loyalty/user/:phone', (req, res) => {
  const user = loyaltyUsers.find(u => u.phone === req.params.phone)
  if (!user) return res.status(404).json({ error: 'User not found' })
  
  const userDen = dens.find(d => d.id === user.denId)
  
  res.json({
    ...user,
    den: userDen || null,
    transactions: pointTransactions.filter(t => t.userId === user.id).slice(-50)
  })
})

// Get user profile including tier progress
app.get('/api/loyalty/profile/:phone', (req, res) => {
  const user = loyaltyUsers.find(u => u.phone === req.params.phone)
  if (!user) return res.status(404).json({ error: 'User not found' })
  
  const nextTier = TIER_THRESHOLDS.find(t => t.minPoints > user.rubyPoints) || TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1]
  const currentTier = TIER_THRESHOLDS.find(t => t.name === getTier(user.rubyPoints))
  const prevThreshold = TIER_THRESHOLDS[TIER_THRESHOLDS.indexOf(currentTier) - 1]?.minPoints || 0
  
  res.json({
    ...user,
    tierInfo: currentTier,
    nextTier: user.rubyPoints >= 25000 ? null : nextTier,
    progress: {
      current: user.rubyPoints - prevThreshold,
      max: nextTier ? nextTier.minPoints - prevThreshold : 0
    },
    transactions: pointTransactions.filter(t => t.userId === user.id).slice(-50)
  })
})

// Den - create
app.post('/api/loyalty/den/create', (req, res) => {
  const { phone, name } = req.body
  if (!phone || !name) return res.status(400).json({ error: 'Phone and den name required' })
  
  const user = loyaltyUsers.find(u => u.phone === phone)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (user.denId) return res.status(400).json({ error: 'User already in a den' })
  
  const den = {
    id: uuid(),
    name,
    leaderId: user.id,
    leaderName: user.name,
    leaderPhone: user.phone,
    members: [{ id: user.id, name: user.name, phone: user.phone, joinedAt: new Date().toISOString() }],
    memberCount: 1,
    createdAt: new Date().toISOString(),
    isPrideLion: false
  }
  
  dens.push(den)
  user.denId = den.id
  
  res.status(201).json(den)
})

// Den - join
app.post('/api/loyalty/den/join', (req, res) => {
  const { phone, denCode } = req.body
  if (!phone || !denCode) return res.status(400).json({ error: 'Phone and den code required' })
  
  const user = loyaltyUsers.find(u => u.phone === phone)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (user.denId) return res.status(400).json({ error: 'Already in a den (no cross-adding allowed)' })
  
  const den = dens.find(d => d.id === denCode || d.name === denCode)
  if (!den) return res.status(404).json({ error: 'Den not found' })
  if (den.memberCount >= MAX_DEN_MEMBERS) return res.status(400).json({ error: 'Den is full (max 10 members)' })
  
  // Check if user is already a member
  if (den.members.find(m => m.id === user.id)) {
    return res.status(400).json({ error: 'Already a member of this den' })
  }
  
  den.members.push({ id: user.id, name: user.name, phone: user.phone, joinedAt: new Date().toISOString() })
  den.memberCount = den.members.length
  user.denId = den.id
  
  // If den reaches 10 members, check if leader gets Pride Lion
  if (den.memberCount >= MAX_DEN_MEMBERS) {
    den.isPrideLion = true
    const leader = loyaltyUsers.find(u => u.id === den.leaderId)
    if (leader) {
      addPoints(leader.id, 200, 'Pride Lion bonus - den completed 10 members')
    }
  }
  
  res.json(den)
})

// Den - get user's den
app.get('/api/loyalty/den/:phone', (req, res) => {
  const user = loyaltyUsers.find(u => u.phone === req.params.phone)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (!user.denId) return res.json({ den: null })
  
  const den = dens.find(d => d.id === user.denId)
  res.json({ den })
})

// Points - transfer
app.post('/api/loyalty/points/transfer', (req, res) => {
  const { fromPhone, toPhone, amount } = req.body
  if (!fromPhone || !toPhone || !amount) {
    return res.status(400).json({ error: 'fromPhone, toPhone, and amount required' })
  }
  
  if (amount > 200) return res.status(400).json({ error: 'Max transfer is 200 points' })
  if (amount <= 0) return res.status(400).json({ error: 'Amount must be positive' })
  
  const fromUser = loyaltyUsers.find(u => u.phone === fromPhone)
  const toUser = loyaltyUsers.find(u => u.phone === toPhone)
  
  if (!fromUser) return res.status(404).json({ error: 'Sender not found' })
  if (!toUser) return res.status(404).json({ error: 'Recipient not found' })
  if (fromUser.rubyPoints < amount) return res.status(400).json({ error: 'Insufficient points' })
  
  deductPoints(fromUser.id, amount, `Transfer to ${toUser.name} (${toPhone})`)
  addPoints(toUser.id, amount, `Transfer from ${fromUser.name} (${fromPhone})`)
  
  updateUserTier(fromUser)
  updateUserTier(toUser)
  
  res.json({ success: true, fromBalance: fromUser.rubyPoints, toBalance: toUser.rubyPoints })
})

// Points - redeem
app.post('/api/loyalty/points/redeem', (req, res) => {
  const { phone, amount } = req.body
  if (!phone || !amount) return res.status(400).json({ error: 'Phone and amount required' })
  
  if (amount < 3000) return res.status(400).json({ error: 'Minimum redemption is 3000 points' })
  if (amount % 100 !== 0) return res.status(400).json({ error: 'Amount must be in multiples of 100' })
  
  const user = loyaltyUsers.find(u => u.phone === phone)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (user.rubyPoints < amount) return res.status(400).json({ error: 'Insufficient points' })
  
  const rupeeValue = amount // 1 point = 1 rupee
  deductPoints(user.id, amount, `Redeemed ${rupeeValue} rupees`)
  
  res.json({ success: true, redeemedRupees: rupeeValue, balance: user.rubyPoints })
})

// Points - history
app.get('/api/loyalty/points/history/:phone', (req, res) => {
  const user = loyaltyUsers.find(u => u.phone === req.params.phone)
  if (!user) return res.status(404).json({ error: 'User not found' })
  
  res.json(pointTransactions.filter(t => t.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
})

// Helper functions
function addPoints(userId, amount, description) {
  const user = loyaltyUsers.find(u => u.id === userId)
  if (!user) return
  
  user.rubyPoints += amount
  updateUserTier(user)
  
  pointTransactions.push({
    id: uuid(),
    userId,
    amount,
    type: 'earn',
    description,
    balance: user.rubyPoints,
    createdAt: new Date().toISOString()
  })
}

function deductPoints(userId, amount, description) {
  const user = loyaltyUsers.find(u => u.id === userId)
  if (!user) return
  
  user.rubyPoints -= amount
  updateUserTier(user)
  
  pointTransactions.push({
    id: uuid(),
    userId,
    amount: -amount,
    type: 'spend',
    description,
    balance: user.rubyPoints,
    createdAt: new Date().toISOString()
  })
}

function updateUserTier(user) {
  user.tier = getTier(user.rubyPoints)
  user.isRubyCrown = user.rubyPoints >= 25000
}

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