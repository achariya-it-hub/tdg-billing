import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, readdirSync, rmSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import XLSX from 'xlsx'

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

const BACKUP_DIR = join(__dirname, 'backups')
const DAILY_BACKUP_DIR = join(__dirname, 'daily-backups')

let lastDailyBackupDate = ''

function performDailyBackup() {
  const today = new Date().toISOString().split('T')[0]
  if (lastDailyBackupDate === today) return false
  try {
    if (!existsSync(DAILY_BACKUP_DIR)) mkdirSync(DAILY_BACKUP_DIR, { recursive: true })
    const backupPath = join(DAILY_BACKUP_DIR, `daily-${today}.json`)
    if (existsSync(backupPath)) { lastDailyBackupDate = today; return false }
    const data = readFileSync(DB_PATH, 'utf-8')
    let parsed = JSON.parse(data)
    writeFileSync(backupPath, JSON.stringify(parsed, null, 2))
    lastDailyBackupDate = today
    // Keep last 30 daily backups
    const files = readdirSync(DAILY_BACKUP_DIR)
      .filter(f => f.startsWith('daily-') && f.endsWith('.json'))
      .sort().reverse()
    for (const old of files.slice(30)) rmSync(join(DAILY_BACKUP_DIR, old))
    console.log(`Daily backup saved: daily-${today}.json`)
    return true
  } catch (e) {
    console.error('Daily backup error:', e.message)
    return false
  }
}

function writeDb(data) {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
    // Auto-backup on every write (keeps last 2 copies)
    try {
      if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      writeFileSync(join(BACKUP_DIR, `db-${ts}.json`), JSON.stringify(data, null, 2))
      // Keep only last 20 backups
      const files = readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).sort().reverse()
      for (const old of files.slice(20)) rmSync(join(BACKUP_DIR, old))
    } catch (be) {
      console.error('Backup error:', be.message)
    }
  } catch (e) {
    console.error('Error writing db.json:', e.message)
  }
}

// Persist ALL in-memory state to db.json (single source of truth)
// Billing system users (PIN-based login for billing staff)
let billingUsers = []
const BILLING_MODULES = [
  'pos', 'captain', 'kitchen', 'billing', 'kot', 'purchase',
  'inventory', 'menu', 'hr', 'loyalty', 'customers', 'reports',
  'dashboard', 'onlineOrders', 'users', 'expenses'
]

function makePermissions(all) {
  const perms = {}
  for (const mod of BILLING_MODULES) {
    perms[mod] = { view: all, create: all, update: all, delete: all }
  }
  return perms
}

const CASHIER_MODULES = ['pos', 'billing', 'customers']
const KITCHEN_MODULES = ['kitchen', 'kot']
const MANAGER_RESTRICT = ['users']

function getDefaultPermissions(role) {
  if (role === 'admin' || role === 'super-admin') return makePermissions(true)
  const perms = makePermissions(false)
  if (role === 'manager') {
    for (const mod of BILLING_MODULES) {
      if (!MANAGER_RESTRICT.includes(mod)) {
        perms[mod] = { view: true, create: true, update: true, delete: true }
      }
    }
    return perms
  }
  if (role === 'cashier') {
    for (const mod of CASHIER_MODULES) {
      perms[mod] = { view: true, create: true, update: true, delete: false }
    }
    return perms
  }
  if (role === 'kitchen') {
    for (const mod of KITCHEN_MODULES) {
      perms[mod] = { view: true, create: true, update: true, delete: false }
    }
    return perms
  }
  return perms
}

// Daily expense tracking
let expenses = []
let purchases = []
let suppliers = []
let purchaseOrders = []
let poItems = []
let grns = []
let vendorPayments = []
let onlineOrders = []
let settings = {
  company: { name: 'Ten Den Gyros', address: 'Shop 1 & 2, R.S.No.345/3 Kottakuppam, Viluppuram', phone: '000000000', email: '', gst: '', logo: null, upiId: '' },
  theme: { accentPrimary: '#e63946', accentPrimaryDark: '#c1121f', bgPrimary: '#f5f5f7' },
  printers: [{ id: 'default', name: 'Default Printer', ip: '', type: 'browser', isDefault: true }]
}
let aggregators = [
  { id: 'swiggy', name: 'Swiggy', displayName: 'Swiggy', isActive: true, defaultPrepTime: 25, color: '#ff5200' },
  { id: 'zomato', name: 'Zomato', displayName: 'Zomato', isActive: true, defaultPrepTime: 20, color: '#e23744' },
  { id: 'zepto', name: 'Zepto', displayName: 'Zepto', isActive: true, defaultPrepTime: 15, color: '#9d2b6b' },
  { id: 'direct', name: 'Direct', displayName: 'Direct Order', isActive: true, defaultPrepTime: 20, color: '#4895ef' }
]

function saveState() {
  const db = readDb()
  db.orders = orders
  db.loyaltyUsers = loyaltyUsers
  db.dens = dens
  db.pointTransactions = pointTransactions
  db.inventory = inventory
  db.orderNumber = orderNumber
  db.usedReferralCodes = [...usedReferralCodes]
  db.expenses = expenses
  db.purchases = purchases
  db.onlineOrders = onlineOrders
  db.aggregators = aggregators
  db.billingUsers = billingUsers
  db.categories = categories
  db.menuItems = menuItems
  db.recipes = recipes
  db.users = mobileAppUsers
  db.suppliers = suppliers
  db.purchaseOrders = purchaseOrders
  db.poItems = poItems
  db.grns = grns
  db.vendorPayments = vendorPayments
  db.settings = settings
  writeDb(db)
}

// Restore in-memory state from db.json on startup
function restoreState() {
  // Safety: if db.json was wiped by deploy, restore latest backup
  if (!existsSync(DB_PATH) && existsSync(BACKUP_DIR)) {
    const backups = readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).sort().reverse()
    if (backups.length > 0) {
      const latest = join(BACKUP_DIR, backups[0])
      try {
        const data = readFileSync(latest, 'utf-8')
        writeFileSync(DB_PATH, data)
        console.log('Auto-restored db.json from backup:', backups[0])
      } catch (e) { console.error('Backup restore failed:', e.message) }
    }
  }
  const db = readDb()
  if (db.orders?.length) orders = db.orders
  if (db.loyaltyUsers?.length) loyaltyUsers = db.loyaltyUsers
  if (db.dens?.length) dens = db.dens
  if (db.pointTransactions?.length) pointTransactions = db.pointTransactions
  if (db.inventory?.length) inventory = db.inventory
  if (db.orderNumber) orderNumber = db.orderNumber
  if (db.usedReferralCodes?.length) usedReferralCodes = new Set(db.usedReferralCodes)
  if (db.expenses?.length) expenses = db.expenses
  if (db.purchases?.length) purchases = db.purchases
  if (db.onlineOrders?.length) onlineOrders = db.onlineOrders
  if (db.aggregators?.length) aggregators = db.aggregators
  if (db.categories?.length) categories = db.categories
  if (db.menuItems?.length) menuItems = db.menuItems
  if (db.recipes?.length) recipes = db.recipes
  if (db.users?.length) mobileAppUsers = db.users
  if (db.suppliers?.length) suppliers = db.suppliers
  if (db.purchaseOrders?.length) purchaseOrders = db.purchaseOrders
  if (db.poItems?.length) poItems = db.poItems
  if (db.grns?.length) grns = db.grns
  if (db.vendorPayments?.length) vendorPayments = db.vendorPayments
  if (db.settings) settings = { ...settings, ...db.settings }
  if (db.billingUsers?.length) {
    billingUsers = db.billingUsers
    // Migrate plaintext PINs to bcrypt hashes (existing data from before hashing was implemented)
    billingUsers.forEach(u => {
      if (u.pin && u.pin.length === 4 && /^\d{4}$/.test(u.pin)) {
        u.pin = bcrypt.hashSync(u.pin, 10)
      }
    })
  }
}

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Serve uploaded files (logos etc.)
const UPLOADS_DIR = join(__dirname, 'uploads')
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })
app.use('/uploads', express.static(UPLOADS_DIR))

// In-memory database
let mobileAppUsers = []
let orders = []
let orderNumber = 1000
let categories = [
  { id: 'c1', name: 'Gyros', displayOrder: 1, color: '#e63946' },
  { id: 'c2', name: 'Burger', displayOrder: 2, color: '#f59e0b' },
  { id: 'c3', name: 'Salads', displayOrder: 3, color: '#10b981' },
  { id: 'c4', name: 'Sides', displayOrder: 4, color: '#dc2626' },
  { id: 'c5', name: 'TDG Crispy Chicken', displayOrder: 5, color: '#fbbf24' },
  { id: 'c6', name: 'Thick Shakes', displayOrder: 6, color: '#8b5cf6' },
  { id: 'c7', name: 'Softy', displayOrder: 7, color: '#ec4899' },
  { id: 'c8', name: 'Desserts', displayOrder: 8, color: '#f472b6' },
  { id: 'c9', name: 'Beverages', displayOrder: 9, color: '#3b82f6' }
]

let menuItems = [
  // Gyros (c1)
  { id: 'm1', categoryId: 'c1', name: 'Non-Veg - Spicy Chicken Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm2', categoryId: 'c1', name: 'Non-Veg - Spicy Chicken Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm3', categoryId: 'c1', name: 'Non-Veg - Cream Chicken Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm4', categoryId: 'c1', name: 'Non-Veg - Cream Chicken Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm5', categoryId: 'c1', name: 'Non-Veg - BBQ Chicken Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm6', categoryId: 'c1', name: 'Non-Veg - BBQ Chicken Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm7', categoryId: 'c1', name: 'Non-Veg - Pesto Chicken Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm8', categoryId: 'c1', name: 'Non-Veg - Pesto Chicken Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm9', categoryId: 'c1', name: 'Veg - Spicy Paneer Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm10', categoryId: 'c1', name: 'Veg - Spicy Paneer Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm11', categoryId: 'c1', name: 'Veg - Cream Paneer Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm12', categoryId: 'c1', name: 'Veg - Cream Paneer Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm13', categoryId: 'c1', name: 'Veg - BBQ Paneer Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm14', categoryId: 'c1', name: 'Veg - BBQ Paneer Gyro (Large)', price: 249, isAvailable: true },
  { id: 'm15', categoryId: 'c1', name: 'Veg - Pesto Paneer Gyro (Regular)', price: 99, isAvailable: true },
  { id: 'm16', categoryId: 'c1', name: 'Veg - Pesto Paneer Gyro (Large)', price: 249, isAvailable: true },

  // Burgers (c2)
  { id: 'm17', categoryId: 'c2', name: 'Non-Veg - Spicy Egg Burger', price: 79, isAvailable: true },
  { id: 'm18', categoryId: 'c2', name: 'Non-Veg - Crispy Chicken Burger', price: 99, isAvailable: true },
  { id: 'm19', categoryId: 'c2', name: 'Veg - Spicy Paneer Burger', price: 99, isAvailable: true },

  // Salads (c3)
  { id: 'm20', categoryId: 'c3', name: 'Non-Veg - Chicken Salad', price: 99, isAvailable: true },
  { id: 'm21', categoryId: 'c3', name: 'Veg - Paneer Salad', price: 99, isAvailable: true },

  // Sides (c4)
  { id: 'm22', categoryId: 'c4', name: 'Non-Veg - Loaded Chicken Fries', price: 199, isAvailable: true },
  { id: 'm23', categoryId: 'c4', name: 'Veg - Fries (Salted, Peri Peri Or Cajun)', price: 99, isAvailable: true },
  { id: 'm24', categoryId: 'c4', name: 'Veg - Loaded Paneer Fries', price: 199, isAvailable: true },
  { id: 'm25', categoryId: 'c4', name: 'Veg - 6 pcs Halloumi Strips', price: 149, isAvailable: true },

  // TDG Crispy Chicken (c5)
  // Leg & Thigh
  { id: 'm26', categoryId: 'c5', name: 'Non-Veg - 1 Pc Crispy Chicken (1 Dip)', price: 70, isAvailable: true },
  { id: 'm27', categoryId: 'c5', name: 'Non-Veg - 2 Pc Crispy Chicken (1 Dip)', price: 140, isAvailable: true },
  { id: 'm28', categoryId: 'c5', name: 'Non-Veg - 4 Pc Crispy Chicken (2 Dip)', price: 280, isAvailable: true },
  { id: 'm29', categoryId: 'c5', name: 'Non-Veg - 8 Pc Crispy Chicken (4 Dip)', price: 560, isAvailable: true },
  { id: 'm30', categoryId: 'c5', name: 'Non-Veg - 12 Pc Crispy Chicken (6 Dip)', price: 840, isAvailable: true },
  // Wings
  { id: 'm31', categoryId: 'c5', name: 'Non-Veg - 3 Pc Crispy Wings (1 Dip)', price: 90, isAvailable: true },
  { id: 'm32', categoryId: 'c5', name: 'Non-Veg - 6 Pc Crispy Wings (2 Dip)', price: 180, isAvailable: true },
  { id: 'm33', categoryId: 'c5', name: 'Non-Veg - 9 Pc Crispy Wings (3 Dip)', price: 270, isAvailable: true },
  { id: 'm34', categoryId: 'c5', name: 'Non-Veg - 20 Pc Crispy Wings (6 Dip)', price: 600, isAvailable: true },
  { id: 'm35', categoryId: 'c5', name: 'Non-Veg - 60 Pc Crispy Wings (12 Dip)', price: 1500, isAvailable: true },
  // Strips
  { id: 'm36', categoryId: 'c5', name: 'Non-Veg - 3 Pc Crispy Strips (1 Dip)', price: 120, isAvailable: true },
  { id: 'm37', categoryId: 'c5', name: 'Non-Veg - 6 Pc Crispy Strips (2 Dip)', price: 240, isAvailable: true },
  { id: 'm38', categoryId: 'c5', name: 'Non-Veg - 9 Pc Crispy Strips (3 Dip)', price: 360, isAvailable: true },
  { id: 'm39', categoryId: 'c5', name: 'Non-Veg - 20 Pc Crispy Strips (6 Dip)', price: 800, isAvailable: true },
  { id: 'm40', categoryId: 'c5', name: 'Non-Veg - 60 Pc Crispy Strips (12 Dip)', price: 2400, isAvailable: true },

  // Thick Shakes (c6)
  { id: 'm41', categoryId: 'c6', name: 'Veg - Vanilla Shake (Regular)', price: 99, isAvailable: true },
  { id: 'm42', categoryId: 'c6', name: 'Veg - Vanilla Shake (Large)', price: 199, isAvailable: true },
  { id: 'm43', categoryId: 'c6', name: 'Veg - Strawberry Shake (Regular)', price: 99, isAvailable: true },
  { id: 'm44', categoryId: 'c6', name: 'Veg - Strawberry Shake (Large)', price: 199, isAvailable: true },
  { id: 'm45', categoryId: 'c6', name: 'Veg - Biscoff Shake (Regular)', price: 99, isAvailable: true },
  { id: 'm46', categoryId: 'c6', name: 'Veg - Biscoff Shake (Large)', price: 199, isAvailable: true },
  { id: 'm47', categoryId: 'c6', name: 'Veg - Dark Chocolate Shake (Regular)', price: 99, isAvailable: true },
  { id: 'm48', categoryId: 'c6', name: 'Veg - Dark Chocolate Shake (Large)', price: 199, isAvailable: true },
  { id: 'm49', categoryId: 'c6', name: 'Veg - Kunafa Pistachio Shake (Regular)', price: 99, isAvailable: true },
  { id: 'm50', categoryId: 'c6', name: 'Veg - Kunafa Pistachio Shake (Large)', price: 199, isAvailable: true },

  // Softy (c7)
  { id: 'm51', categoryId: 'c7', name: 'Veg - Vanilla Softy', price: 39, isAvailable: true },

  // Desserts (c8)
  { id: 'm52', categoryId: 'c8', name: 'Veg - Chocolate Brownie', price: 99, isAvailable: true },
  { id: 'm53', categoryId: 'c8', name: 'Veg - Blondy Cake', price: 99, isAvailable: true },

  // Beverages (c9)
  { id: 'm54', categoryId: 'c9', name: 'Veg - Sprite / Coca-Cola (Regular)', price: 59, isAvailable: true },
  { id: 'm55', categoryId: 'c9', name: 'Veg - Sprite / Coca-Cola (Large)', price: 99, isAvailable: true },
  { id: 'm56', categoryId: 'c9', name: 'Veg - Ice Tea (Peach / Lime) (Regular)', price: 59, isAvailable: true },
  { id: 'm57', categoryId: 'c9', name: 'Veg - Ice Tea (Peach / Lime) (Large)', price: 99, isAvailable: true },
  { id: 'm58', categoryId: 'c9', name: 'Veg - Hot Chocolate', price: 149, isAvailable: true },
  { id: 'm59', categoryId: 'c9', name: 'Veg - Signature Tea', price: 99, isAvailable: true }
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

// Verify asset OTP — called by the referred person during signup
app.post('/api/assets/verify-otp', (req, res) => {
  const { phone, otp } = req.body
  if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP required' })

  const db = readDb()
  // Find any master user who has this phone as a pending asset with matching OTP
  for (const master of db.users) {
    const assets = master.assets || []
    const asset = assets.find(a => a.phone === phone && a.status === 'pending' && a.otp === otp)
    if (asset) {
      // Check OTP expiry
      if (asset.otpExpiry && new Date(asset.otpExpiry) < new Date()) {
        return res.status(400).json({ message: 'OTP expired. Ask your referrer to add you again.' })
      }
      // OTP valid — activate asset
      asset.status = 'active'
      asset.activatedAt = new Date().toISOString()
      asset.otp = null
      asset.otpExpiry = null
      writeDb(db)
      return res.json({ success: true, message: 'OTP verified', masterName: master.name, masterId: master.id })
    }
  }
  res.status(400).json({ message: 'Invalid OTP or phone number' })
})

// Auth - Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone, password, referredBy, otp } = req.body
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    if (mobileAppUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }
    if (mobileAppUsers.find(u => u.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''))) {
      return res.status(400).json({ message: 'User with this phone number already exists' })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const userId = 'u_' + Date.now()
    const now = new Date().toISOString()
    const newUser = {
      id: userId,
      name, email, phone,
      password: hashedPassword,
      role: 'user',
      points: 500,
      assets: [],
      totalDistributed: 0,
      cashbackEarned: 0,
      assetsDinedCount: 0,
      allAssetsActive: false,
      bonusClaimed: false,
      referredBy: referredBy || null,
      referredByName: null,
      createdAt: now
    }

    // Link to master user if referredBy is provided
    if (referredBy) {
      const master = mobileAppUsers.find(u => u.id === referredBy || u.email.toLowerCase() === referredBy.toLowerCase() || u.phone.replace(/[^0-9]/g, '') === referredBy.replace(/[^0-9]/g, ''))
      if (master) {
        newUser.referredBy = master.id
        newUser.referredByName = master.name
        // Update master's asset list - verify OTP if provided
        const masterAssets = master.assets || []
        const assetIdx = masterAssets.findIndex(a => a.phone === phone)
        if (assetIdx >= 0) {
          // OTP verification: if asset has an OTP, must match
          if (masterAssets[assetIdx].otp && masterAssets[assetIdx].status === 'pending') {
            if (!otp) {
              return res.status(400).json({ message: 'OTP required to verify referral. Ask your referrer for the code.' })
            }
            if (masterAssets[assetIdx].otp !== otp) {
              return res.status(400).json({ message: 'Invalid OTP. Please check the code from your referrer.' })
            }
            if (masterAssets[assetIdx].otpExpiry && new Date(masterAssets[assetIdx].otpExpiry) < new Date()) {
              return res.status(400).json({ message: 'OTP expired. Ask your referrer to add you again.' })
            }
          }
          masterAssets[assetIdx].status = 'active'
          masterAssets[assetIdx].activatedAt = now
          masterAssets[assetIdx].otp = null
          masterAssets[assetIdx].otpExpiry = null
          master.assetsDinedCount = master.assetsDinedCount || 0
        } else if (masterAssets.length < 10) {
          // Auto-add as asset if master has less than 10
          masterAssets.push({
            id: 'a_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            name, phone,
            status: 'active',
            activatedAt: now,
            hasDined: false,
            pointsDistributed: 0
          })
        }
        master.assets = masterAssets
        // Give referrer +50 bonus points
        master.points = (master.points || 0) + 50
      }
    }

    mobileAppUsers.push(newUser)
    saveState()

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
    const clean = email.trim().toLowerCase()
    const user = mobileAppUsers.find(u => u.email.toLowerCase() === clean || u.phone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, ''))
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

// Auth - Forgot Password (send OTP)
app.post('/api/auth/forgot-password', (req, res) => {
  const { phone } = req.body
  if (!phone) return res.status(400).json({ message: 'Phone number required' })

  const db = readDb()
  const user = db.users.find(u => u.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''))
  if (!user) return res.status(404).json({ message: 'No account found with this phone number' })

  const otp = String(Math.floor(1000 + Math.random() * 9000))
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
  user.forgotPasswordOtp = otp
  user.forgotPasswordOtpExpiry = otpExpiry
  writeDb(db)

  console.log(`[FORGOT PASSWORD] OTP for ${phone}: ${otp}`)
  res.json({ success: true, message: 'OTP sent successfully' })
})

// Auth - Reset Password (verify OTP + set new password)
app.post('/api/auth/reset-password', async (req, res) => {
  const { phone, otp, newPassword } = req.body
  if (!phone || !otp || !newPassword) return res.status(400).json({ message: 'Phone, OTP, and new password required' })
  if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

  const db = readDb()
  const user = db.users.find(u => u.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''))
  if (!user) return res.status(404).json({ message: 'User not found' })

  if (!user.forgotPasswordOtp || user.forgotPasswordOtp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' })
  }
  if (user.forgotPasswordOtpExpiry && new Date(user.forgotPasswordOtpExpiry) < new Date()) {
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' })
  }

  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(newPassword, salt)
  user.forgotPasswordOtp = null
  user.forgotPasswordOtpExpiry = null
  writeDb(db)

  res.json({ success: true, message: 'Password reset successful' })
})

function getMobileUser(userId) {
  let user = mobileAppUsers.find(u => u.id === userId)
  if (!user) {
    const db = readDb()
    user = (db.users || []).find(u => u.id === userId)
    if (user) {
      const idx = mobileAppUsers.findIndex(u => u.id === userId)
      if (idx >= 0) mobileAppUsers[idx] = user
      else mobileAppUsers.push(user)
    }
  }
  return user
}

// Auth - Profile
app.get('/api/auth/profile', auth, (req, res) => {
  const user = getMobileUser(req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const { password: _, ...userWithoutPassword } = user
  res.json(userWithoutPassword)
})

// Auth - Update Profile
app.put('/api/auth/profile', auth, (req, res) => {
  const { name, phone, email } = req.body
  const user = getMobileUser(req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  if (name) user.name = name
  if (phone) user.phone = phone
  if (email) {
    const other = mobileAppUsers.find(u => u.id !== req.userId && u.email.toLowerCase() === email.toLowerCase())
    if (other) return res.status(400).json({ message: 'Email already in use' })
    user.email = email
  }
  saveState()
  const { password: _, ...userWithoutPassword } = user
  res.json(userWithoutPassword)
})

// ============ ASSET MANAGEMENT API ============

// Get user's assets and points
app.get('/api/assets', auth, (req, res) => {
  const user = getMobileUser(req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({
    points: user.points || 0,
    assets: user.assets || [],
    totalDistributed: user.totalDistributed || 0,
    availablePoints: (user.points || 0) - (user.totalDistributed || 0),
    cashbackEarned: user.cashbackEarned || 0,
    assetsDinedCount: user.assetsDinedCount || 0,
    allAssetsActive: user.allAssetsActive || false,
    bonusClaimed: user.bonusClaimed || false,
    referredBy: user.referredBy || null,
    referredByName: user.referredByName || null
  })
})

// Add an asset (friend)
app.post('/api/assets', auth, (req, res) => {
  const { name, phone } = req.body
  if (!name || !phone) return res.status(400).json({ message: 'Name and phone required' })

  const user = getMobileUser(req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const assets = user.assets || []
  if (assets.length >= 10) return res.status(400).json({ message: 'Maximum 10 assets allowed' })
  if (assets.find(a => a.phone === phone)) return res.status(400).json({ message: 'Asset with this phone already added' })

  // Generate 4-digit OTP
  const otp = String(Math.floor(1000 + Math.random() * 9000))
  const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

  const newAsset = {
    id: 'a_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name,
    phone,
    status: 'pending',
    activatedAt: null,
    hasDined: false,
    pointsDistributed: 0,
    otp,
    otpExpiry
  }

  assets.push(newAsset)
  user.assets = assets
  saveState()
  res.json({ success: true, asset: newAsset, assets: user.assets, otp })
})

// Replace an asset (if friend hasn't activated)
app.put('/api/assets/:assetId', auth, (req, res) => {
  const { assetId } = req.params
  const { name, phone } = req.body
  if (!name || !phone) return res.status(400).json({ message: 'Name and phone required' })

  const db = readDb()
  const user = db.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const assets = user.assets || []
  const idx = assets.findIndex(a => a.id === assetId)
  if (idx === -1) return res.status(404).json({ message: 'Asset not found' })

  // Only allow replacement if asset hasn't activated (no dine recorded)
  if (assets[idx].hasDined) return res.status(400).json({ message: 'Cannot replace an asset who has already dined' })

  assets[idx] = { ...assets[idx], name, phone, status: 'pending', activatedAt: null }
  user.assets = assets
  writeDb(db)
  res.json({ success: true, asset: assets[idx], assets: user.assets })
})

// Remove an asset
app.delete('/api/assets/:assetId', auth, (req, res) => {
  const { assetId } = req.params
  const db = readDb()
  const user = db.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const assets = user.assets || []
  const idx = assets.findIndex(a => a.id === assetId)
  if (idx === -1) return res.status(404).json({ message: 'Asset not found' })

  // Return undistributed points back
  const undistributedPoints = assets[idx].pointsDistributed || 0
  assets.splice(idx, 1)
  user.assets = assets
  user.totalDistributed = (user.totalDistributed || 0) - undistributedPoints

  writeDb(db)
  res.json({ success: true, assets: user.assets, pointsRefunded: undistributedPoints })
})

// Distribute points to an asset
app.post('/api/assets/distribute', auth, (req, res) => {
  const { assetId, amount } = req.body
  if (!assetId || !amount || amount <= 0) return res.status(400).json({ message: 'Asset ID and valid amount required' })

  const db = readDb()
  const user = db.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const assets = user.assets || []
  const asset = assets.find(a => a.id === assetId)
  if (!asset) return res.status(404).json({ message: 'Asset not found' })

  const availablePoints = (user.points || 0) - (user.totalDistributed || 0)
  if (amount > availablePoints) return res.status(400).json({ message: 'Insufficient available points', available: availablePoints })

  // Credit points to the asset's account if they exist
  const assetUser = db.users.find(u => u.phone === asset.phone)
  if (assetUser) {
    assetUser.points = (assetUser.points || 0) + amount
    if (!db.transactions) db.transactions = []
    db.transactions.push({
      id: 't_' + Date.now(),
      userId: assetUser.id,
      type: 'credit',
      amount,
      description: 'Points received from ' + user.name,
      createdAt: new Date().toISOString()
    })
    asset.status = 'active'
    asset.activatedAt = asset.activatedAt || new Date().toISOString()
  }

  asset.pointsDistributed = (asset.pointsDistributed || 0) + amount
  user.totalDistributed = (user.totalDistributed || 0) + amount

  // Check if all 10 assets have been distributed to and all dined
  checkAllAssetsBonus(user, db)

  writeDb(db)
  res.json({
    success: true,
    asset,
    points: user.points,
    totalDistributed: user.totalDistributed,
    availablePoints: (user.points || 0) - (user.totalDistributed || 0)
  })
})

// Get discount info for a customer (used by billing app + checkout)
// Query params: ?billAmount=XXX
app.get('/api/assets/discount/:phone', (req, res) => {
  const db = readDb()
  const customer = db.users.find(u => u.phone === req.params.phone)
  if (!customer) return res.json({ discount: 0, message: 'No account', isAsset: false })

  const billAmount = Number(req.query.billAmount) || 0
  const isAsset = !!customer.referredBy
  let discount = 0
  let message = ''

  // Asset promotional discount based on bill amount
  if (isAsset) {
    if (billAmount > 0 && billAmount < 500) {
      discount = 20
      message = '20% asset discount (bill under ₹500)'
    } else if (billAmount >= 500) {
      discount = 25
      message = '25% asset discount (bill ₹500+)'
    } else {
      discount = 20
      message = '20% asset discount'
    }
  }

  // Flat 10% for any logged-in app user (stacks with asset discount)
  const loggedInDiscount = 10
  const loggedInMessage = ' + 10% app login discount'

  const totalDiscount = discount + loggedInDiscount
  const finalMessage = isAsset
    ? '$message$loggedInMessage'
    : '10% app login discount'

  res.json({
    discount: isAsset ? totalDiscount : loggedInDiscount,
    message: finalMessage,
    assetDiscount: discount,
    loggedInDiscount: loggedInDiscount,
    points: customer.points || 0,
    isAsset,
    canRedeemPoints: isAsset
  })
})

// Get master user for cashback when asset pays bill
app.get('/api/assets/master/:phone', (req, res) => {
  const db = readDb()
  const customer = db.users.find(u => u.phone === req.params.phone)
  if (!customer || !customer.referredBy) return res.json({ master: null })

  const master = db.users.find(u => u.id === customer.referredBy)
  if (!master) return res.json({ master: null })

  res.json({ master: { id: master.id, name: master.name } })
})

// Helper: check if all 10 assets have dined and give bonus
function checkAllAssetsBonus(user, db) {
  const assets = user.assets || []
  if (assets.length < 10) return false

  const allDined = assets.every(a => a.hasDined)
  if (allDined && !user.allAssetsActive) {
    user.allAssetsActive = true
    // +500 bonus
    user.points = (user.points || 0) + 500
    if (!db.transactions) db.transactions = []
    db.transactions.push({
      id: 't_' + Date.now(),
      userId: user.id,
      type: 'credit',
      amount: 500,
      description: 'All 10 assets dined! Bonus points',
      createdAt: new Date().toISOString()
    })

    // +100 sharing bonus
    if (!user.bonusClaimed) {
      user.bonusClaimed = true
      user.points += 100
      db.transactions.push({
        id: 't_' + Date.now() + '_b',
        userId: user.id,
        type: 'credit',
        amount: 100,
        description: 'Sharing bonus - 10 assets completed',
        createdAt: new Date().toISOString()
      })
    }
    return true
  }
  return false
}

// ============ BILLING USERS API (PIN-based login for billing staff) ============

// Billing login - verify PIN
app.post('/api/billing/login', async (req, res) => {
  try {
    const { pin } = req.body
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ error: '4-digit PIN required' })
    }
    const user = billingUsers.find(u => bcrypt.compareSync(pin, u.pin))
    if (!user) {
      return res.status(401).json({ error: 'Invalid PIN' })
    }
    const { pin: _, ...userWithoutPin } = user
    const safeUser = { ...userWithoutPin, permissions: user.permissions || getDefaultPermissions(user.role) }
    res.json({ user: safeUser })
  } catch (error) {
    console.error('Billing login error:', error)
    res.status(500).json({ error: 'Server error during login' })
  }
})

// Change own PIN
app.post('/api/billing/change-pin', (req, res) => {
  const { userId, currentPin, newPin } = req.body
  if (!userId || !currentPin || !newPin) {
    return res.status(400).json({ error: 'userId, currentPin, and newPin required' })
  }
  if (newPin.length !== 4) {
    return res.status(400).json({ error: 'New PIN must be 4 digits' })
  }
  const user = billingUsers.find(u => u.id === userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (!bcrypt.compareSync(currentPin, user.pin)) return res.status(400).json({ error: 'Current PIN is incorrect' })
  if (billingUsers.some(u => u.id !== userId && bcrypt.compareSync(newPin, u.pin))) {
    return res.status(400).json({ error: 'New PIN already in use by another user' })
  }
  user.pin = bcrypt.hashSync(newPin, 10)
  saveState()
  res.json({ success: true, message: 'PIN changed successfully' })
})

// List billing users
app.get('/api/billing/users', (req, res) => {
  const safe = billingUsers.map(({ pin, ...u }) => ({ ...u, permissions: u.permissions || getDefaultPermissions(u.role) }))
  res.json(safe)
})

// Create billing user
app.post('/api/billing/users', async (req, res) => {
  try {
    const { name, pin, role } = req.body
    if (!name || !pin || !role) return res.status(400).json({ error: 'Name, PIN, and role required' })
    if (pin.length !== 4) return res.status(400).json({ error: 'PIN must be 4 digits' })
    if (billingUsers.some(u => bcrypt.compareSync(pin, u.pin))) return res.status(400).json({ error: 'PIN already in use' })
    
    const id = 'bu_' + Date.now()
    const permissions = req.body.permissions || getDefaultPermissions(role)
    const newUser = { id, name, pin: bcrypt.hashSync(pin, 10), role, permissions, createdAt: new Date().toISOString() }
    billingUsers.push(newUser)
    saveState()
    
    const { pin: _, ...safe } = newUser
    res.status(201).json({ user: { ...safe, permissions } })
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' })
  }
})

// Update billing user
app.put('/api/billing/users/:id', async (req, res) => {
  try {
    const idx = billingUsers.findIndex(u => u.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'User not found' })
    
    const { name, role, permissions, pin } = req.body
    if (name) billingUsers[idx].name = name
    if (role) billingUsers[idx].role = role
    if (permissions) billingUsers[idx].permissions = permissions
    if (pin) {
      if (pin.length !== 4) return res.status(400).json({ error: 'PIN must be 4 digits' })
      if (billingUsers.some((u, i) => i !== idx && bcrypt.compareSync(pin, u.pin))) return res.status(400).json({ error: 'PIN already in use' })
      billingUsers[idx].pin = bcrypt.hashSync(pin, 10)
    }
    saveState()
    
    const { pin: _, ...safe } = billingUsers[idx]
    res.json({ user: { ...safe, permissions: billingUsers[idx].permissions } })
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' })
  }
})

// Delete billing user
app.delete('/api/billing/users/:id', (req, res) => {
  const idx = billingUsers.findIndex(u => u.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'User not found' })
  if (billingUsers[idx].role === 'admin' || billingUsers[idx].role === 'super-admin') return res.status(400).json({ error: 'Cannot delete admin user' })
  billingUsers.splice(idx, 1)
  saveState()
  res.json({ success: true })
})

// Get all mobile app customers
app.get('/api/customers', (req, res) => {
  const db = readDb()
  const customers = (db.users || []).map(u => ({
    id: u.id,
    name: u.name || '',
    phone: u.phone || '',
    email: u.email || '',
    points: u.points || 0,
    totalOrders: (u.orderHistory || []).length,
    totalSpent: (u.orderHistory || []).reduce((s, o) => s + (o.total || 0), 0),
    createdAt: u.createdAt || u.signupAt || '',
    lastVisit: u.lastVisit || u.updatedAt || u.createdAt || ''
  }))
  res.json(customers)
})

// ============ BILLING CUSTOMER / ASSET MANAGEMENT ============

// Create a mobile app customer from billing app
app.post('/api/billing/customers', async (req, res) => {
  const { pin, name, email, phone } = req.body
  if (!pin || pin.length !== 4) return res.status(400).json({ error: 'Valid billing PIN required' })
  const billingUser = billingUsers.find(u => bcrypt.compareSync(pin, u.pin))
  if (!billingUser) return res.status(403).json({ error: 'Invalid PIN' })
  if (!name || !email || !phone) return res.status(400).json({ error: 'Name, email, and phone required' })

  const db = readDb()
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) return res.status(400).json({ error: 'Email already registered' })
  if (db.users.find(u => u.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''))) return res.status(400).json({ error: 'Phone already registered' })

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(phone.slice(-6), salt)
  const now = new Date().toISOString()
  const newUser = {
    id: 'u_' + Date.now(),
    name, email, phone,
    password: hashedPassword,
    role: 'user',
    points: 500,
    assets: [],
    totalDistributed: 0,
    cashbackEarned: 0,
    assetsDinedCount: 0,
    allAssetsActive: false,
    bonusClaimed: false,
    referredBy: null,
    referredByName: null,
    createdAt: now
  }
  db.users.push(newUser)
  writeDb(db)
  res.json({ success: true, customer: { id: newUser.id, name, email, phone, points: 500, createdAt: now }, password: phone.slice(-6) })
})

// Get a customer's den/assets from billing app
app.get('/api/billing/customer-assets/:phone', (req, res) => {
  const pin = req.query.pin
  if (!pin || pin.length !== 4) return res.status(400).json({ error: 'Valid billing PIN required' })
  const billingUser = billingUsers.find(u => bcrypt.compareSync(pin, u.pin))
  if (!billingUser) return res.status(403).json({ error: 'Invalid PIN' })

  const db = readDb()
  const customer = db.users.find(u => u.phone.replace(/[^0-9]/g, '') === req.params.phone.replace(/[^0-9]/g, ''))
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  res.json({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    points: customer.points || 0,
    totalDistributed: customer.totalDistributed || 0,
    cashbackEarned: customer.cashbackEarned || 0,
    assetsDinedCount: customer.assetsDinedCount || 0,
    allAssetsActive: customer.allAssetsActive || false,
    bonusClaimed: customer.bonusClaimed || false,
    assets: (customer.assets || []).map(a => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      status: a.status,
      hasDined: a.hasDined,
      pointsDistributed: a.pointsDistributed || 0
    }))
  })
})

// Add an asset to a customer's den from billing app
app.post('/api/billing/assets', async (req, res) => {
  const { pin, customerPhone, name, phone } = req.body
  if (!pin || pin.length !== 4) return res.status(400).json({ error: 'Valid billing PIN required' })
  const billingUser = billingUsers.find(u => bcrypt.compareSync(pin, u.pin))
  if (!billingUser) return res.status(403).json({ error: 'Invalid PIN' })
  if (!customerPhone || !name || !phone) return res.status(400).json({ error: 'Customer phone, asset name, and asset phone required' })

  const db = readDb()
  const customer = db.users.find(u => u.phone.replace(/[^0-9]/g, '') === customerPhone.replace(/[^0-9]/g, ''))
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  const assets = customer.assets || []
  if (assets.length >= 10) return res.status(400).json({ error: 'Maximum 10 assets allowed' })
  if (assets.find(a => a.phone === phone)) return res.status(400).json({ error: 'Asset with this phone already added' })

  const otp = String(Math.floor(1000 + Math.random() * 9000))
  const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const newAsset = {
    id: 'a_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name,
    phone,
    status: 'pending',
    activatedAt: null,
    hasDined: false,
    pointsDistributed: 0,
    otp,
    otpExpiry
  }

  assets.push(newAsset)
  customer.assets = assets
  writeDb(db)
  res.json({ success: true, asset: newAsset, assets: customer.assets, otp })
})

// ============ SETTINGS API ============

// Public: get settings (needed for theme on login page)
app.get('/api/settings', (req, res) => {
  res.json(settings)
})

// Helper: verify super-admin PIN from request body
function verifySuperAdmin(pin) {
  if (!pin || pin.length !== 4) return { ok: false, error: '4-digit PIN required' }
  const user = billingUsers.find(u => bcrypt.compareSync(pin, u.pin))
  if (!user) return { ok: false, error: 'Invalid PIN' }
  if (user.role !== 'super-admin') return { ok: false, error: 'Super admin access required' }
  return { ok: true, user }
}

// Update company info
app.put('/api/settings/company', (req, res) => {
  const auth = verifySuperAdmin(req.body.pin)
  if (!auth.ok) return res.status(403).json({ error: auth.error })
  const { name, address, phone, email, gst } = req.body
  if (name !== undefined) settings.company.name = name
  if (address !== undefined) settings.company.address = address
  if (phone !== undefined) settings.company.phone = phone
  if (email !== undefined) settings.company.email = email
  if (gst !== undefined) settings.company.gst = gst
  if (upiId !== undefined) settings.company.upiId = upiId
  const db = readDb(); db.settings = settings; writeDb(db)
  res.json({ success: true, settings })
})

// Update theme
app.put('/api/settings/theme', (req, res) => {
  const auth = verifySuperAdmin(req.body.pin)
  if (!auth.ok) return res.status(403).json({ error: auth.error })
  const { accentPrimary, accentPrimaryDark, bgPrimary } = req.body
  if (accentPrimary !== undefined) settings.theme.accentPrimary = accentPrimary
  if (accentPrimaryDark !== undefined) settings.theme.accentPrimaryDark = accentPrimaryDark
  if (bgPrimary !== undefined) settings.theme.bgPrimary = bgPrimary
  const db = readDb(); db.settings = settings; writeDb(db)
  res.json({ success: true, settings })
})

// Update printers
app.put('/api/settings/printers', (req, res) => {
  const auth = verifySuperAdmin(req.body.pin)
  if (!auth.ok) return res.status(403).json({ error: auth.error })
  if (req.body.printers) settings.printers = req.body.printers
  const db = readDb(); db.settings = settings; writeDb(db)
  res.json({ success: true, settings })
})

// Upload logo
app.post('/api/settings/upload-logo', (req, res) => {
  const pin = req.query.pin || req.headers['x-pin']
  const auth = verifySuperAdmin(pin)
  if (!auth.ok) return res.status(403).json({ error: auth.error })

  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    try {
      const buf = Buffer.concat(chunks)
      const ct = req.headers['content-type'] || ''
      let ext = 'png'
      if (ct.includes('jpeg') || ct.includes('jpg')) ext = 'jpg'
      else if (ct.includes('svg')) ext = 'svg'
      else if (ct.includes('webp')) ext = 'webp'

      const logoPath = join(UPLOADS_DIR, `logo.${ext}`)
      writeFileSync(logoPath, buf)
      settings.company.logo = `/uploads/logo.${ext}`
      const db = readDb(); db.settings = settings; writeDb(db)
      res.json({ success: true, logo: settings.company.logo })
    } catch (e) {
      res.status(500).json({ error: 'Logo upload failed: ' + e.message })
    }
  })
})

// Upload customers CSV
app.post('/api/settings/upload-customers', (req, res) => {
  const pin = req.query.pin || req.headers['x-pin']
  const auth = verifySuperAdmin(pin)
  if (!auth.ok) return res.status(403).json({ error: auth.error })

  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    try {
      const csv = Buffer.concat(chunks).toString('utf-8')
      const lines = csv.trim().split('\n')
      if (lines.length < 2) return res.status(400).json({ error: 'CSV must have header + at least 1 row' })

      const header = lines[0].toLowerCase().split(',').map(h => h.trim())
      const nameIdx = header.indexOf('name')
      const phoneIdx = header.indexOf('phone')
      const emailIdx = header.indexOf('email')

      let imported = 0, skipped = 0, errors = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim())
        const name = nameIdx >= 0 ? cols[nameIdx] : ''
        const phone = phoneIdx >= 0 ? cols[phoneIdx] : ''
        const email = emailIdx >= 0 ? cols[emailIdx] : ''

        if (!phone) { errors.push(`Row ${i + 1}: no phone`); skipped++; continue }
        if (loyaltyUsers.find(u => u.phone === phone)) { skipped++; continue }

        loyaltyUsers.push({
          id: 'lu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          name: name || 'Customer',
          phone,
          email: email || '',
          rubyPoints: 0,
          tier: 'Bronze',
          referredBy: null,
          denId: null,
          createdAt: new Date().toISOString()
        })
        imported++
      }
      saveState()
      res.json({ success: true, imported, skipped, errors })
    } catch (e) {
      res.status(500).json({ error: 'CSV parse failed: ' + e.message })
    }
  })
})

// Download backup
app.get('/api/settings/export-backup', (req, res) => {
  const pin = req.query.pin
  const auth = verifySuperAdmin(pin)
  if (!auth.ok) return res.status(403).json({ error: auth.error })

  const db = readDb()
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="tdg-backup-${new Date().toISOString().slice(0,10)}.json"`)
  res.json(db)
})

// Restore from backup
app.post('/api/settings/restore-backup', (req, res) => {
  const pin = req.query.pin || req.headers['x-pin']
  const auth = verifySuperAdmin(pin)
  if (!auth.ok) return res.status(403).json({ error: auth.error })

  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    try {
      const backupData = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
      // Save current as safety backup
      const ts = new Date().toISOString().replace(/[:.]/g, '-')
      const safetyPath = join(BACKUP_DIR, `db-pre-restore-${ts}.json`)
      if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })
      writeFileSync(safetyPath, JSON.stringify(readDb(), null, 2))

      // Restore
      writeFileSync(DB_PATH, JSON.stringify(backupData, null, 2))
      restoreState()
      res.json({ success: true, message: 'Backup restored. Page will reload.', backup: safetyPath })
    } catch (e) {
      res.status(500).json({ error: 'Invalid backup file: ' + e.message })
    }
  })
})

// Full settings update
app.put('/api/settings', (req, res) => {
  const auth = verifySuperAdmin(req.body.pin)
  if (!auth.ok) return res.status(403).json({ error: auth.error })
  if (req.body.company) settings.company = { ...settings.company, ...req.body.company }
  if (req.body.theme) settings.theme = { ...settings.theme, ...req.body.theme }
  if (req.body.printers) settings.printers = req.body.printers
  const db = readDb(); db.settings = settings; writeDb(db)
  res.json({ success: true, settings })
})

// Menu (mobile format)
app.get('/api/menu', (req, res) => {
  // Build from existing categories + menuItems dynamically so POS updates are reflected
  res.json({
    categories: categories.map(c => c.name),
    items: menuItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      desc: item.description || '',
      category: categories.find(c => c.id === item.categoryId)?.name || 'Other',
      tag: item.isAvailable ? 'Popular' : '',
      image: item.image || null,
      isAvailable: item.isAvailable !== false
    }))
  })
})

// Wallet
app.get('/api/wallet', auth, (req, res) => {
  const user = getMobileUser(req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const transactions = (readDb().transactions || []).filter(t => t.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({
    points: user.points || 0,
    cashbackEarned: user.cashbackEarned || 0,
    totalDistributed: user.totalDistributed || 0,
    availablePoints: (user.points || 0) - (user.totalDistributed || 0),
    assets: user.assets || [],
    assetsDinedCount: user.assetsDinedCount || 0,
    allAssetsActive: user.allAssetsActive || false,
    bonusClaimed: user.bonusClaimed || false,
    transactions
  })
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
  user.points = (user.points || 0) + user.scratchCards[cardIdx].amount
  if (!db.transactions) db.transactions = []
  db.transactions.push({ id: 't_' + Date.now(), userId: user.id, type: 'credit', amount: user.scratchCards[cardIdx].amount, description: 'Scratch Card: ' + user.scratchCards[cardIdx].title, createdAt: new Date().toISOString() })
  writeDb(db)
  const transactions = db.transactions.filter(t => t.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ message: 'Claimed!', points: user.points, scratchCards: user.scratchCards, transactions })
})

// Wallet - Add points
app.post('/api/wallet/add', auth, (req, res) => {
  const { amount } = req.body
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required' })
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === req.userId)
  if (idx === -1) return res.status(404).json({ message: 'User not found' })
  db.users[idx].points = (db.users[idx].points || 0) + Number(amount)
  if (!db.transactions) db.transactions = []
  db.transactions.push({ id: 't_' + Date.now(), userId: db.users[idx].id, type: 'credit', amount: Number(amount), description: 'Points added', createdAt: new Date().toISOString() })
  writeDb(db)
  const transactions = db.transactions.filter(t => t.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ message: `Added ${amount} points!`, points: db.users[idx].points, transactions })
})

// Wallet - Redeem points (used as bill discount)
app.post('/api/wallet/redeem', auth, (req, res) => {
  const { amount } = req.body
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required' })
  const db = readDb()
  const idx = db.users.findIndex(u => u.id === req.userId)
  if (idx === -1) return res.status(404).json({ message: 'User not found' })
  const user = db.users[idx]
  const userPoints = user.points || 0
  if (userPoints < amount) return res.status(400).json({ message: 'Insufficient points' })
  user.points = userPoints - Number(amount)
  if (!db.transactions) db.transactions = []
  db.transactions.push({ id: 't_' + Date.now(), userId: user.id, type: 'debit', amount: Number(amount), description: 'Points redeemed for bill discount', createdAt: new Date().toISOString() })
  writeDb(db)
  const transactions = db.transactions.filter(t => t.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json({ message: `Redeemed ${amount} points!`, points: user.points, transactions })
})

// Den progress (now Asset system)
app.get('/api/den', auth, (req, res) => {
  const user = getMobileUser(req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  const assets = user.assets || []
  const count = assets.length

  let denLevel = 'BRONZE'
  if (count >= 10) denLevel = 'DIAMOND'
  else if (count >= 6) denLevel = 'PLATINUM'
  else if (count >= 4) denLevel = 'GOLD'
  else if (count >= 2) denLevel = 'SILVER'
  else denLevel = 'BRONZE'

  res.json({
    points: user.points || 0,
    assetsCount: count,
    maxAssets: 10,
    denLevel,
    currentLevel: denLevel,
    assetsDinedCount: user.assetsDinedCount || 0,
    allAssetsActive: user.allAssetsActive || false,
    totalDistributed: user.totalDistributed || 0,
    cashbackEarned: user.cashbackEarned || 0,
    bonusClaimed: user.bonusClaimed || false,
    referredBy: user.referredBy || null,
    referredByName: user.referredByName || null,
    assets: assets.map(a => ({
      id: a.id,
      name: a.name,
      phone: a.phone,
      status: a.status,
      hasDined: a.hasDined,
      pointsDistributed: a.pointsDistributed
    }))
  })
})

// Mobile orders - get user's orders (merged with billing orders)
app.get('/api/orders', auth, (req, res) => {
  const db = readDb()
  const user = db.users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  
  // Admin sees ALL orders
  if (user.role === 'admin') {
    const allOrders = [
      ...db.orders,
      ...orders.map(o => ({ ...o, _source: 'billing' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return res.json(allOrders)
  }
  
  const userOrders = db.orders.filter(o => o.userId === req.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  // Include billing system orders linked by phone
  const billingOrders = orders.filter(o => o.customerPhone === user.phone).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  // Merge into a single list for backward compat with Flutter app
  const allOrders = [...userOrders, ...billingOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json(allOrders)
})

// Mobile orders - create order (synced to billing system)
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
  const now = new Date().toISOString()
  const order = { id: 'ORD' + nextNum, userId: user.id, items, subtotal, tax, deliveryFee, total, status: 'Placed', paymentMethod, deliveryAddress, createdAt: now }
  db.orders.push(order)
  writeDb(db)

  // SYNC: Push into billing in-memory orders so Kitchen/POS can see it
  const billingOrderId = uuid()
  const billingOrderNum = ++orderNumber
  const billingOrder = {
    id: billingOrderId,
    orderNumber: billingOrderNum,
    type: 'delivery',
    status: 'pending',
    source: 'mobile',
    subtotal: subtotal || 0,
    tax: tax || 0,
    total: total || 0,
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
    tableNumber: '',
    customerName: user.name,
    customerPhone: user.phone,
    userId: user.id,
    notes: deliveryAddress || '',
    createdAt: now,
    updatedAt: now,
    items: items.map(item => ({
      id: uuid(),
      menuItemId: item.menuItemId,
      menuItemName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: (item.price || 0) * (item.quantity || 1),
      status: 'pending'
    }))
  }
  orders.unshift(billingOrder)
  io.emit('order:created', billingOrder)
  io.to('kitchen').emit('kot:created', {
    id: billingOrderId,
    orderNumber: `K${billingOrderNum}`,
    items: billingOrder.items,
    tableNumber: billingOrder.tableNumber,
    type: billingOrder.type,
    createdAt: now
  })
  saveState()

  res.status(201).json({ message: 'Order placed!', order, billingOrderId, rubyBalance: user.rubyBalance })
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

// Menu Item CRUD
app.post('/api/admin/menu/items', (req, res) => {
  const { name, price, categoryId, description, isAvailable, image } = req.body
  if (!name || price === undefined || price === null) return res.status(400).json({ error: 'name and price required' })
  const id = 'm_' + Date.now()
  const catId = categoryId || (categories[0]?.id || 'c1')
  const item = { id, name, price: Number(price), categoryId: catId, description: description || '', isAvailable: isAvailable !== false, image: image || null }
  menuItems.push(item)
  saveState()
  io.emit('menu:updated', item)
  res.status(201).json(item)
})

app.put('/api/admin/menu/items/:id', (req, res) => {
  const targetId = req.params.id
  let idx = menuItems.findIndex(i => String(i.id) === String(targetId))
  if (idx === -1 && req.body.name) {
    idx = menuItems.findIndex(i => String(i.name).toLowerCase() === String(req.body.name).toLowerCase())
  }
  const { name, price, categoryId, description, isAvailable, image } = req.body

  if (idx >= 0) {
    if (name !== undefined) menuItems[idx].name = name
    if (price !== undefined) menuItems[idx].price = Number(price)
    if (categoryId !== undefined) menuItems[idx].categoryId = categoryId
    if (description !== undefined) menuItems[idx].description = description
    if (isAvailable !== undefined) menuItems[idx].isAvailable = isAvailable
    if (image !== undefined) menuItems[idx].image = image
  } else {
    const newItem = {
      id: targetId,
      name: name || 'Item',
      price: price !== undefined ? Number(price) : 0,
      categoryId: categoryId || (categories[0]?.id || 'c1'),
      description: description || '',
      isAvailable: isAvailable !== false,
      image: image || null
    }
    menuItems.push(newItem)
    idx = menuItems.length - 1
  }

  // Keep recipe names in sync if name was updated
  if (name !== undefined) {
    recipes.forEach(r => {
      if (String(r.menuItemId) === String(targetId) || String(r.menuItemId) === String(menuItems[idx].id)) {
        r.menuItemName = name
        r.name = `${name} Recipe`
      }
    })
  }

  saveState()
  io.emit('menu:updated', menuItems[idx])
  res.json(menuItems[idx])
})

app.delete('/api/admin/menu/items/:id', (req, res) => {
  const idx = menuItems.findIndex(i => i.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Item not found' })
  // Delete associated image file if exists
  const item = menuItems[idx]
  if (item.image && item.image.startsWith('/uploads/menu/')) {
    try {
      const imgPath = join(UPLOADS_DIR, 'menu', item.image.split('/uploads/menu/')[1])
      if (existsSync(imgPath)) rmSync(imgPath)
    } catch (e) { console.error('Image delete error:', e.message) }
  }
  menuItems.splice(idx, 1)
  saveState()
  res.json({ success: true })
})

// Upload menu item image
app.post('/api/admin/menu/items/:id/image', (req, res) => {
  const item = menuItems.find(i => i.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Item not found' })

  const menuImgDir = join(UPLOADS_DIR, 'menu')
  if (!existsSync(menuImgDir)) mkdirSync(menuImgDir, { recursive: true })

  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    try {
      const buf = Buffer.concat(chunks)
      const ct = req.headers['content-type'] || ''
      let ext = 'jpg'
      if (ct.includes('png')) ext = 'png'
      else if (ct.includes('webp')) ext = 'webp'
      else if (ct.includes('gif')) ext = 'gif'

      // Remove old image if exists
      if (item.image && item.image.startsWith('/uploads/menu/')) {
        try {
          const oldPath = join(menuImgDir, item.image.split('/uploads/menu/')[1])
          if (existsSync(oldPath)) rmSync(oldPath)
        } catch (e) { /* ignore */ }
      }

      const filename = `${item.id}.${ext}`
      writeFileSync(join(menuImgDir, filename), buf)
      item.image = `/uploads/menu/${filename}`
      saveState()
      res.json({ success: true, image: item.image })
    } catch (e) {
      res.status(500).json({ error: 'Image upload failed: ' + e.message })
    }
  })
})

// Delete menu item image
app.delete('/api/admin/menu/items/:id/image', (req, res) => {
  const item = menuItems.find(i => i.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Item not found' })
  if (item.image && item.image.startsWith('/uploads/menu/')) {
    try {
      const imgPath = join(UPLOADS_DIR, 'menu', item.image.split('/uploads/menu/')[1])
      if (existsSync(imgPath)) rmSync(imgPath)
    } catch (e) { /* ignore */ }
  }
  item.image = null
  saveState()
  res.json({ success: true, image: null })
})

app.put('/api/admin/menu/items/:id/toggle', (req, res) => {
  const idx = menuItems.findIndex(i => i.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Item not found' })
  menuItems[idx].isAvailable = !menuItems[idx].isAvailable
  saveState()
  res.json(menuItems[idx])
})

// ============ RECIPE MANAGEMENT ============
let recipes = []

app.get('/api/recipes', (req, res) => {
  res.json(recipes)
})

app.post('/api/recipes', (req, res) => {
  const recipe = req.body
  if (!recipe || !recipe.menuItemId) return res.status(400).json({ error: 'menuItemId required' })
  const existingIdx = recipes.findIndex(r => r.menuItemId === recipe.menuItemId)
  if (existingIdx >= 0) {
    recipes[existingIdx] = { ...recipes[existingIdx], ...recipe }
  } else {
    recipe.id = recipe.id || ('r_' + Date.now())
    recipes.push(recipe)
  }
  saveState()
  res.status(200).json(recipes)
})

app.delete('/api/recipes/:menuItemId', (req, res) => {
  const mId = req.params.menuItemId
  recipes = recipes.filter(r => r.menuItemId !== mId && r.id !== mId)
  saveState()
  res.json({ success: true })
})

// Category CRUD
app.post('/api/admin/menu/categories', (req, res) => {
  const { name, color } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  const id = 'cat_' + Date.now()
  const displayOrder = categories.length + 1
  const cat = { id, name, color: color || '#6b7280', displayOrder }
  categories.push(cat)
  saveState()
  res.status(201).json(cat)
})

app.put('/api/admin/menu/categories/:id', (req, res) => {
  const idx = categories.findIndex(c => c.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Category not found' })
  const { name, color, displayOrder } = req.body
  if (name !== undefined) categories[idx].name = name
  if (color !== undefined) categories[idx].color = color
  if (displayOrder !== undefined) categories[idx].displayOrder = displayOrder
  saveState()
  res.json(categories[idx])
})

app.delete('/api/admin/menu/categories/:id', (req, res) => {
  const idx = categories.findIndex(c => c.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Category not found' })
  categories.splice(idx, 1)
  menuItems.forEach(item => { if (item.categoryId === req.params.id) item.categoryId = null })
  saveState()
  res.json({ success: true })
})

// Menu Items Admin list (full data)
app.get('/api/admin/menu/items', (req, res) => {
  res.json(menuItems)
})

app.get('/api/admin/menu/categories', (req, res) => {
  res.json(categories.sort((a, b) => a.displayOrder - b.displayOrder))
})

// Export Menu to Excel
app.get('/api/admin/menu/export-excel', (req, res) => {
  try {
    const menuRows = menuItems.map(item => {
      const cat = categories.find(c => c.id === item.categoryId)
      const recipe = recipes.find(r => r.menuItemId === item.id)
      let cost = null
      if (recipe && recipe.ingredients) {
        cost = recipe.ingredients.reduce((sum, ing) => {
          const invItem = inventory.find(i => i.id === ing.inventoryItemId)
          const cpu = ing.costPerUnit || (invItem ? invItem.costPerUnit : 0)
          return sum + (ing.quantity * cpu)
        }, 0)
      }
      const profit = cost !== null ? item.price - cost : null
      const margin = (profit !== null && item.price > 0) ? ((profit / item.price) * 100).toFixed(1) : null

      return {
        'Item ID': item.id,
        'Item Name': item.name,
        'Category': cat ? cat.name : 'Uncategorized',
        'Price (₹)': item.price,
        'Cost (₹)': cost !== null ? Number(cost.toFixed(2)) : 'N/A',
        'Profit (₹)': profit !== null ? Number(profit.toFixed(2)) : 'N/A',
        'Margin (%)': margin !== null ? `${margin}%` : 'N/A',
        'Available': item.isAvailable !== false ? 'Yes' : 'No',
        'Recipe Mapped': recipe ? 'Yes' : 'No',
        'Description': item.description || ''
      }
    })

    const catRows = categories.map(cat => {
      const count = menuItems.filter(i => i.categoryId === cat.id).length
      return {
        'Category ID': cat.id,
        'Category Name': cat.name,
        'Color': cat.color || '',
        'Item Count': count
      }
    })

    const recipeRows = []
    recipes.forEach(r => {
      const mItem = menuItems.find(m => m.id === r.menuItemId)
      r.ingredients.forEach(ing => {
        const invItem = inventory.find(i => i.id === ing.inventoryItemId)
        const cpu = ing.costPerUnit || (invItem ? invItem.costPerUnit : 0)
        const totalCost = ing.cost || (ing.quantity * cpu)
        recipeRows.push({
          'Recipe ID': r.id,
          'Menu Item Name': mItem ? mItem.name : r.menuItemName || r.name,
          'Ingredient Name': ing.inventoryName || (invItem ? invItem.name : 'Unknown'),
          'Quantity': ing.quantity,
          'Unit': ing.unit || '',
          'Cost Per Unit (₹)': cpu,
          'Ingredient Cost (₹)': Number(totalCost.toFixed(2))
        })
      })
    })

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(menuRows), 'Menu Items')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(catRows), 'Categories')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recipeRows), 'Recipes & Costing')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const dateStr = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="TDG_Menu_Export_${dateStr}.xlsx"`)
    res.send(buf)
  } catch (e) {
    res.status(500).json({ error: 'Excel export failed: ' + e.message })
  }
})

// Import Menu from Excel
app.post('/api/admin/menu/import-excel', (req, res) => {
  try {
    const { items = [], categories: inCats = [] } = req.body
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided for import' })
    }

    let created = 0
    let updated = 0

    // 1. Process categories if provided
    inCats.forEach(c => {
      const cName = c['Category Name'] || c.name
      if (cName) {
        const exists = categories.find(cat => cat.name.toLowerCase() === String(cName).toLowerCase() || cat.id === c['Category ID'] || cat.id === c.id)
        if (!exists) {
          categories.push({
            id: c['Category ID'] || c.id || ('cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
            name: String(cName),
            color: c['Color'] || c.color || '#6b7280',
            displayOrder: categories.length + 1
          })
        }
      }
    })

    // 2. Process items
    items.forEach(row => {
      const itemName = row['Item Name'] || row.name || row['Name'] || row['Item']
      const priceVal = row['Price (₹)'] || row.price || row['Price']
      if (!itemName || priceVal === undefined || priceVal === null) return

      const categoryName = row['Category'] || row.category || row['Category Name']
      let catId = null
      if (categoryName) {
        let matchedCat = categories.find(c => c.name.toLowerCase() === String(categoryName).toLowerCase())
        if (!matchedCat) {
          matchedCat = {
            id: 'cat_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name: String(categoryName),
            color: '#6b7280',
            displayOrder: categories.length + 1
          }
          categories.push(matchedCat)
        }
        catId = matchedCat.id
      }
      if (!catId && categories.length > 0) catId = categories[0].id

      const itemId = row['Item ID'] || row.id
      const desc = row['Description'] || row.description || ''
      const availVal = row['Available'] !== undefined ? row['Available'] : row.isAvailable
      const isAvailable = availVal === false || availVal === 'No' || availVal === 'no' || availVal === '0' ? false : true

      const existingIdx = menuItems.findIndex(i => (itemId && i.id === itemId) || i.name.toLowerCase() === String(itemName).toLowerCase())

      if (existingIdx >= 0) {
        menuItems[existingIdx] = {
          ...menuItems[existingIdx],
          name: String(itemName),
          price: Number(priceVal),
          categoryId: catId || menuItems[existingIdx].categoryId,
          description: String(desc),
          isAvailable
        }
        updated++
      } else {
        const newItem = {
          id: itemId || ('m_' + Date.now() + '_' + Math.floor(Math.random() * 1000)),
          name: String(itemName),
          price: Number(priceVal),
          categoryId: catId || 'c1',
          description: String(desc),
          isAvailable,
          image: null
        }
        menuItems.push(newItem)
        created++
      }
    })

    saveState()
    io.emit('menu:updated', { created, updated })
    res.json({ success: true, created, updated, total: menuItems.length })
  } catch (e) {
    console.error('Import error:', e)
    res.status(500).json({ error: 'Import failed: ' + e.message })
  }
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
  const { type, source, items, subtotal, tax, total, tableNumber, customerName, customerPhone, notes, paymentMethod, complimentary, complimentaryType, specialRemarks } = req.body
  
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
    customerPhone: customerPhone || '',
    notes: notes || '',
    complimentary: complimentary || false,
    complimentaryType: complimentaryType || '',
    specialRemarks: specialRemarks || '',
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
  saveState()
  
  // Emit to connected clients
  io.emit('order:created', order)
  io.to('kitchen').emit('kot:created', { id, orderNumber: `K${orderNum}`, items: order.items, tableNumber: order.tableNumber, type: order.type, createdAt: now })
  
  res.status(201).json(order)
})

app.patch('/api/pos/orders/:id/status', (req, res) => {
  const { id } = req.params
  const { status, paymentStatus, cancelReason } = req.body
  
  const order = orders.find(o => o.id === id)
  if (order) {
    order.status = status || order.status
    order.paymentStatus = paymentStatus || order.paymentStatus
    order.paymentMethod = req.body.paymentMethod || order.paymentMethod
    if (status === 'cancelled') {
      if (cancelReason) order.cancelReason = cancelReason
      if (req.body.cancelledBy) order.cancelledBy = req.body.cancelledBy
    }
    order.updatedAt = new Date().toISOString()
    io.emit('order:updated', order)
    saveState()

    // ASSET SYSTEM: When order completed, handle cashback + asset dined tracking
    if ((status === 'completed' || status === 'served') && order.customerPhone) {
      const db = readDb()
      const billAmount = Math.floor(order.total || 0)
      if (billAmount > 0) {
        const customer = db.users.find(u => u.phone === order.customerPhone)

        // 1. Mark asset as dined if customer is someone's asset
        if (customer && customer.referredBy) {
          const master = db.users.find(u => u.id === customer.referredBy)
          if (master) {
            const assets = master.assets || []
            const asset = assets.find(a => a.phone === order.customerPhone)
            if (asset && !asset.hasDined) {
              asset.hasDined = true
              asset.dinedAt = new Date().toISOString()
              master.assetsDinedCount = (master.assetsDinedCount || 0) + 1
              checkAllAssetsBonus(master, db)
            }

            // 2. 10% cashback to master (perpetual)
            const cashback = Math.floor(billAmount * 0.10)
            if (cashback > 0) {
              master.points = (master.points || 0) + cashback
              master.cashbackEarned = (master.cashbackEarned || 0) + cashback
              db.transactions.push({
                id: 't_' + Date.now() + '_cb',
                userId: master.id,
                type: 'credit',
                amount: cashback,
                description: '10% cashback from ' + (customer.name || order.customerPhone) + ' - Order #' + order.orderNumber,
                createdAt: new Date().toISOString()
              })
            }
          }
        }

        // 3. Earn points for the customer (1 point = 1 rupee, earned on order)
        if (customer) {
          const earnedPoints = Math.floor(billAmount * 0.05) // 5% earning
          if (earnedPoints > 0) {
            customer.points = (customer.points || 0) + earnedPoints
            db.transactions.push({
              id: 't_' + Date.now() + '_ep',
              userId: customer.id,
              type: 'credit',
              amount: earnedPoints,
              description: 'Order #' + order.orderNumber + ' completed',
              createdAt: new Date().toISOString()
            })
          }
        }

        writeDb(db)
        saveState()
      }
    }
  }
  
  res.json({ success: true })
})

// ─── Online Orders (Zomato/Swiggy/Zepto) ───
app.get('/api/online-orders', (req, res) => {
  res.json(onlineOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
})

app.get('/api/online-orders/aggregators', (req, res) => {
  res.json(aggregators)
})

app.post('/api/online-orders/aggregators/toggle', (req, res) => {
  const { id, isActive } = req.body
  const agg = aggregators.find(a => a.id === id)
  if (agg) agg.isActive = isActive
  saveState()
  res.json(aggregators)
})

// Webhook: receive order from aggregator or manual entry
app.post('/api/online-orders/webhook', (req, res) => {
  const { aggregator, externalOrderId, customerName, customerPhone, customerAddress, items, total, notes } = req.body
  const agg = aggregators.find(a => a.id === aggregator) || aggregators[3]
  const id = uuid()
  const now = new Date().toISOString()
  const onlineOrder = {
    id,
    aggregator: aggregator || 'direct',
    aggregatorName: agg?.name || 'Direct',
    externalOrderId: externalOrderId || `${aggregator.toUpperCase()}-${Date.now() % 10000}`,
    customerName: customerName || 'Guest',
    customerPhone: customerPhone || '',
    customerAddress: customerAddress || '',
    items: items || [],
    total: total || 0,
    platformStatus: 'received',
    estimatedTime: agg?.defaultPrepTime || 20,
    internalOrderId: null,
    internalOrder: null,
    notes: notes || '',
    createdAt: now,
    updatedAt: now
  }
  onlineOrders.unshift(onlineOrder)
  saveState()
  io.emit('online-order:new', { id: onlineOrder.id })
  res.status(201).json(onlineOrder)
})

// Accept online order → create internal POS order → push to kitchen
app.post('/api/online-orders/:id/accept', (req, res) => {
  const { id } = req.params
  const onlineOrder = onlineOrders.find(o => o.id === id)
  if (!onlineOrder) return res.status(404).json({ error: 'Order not found' })

  onlineOrder.platformStatus = 'accepted'
  onlineOrder.estimatedTime = req.body.estimatedTime || onlineOrder.estimatedTime
  onlineOrder.updatedAt = new Date().toISOString()

  // Create internal POS order for kitchen
  const orderNum = ++orderNumber
  const now = new Date().toISOString()
  const internalOrder = {
    id: uuid(),
    orderNumber: orderNum,
    type: 'delivery',
    status: 'pending',
    source: 'online',
    subtotal: onlineOrder.total,
    tax: Math.round(onlineOrder.total * 0.05),
    total: Math.round(onlineOrder.total * 1.05),
    paymentMethod: 'online',
    paymentStatus: 'paid',
    tableNumber: '',
    customerName: onlineOrder.customerName,
    customerPhone: onlineOrder.customerPhone,
    notes: `Online: ${onlineOrder.aggregatorName} #${onlineOrder.externalOrderId}`,
    createdAt: now,
    updatedAt: now,
    items: (onlineOrder.items || []).map(i => ({
      id: uuid(),
      menuItemId: null,
      menuItemName: i.name,
      quantity: i.quantity,
      unitPrice: i.price || Math.round(i.total / i.quantity),
      totalPrice: i.total || i.price * i.quantity,
      status: 'pending'
    }))
  }

  orders.unshift(internalOrder)
  onlineOrder.internalOrderId = internalOrder.id
  onlineOrder.internalOrder = internalOrder
  saveState()

  io.emit('order:created', internalOrder)
  io.to('kitchen').emit('kot:created', {
    id: internalOrder.id,
    orderNumber: `K${orderNum}`,
    items: internalOrder.items,
    tableNumber: internalOrder.tableNumber,
    type: internalOrder.type,
    createdAt: now,
    source: 'online',
    aggregator: onlineOrder.aggregator,
    aggregatorName: onlineOrder.aggregatorName,
    externalOrderId: onlineOrder.externalOrderId
  })

  res.json(onlineOrder)
})

app.patch('/api/online-orders/:id/status', (req, res) => {
  const { id } = req.params
  const { platformStatus } = req.body
  const onlineOrder = onlineOrders.find(o => o.id === id)
  if (!onlineOrder) return res.status(404).json({ error: 'Order not found' })

  onlineOrder.platformStatus = platformStatus
  onlineOrder.updatedAt = new Date().toISOString()
  saveState()
  io.emit('online-order:status', { id, platformStatus })

  // Sync back to internal order if linked
  if (onlineOrder.internalOrderId && (platformStatus === 'ready' || platformStatus === 'out-for-delivery')) {
    const internalOrder = orders.find(o => o.id === onlineOrder.internalOrderId)
    if (internalOrder) {
      internalOrder.status = platformStatus === 'ready' ? 'ready' : 'completed'
      internalOrder.updatedAt = new Date().toISOString()
      io.emit('order:updated', internalOrder)
    }
  }

  res.json(onlineOrder)
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
    role: 'user',
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
  saveState()

  // SYNC: Also create mobile user in db.json
  const db = readDb()
  if (!db.users.find(u => u.phone === phone)) {
    db.users.push({
      id: 'u_' + Date.now(),
      name, email, phone,
      rubyBalance: user.rubyPoints,
      scratchCards: [
        { id: 's_' + Date.now() + '_1', title: 'Welcome Scratch Card', subtitle: 'Tap to scratch', amount: 100, claimed: false },
        { id: 's_' + Date.now() + '_2', title: 'New Member Gift', subtitle: 'Tap to scratch', amount: 200, claimed: false }
      ],
      denId: null,
      createdAt: now
    })
    writeDb(db)
  }
  
  res.status(201).json({ user, isFreeAccount })
})

// Get user by phone
app.get('/api/loyalty/user/:phone', (req, res) => {
  let user = loyaltyUsers.find(u => u.phone === req.params.phone)
  if (!user) {
    // Fallback: try db.json users and auto-create loyalty entry
    const db = readDb()
    const mobileUser = db.users.find(u => u.phone === req.params.phone)
    if (mobileUser) {
      const id = mobileUser.id || 'loy_' + Date.now()
      user = {
        id,
        referralCode: mobileUser.id?.slice(0, 6).toUpperCase() || 'REF' + Date.now().toString().slice(-4),
        name: mobileUser.name || 'Customer',
        phone: mobileUser.phone,
        email: mobileUser.email || '',
        role: 'user',
        rubyPoints: mobileUser.rubyBalance || 0,
        tier: getTier(mobileUser.rubyBalance || 0),
        referredBy: null,
        denId: null,
        createdAt: mobileUser.createdAt || new Date().toISOString()
      }
      loyaltyUsers.push(user)
      saveState()
    } else {
      // Unknown phone — return zero-balance user so frontend shows "Insufficient balance"
      const id = 'loy_' + Date.now()
      user = {
        id, name: 'Customer', phone: req.params.phone, email: '', role: 'user',
        rubyPoints: 0, tier: 'Bronze', referralCode: 'NEW', referredBy: null, denId: null,
        createdAt: new Date().toISOString()
      }
      loyaltyUsers.push(user)
      saveState()
    }
  }
  
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
  
  let referredByName = null
  if (user.referredBy) {
    const referrer = loyaltyUsers.find(u => u.referralCode === user.referredBy || u.phone === user.referredBy || u.id === user.referredBy)
    if (referrer) {
      referredByName = referrer.name
    }
  }

  res.json({
    ...user,
    referredByName,
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
  saveState()
  
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
  
  saveState()
  res.json(den)
})

// Den - get user's den
app.get('/api/loyalty/den/:phone', (req, res) => {
  const user = loyaltyUsers.find(u => u.phone === req.params.phone)
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (!user.denId) return res.json({ den: null })
  
  const den = dens.find(d => d.id === user.denId)
  if (!den) return res.json({ den: null })

  // Map members to include referredBy and referredByName
  const membersWithReferral = den.members.map(m => {
    const memberUser = loyaltyUsers.find(u => u.id === m.id)
    let referredBy = null
    let referredByName = null
    if (memberUser && memberUser.referredBy) {
      referredBy = memberUser.referredBy
      const referrer = loyaltyUsers.find(u => u.referralCode === memberUser.referredBy || u.phone === memberUser.referredBy || u.id === memberUser.referredBy)
      if (referrer) {
        referredByName = referrer.name
      }
    }
    return {
      ...m,
      referralCode: memberUser ? memberUser.referralCode : null,
      referredBy,
      referredByName
    }
  })

  res.json({
    den: {
      ...den,
      members: membersWithReferral
    }
  })
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
  saveState()
  
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
  saveState()
  
  res.json({ success: true, redeemedRupees: rupeeValue, balance: user.rubyPoints })
})

// Points - history
app.get('/api/loyalty/points/history/:phone', (req, res) => {
  const user = loyaltyUsers.find(u => u.phone === req.params.phone)
  if (!user) return res.status(404).json({ error: 'User not found' })
  
  res.json(pointTransactions.filter(t => t.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
})

// Helper functions
function syncLoyaltyToDbJson(userId) {
  const loyaltyUser = loyaltyUsers.find(u => u.id === userId)
  if (!loyaltyUser) return
  const db = readDb()
  const mobileUser = db.users.find(u => u.phone === loyaltyUser.phone)
  if (mobileUser) {
    mobileUser.rubyBalance = loyaltyUser.rubyPoints
    writeDb(db)
  }
}

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
  syncLoyaltyToDbJson(userId)
  saveState()
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
  syncLoyaltyToDbJson(userId)
  saveState()
}

function updateUserTier(user) {
  user.tier = getTier(user.rubyPoints)
  user.isRubyCrown = user.rubyPoints >= 25000
}

// ============ EXPENSES ============
app.get('/api/expenses', (req, res) => {
  const { date } = req.query
  let result = [...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (date) result = result.filter(e => e.createdAt.startsWith(date))
  res.json(result)
})

app.post('/api/expenses', (req, res) => {
  const { category, amount, description } = req.body
  if (!category || !amount) return res.status(400).json({ error: 'Category and amount required' })
  const expense = {
    id: uuid(),
    category,
    amount: Number(amount),
    description: description || '',
    createdAt: new Date().toISOString()
  }
  expenses.unshift(expense)
  saveState()
  res.status(201).json(expense)
})

// ============ SUPPLIER CRUD ============
app.get('/api/admin/suppliers', (req, res) => {
  res.json(suppliers)
})

app.post('/api/admin/suppliers', (req, res) => {
  const { name, category, contact, email, address, rating, defaultInvoiceNo, invoicePrefix } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  const id = 'S' + Date.now()
  const supplier = { id, name, category: category || '', contact: contact || '', email: email || '', address: address || '', rating: rating || 0, defaultInvoiceNo: defaultInvoiceNo || '', invoicePrefix: invoicePrefix || '' }
  suppliers.push(supplier)
  saveState()
  res.status(201).json(supplier)
})

app.put('/api/admin/suppliers/:id', (req, res) => {
  const idx = suppliers.findIndex(s => s.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Supplier not found' })
  Object.assign(suppliers[idx], req.body)
  saveState()
  res.json(suppliers[idx])
})

app.delete('/api/admin/suppliers/:id', (req, res) => {
  const idx = suppliers.findIndex(s => s.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Supplier not found' })
  suppliers.splice(idx, 1)
  saveState()
  res.json({ success: true })
})

// ============ PURCHASE ORDERS CRUD ============
app.get('/api/admin/purchase-orders', (req, res) => {
  res.json(purchaseOrders.sort((a, b) => new Date(b.date) - new Date(a.date)))
})

app.post('/api/admin/purchase-orders', (req, res) => {
  const { supplier, items, total, expectedDate } = req.body
  if (!supplier || !items?.length) return res.status(400).json({ error: 'supplier and items required' })
  const id = 'PO' + String(purchaseOrders.length + 1).padStart(3, '0')
  const po = { id, supplier, items: items.length, total: Number(total), status: 'pending', date: new Date().toISOString().split('T')[0], expectedDate: expectedDate || '' }
  purchaseOrders.push(po)
  // Save PO items
  const newItems = items.map((item, i) => ({ id: 'PI' + id + i, poId: id, name: item.name, quantity: item.quantity, unit: item.unit, rate: item.rate, received: 0 }))
  poItems.push(...newItems)
  saveState()
  res.status(201).json({ po, items: newItems })
})

app.put('/api/admin/purchase-orders/:id', (req, res) => {
  const idx = purchaseOrders.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'PO not found' })
  Object.assign(purchaseOrders[idx], req.body)
  saveState()
  res.json(purchaseOrders[idx])
})

app.get('/api/admin/po-items', (req, res) => {
  const { poId } = req.query
  let result = poItems
  if (poId) result = poItems.filter(i => i.poId === poId)
  res.json(result)
})

app.post('/api/admin/po-items', (req, res) => {
  const { poId, name, quantity, unit, rate } = req.body
  if (!poId || !name) return res.status(400).json({ error: 'poId and name required' })
  const id = uuid()
  const item = { id, poId, name, quantity: Number(quantity), unit: unit || 'kg', rate: Number(rate), received: 0 }
  poItems.push(item)
  saveState()
  res.status(201).json(item)
})

// ============ GRN CRUD ============
app.get('/api/admin/grns', (req, res) => {
  res.json(grns.sort((a, b) => new Date(b.date) - new Date(a.date)))
})

app.post('/api/admin/grns', (req, res) => {
  const { poId, supplier, items, totalValue, invoiceNo, invoiceImage, receivedBy, remarks, vehicleNo } = req.body
  if (!poId || !supplier) return res.status(400).json({ error: 'poId and supplier required' })
  const id = 'GRN' + String(grns.length + 1).padStart(3, '0')
  const grn = { id, poId, supplier, items: items || 0, totalValue: Number(totalValue) || 0, invoiceNo: invoiceNo || '', invoiceImage: invoiceImage || null, date: new Date().toISOString().split('T')[0], status: 'completed', receivedBy: receivedBy || '', remarks: remarks || '', vehicleNo: vehicleNo || '' }
  grns.push(grn)
  saveState()
  res.status(201).json(grn)
})

// ============ VENDOR PAYMENTS ============
app.get('/api/admin/vendor-payments', (req, res) => {
  res.json(vendorPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)))
})

app.post('/api/admin/vendor-payments', (req, res) => {
  const { supplier, poId, grnId, amount, paymentMethod, reference, paymentDate, notes } = req.body
  if (!supplier || !amount || !paymentMethod) return res.status(400).json({ error: 'Supplier, amount, and paymentMethod required' })
  const payment = {
    id: 'VP' + Date.now(),
    supplier,
    poId: poId || '',
    grnId: grnId || '',
    amount: Number(amount),
    paymentMethod,
    reference: reference || '',
    paymentDate: paymentDate || new Date().toISOString().split('T')[0],
    notes: notes || '',
    createdAt: new Date().toISOString()
  }
  vendorPayments.unshift(payment)
  saveState()
  res.status(201).json(payment)
})

app.put('/api/admin/vendor-payments/:id', (req, res) => {
  const idx = vendorPayments.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Payment not found' })
  Object.assign(vendorPayments[idx], req.body)
  saveState()
  res.json(vendorPayments[idx])
})

app.delete('/api/admin/vendor-payments/:id', (req, res) => {
  const idx = vendorPayments.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Payment not found' })
  vendorPayments.splice(idx, 1)
  saveState()
  res.json({ success: true })
})

// ============ GST / ACCOUNTS ============
app.get('/api/accounts/gst-summary', (req, res) => {
  const period = req.query.period || new Date().toISOString().slice(0, 7)
  const salesTaxRate = 0.05
  const purchaseTaxRate = 0.05

  // Output GST from sales
  const periodOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(period))
  const completedOrders = periodOrders.filter(o => o.status === 'completed' || o.status === 'served' || o.status === 'delivered')
  const totalSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const outputGst = Math.round(totalSales * salesTaxRate * 100 / (100 + salesTaxRate * 100))

  // Input GST from purchases
  const periodPurchases = purchases.filter(p => p.createdAt && p.createdAt.startsWith(period))
  const totalPurchases = periodPurchases.reduce((sum, p) => sum + (p.total || 0), 0)
  const inputGst = Math.round(totalPurchases * purchaseTaxRate * 100 / (100 + purchaseTaxRate * 100))

  // Input GST from GRNs (goods receipt value)
  const periodGrns = grns.filter(g => g.date && g.date.startsWith(period.slice(0, 10)))
  const totalGrnValue = periodGrns.reduce((sum, g) => sum + (g.totalValue || 0), 0)
  const inputGstGrn = Math.round(totalGrnValue * purchaseTaxRate * 100 / (100 + purchaseTaxRate * 100))

  // By payment method (output)
  const byPaymentMethod = {}
  completedOrders.forEach(o => {
    const method = o.paymentMethod || 'cash'
    byPaymentMethod[method] = (byPaymentMethod[method] || 0) + (o.total || 0)
  })

  // Invoice count
  const invoiceCount = completedOrders.length

  // Individual taxable invoices (output)
  const salesInvoices = completedOrders.map(o => {
    const taxable = Math.round((o.total || 0) * 100 / (100 + salesTaxRate * 100))
    return {
      id: o.id || o.billNo || '',
      date: (o.createdAt || '').split('T')[0],
      customer: o.customerName || o.table || 'Walk-in',
      total: Math.round(o.total || 0),
      taxable,
      gst: Math.round(o.total || 0) - taxable,
      paymentMethod: o.paymentMethod || 'cash',
      source: o.source || 'pos'
    }
  })

  // Individual purchase invoices (input)
  const purchaseInvoices = periodPurchases.map(p => {
    const taxable = Math.round((p.total || 0) * 100 / (100 + purchaseTaxRate * 100))
    return {
      id: p.id || '',
      date: (p.createdAt || '').split('T')[0],
      supplier: p.supplier || 'Unknown',
      items: p.items?.length || 0,
      total: Math.round(p.total || 0),
      taxable,
      gst: Math.round(p.total || 0) - taxable
    }
  })

  // Individual GRN invoices (input)
  const grnInvoices = periodGrns.map(g => {
    const taxable = Math.round((g.totalValue || 0) * 100 / (100 + purchaseTaxRate * 100))
    return {
      id: g.id || '',
      date: (g.date || '').split('T')[0],
      supplier: g.supplier || 'Unknown',
      invoiceNo: g.invoiceNo || '',
      total: Math.round(g.totalValue || 0),
      taxable,
      gst: Math.round(g.totalValue || 0) - taxable
    }
  })

  res.json({
    period,
    salesTaxRate: salesTaxRate * 100,
    purchaseTaxRate: purchaseTaxRate * 100,
    // Output
    totalSales: Math.round(totalSales),
    taxableSales: Math.round(totalSales * 100 / (100 + salesTaxRate * 100)),
    outputGst,
    invoiceCount,
    byPaymentMethod,
    salesInvoices,
    // Input
    totalPurchases: Math.round(totalPurchases),
    totalGrnValue: Math.round(totalGrnValue),
    taxablePurchases: Math.round(totalPurchases * 100 / (100 + purchaseTaxRate * 100)),
    inputGst,
    inputGstGrn,
    purchaseInvoices,
    grnInvoices,
    // Net
    netGstPayable: outputGst - inputGst - inputGstGrn,
    netGstRefund: outputGst - inputGst - inputGstGrn < 0 ? Math.abs(outputGst - inputGst - inputGstGrn) : 0
  })
})

app.get('/api/accounts/vendor-balances', (req, res) => {
  const balances = suppliers.map(s => {
    const poTotal = purchaseOrders
      .filter(po => po.supplier === s.name)
      .reduce((sum, po) => sum + (po.total || 0), 0)
    const paidTotal = vendorPayments
      .filter(vp => vp.supplier === s.name)
      .reduce((sum, vp) => sum + (vp.amount || 0), 0)
    return {
      supplierId: s.id,
      supplierName: s.name,
      category: s.category,
      contact: s.contact,
      totalOrdered: poTotal,
      totalPaid: paidTotal,
      balance: poTotal - paidTotal,
      paymentCount: vendorPayments.filter(vp => vp.supplier === s.name).length
    }
  })
  res.json(balances)
})

// ============ DUE BILLS (outstanding invoices per vendor) ============
app.get('/api/accounts/due-bills', (req, res) => {
  const bills = []

  // From Purchase Orders
  purchaseOrders.forEach(po => {
    const paidAmt = vendorPayments
      .filter(vp => vp.poId === po.id)
      .reduce((sum, vp) => sum + (vp.amount || 0), 0)
    const balance = (po.total || 0) - paidAmt
    if (balance > 0) {
      bills.push({
        id: po.id,
        type: 'PO',
        supplier: po.supplier,
        date: po.date || '',
        total: po.total || 0,
        paid: paidAmt,
        balance,
        status: paidAmt === 0 ? 'unpaid' : 'partial',
        ref: po.id,
        invoiceNo: '',
        items: po.items || 0,
        expectedDate: po.expectedDate || ''
      })
    }
  })

  // From GRNs
  grns.forEach(grn => {
    const paidAmt = vendorPayments
      .filter(vp => vp.grnId === grn.id)
      .reduce((sum, vp) => sum + (vp.amount || 0), 0)
    const balance = (grn.totalValue || 0) - paidAmt
    // Also check for payments linked to the parent PO
    const poPaidAmt = grn.poId ? vendorPayments
      .filter(vp => vp.poId === grn.poId)
      .reduce((sum, vp) => sum + (vp.amount || 0), 0) : 0
    if (balance > 0 || (grn.totalValue > 0 && paidAmt < grn.totalValue)) {
      const effectivePaid = Math.max(paidAmt, poPaidAmt > 0 ? paidAmt : 0)
      const effectiveBalance = (grn.totalValue || 0) - effectivePaid
      if (effectiveBalance > 0) {
        bills.push({
          id: grn.id,
          type: 'GRN',
          supplier: grn.supplier,
          date: grn.date || '',
          total: grn.totalValue || 0,
          paid: effectivePaid,
          balance: effectiveBalance,
          status: effectivePaid === 0 ? 'unpaid' : 'partial',
          ref: grn.poId || '',
          invoiceNo: grn.invoiceNo || '',
          items: grn.items || 0,
          notes: grn.remarks || ''
        })
      }
    }
  })

  // From direct purchases (simple /api/purchases entries)
  purchases.forEach(p => {
    const paidAmt = vendorPayments
      .filter(vp => vp.supplier === p.supplier && !vp.poId && !vp.grnId)
      .reduce((sum, vp) => sum + (vp.amount || 0), 0)
    // Skip if already covered by PO/GRN payment
    const alreadyCovered = vendorPayments.some(vp =>
      (vp.poId && purchaseOrders.some(po => po.id === vp.poId && po.supplier === p.supplier)) ||
      (vp.grnId && grns.some(g => g.id === vp.grnId && g.supplier === p.supplier))
    )
    if (!alreadyCovered) {
      const balance = (p.total || 0) - paidAmt
      if (balance > 0) {
        bills.push({
          id: p.id,
          type: 'PURCHASE',
          supplier: p.supplier,
          date: (p.createdAt || '').split('T')[0],
          total: p.total || 0,
          paid: paidAmt,
          balance,
          status: 'unpaid',
          ref: '',
          invoiceNo: '',
          items: p.items?.length || 0,
          notes: ''
        })
      }
    }
  })

  // Sort by date descending
  bills.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  res.json(bills)
})

// ============ PURCHASES (supplier orders) ============
app.get('/api/purchases', (req, res) => {
  const { date } = req.query
  let result = [...purchases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (date) result = result.filter(p => p.createdAt.startsWith(date))
  res.json(result)
})

app.post('/api/purchases', (req, res) => {
  const { supplier, items, total } = req.body
  if (!supplier || !items || !items.length || total === undefined) {
    return res.status(400).json({ error: 'Supplier, items, and total required' })
  }
  const purchase = {
    id: uuid(),
    supplier,
    items,
    total: Number(total),
    createdAt: new Date().toISOString()
  }
  purchases.unshift(purchase)
  saveState()
  res.status(201).json(purchase)
})

// ============ DAILY CLOSING REPORT ============
app.get('/api/reports/daily-closing', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0]

  // Trigger daily backup when today's closing is viewed
  if (date === new Date().toISOString().split('T')[0]) {
    performDailyBackup()
  }

  // Filter orders for the given date
  const dayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(date))
  const completedOrders = dayOrders.filter(o => o.status === 'completed' || o.status === 'served' || o.status === 'delivered')
  const cancelledOrders = dayOrders.filter(o => o.status === 'cancelled')

  // Total invoices (completed/served/delivered)
  const totalInvoices = completedOrders.length

  // Total sale value
  const totalSales = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)

  // By payment method
  const byPaymentMethod = {}
  completedOrders.forEach(o => {
    const method = o.paymentMethod || 'cash'
    byPaymentMethod[method] = (byPaymentMethod[method] || 0) + (o.total || 0)
  })

  // By source (POS, mobile, kiosk, etc.)
  const bySource = {}
  completedOrders.forEach(o => {
    const src = o.source || 'pos'
    bySource[src] = (bySource[src] || 0)
    bySource[src]++
  })

  // Average basket value
  const avgBasketValue = totalInvoices > 0 ? Math.round(totalSales / totalInvoices) : 0

  // Expenses for the day
  const dayExpenses = expenses.filter(e => e.createdAt.startsWith(date))
  const totalExpenses = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  // Purchases for the day
  const dayPurchases = purchases.filter(p => p.createdAt.startsWith(date))
  const totalPurchases = dayPurchases.reduce((sum, p) => sum + (p.total || 0), 0)

  // Gross profit = totalSales - totalPurchases - totalExpenses
  const grossProfit = totalSales - totalPurchases - totalExpenses

  // Status breakdown
  const statusBreakdown = {}
  dayOrders.forEach(o => {
    const s = o.status || 'unknown'
    statusBreakdown[s] = (statusBreakdown[s] || 0) + 1
  })

  res.json({
    date,
    totalInvoices,
    totalSales: Math.round(totalSales),
    totalPurchases: Math.round(totalPurchases),
    totalExpenses: Math.round(totalExpenses),
    grossProfit: Math.round(grossProfit),
    avgBasketValue,
    byPaymentMethod,
    bySource,
    statusBreakdown,
    cancelledCount: cancelledOrders.length,
    expenses: dayExpenses,
    purchases: dayPurchases
  })
})

// P&L (Profit & Loss) Report
app.get('/api/reports/pnl', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0]
  const period = req.query.period || 'day' // day, week, month

  let fromDate, toDate
  if (period === 'week') {
    const d = new Date(date)
    const dayOfWeek = d.getDay()
    fromDate = new Date(d); fromDate.setDate(d.getDate() - dayOfWeek)
    toDate = new Date(fromDate); toDate.setDate(toDate.getDate() + 6)
  } else if (period === 'month') {
    const d = new Date(date)
    fromDate = new Date(d.getFullYear(), d.getMonth(), 1)
    toDate = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  } else {
    fromDate = new Date(date)
    toDate = new Date(date)
  }

  const fromStr = fromDate.toISOString().split('T')[0]
  const toStr = toDate.toISOString().split('T')[0]

  // Revenue: completed/served/delivered orders
  const periodOrders = orders.filter(o =>
    o.createdAt && o.createdAt.slice(0, 10) >= fromStr && o.createdAt.slice(0, 10) <= toStr &&
    (o.status === 'completed' || o.status === 'served' || o.status === 'delivered')
  )
  const totalRevenue = periodOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const orderCount = periodOrders.length

  // Revenue by payment method
  const revenueByMethod = {}
  periodOrders.forEach(o => {
    const m = o.paymentMethod || 'cash'
    revenueByMethod[m] = (revenueByMethod[m] || 0) + (o.total || 0)
  })

  // COGS: purchases in period
  const periodPurchases = purchases.filter(p =>
    p.createdAt && p.createdAt.slice(0, 10) >= fromStr && p.createdAt.slice(0, 10) <= toStr
  )
  const totalCogs = periodPurchases.reduce((sum, p) => sum + (p.total || 0), 0)

  // Gross Profit
  const grossProfit = totalRevenue - totalCogs

  // Expenses by category
  const periodExpenses = expenses.filter(e =>
    e.createdAt && e.createdAt.slice(0, 10) >= fromStr && e.createdAt.slice(0, 10) <= toStr
  )
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const expensesByCategory = {}
  periodExpenses.forEach(e => {
    const cat = e.category || 'other'
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0)
  })

  // Net Profit
  const netProfit = grossProfit - totalExpenses

  // Cancelled orders
  const cancelledOrders = orders.filter(o =>
    o.createdAt && o.createdAt.slice(0, 10) >= fromStr && o.createdAt.slice(0, 10) <= toStr &&
    o.status === 'cancelled'
  )
  const cancelledRevenue = cancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0)

  res.json({
    period: { from: fromStr, to: toStr, label: period },
    revenue: { total: Math.round(totalRevenue), orderCount, byMethod: revenueByMethod },
    cogs: { total: Math.round(totalCogs), purchaseCount: periodPurchases.length },
    grossProfit: Math.round(grossProfit),
    grossMargin: totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0,
    expenses: { total: Math.round(totalExpenses), count: periodExpenses.length, byCategory: expensesByCategory },
    netProfit: Math.round(netProfit),
    netMargin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0,
    cancelled: { count: cancelledOrders.length, revenue: Math.round(cancelledRevenue) }
  })
})

// Purchase Orders Report
app.get('/api/reports/purchase-orders', (req, res) => {
  const { from, to } = req.query
  const today = new Date().toISOString().split('T')[0]
  const fromStr = from || today
  const toStr = to || today

  const filtered = purchaseOrders.filter(po =>
    po.date >= fromStr && po.date <= toStr
  ).sort((a, b) => b.date.localeCompare(a.date))

  const byStatus = {}
  const bySupplier = {}
  let totalValue = 0
  filtered.forEach(po => {
    const s = po.status || 'pending'
    byStatus[s] = (byStatus[s] || 0) + 1
    bySupplier[po.supplier] = (bySupplier[po.supplier] || 0) + (po.total || 0)
    totalValue += (po.total || 0)
  })

  res.json({ orders: filtered, summary: { total: filtered.length, totalValue: Math.round(totalValue), byStatus, bySupplier } })
})

// GRN Report
app.get('/api/reports/grns', (req, res) => {
  const { from, to } = req.query
  const today = new Date().toISOString().split('T')[0]
  const fromStr = from || today
  const toStr = to || today

  const filtered = grns.filter(g =>
    g.date >= fromStr && g.date <= toStr
  ).sort((a, b) => b.date.localeCompare(a.date))

  const bySupplier = {}
  let totalValue = 0
  filtered.forEach(g => {
    bySupplier[g.supplier] = (bySupplier[g.supplier] || 0) + (g.totalValue || 0)
    totalValue += (g.totalValue || 0)
  })

  res.json({ grns: filtered, summary: { total: filtered.length, totalValue: Math.round(totalValue), bySupplier } })
})

// Customer Report
app.get('/api/reports/customers', (req, res) => {
  const db = readDb()
  const { from, to } = req.query
  const today = new Date().toISOString().split('T')[0]
  const fromStr = from || '2000-01-01'
  const toStr = to || today

  const allUsers = (db.users || []).filter(u => u.role === 'user' || u.role === 'customer')
  const periodUsers = allUsers.filter(u => {
    const d = u.createdAt ? u.createdAt.slice(0, 10) : ''
    return d >= fromStr && d <= toStr
  })

  // Compute aggregate from orders for each customer
  const customerStats = periodUsers.map(u => {
    const customerOrders = orders.filter(o => o.customerPhone === u.phone && o.status !== 'cancelled')
    const totalSpent = customerOrders.reduce((s, o) => s + (o.total || 0), 0)
    const lastOrder = customerOrders.sort((a, b) => b.createdAt?.localeCompare(a.createdAt || ''))[0]
    return {
      id: u.id, name: u.name, phone: u.phone, email: u.email || '',
      points: u.points || 0, totalOrders: customerOrders.length,
      totalSpent: Math.round(totalSpent),
      createdAt: u.createdAt, lastVisit: lastOrder?.createdAt || u.lastVisit || ''
    }
  }).sort((a, b) => b.totalSpent - a.totalSpent)

  const activeCustomers = customerStats.filter(c => c.totalOrders > 0)
  const totalSpentAll = customerStats.reduce((s, c) => s + c.totalSpent, 0)

  res.json({
    customers: customerStats,
    summary: {
      total: customerStats.length,
      active: activeCustomers.length,
      totalSpent: Math.round(totalSpentAll),
      avgPerCustomer: customerStats.length > 0 ? Math.round(totalSpentAll / customerStats.length) : 0
    }
  })
})

// Expense Report
app.get('/api/reports/expenses', (req, res) => {
  const { from, to } = req.query
  const today = new Date().toISOString().split('T')[0]
  const fromStr = from || today
  const toStr = to || today

  const filtered = expenses.filter(e =>
    e.createdAt && e.createdAt.slice(0, 10) >= fromStr && e.createdAt.slice(0, 10) <= toStr
  ).sort((a, b) => b.createdAt?.localeCompare(a.createdAt || ''))

  const byCategory = {}
  let totalAmount = 0
  filtered.forEach(e => {
    const cat = e.category || 'other'
    byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0)
    totalAmount += (e.amount || 0)
  })

  res.json({
    expenses: filtered,
    summary: { total: filtered.length, totalAmount: Math.round(totalAmount), byCategory }
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', message: 'TDG Backend is running smoothly.' })
})

// Version/diagnostic endpoint — helps verify which deploy is running
app.get('/api/deploy-version', (req, res) => {
  res.json({
    deployedAt: new Date().toISOString(),
    features: ['bcrypt-pins', 'backup-api', 'ws-8.21.0'],
    hasBackupRoutes: true
  })
})

// Manual backup trigger
app.post('/api/backup', (req, res) => {
  try {
    const db = readDb()
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })
    const backupPath = join(BACKUP_DIR, `db-manual-${ts}.json`)
    writeFileSync(backupPath, JSON.stringify(db, null, 2))
    res.json({ success: true, path: backupPath })
  } catch (e) {
    res.status(500).json({ error: 'Backup failed: ' + e.message })
  }
})

// List available backups
app.get('/api/backups', (req, res) => {
  try {
    if (!existsSync(BACKUP_DIR)) return res.json([])
    const files = readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).sort().reverse()
    res.json(files.map(f => ({ name: f, size: statSync(join(BACKUP_DIR, f)).size, date: f.replace('db-', '').replace('db-manual-', '').replace('.json', '').replace(/-/g, ':') })))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// List daily backups
app.get('/api/backups/daily', (req, res) => {
  try {
    if (!existsSync(DAILY_BACKUP_DIR)) return res.json([])
    const files = readdirSync(DAILY_BACKUP_DIR)
      .filter(f => f.startsWith('daily-') && f.endsWith('.json'))
      .sort().reverse()
    res.json(files.map(f => ({
      name: f,
      date: f.replace('daily-', '').replace('.json', ''),
      size: statSync(join(DAILY_BACKUP_DIR, f)).size
    })))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Restore from a daily backup by date
app.post('/api/backups/daily/restore', (req, res) => {
  try {
    const { date } = req.body
    if (!date) return res.status(400).json({ error: 'date required (YYYY-MM-DD)' })
    const backupPath = join(DAILY_BACKUP_DIR, `daily-${date}.json`)
    if (!existsSync(backupPath)) return res.status(404).json({ error: `No daily backup for ${date}` })
    // Save current state as safety backup
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })
    const safetyPath = join(BACKUP_DIR, `db-pre-restore-${ts}.json`)
    writeFileSync(safetyPath, readFileSync(DB_PATH))
    // Restore the daily backup
    writeFileSync(DB_PATH, readFileSync(backupPath))
    console.log(`Restored daily backup from ${date}. Safety copy: ${safetyPath}`)
    res.json({ success: true, message: `Restored from ${date} backup`, safety: safetyPath })
  } catch (e) {
    res.status(500).json({ error: 'Restore failed: ' + e.message })
  }
})

// Reset operational data (orders, billing, KOTs, POs, GRNs, expenses) — ADMIN ONLY
app.post('/api/reset', async (req, res) => {
  try {
    const { pin } = req.body
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ error: '4-digit PIN required' })
    }
    const user = billingUsers.find(u => bcrypt.compareSync(pin, u.pin))
    if (!user) {
      return res.status(401).json({ error: 'Invalid PIN' })
    }
    if (user.role !== 'super-admin') {
      return res.status(403).json({ error: 'Only super admin can reset data' })
    }

    // Backup first
    const db = readDb()
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })
    const backupPath = join(BACKUP_DIR, `db-pre-reset-${ts}.json`)
    writeFileSync(backupPath, JSON.stringify(db, null, 2))

    // Clear operational data
    orders = []
    orderNumber = 1000
    purchaseOrders = []
    poItems = []
    grns = []
    vendorPayments = []
    expenses = []
    purchases = []
    onlineOrders = []

    saveState()
    console.log(`Data reset by admin ${user.name}. Backup:`, backupPath)
    res.json({ success: true, message: 'Operational data reset', backup: backupPath, admin: user.name })
  } catch (e) {
    res.status(500).json({ error: 'Reset failed: ' + e.message })
  }
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
  
  socket.on('join-online', () => {
    socket.join('online')
  })
  
  socket.on('kot:bump', (kotId) => {
    io.emit('kot:bumped', kotId)
  })
})

// Restore persisted state on startup
restoreState()

// Seed admin user for mobile app
async function seedAdmin() {
  const db = readDb()
  if (!db.users.find(u => u.email === 'admin@tdg.com')) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('admin123', salt)
    const adminUser = {
      id: 'u_admin',
      name: 'Admin',
      email: 'admin@tdg.com',
      phone: '0000000000',
      password: hashedPassword,
      role: 'admin',
      rubyBalance: 99999,
      denLevel: 'Emerald',
      completedDens: 10,
      denProgress: 10,
      scratchCards: [],
      denId: null,
      createdAt: new Date().toISOString()
    }
    db.users.push(adminUser)
    writeDb(db)
    console.log('Admin user seeded: admin@tdg.com / admin123')
  }
  if (!loyaltyUsers.find(u => u.phone === '0000000000')) {
    loyaltyUsers.push({
      id: 'u_admin',
      referralCode: 'ADMIN01',
      name: 'Admin',
      phone: '0000000000',
      email: 'admin@tdg.com',
      role: 'admin',
      rubyPoints: 99999,
      tier: 'Emerald',
      referredBy: null,
      denId: null,
      createdAt: new Date().toISOString()
    })
    saveState()
  }

  // Seed billing users if empty
  if (billingUsers.length === 0) {
    const defaultUsers = [
      { name: 'Super Admin', pin: '1010', role: 'super-admin' },
      { name: 'Admin', pin: '1234', role: 'admin' },
      { name: 'Manager', pin: '5678', role: 'manager' },
      { name: 'Cashier', pin: '0000', role: 'cashier' },
      { name: 'Kitchen', pin: '8888', role: 'kitchen' },
    ]
    for (const u of defaultUsers) {
      billingUsers.push({
        id: 'bu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: u.name,
        pin: bcrypt.hashSync(u.pin, 10),
        role: u.role,
        permissions: getDefaultPermissions(u.role),
        createdAt: new Date().toISOString()
      })
    }
    saveState()
    console.log('Seeded ' + defaultUsers.length + ' billing users')
  }

  // Ensure super-admin user exists (migration for existing databases)
  if (!billingUsers.find(u => u.role === 'super-admin')) {
    billingUsers.push({
      id: 'bu_superadmin',
      name: 'Super Admin',
      pin: bcrypt.hashSync('1010', 10),
      role: 'super-admin',
      permissions: getDefaultPermissions('super-admin'),
      createdAt: new Date().toISOString()
    })
    saveState()
    console.log('Migrated: created super-admin user (PIN: 1010)')
  }

  // Ensure settings exist in db.json
  if (!db.settings) {
    db.settings = settings
    writeDb(db)
    console.log('Migrated: initialized settings in db.json')
  }
}
seedAdmin()

// Serve built frontend in production
const distPath = join(__dirname, '..', 'dist')
const flutterWebPath = join(__dirname, '..', 'ttt', 'build', 'web')

// Serve Flutter Web App for den.tendengyros.com subdomain
app.use((req, res, next) => {
  const host = req.headers.host || ''
  if (host.startsWith('den.') && !req.path.startsWith('/api/')) {
    try {
      statSync(flutterWebPath)
      return express.static(flutterWebPath)(req, res, (err) => {
        if (err) return next(err)
        // SPA fallback — serve Flutter web's index.html for non-asset routing
        res.sendFile(join(flutterWebPath, 'index.html'))
      })
    } catch (e) {
      console.log('Flutter Web App build not found, falling back to default frontend')
    }
  }
  next()
})

try {
  statSync(distPath)
  app.use(express.static(distPath))
  // SPA fallback — serve index.html for any non-API path
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
  console.log('Serving frontend from:', distPath)
} catch {
  console.log('No dist folder — frontend not served by server')
}

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Restored: ${orders.length} orders, ${loyaltyUsers.length} loyalty users, ${dens.length} dens, ${inventory.length} inventory items`)
  // Schedule daily backup check every hour
  performDailyBackup()
  const DAILY_BACKUP_INTERVAL = 60 * 60 * 1000 // 1 hour
  setInterval(performDailyBackup, DAILY_BACKUP_INTERVAL)
  console.log('Daily backup scheduler active (checks every hour)')
})

export default app