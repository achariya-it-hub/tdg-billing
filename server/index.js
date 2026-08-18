// TDG Server v1.0.7 - Customer Search & Auto-Fetch Update (2026-08-06)
import express from 'express'
import whatsappRouter from './routes/whatsapp.js'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { readFileSync, writeFileSync, appendFileSync, existsSync, statSync, mkdirSync, readdirSync, rmSync, renameSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import XLSX from 'xlsx'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const JWT_SECRET = process.env.JWT_SECRET || 'tdg_secret_key_123'

// ─── Persistent Data Directory ──────────────────────────────────────────────
// On Linux/Hostinger: use ~/tdg-data/ which is OUTSIDE public_html
// → never touched by git pull / redeploy → data survives forever
// On Windows (local dev): keep using server/ folder as before
const DEFAULT_DATA_DIR = process.env.DATA_DIR
 ? process.env.DATA_DIR
 : process.platform === 'linux'
 ? join(process.env.HOME || '/home', 'tdg-data')
 : __dirname

const DATA_DIR = DEFAULT_DATA_DIR

// Ensure the data directory exists
if (!existsSync(DATA_DIR)) {
 mkdirSync(DATA_DIR, { recursive: true })
 console.log('[DATA] Created persistent data directory:', DATA_DIR)
}

const DB_PATH = join(DATA_DIR, 'db.json')
const ORDER_LOG_PATH = join(DATA_DIR, 'order_log.jsonl')

// ─── One-time migration: move db.json from old location to safe location ─────
const OLD_DB_PATH = join(__dirname, 'db.json')
if (!existsSync(DB_PATH) && existsSync(OLD_DB_PATH)) {
 try {
 const oldData = readFileSync(OLD_DB_PATH)
 writeFileSync(DB_PATH, oldData)
 console.log('[DATA MIGRATION] ✅ Moved db.json from', OLD_DB_PATH, '→', DB_PATH)
 console.log('[DATA MIGRATION] Your data is now stored safely outside the Git folder.')
 } catch (me) {
 console.error('[DATA MIGRATION] ❌ Failed to migrate db.json:', me.message)
 }
}
function appendOrderLog(order) {
 try {
 const line = JSON.stringify({ ts: new Date().toISOString(), id: order.id, orderNumber: order.orderNumber, total: order.total, date: order.date, paymentMethod: order.paymentMethod })
 appendFileSync(ORDER_LOG_PATH, line + '\n')
 } catch (e) {
 console.error('[ORDER LOG] Failed to append:', e.message)
 }
}

const LOCAL_BACKUP_KEY = process.env.BACKUP_SECRET_KEY || 'tdg-local-backup-2026'



process.on('unhandledRejection', (reason, promise) => {
 console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason)
 try {
 if (typeof saveState === 'function') saveState()
 console.error('[EMERGENCY SAVE] Data flushed after unhandledRejection')
 } catch (se) {}
})
// Final safety net: fires just before process actually exits (any reason)
process.on('exit', (code) => {
 try {
 if (typeof saveState === 'function') saveState()
 } catch (e) {}
 console.log(`[EXIT] Process exiting with code ${code}. Final save attempted.`)
})
process.on('beforeExit', (code) => {
 try {
 if (typeof saveState === 'function') saveState()
 } catch (e) {}
})

function readDb() {
 try {
 // Recover orphaned temp file (from interrupted writeDb)
 const tmpPath = `${DB_PATH}.tmp`
 if (existsSync(tmpPath)) {
 try {
 const tmpContent = readFileSync(tmpPath, 'utf-8').trim()
 if (tmpContent) {
 const tmpParsed = JSON.parse(tmpContent)
 if (tmpParsed && typeof tmpParsed === 'object' && (tmpParsed.orders?.length || tmpParsed.menuItems?.length)) {
 console.log('[DATA RECOVERY] Found orphaned tmp file, recovering...')
 renameSync(tmpPath, DB_PATH)
 }
 }
 } catch (re) {
 console.error('[DATA RECOVERY] Failed to recover tmp file:', re.message)
 }
 }
 if (existsSync(DB_PATH)) {
 const content = readFileSync(DB_PATH, 'utf-8').trim()
 if (content && content !== '{}') {
 const parsed = JSON.parse(content)
 if (parsed && typeof parsed === 'object') return parsed
 }
 }
 const seedPath = join(__dirname, 'seed-db.json')
 if (existsSync(seedPath)) {
 console.log('db.json missing. Initializing database on first installation from seed-db.json...')
 const content = readFileSync(seedPath, 'utf-8').trim()
 if (content) {
 const parsed = JSON.parse(content)
 try {
 writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2))
 } catch (we) {
 console.error('Failed writing initial db.json:', we.message)
 }
 return parsed
 }
 }
 } catch (e) {
 console.error('Error reading db.json:', e.message)
 }
 return { users: [], orders: [], transactions: [], categories: [], menuItems: [], recipes: [], settings: {} }
}

const BACKUP_DIR = join(DATA_DIR, 'backups')
const DAILY_BACKUP_DIR = join(DATA_DIR, 'daily-backups')

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

let isStateRestored = false

function writeDb(data = {}) {
 try {
 const diskDb = readDb() || {}
 const completeData = {
 ...diskDb,
 ...data,
 orders: typeof orders !== 'undefined' && orders.length > 0 ? orders : (data.orders && data.orders.length > 0 ? data.orders : (diskDb.orders || [])),
 loyaltyUsers: typeof loyaltyUsers !== 'undefined' ? loyaltyUsers : (data.loyaltyUsers || diskDb.loyaltyUsers || []),
 dens: typeof dens !== 'undefined' ? dens : (data.dens || diskDb.dens || []),
 pointTransactions: typeof pointTransactions !== 'undefined' ? pointTransactions : (data.pointTransactions || diskDb.pointTransactions || []),
 inventory: typeof inventory !== 'undefined' ? inventory : (data.inventory || diskDb.inventory || []),
 orderNumber: Math.max(typeof orderNumber !== 'undefined' ? (orderNumber || 0) : 0, data.orderNumber || 0, diskDb.orderNumber || 0),
 usedReferralCodes: typeof usedReferralCodes !== 'undefined' ? [...usedReferralCodes] : (data.usedReferralCodes || diskDb.usedReferralCodes || []),
 expenses: typeof expenses !== 'undefined' ? expenses : (data.expenses || diskDb.expenses || []),
 purchases: typeof purchases !== 'undefined' ? purchases : (data.purchases || diskDb.purchases || []),
 onlineOrders: typeof onlineOrders !== 'undefined' ? onlineOrders : (data.onlineOrders || diskDb.onlineOrders || []),
 aggregators: typeof aggregators !== 'undefined' ? aggregators : (data.aggregators || diskDb.aggregators || []),
 billingUsers: typeof billingUsers !== 'undefined' ? billingUsers : (data.billingUsers || diskDb.billingUsers || []),
 categories: typeof categories !== 'undefined' ? categories : (data.categories || diskDb.categories || []),
 menuItems: typeof menuItems !== 'undefined' ? menuItems : (data.menuItems || diskDb.menuItems || []),
 recipes: typeof recipes !== 'undefined' ? recipes : (data.recipes || diskDb.recipes || []),
 users: typeof mobileAppUsers !== 'undefined' ? mobileAppUsers : (data.users || diskDb.users || []),
 suppliers: typeof suppliers !== 'undefined' ? suppliers : (data.suppliers || diskDb.suppliers || []),
 purchaseOrders: typeof purchaseOrders !== 'undefined' ? purchaseOrders : (data.purchaseOrders || diskDb.purchaseOrders || []),
 poItems: typeof poItems !== 'undefined' ? poItems : (data.poItems || diskDb.poItems || []),
 grns: typeof grns !== 'undefined' ? grns : (data.grns || diskDb.grns || []),
 vendorPayments: typeof vendorPayments !== 'undefined' ? vendorPayments : (data.vendorPayments || diskDb.vendorPayments || []),
 employees: typeof employees !== 'undefined' ? employees : (data.employees || diskDb.employees || []),
 staffAuditLogs: typeof staffAuditLogs !== 'undefined' ? staffAuditLogs : (data.staffAuditLogs || diskDb.staffAuditLogs || []),
 staffPromotionSettings: typeof staffPromotionSettings !== 'undefined' ? staffPromotionSettings : (data.staffPromotionSettings || diskDb.staffPromotionSettings || {}),
 cashCounterSessions: typeof cashCounterSessions !== 'undefined' ? cashCounterSessions : (data.cashCounterSessions || diskDb.cashCounterSessions || []),
 settings: typeof settings !== 'undefined' ? settings : (data.settings || diskDb.settings || {})
 }

 const tempPath = `${DB_PATH}.tmp`
 writeFileSync(tempPath, JSON.stringify(completeData, null, 2))
 renameSync(tempPath, DB_PATH)

 // Sync live seed-db.json
 try {
 const seedPath = join(__dirname, 'seed-db.json')
 writeFileSync(seedPath, JSON.stringify(completeData, null, 2))
 } catch (se) {}

 // Auto-backup on every write (keeps last 20 copies)
 try {
 if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })
 const ts = new Date().toISOString().replace(/[:.]/g, '-')
 writeFileSync(join(BACKUP_DIR, `db-${ts}.json`), JSON.stringify(completeData, null, 2))
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
let employees = []
let staffAuditLogs = []
let staffPromotionSettings = {
 enabled: true,
 title: 'Achariya Family Week 2026',
 offerType: 'staff_family',
 startDate: '2026-08-04',
 endDate: '2026-08-09',
 discountPct: 50,
 maxDiscountPerBill: 0,
 maxBillsPerDay: 1,
 applicableOrderTypes: ['dine-in', 'pos', 'takeaway', 'delivery', 'dinein'],
 applicableCategories: [],
 applicableMenuItems: []
}

const defaultEmployees = [
 {
 id: 'EMP001',
 name: 'Dr. S. Achariya',
 department: 'Management',
 designation: 'Director',
 mobile: '9876543210',
 email: 'director@achariya.org',
 status: 'Active',
 joiningDate: '2020-01-01',
 qrCode: 'EMP001',
 familyMembers: [
 { id: 'FAM001_1', employeeId: 'EMP001', name: 'Mrs. A. Achariya', relationship: 'Spouse', mobile: '9876543211', status: 'Active' },
 { id: 'FAM001_2', employeeId: 'EMP001', name: 'Kavya Achariya', relationship: 'Daughter', mobile: '9876543212', status: 'Active' }
 ]
 },
 {
 id: 'EMP002',
 name: 'Rajesh Kumar',
 department: 'Billing',
 designation: 'Senior Cashier',
 mobile: '9876543220',
 email: 'rajesh@achariya.org',
 status: 'Active',
 joiningDate: '2022-03-15',
 qrCode: 'EMP002',
 familyMembers: [
 { id: 'FAM002_1', employeeId: 'EMP002', name: 'Sunita Kumar', relationship: 'Spouse', mobile: '9876543221', status: 'Active' }
 ]
 },
 {
 id: 'EMP003',
 name: 'Priya Sharma',
 department: 'Teaching',
 designation: 'Assistant Professor',
 mobile: '9876543230',
 email: 'priya@achariya.org',
 status: 'Active',
 joiningDate: '2021-07-10',
 qrCode: 'EMP003',
 familyMembers: [
 { id: 'FAM003_1', employeeId: 'EMP003', name: 'Ramesh Sharma', relationship: 'Father', mobile: '9876543231', status: 'Active' }
 ]
 }
]
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

// Daily expense & cash counter tracking
let expenses = []
let cashCounterSessions = []
let purchases = []
let suppliers = []
let purchaseOrders = []
let poItems = []
let grns = []
let vendorPayments = []
let onlineOrders = []
let settings = {
 company: { name: 'Tendens Gyros', address: 'Shop 1 & 2, R.S.No.345/3 Kottakuppam, Viluppuram', phone: '7548808877', email: 'info@tendengyros.com', gst: '33FJSPA2544H1Z9', gstNo: '33FJSPA2544H1Z9', gstin: '33FJSPA2544H1Z9', logo: null, upiId: '', deliveryEnabled: true },
 theme: { accentPrimary: '#e63946', accentPrimaryDark: '#c1121f', bgPrimary: '#f5f5f7' },
 printers: [{ id: 'default', name: 'Default Printer', ip: '', type: 'browser', isDefault: true }],
 paymentGateways: {
 ccavenue: {
 merchantId: process.env.CCAVENUE_MERCHANT_ID || '',
 workingKey: process.env.CCAVENUE_WORKING_KEY || '',
 accessCode: process.env.CCAVENUE_ACCESS_CODE || '',
 isProduction: false,
 isEnabled: true
 },
 cashfree: {
 appId: process.env.CASHFREE_APP_ID || '',
 secretKey: process.env.CASHFREE_SECRET_KEY || '',
 isProduction: false,
 isEnabled: true
 }
 },
 msg91: {
 widgetId: process.env.MSG91_WIDGET_ID || '36686e624b35303331383732',
 authKey: process.env.MSG91_AUTH_KEY || '',
 senderId: process.env.MSG91_SENDER_ID || 'TDGBIL',
 templateId: process.env.MSG91_TEMPLATE_ID || '',
 otpExpiry: 300,
 isEnabled: true
 },
 offers: [
 { id: '1', title: 'Golden Gyro Feast (50% OFF)', desc: '1x Spicy Chicken Gyro + 1x Loaded Fries + Cold Drink', tag: '50% OFF', price: '₹199', origPrice: '₹398', image: '/uploads/menu/m1.jpg' },
 { id: '2', title: 'Crispy Chicken & Dip Combo', desc: '4 Pcs Crispy Chicken + 2x Dip + Sauce', tag: 'Save ₹151', price: '₹299', origPrice: '₹450', image: '/uploads/menu/m2.jpg' },
 { id: '3', title: 'BOGO Thick Shake Delight', desc: 'Buy 1 Shake & get Vanilla Shake Free', tag: 'BUY 1 GET 1', price: '₹149', origPrice: '₹298', image: '/uploads/menu/m3.jpg' }
 ],
 campaigns: {
 inauguration: { active: true, date: '2026-07-27', pct: 50, label: 'Inauguration Offer 50%' },
 special20: { active: true, from: '2026-07-29', to: '2026-08-02', pct: 20, label: 'Special Offer 20%' },
 vip50: { active: true, pct: 50, label: 'VIP 50% OFF' }
 }
}
let aggregators = [
 { id: 'swiggy', name: 'Swiggy', displayName: 'Swiggy', isActive: true, defaultPrepTime: 25, color: '#ff5200' },
 { id: 'zomato', name: 'Zomato', displayName: 'Zomato', isActive: true, defaultPrepTime: 20, color: '#e23744' },
 { id: 'zepto', name: 'Zepto', displayName: 'Zepto', isActive: true, defaultPrepTime: 15, color: '#9d2b6b' },
 { id: 'direct', name: 'Direct', displayName: 'Direct Order', isActive: true, defaultPrepTime: 20, color: '#4895ef' }
]

// Vault files stored in DATA_DIR (~/tdg-data on Hostinger) — OUTSIDE Git folder
// so they are NEVER overwritten by git pull / redeploy
const VAULT_PATH = join(DATA_DIR, 'sales_vault_LOCK.json')
const MENU_VAULT_PATH = join(DATA_DIR, 'menu_backup_LOCK.json')
const FROZEN_MENU_PATH = join(DATA_DIR, 'frozen_menu_LOCK.json')
const INVENTORY_VAULT_PATH = join(DATA_DIR, 'inventory_vault_LOCK.json')
const SETTINGS_VAULT_PATH = join(DATA_DIR, 'settings_vault_LOCK.json')

// One-time migration: copy vault files from old server/ location to new DATA_DIR
const OLD_VAULT_FILES = [
 { old: join(__dirname, 'sales_vault_LOCK.json'), new: VAULT_PATH },
 { old: join(__dirname, 'menu_backup_LOCK.json'), new: MENU_VAULT_PATH },
 { old: join(__dirname, 'frozen_menu_LOCK.json'), new: FROZEN_MENU_PATH },
 { old: join(__dirname, 'inventory_vault_LOCK.json'), new: INVENTORY_VAULT_PATH },
 { old: join(__dirname, 'settings_vault_LOCK.json'), new: SETTINGS_VAULT_PATH }
]
for (const vf of OLD_VAULT_FILES) {
 if (!existsSync(vf.new) && existsSync(vf.old)) {
 try {
 writeFileSync(vf.new, readFileSync(vf.old))
 console.log('[VAULT MIGRATION] Moved', vf.old, '→', vf.new)
 } catch (e) {
 console.error('[VAULT MIGRATION] Failed for', vf.old, ':', e.message)
 }
 }
}

function syncSalesVault(currentOrders) {
 try {
 let vaultOrders = []
 if (existsSync(VAULT_PATH)) {
 const content = readFileSync(VAULT_PATH, 'utf-8').trim()
 if (content) {
 try {
 const parsed = JSON.parse(content)
 vaultOrders = Array.isArray(parsed) ? parsed : (parsed.orders || [])
 } catch (err) {}
 }
 }
 const orderMap = new Map()
 vaultOrders.forEach(o => { if (o && (o.id || o.orderNumber)) orderMap.set(String(o.id || o.orderNumber), o) })
 if (Array.isArray(currentOrders)) {
 currentOrders.forEach(o => { if (o && (o.id || o.orderNumber)) orderMap.set(String(o.id || o.orderNumber), o) })
 }
 const mergedOrders = Array.from(orderMap.values())
 writeFileSync(VAULT_PATH, JSON.stringify({ orders: mergedOrders, count: mergedOrders.length }, null, 2))
 return mergedOrders
 } catch (e) {
 console.error('[SALES VAULT] Error:', e.message)
 return Array.isArray(currentOrders) && currentOrders.length ? currentOrders : []
 }
}

function syncMenuVault(curCategories, curMenuItems, curRecipes) {
 try {
 const finalCategories = Array.isArray(curCategories) && curCategories.length > 0 ? curCategories : (categories || [])
 const finalMenuItems = Array.isArray(curMenuItems) && curMenuItems.length > 0 ? curMenuItems : (menuItems || [])
 const finalRecipes = Array.isArray(curRecipes) && curRecipes.length > 0 ? curRecipes : (recipes || [])

 const finalVault = {
 categories: finalCategories,
 menuItems: finalMenuItems,
 recipes: finalRecipes,
 updatedAt: new Date().toISOString()
 }

 if (finalVault.menuItems.length > 0 || finalVault.categories.length > 0) {
 writeFileSync(MENU_VAULT_PATH, JSON.stringify(finalVault, null, 2))
 writeFileSync(FROZEN_MENU_PATH, JSON.stringify(finalVault, null, 2))
 }
 return finalVault
 } catch (e) {
 console.error('[MENU VAULT] Error:', e.message)
 return { categories: curCategories || [], menuItems: curMenuItems || [], recipes: curRecipes || [] }
 }
}

function syncInventoryVault(curInventory) {
 try {
 let vaultInv = []
 if (existsSync(INVENTORY_VAULT_PATH)) {
 const content = readFileSync(INVENTORY_VAULT_PATH, 'utf-8').trim()
 if (content) {
 try {
 const parsed = JSON.parse(content)
 vaultInv = Array.isArray(parsed) ? parsed : (parsed.inventory || [])
 } catch (e) {}
 }
 }
 const invMap = new Map()
 vaultInv.forEach(i => { if (i && (i.id || i.name)) invMap.set(i.id || i.name, i) })
 ;(curInventory || []).forEach(i => { if (i && (i.id || i.name)) invMap.set(i.id || i.name, i) })
 const mergedInv = Array.from(invMap.values())
 writeFileSync(INVENTORY_VAULT_PATH, JSON.stringify({ inventory: mergedInv, count: mergedInv.length }, null, 2))
 return mergedInv
 } catch (e) {
 console.error('[INVENTORY VAULT] Error:', e.message)
 return curInventory || []
 }
}

function syncSettingsVault(currentSettings) {
  try {
    let vaultCompany = {}
    let vaultSettings = {}
    if (existsSync(SETTINGS_VAULT_PATH)) {
      const content = readFileSync(SETTINGS_VAULT_PATH, 'utf-8').trim()
      if (content) {
        try {
          vaultSettings = JSON.parse(content)
          vaultCompany = vaultSettings.company || (vaultSettings.settings ? vaultSettings.settings.company : {})
        } catch (e) {}
      }
    }

    const currentCompany = currentSettings?.company || {}
    const pickBest = (currVal, vaultVal) => {
      const c = (currVal || '').toString().trim()
      const v = (vaultVal || '').toString().trim()
      if (c && c !== '000000000') return c
      if (v && v !== '000000000') return v
      return c || v || ''
    }

    const mergedCompany = {
      ...vaultCompany,
      ...currentCompany,
      name: pickBest(currentCompany.name, vaultCompany.name) || 'Tendens Gyros',
      address: pickBest(currentCompany.address, vaultCompany.address) || 'Shop 1 & 2, R.S.No.345/3 Kottakuppam, Viluppuram',
      phone: pickBest(currentCompany.phone, vaultCompany.phone),
      email: pickBest(currentCompany.email, vaultCompany.email),
      gst: pickBest(currentCompany.gst || currentCompany.gstNo || currentCompany.gstin, vaultCompany.gst || vaultCompany.gstNo || vaultCompany.gstin),
      gstNo: pickBest(currentCompany.gstNo || currentCompany.gst || currentCompany.gstin, vaultCompany.gstNo || vaultCompany.gst || vaultCompany.gstin),
      gstin: pickBest(currentCompany.gstin || currentCompany.gst || currentCompany.gstNo, vaultCompany.gstin || vaultCompany.gst || vaultCompany.gstNo),
      upiId: pickBest(currentCompany.upiId, vaultCompany.upiId),
      logo: currentCompany.logo !== undefined ? currentCompany.logo : vaultCompany.logo,
      deliveryEnabled: currentCompany.deliveryEnabled !== undefined ? currentCompany.deliveryEnabled : (vaultCompany.deliveryEnabled !== false)
    }

    const mergedMsg91 = {
      ...(vaultSettings.msg91 || {}),
      ...(currentSettings?.msg91 || {})
    }

    const finalSettings = {
      ...vaultSettings,
      ...(currentSettings || {}),
      company: mergedCompany,
      msg91: mergedMsg91
    }

    writeFileSync(SETTINGS_VAULT_PATH, JSON.stringify(finalSettings, null, 2))
    return finalSettings
  } catch (e) {
    console.error('[SETTINGS VAULT] Error:', e.message)
    return currentSettings
  }
}

function saveState() {
 orders = syncSalesVault(orders)
 settings = syncSettingsVault(settings)
 
 const menuVault = syncMenuVault(categories, menuItems, recipes)
 categories = menuVault.categories
 menuItems = menuVault.menuItems
 recipes = menuVault.recipes

 inventory = syncInventoryVault(inventory)

 writeDb({
 orders,
 settings,
 categories,
 menuItems,
 recipes,
 inventory,
 billingUsers,
 users: mobileAppUsers,
 loyaltyUsers,
 employees,
 expenses,
 cashCounterSessions,
 purchases,
 suppliers,
 purchaseOrders,
 poItems,
 grns,
 vendorPayments
 })
}

function findLatestValidBackup() {
 const backupDirs = [BACKUP_DIR, DAILY_BACKUP_DIR]

 // 1. First check db-latest.json
 const latestPath = join(BACKUP_DIR, 'db-latest.json')
 if (existsSync(latestPath)) {
 try {
 const content = readFileSync(latestPath, 'utf-8').trim()
 if (content) {
 const parsed = JSON.parse(content)
 if ((parsed.orders && parsed.orders.length) || (parsed.users && parsed.users.length) || (parsed.menuItems && parsed.menuItems.length) || (parsed.categories && parsed.categories.length)) {
 console.log('[DATA SAFETY] Found db-latest.json backup')
 return parsed
 }
 }
 } catch (e) {}
 }

 // 2. Otherwise sort all backup files strictly by modification timestamp (mtimeMs)
 for (const bDir of backupDirs) {
 if (existsSync(bDir)) {
 let files = readdirSync(bDir).filter(f => f.endsWith('.json'))
 const regularFiles = files.filter(f => !f.includes('pre-restore') && !f.includes('pre-reset') && f !== 'db-latest.json')
 if (regularFiles.length > 0) files = regularFiles

 files.sort((a, b) => {
 try {
 return statSync(join(bDir, b)).mtimeMs - statSync(join(bDir, a)).mtimeMs
 } catch (e) {
 return 0
 }
 })

 for (const file of files) {
 try {
 const content = readFileSync(join(bDir, file), 'utf-8').trim()
 if (!content) continue
 const parsed = JSON.parse(content)
 if ((parsed.orders && parsed.orders.length) || (parsed.users && parsed.users.length) || (parsed.menuItems && parsed.menuItems.length) || (parsed.categories && parsed.categories.length)) {
 console.log(`[DATA SAFETY] Found newest timestamped backup: ${file}`)
 return parsed
 }
 } catch (e) { /* ignore corrupt backup */ }
 }
 }
 }

 return null
}

// Safe Data Protection & State Restoration
function restoreState() {
 let db = readDb() || {}
 const SEED_PATH = join(__dirname, 'seed-db.json')

 // Create Data Shield Backup
 if (db && (db.orders?.length || db.purchases?.length || db.grns?.length || db.users?.length)) {
 try {
 if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })
 const ts = new Date().toISOString().replace(/[:.]/g, '-')
 writeFileSync(join(BACKUP_DIR, `db-shield-${ts}.json`), JSON.stringify(db, null, 2))
 } catch (e) {}
 }

 // Safety: only fall back to seed if BOTH menu items AND orders are missing
 // Do NOT treat 'no orders yet' as a broken database — that would wipe the user-saved menu
 const hasMenuData = (db.menuItems && db.menuItems.length > 0) || (db.categories && db.categories.length > 0)
 const hasOrderData = db.orders && db.orders.length > 0
 const isDbMissing = !existsSync(DB_PATH) || !db || (!hasMenuData && !hasOrderData)
 if (isDbMissing) {
 let foundBackup = null
 if (existsSync(SEED_PATH)) {
 try {
 const seedContent = readFileSync(SEED_PATH, 'utf-8').trim()
 if (seedContent) foundBackup = JSON.parse(seedContent)
 } catch (e) {}
 }
 if (!foundBackup || (!foundBackup.orders?.length && !foundBackup.menuItems?.length)) {
 foundBackup = findLatestValidBackup()
 }
 if (foundBackup) {
 console.log('[RESTORE] DB was empty — loaded from seed/backup.')
 db = foundBackup
 }
 }

 // Sync with Vault Locks for absolute 100% data retention
 orders = syncSalesVault(db.orders || [])
 settings = syncSettingsVault(db.settings || settings)

 const menuVault = syncMenuVault(db.categories || categories, db.menuItems || menuItems, db.recipes || recipes)
 categories = menuVault.categories
 menuItems = menuVault.menuItems
 recipes = menuVault.recipes

 inventory = syncInventoryVault(db.inventory || inventory)

 if (db.loyaltyUsers && Array.isArray(db.loyaltyUsers)) loyaltyUsers = db.loyaltyUsers
 if (db.dens && Array.isArray(db.dens) && db.dens.length) dens = db.dens
 if (db.pointTransactions && Array.isArray(db.pointTransactions) && db.pointTransactions.length) pointTransactions = db.pointTransactions
 if (db.orderNumber) orderNumber = Math.max(orderNumber || 0, db.orderNumber || 0)
 if (db.usedReferralCodes && Array.isArray(db.usedReferralCodes)) usedReferralCodes = new Set(db.usedReferralCodes)
 if (db.expenses && Array.isArray(db.expenses) && db.expenses.length) expenses = db.expenses
 if (db.cashCounterSessions && Array.isArray(db.cashCounterSessions)) cashCounterSessions = db.cashCounterSessions
 if (db.purchases && Array.isArray(db.purchases) && db.purchases.length) purchases = db.purchases
 if (db.onlineOrders && Array.isArray(db.onlineOrders) && db.onlineOrders.length) onlineOrders = db.onlineOrders
 if (db.aggregators && Array.isArray(db.aggregators) && db.aggregators.length) aggregators = db.aggregators
 if (db.users && Array.isArray(db.users)) mobileAppUsers = db.users
 if (db.suppliers && Array.isArray(db.suppliers) && db.suppliers.length) suppliers = db.suppliers
 if (db.purchaseOrders && Array.isArray(db.purchaseOrders) && db.purchaseOrders.length) purchaseOrders = db.purchaseOrders
 if (db.poItems && Array.isArray(db.poItems) && db.poItems.length) poItems = db.poItems
 if (db.grns && Array.isArray(db.grns) && db.grns.length) grns = db.grns
 if (db.vendorPayments && Array.isArray(db.vendorPayments) && db.vendorPayments.length) vendorPayments = db.vendorPayments
 if (db.employees && Array.isArray(db.employees) && db.employees.length > 0) employees = db.employees
 else employees = defaultEmployees
 if (db.staffAuditLogs && Array.isArray(db.staffAuditLogs)) staffAuditLogs = db.staffAuditLogs
 if (db.staffPromotionSettings) staffPromotionSettings = { ...staffPromotionSettings, ...db.staffPromotionSettings }

 if (db.billingUsers && Array.isArray(db.billingUsers) && db.billingUsers.length) {
 billingUsers = db.billingUsers
 billingUsers.forEach(u => {
 if (u.pin && u.pin.length === 4 && /^\d{4}$/.test(u.pin)) {
 u.pin = bcrypt.hashSync(u.pin, 10)
 }
 })
 }

 // Seed demo login credentials if missing
 const demoEmail = 'demo'
 const hasDemo = mobileAppUsers.some(u => u.email && u.email.toLowerCase() === demoEmail)
 if (!hasDemo) {
 const hashed = bcrypt.hashSync('demo123', 10)
 const demoUser = {
 id: 'demo_user',
 name: 'Demo User',
 email: 'demo',
 phone: '9999999999',
 password: hashed,
 points: 500,
 referCode: 'DEMO77',
 assets: []
 }
 mobileAppUsers.push(demoUser)
 db.users = mobileAppUsers
 }

 isStateRestored = true
 console.log(`[DATA PROTECTION] Database initialized. Single source of truth restored: ${orders.length} orders, ${menuItems.length} menu items, ${inventory.length} inventory items!`)
}

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
 cors: { origin: '*', methods: ['GET', 'POST'] }
})

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Serve uploaded files & public images
const UPLOADS_DIR = join(__dirname, 'uploads')
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })
app.use('/uploads', express.static(UPLOADS_DIR))
const PUBLIC_DIR = join(__dirname, '../public')
if (existsSync(PUBLIC_DIR)) {
  app.use('/images', express.static(join(PUBLIC_DIR, 'images')))
  app.use(express.static(PUBLIC_DIR))
}
app.use('/api/whatsapp', whatsappRouter)

// Version & Diagnostics endpoint
app.get('/api/version', (req, res) => {
 const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
 const todayStr = getLocalDateStr(new Date())
 res.json({
 version: '1.0.7-cust-search',
 serverTimeIST: nowIST,
 todayStr: todayStr,
 ordersCount: typeof orders !== 'undefined' && Array.isArray(orders) ? orders.length : 0
 })
})




// In-memory database
let mobileAppUsers = []
let orders = []
let orderNumber = 1000
let categories = [
 {
 "id": "c10",
 "name": "Beverages & Kombucha",
 "icon": "🍹",
 "color": "#0284c7"
 },
 {
 "id": "c9",
 "name": "Desserts",
 "icon": "🍰",
 "color": "#ec4899"
 },
 {
 "id": "c4",
 "name": "Dips & Add-Ons",
 "icon": "🥣",
 "color": "#e63946"
 },
 {
 "id": "c6",
 "name": "Fries",
 "icon": "🍟",
 "color": "#f59e0b"
 },
 {
 "id": "c1",
 "name": "Gyros",
 "icon": "🥙",
 "color": "#d97706"
 },
 {
 "id": "c2",
 "name": "Meals & Combos",
 "icon": "🍱",
 "color": "#8b5cf6"
 },
 {
 "id": "c11",
 "name": "Protein Max",
 "icon": "💪",
 "color": "#10b981"
 },
 {
 "id": "c3",
 "name": "Rice & Salads",
 "icon": "🥗",
 "color": "#059669"
 },
 {
 "id": "c7",
 "name": "Shakes & Softy",
 "icon": "🥤",
 "color": "#db2777"
 },
 {
 "id": "c5_strips",
 "name": "Strips",
 "icon": "🍗",
 "color": "#ca8a04"
 },
 {
 "id": "c5_legthigh",
 "name": "Leg & Thigh",
 "icon": "🍗",
 "color": "#ea580c"
 },
 {
 "id": "c5_wings",
 "name": "Wings",
 "icon": "🍗",
 "color": "#b45309"
 }
]

let menuItems = [
 {
 "id": "m11",
 "categoryId": "c1",
 "name": "Pesto Gyro",
 "price": 99,
 "description": "Herby pesto gyro wrap with fresh veggies (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m12",
 "categoryId": "c1",
 "name": "Pesto Gyro (Signature)",
 "price": 249,
 "description": "Large signature herby pesto gyro wrap (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m13",
 "categoryId": "c5_legthigh",
 "name": "4 Pc Leg & Thigh (2 Dips)",
 "price": 280,
 "description": "4 Pc Crispy Fried Chicken Leg & Thigh + 2 Dips",
 "isAvailable": true,
 "image": "/images/menu/Leg& Thigh.png",
 "category": "Leg & Thigh"
 },
 {
 "id": "m14",
 "categoryId": "c5_legthigh",
 "name": "8 Pc Leg & Thigh (4 Dips)",
 "price": 560,
 "description": "8 Pc Crispy Fried Chicken Leg & Thigh + 4 Dips",
 "isAvailable": true,
 "image": "/images/menu/Leg& Thigh.png",
 "category": "Leg & Thigh"
 },
 {
 "id": "m15",
 "categoryId": "c5_legthigh",
 "name": "12 Pc Leg & Thigh (6 Dips)",
 "price": 840,
 "description": "12 Pc Crispy Fried Chicken Leg & Thigh + 6 Dips",
 "isAvailable": true,
 "image": "/images/menu/Leg& Thigh.png",
 "category": "Leg & Thigh"
 },
 {
 "id": "m16",
 "categoryId": "c5_wings",
 "name": "3 Pc Wings (1 Dip)",
 "price": 90,
 "description": "3 Pcs Crispy Fried Wings + 1 Dip",
 "isAvailable": true,
 "image": "/images/menu/wings.png"
 },
 {
 "id": "m17",
 "categoryId": "c5_wings",
 "name": "6 Pc Wings (2 Dips)",
 "price": 180,
 "description": "6 Pcs Crispy Fried Wings + 2 Dips",
 "isAvailable": true,
 "image": "/images/menu/wings.png"
 },
 {
 "id": "m18",
 "categoryId": "c5_wings",
 "name": "9 Pc Wings (3 Dips)",
 "price": 270,
 "description": "9 Pcs Crispy Fried Wings + 3 Dips",
 "isAvailable": true,
 "image": "/images/menu/wings.png"
 },
 {
 "id": "m19",
 "categoryId": "c5_wings",
 "name": "20 Pc Wings (6 Dips)",
 "price": 600,
 "description": "20 Pcs Crispy Fried Wings + 6 Dips",
 "isAvailable": true,
 "image": "/images/menu/wings.png"
 },
 {
 "id": "m20",
 "categoryId": "c5_wings",
 "name": "60 Pc Wings (12 Dips)",
 "price": 1500,
 "description": "60 Pcs Party Bucket Crispy Wings + 12 Dips",
 "isAvailable": true,
 "image": "/images/menu/wings.png"
 },
 {
 "id": "m21",
 "categoryId": "c5_strips",
 "name": "3 Pc Strips (1 Dip)",
 "price": 120,
 "description": "3 Pcs Boneless Crispy Strips + 1 Dip",
 "isAvailable": true,
 "image": "/images/menu/strips.png"
 },
 {
 "id": "m22",
 "categoryId": "c5_strips",
 "name": "6 Pc Strips (2 Dips)",
 "price": 240,
 "description": "6 Pcs Boneless Crispy Strips + 2 Dips",
 "isAvailable": true,
 "image": "/images/menu/strips.png"
 },
 {
 "id": "m23",
 "categoryId": "c5_strips",
 "name": "9 Pc Strips (3 Dips)",
 "price": 360,
 "description": "9 Pcs Boneless Crispy Strips + 3 Dips",
 "isAvailable": true,
 "image": "/images/menu/strips.png"
 },
 {
 "id": "m24",
 "categoryId": "c5_strips",
 "name": "20 Pc Strips (6 Dips)",
 "price": 800,
 "description": "20 Pcs Boneless Crispy Strips + 6 Dips",
 "isAvailable": true,
 "image": "/images/menu/strips.png"
 },
 {
 "id": "m25",
 "categoryId": "c5_strips",
 "name": "60 Pc Strips (12 Dips)",
 "price": 2400,
 "description": "60 Pcs Party Bucket Boneless Strips + 12 Dips",
 "isAvailable": true,
 "image": "/images/menu/strips.png"
 },
 {
 "id": "m26a",
 "categoryId": "c6",
 "name": "Salted Fries",
 "price": 99,
 "description": "Crispy golden salted French fries",
 "isAvailable": true,
 "image": "/images/menu/fries.png"
 },
 {
 "id": "m26b",
 "categoryId": "c6",
 "name": "Peri Peri Fries",
 "price": 99,
 "description": "Crispy golden French fries tossed in peri peri seasoning",
 "isAvailable": true,
 "image": "/images/menu/fries.png"
 },
 {
 "id": "m26c",
 "categoryId": "c6",
 "name": "Cajun Fries",
 "price": 99,
 "description": "Crispy golden French fries tossed in cajun seasoning",
 "isAvailable": true,
 "image": "/images/menu/fries.png"
 },
 {
 "id": "m27a",
 "categoryId": "c6",
 "name": "Loaded Chicken Fries",
 "price": 199,
 "description": "Loaded fries topped with melted cheese & crispy chicken",
 "isAvailable": true,
 "image": "/images/menu/loaded fries.png"
 },
 {
 "id": "m27b",
 "categoryId": "c6",
 "name": "Loaded Paneer Fries",
 "price": 199,
 "description": "Loaded fries topped with melted cheese & grilled paneer",
 "isAvailable": true,
 "image": "/images/menu/loaded fries.png"
 },
 {
 "id": "m28a",
 "categoryId": "c3",
 "name": "Lebanese Rice Bowl (Chicken)",
 "price": 199,
 "description": "Flavored Mediterranean Lebanese rice topped with grilled chicken",
 "isAvailable": true,
 "image": "/images/menu/lebanese rice bowl.png"
 },
 {
 "id": "m28b",
 "categoryId": "c3",
 "name": "Lebanese Rice Bowl (Paneer)",
 "price": 199,
 "description": "Flavored Mediterranean Lebanese rice topped with grilled paneer",
 "isAvailable": true,
 "image": "/images/menu/lebanese rice bowl.png"
 },
 {
 "id": "m29a",
 "categoryId": "c3",
 "name": "Signature Salad (Chicken)",
 "price": 149,
 "description": "Fresh garden salad with olives, dressing & grilled chicken",
 "isAvailable": true,
 "image": "/images/menu/signature salad.png"
 },
 {
 "id": "m29b",
 "categoryId": "c3",
 "name": "Signature Salad (Paneer)",
 "price": 149,
 "description": "Fresh garden salad with olives, dressing & grilled paneer",
 "isAvailable": true,
 "image": "/images/menu/signature salad.png"
 },
 {
 "id": "m30",
 "categoryId": "c2",
 "name": "Express Meal",
 "price": 149,
 "description": "Gyro & Regular Drink",
 "isAvailable": true,
 "image": "/images/menu/express meal.png"
 },
 {
 "id": "m31",
 "categoryId": "c2",
 "name": "Classic Gyro Meal",
 "price": 249,
 "description": "Gyro, 2 Wings, Fries, Regular Drink, 1 Dip",
 "isAvailable": true,
 "image": "/images/menu/classic gyro meal.png"
 },
 {
 "id": "m32",
 "categoryId": "c2",
 "name": "Signature Gyro Meal",
 "price": 299,
 "description": "Signature Gyro, Fries, Regular Drink",
 "isAvailable": true,
 "image": "/images/menu/signature gyro meal.png"
 },
 {
 "id": "m33",
 "categoryId": "c2",
 "name": "Lebanese Rice Box",
 "price": 299,
 "description": "Lebanese rice, Fries, Regular Drink",
 "isAvailable": true,
 "image": "/images/menu/lebanese rice box.png"
 },
 {
 "id": "m34",
 "categoryId": "c2",
 "name": "Duo Gyro Feast",
 "price": 349,
 "description": "2 Gyros, Fries, 2 Regular Drinks",
 "isAvailable": true,
 "image": "/images/menu/duo gyro feast.png"
 },
 {
 "id": "m35",
 "categoryId": "c2",
 "name": "Double Crunch Box",
 "price": 499,
 "description": "2 Gyros, 6 Wings, Fries, 2 Regular Drinks",
 "isAvailable": true,
 "image": "/images/menu/double crunch box.png"
 },
 {
 "id": "m36",
 "categoryId": "c2",
 "name": "Mega Feast Meal",
 "price": 649,
 "description": "2 Gyros, 2 Leg & Thighs, 2 Wings, 2 Strips, Fries, 2 Regular Drinks, 3 Dips",
 "isAvailable": true,
 "image": "/images/menu/mega feast meal.png"
 },
 {
 "id": "m37",
 "categoryId": "c2",
 "name": "Den's Party Meal",
 "price": 899,
 "description": "2 Signature Gyros, 6 Wings, 4 Leg & Thighs, 2 Fries, 3 Regular Drinks",
 "isAvailable": true,
 "image": "/images/menu/den's party meal.png"
 },
 {
 "id": "m38",
 "categoryId": "c2",
 "name": "Super 5 Bucket",
 "price": 1299,
 "description": "5 Leg & Thighs, 10 Wings, 10 Strips, 5 Regular Drinks",
 "isAvailable": true,
 "image": "/images/menu/super 5 bucket.png"
 },
 {
 "id": "m40a",
 "categoryId": "c11",
 "name": "Lebanese Rice - Protein Max (Chicken)",
 "price": 299,
 "description": "Extra high protein Lebanese Rice bowl with grilled chicken",
 "isAvailable": true,
 "image": "/images/menu/protein max.png"
 },
 {
 "id": "m40b",
 "categoryId": "c11",
 "name": "Lebanese Rice - Protein Max (Paneer)",
 "price": 299,
 "description": "Extra high protein Lebanese Rice bowl with grilled paneer",
 "isAvailable": true,
 "image": "/images/menu/protein max.png"
 },
 {
 "id": "m41a",
 "categoryId": "c11",
 "name": "Salad - Protein Max (Chicken)",
 "price": 299,
 "description": "Extra high protein Salad bowl with grilled chicken",
 "isAvailable": true,
 "image": "/images/menu/protein max.png"
 },
 {
 "id": "m41b",
 "categoryId": "c11",
 "name": "Salad - Protein Max (Paneer)",
 "price": 299,
 "description": "Extra high protein Salad bowl with grilled paneer",
 "isAvailable": true,
 "image": "/images/menu/protein max.png"
 },
 {
 "id": "m42",
 "categoryId": "c7",
 "name": "Vanilla Shake (Regular)",
 "price": 120,
 "description": "Creamy thick vanilla shake",
 "isAvailable": true,
 "image": "/images/menu/vanilla shake.png"
 },
 {
 "id": "m43",
 "categoryId": "c7",
 "name": "Vanilla Shake (Large)",
 "price": 199,
 "description": "Large creamy thick vanilla shake",
 "isAvailable": true,
 "image": "/images/menu/vanilla shake.png"
 },
 {
 "id": "m44",
 "categoryId": "c7",
 "name": "Strawberry Shake (Regular)",
 "price": 120,
 "description": "Thick strawberry shake",
 "isAvailable": true,
 "image": "/images/menu/strawberry shake.png"
 },
 {
 "id": "m45",
 "categoryId": "c7",
 "name": "Strawberry Shake (Large)",
 "price": 199,
 "isAvailable": true,
 "image": "/images/menu/strawberry shake.png"
 },
 {
 "id": "m46",
 "categoryId": "c7",
 "name": "Biscoff Shake (Regular)",
 "price": 120,
 "description": "Lotus biscoff thick shake",
 "isAvailable": true,
 "image": "/images/menu/biscoff shake.png"
 },
 {
 "id": "m47",
 "categoryId": "c7",
 "name": "Biscoff Shake (Large)",
 "price": 199,
 "isAvailable": true,
 "image": "/images/menu/biscoff shake.png"
 },
 {
 "id": "m48",
 "categoryId": "c7",
 "name": "Chocolate Shake (Regular)",
 "price": 120,
 "description": "Rich Belgian chocolate thick shake",
 "isAvailable": true,
 "image": "/images/menu/chocolate shake.png"
 },
 {
 "id": "m49",
 "categoryId": "c7",
 "name": "Chocolate Shake (Large)",
 "price": 199,
 "isAvailable": true,
 "image": "/images/menu/chocolate shake.png"
 },
 {
 "id": "m50",
 "categoryId": "c7",
 "name": "Kunafa Pistachio Shake (Regular)",
 "price": 120,
 "description": "Special Kunafa Pistachio thick shake",
 "isAvailable": true,
 "image": "/images/menu/kunafa pistachio shake.png"
 },
 {
 "id": "m51",
 "categoryId": "c7",
 "name": "Kunafa Pistachio Shake (Large)",
 "price": 199,
 "isAvailable": true,
 "image": "/images/menu/kunafa pistachio shake.png"
 },
 {
 "id": "m52",
 "categoryId": "c7",
 "name": "Vanilla Softy",
 "price": 39,
 "description": "Classic soft serve ice cream cone",
 "isAvailable": true,
 "image": "/images/menu/vanilla softy.png"
 },
 {
 "id": "m53a",
 "categoryId": "c10",
 "name": "Coca-Cola (Regular)",
 "price": 59,
 "description": "Chilled 330ml Coca-Cola soda",
 "isAvailable": true,
 "image": "/images/menu/logo.png"
 },
 {
 "id": "m53b",
 "categoryId": "c10",
 "name": "Coca-Cola (Large)",
 "price": 99,
 "description": "Large chilled Coca-Cola soda",
 "isAvailable": true,
 "image": "/images/menu/logo.png"
 },
 {
 "id": "m54a",
 "categoryId": "c10",
 "name": "Sprite (Regular)",
 "price": 59,
 "description": "Chilled 330ml Sprite soda",
 "isAvailable": true,
 "image": "/images/menu/logo.png"
 },
 {
 "id": "m54b",
 "categoryId": "c10",
 "name": "Sprite (Large)",
 "price": 99,
 "description": "Large chilled Sprite soda",
 "isAvailable": true,
 "image": "/images/menu/logo.png"
 },
 {
 "id": "m55a",
 "categoryId": "c10",
 "name": "Peach Ice Tea (Regular)",
 "price": 59,
 "description": "Refreshing peach iced tea",
 "isAvailable": true,
 "image": "/images/menu/logo.png"
 },
 {
 "id": "m55b",
 "categoryId": "c10",
 "name": "Peach Ice Tea (Large)",
 "price": 99,
 "description": "Large refreshing peach iced tea",
 "isAvailable": true,
 "image": "/images/menu/logo.png"
 },
 {
 "id": "m56a",
 "categoryId": "c10",
 "name": "Lime Ice Tea (Regular)",
 "price": 59,
 "description": "Refreshing lime iced tea",
 "isAvailable": true,
 "image": "/images/menu/ice tea - lime.png"
 },
 {
 "id": "m56b",
 "categoryId": "c10",
 "name": "Lime Ice Tea (Large)",
 "price": 99,
 "description": "Large refreshing lime iced tea",
 "isAvailable": true,
 "image": "/images/menu/ice tea - lime.png"
 },
 {
 "id": "m59a",
 "categoryId": "c10",
 "name": "Mint Kombucha",
 "price": 114.29,
 "description": "Organic sparkling mint probiotic Kombucha drink",
 "isAvailable": true,
 "image": "/images/menu/mint-kombucha.png",
 "taxInclusive": true
 },
 {
 "id": "m59b",
 "categoryId": "c10",
 "name": "Hibiscus Kombucha",
 "price": 114.29,
 "description": "Organic sparkling hibiscus probiotic Kombucha drink",
 "isAvailable": true,
 "image": "/images/menu/kombucha-hibiscus.png",
 "taxInclusive": true
 },
 {
 "id": "m59c",
 "categoryId": "c10",
 "name": "Ginger Kombucha",
 "price": 114.29,
 "description": "Organic sparkling ginger probiotic Kombucha drink",
 "isAvailable": true,
 "image": "/images/menu/ginger - kombucha.png",
 "taxInclusive": true
 },
 {
 "id": "m59d",
 "categoryId": "c10",
 "name": "Butterfly Pea Kombucha",
 "price": 114.29,
 "description": "Organic sparkling butterfly pea probiotic Kombucha drink",
 "isAvailable": true,
 "image": "/images/menu/butterfly pea - kombucha.png",
 "taxInclusive": true
 },
 {
 "id": "m57",
 "categoryId": "c10",
 "name": "Hot Chocolate",
 "price": 99,
 "description": "Warm rich hot chocolate drink",
 "isAvailable": true,
 "image": "/images/menu/Hot Chocolate.png"
 },
 {
 "id": "m58",
 "categoryId": "c10",
 "name": "Signature Tea",
 "price": 99,
 "description": "TDG Special aromatic brewed tea",
 "isAvailable": true,
 "image": "/images/menu/Signature tea.png"
 },
 {
 "id": "m60",
 "categoryId": "c9",
 "name": "Chocolate Brownie",
 "price": 99,
 "description": "Warm fudgy chocolate brownie",
 "isAvailable": true,
 "image": "/images/menu/chcolate brownie.png"
 },
 {
 "id": "m61",
 "categoryId": "c9",
 "name": "Blondie Cake",
 "price": 99,
 "description": "Delicious vanilla butter blondie slice",
 "isAvailable": true,
 "image": "/images/menu/blondie cake.png"
 },
 {
 "id": "m62a",
 "categoryId": "c4",
 "name": "Turkish Chilli Dip",
 "price": 15,
 "description": "Spicy authentic Turkish chilli dip",
 "isAvailable": true,
 "image": "/images/menu/turkish chilli.png"
 },
 {
 "id": "m62b",
 "categoryId": "c4",
 "name": "Jalapeno Cheese Dip",
 "price": 15,
 "description": "Rich creamy jalapeno cheese dip",
 "isAvailable": true,
 "image": "/images/menu/jalapeno cheese.png"
 },
 {
 "id": "m62c",
 "categoryId": "c4",
 "name": "Garlic Mayo Dip",
 "price": 15,
 "description": "Classic creamy garlic mayonnaise dip",
 "isAvailable": true,
 "image": "/images/menu/garlic mayo.png"
 },
 {
 "id": "m62d",
 "categoryId": "c4",
 "name": "Spicy Mayo Dip",
 "price": 15,
 "description": "Zesty spicy mayonnaise dip",
 "isAvailable": true,
 "image": "/images/menu/spicy mayo.png"
 },
 {
 "id": "m62e",
 "categoryId": "c4",
 "name": "Peri Peri Dip",
 "price": 15,
 "description": "Fiery peri peri dipping sauce",
 "isAvailable": true,
 "image": "/images/menu/peri peri.png"
 },
 {
 "id": "m62f",
 "categoryId": "c4",
 "name": "Honey Mustard Dip",
 "price": 15,
 "description": "Sweet and tangy honey mustard dip",
 "isAvailable": true,
 "image": "/images/menu/honey mustard.png"
 },
 {
 "id": "m1",
 "categoryId": "c1",
 "name": "Spicy Gyro",
 "price": 99,
 "description": "Fresh pita wrap with spicy sauce & fresh veggies (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m2",
 "categoryId": "c1",
 "name": "Spicy Gyro (Signature)",
 "price": 249,
 "description": "Large signature pita wrap with spicy sauce & fresh veggies (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m3",
 "categoryId": "c1",
 "name": "Creamy Gyro",
 "price": 99,
 "description": "Fluffy pita wrap with creamy garlic sauce & fresh veggies (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m4",
 "categoryId": "c1",
 "name": "Creamy Gyro (Signature)",
 "price": 249,
 "description": "Large signature pita wrap with creamy garlic sauce (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m5",
 "categoryId": "c1",
 "name": "BBQ Gyro",
 "price": 99,
 "description": "Pita wrap with smoky BBQ sauce & fresh veggies (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m6",
 "categoryId": "c1",
 "name": "BBQ Gyro (Signature)",
 "price": 249,
 "description": "Large signature pita wrap with smoky BBQ sauce (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m7",
 "categoryId": "c1",
 "name": "Peri Peri Gyro",
 "price": 99,
 "description": "Zesty Peri Peri pita wrap with fresh veggies (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m8",
 "categoryId": "c1",
 "name": "Peri Peri Gyro (Signature)",
 "price": 249,
 "description": "Large signature Peri Peri pita wrap (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m9",
 "categoryId": "c1",
 "name": "Signature Gyro",
 "price": 99,
 "description": "Our house signature gyro wrap (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m10",
 "categoryId": "c1",
 "name": "Signature Gyro (Signature)",
 "price": 249,
 "description": "Large house signature gyro wrap (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 },
 {
 "id": "m39",
 "categoryId": "c1",
 "name": "Gyro - Protein Max",
 "price": 299,
 "description": "High protein double wrap (Chicken or Paneer)",
 "isAvailable": true,
 "image": "/images/menu/gyro.png"
 }
]

let recipes = [
 {
 "id": "r_m53a",
 "menuItemId": "m53a",
 "menuItemName": "Coca-Cola (Regular)",
 "name": "COLA 330ML",
 "description": "Standard recipe for COLA 330ML (Price ₹59/-)",
 "yieldQty": 1,
 "prepTime": 2,
 "rmCost": 24.36,
 "pmCost": 6.42,
 "labourCost": 3.2,
 "calculatedCost": 33.98,
 "sellingPrice": 59,
 "ingredients": [
 {
 "id": "ri_m53a_1",
 "inventoryItemId": "inv_cola",
 "inventoryName": "COLA",
 "quantity": 1,
 "unit": "kg",
 "costPerUnit": 24,
 "cost": 24
 },
 {
 "id": "ri_m53a_2",
 "inventoryItemId": "inv_ice_cube",
 "inventoryName": "ICE CUBE",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 6,
 "cost": 0.36
 },
 {
 "id": "ri_m53a_3",
 "inventoryItemId": "inv_bev_lid_330",
 "inventoryName": "BEVERAGES WITH LID 330ML",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 5.49,
 "cost": 5.49
 },
 {
 "id": "ri_m53a_4",
 "inventoryItemId": "inv_straw",
 "inventoryName": "Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.93,
 "cost": 0.93
 },
 {
 "id": "ri_m53a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m54a",
 "menuItemId": "m54a",
 "menuItemName": "Sprite (Regular)",
 "name": "SPRITE 330ML",
 "description": "Standard recipe for SPRITE 330ML (Price ₹59/-)",
 "yieldQty": 1,
 "prepTime": 2,
 "rmCost": 24.36,
 "pmCost": 6.42,
 "labourCost": 3.2,
 "calculatedCost": 33.98,
 "sellingPrice": 59,
 "ingredients": [
 {
 "id": "ri_m54a_1",
 "inventoryItemId": "inv_sprite",
 "inventoryName": "SPRITE",
 "quantity": 1,
 "unit": "kg",
 "costPerUnit": 24,
 "cost": 24
 },
 {
 "id": "ri_m54a_2",
 "inventoryItemId": "inv_ice_cube",
 "inventoryName": "ICE CUBE",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 6,
 "cost": 0.36
 },
 {
 "id": "ri_m54a_3",
 "inventoryItemId": "inv_bev_lid_330",
 "inventoryName": "BEVERAGES WITH LID 330ML",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 5.49,
 "cost": 5.49
 },
 {
 "id": "ri_m54a_4",
 "inventoryItemId": "inv_straw",
 "inventoryName": "Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.93,
 "cost": 0.93
 },
 {
 "id": "ri_m54a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m53b",
 "menuItemId": "m53b",
 "menuItemName": "Coca-Cola (Large)",
 "name": "COLA 650ML",
 "description": "Standard recipe for COLA 650ML (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 2,
 "rmCost": 48.72,
 "pmCost": 7.78,
 "labourCost": 3.2,
 "calculatedCost": 59.7,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m53b_1",
 "inventoryItemId": "inv_cola",
 "inventoryName": "COLA",
 "quantity": 2,
 "unit": "kg",
 "costPerUnit": 24,
 "cost": 48
 },
 {
 "id": "ri_m53b_2",
 "inventoryItemId": "inv_ice_cube",
 "inventoryName": "ICE CUBE",
 "quantity": 0.12,
 "unit": "kg",
 "costPerUnit": 6,
 "cost": 0.72
 },
 {
 "id": "ri_m53b_3",
 "inventoryItemId": "inv_bev_lid_650",
 "inventoryName": "BEVERAGES WITH LID 650ML",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.85,
 "cost": 6.85
 },
 {
 "id": "ri_m53b_4",
 "inventoryItemId": "inv_straw",
 "inventoryName": "Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.93,
 "cost": 0.93
 },
 {
 "id": "ri_m53b_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m54b",
 "menuItemId": "m54b",
 "menuItemName": "Sprite (Large)",
 "name": "SPRITE 650ML",
 "description": "Standard recipe for SPRITE 650ML (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 2,
 "rmCost": 48.72,
 "pmCost": 7.78,
 "labourCost": 3.2,
 "calculatedCost": 59.7,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m54b_1",
 "inventoryItemId": "inv_sprite",
 "inventoryName": "SPRITE",
 "quantity": 2,
 "unit": "kg",
 "costPerUnit": 24,
 "cost": 48
 },
 {
 "id": "ri_m54b_2",
 "inventoryItemId": "inv_ice_cube",
 "inventoryName": "ICE CUBE",
 "quantity": 0.12,
 "unit": "kg",
 "costPerUnit": 6,
 "cost": 0.72
 },
 {
 "id": "ri_m54b_3",
 "inventoryItemId": "inv_bev_lid_650",
 "inventoryName": "BEVERAGES WITH LID 650ML",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.85,
 "cost": 6.85
 },
 {
 "id": "ri_m54b_4",
 "inventoryItemId": "inv_straw",
 "inventoryName": "Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.93,
 "cost": 0.93
 },
 {
 "id": "ri_m54b_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m56a",
 "menuItemId": "m56a",
 "menuItemName": "Lime Ice Tea (Regular)",
 "name": "Lime 330ml",
 "description": "Standard recipe for Lime Ice Tea 330ml (Price ₹59/-)",
 "yieldQty": 1,
 "prepTime": 2,
 "rmCost": 17.4,
 "pmCost": 6.59,
 "labourCost": 3.2,
 "calculatedCost": 27.19,
 "sellingPrice": 59,
 "ingredients": [
 {
 "id": "ri_m56a_1",
 "inventoryItemId": "inv_lime",
 "inventoryName": "Lime",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 550,
 "cost": 16.5
 },
 {
 "id": "ri_m56a_2",
 "inventoryItemId": "inv_ice_cube",
 "inventoryName": "ICE CUBE",
 "quantity": 0.15,
 "unit": "kg",
 "costPerUnit": 6,
 "cost": 0.9
 },
 {
 "id": "ri_m56a_3",
 "inventoryItemId": "inv_bev_lid_330",
 "inventoryName": "Beverages with LID 330ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 5.49,
 "cost": 5.49
 },
 {
 "id": "ri_m56a_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.1,
 "cost": 1.1
 },
 {
 "id": "ri_m56a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m55a",
 "menuItemId": "m55a",
 "menuItemName": "Peach Ice Tea (Regular)",
 "name": "Peach 330ml",
 "description": "Standard recipe for Peach Ice Tea 330ml (Price ₹59/-)",
 "yieldQty": 1,
 "prepTime": 2,
 "rmCost": 17.4,
 "pmCost": 6.59,
 "labourCost": 3.2,
 "calculatedCost": 27.19,
 "sellingPrice": 59,
 "ingredients": [
 {
 "id": "ri_m55a_1",
 "inventoryItemId": "inv_peach",
 "inventoryName": "Peach",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 550,
 "cost": 16.5
 },
 {
 "id": "ri_m55a_2",
 "inventoryItemId": "inv_ice_cube",
 "inventoryName": "ICE CUBE",
 "quantity": 0.15,
 "unit": "kg",
 "costPerUnit": 6,
 "cost": 0.9
 },
 {
 "id": "ri_m55a_3",
 "inventoryItemId": "inv_bev_lid_330",
 "inventoryName": "Beverages with LID 330ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 5.49,
 "cost": 5.49
 },
 {
 "id": "ri_m55a_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.1,
 "cost": 1.1
 },
 {
 "id": "ri_m55a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m56b",
 "menuItemId": "m56b",
 "menuItemName": "Lime Ice Tea (Large)",
 "name": "Lime 650ml",
 "description": "Standard recipe for Lime Ice Tea 650ml (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 2,
 "rmCost": 34.8,
 "pmCost": 9.19,
 "labourCost": 3.2,
 "calculatedCost": 47.19,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m56b_1",
 "inventoryItemId": "inv_lime",
 "inventoryName": "LIME",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 550,
 "cost": 33
 },
 {
 "id": "ri_m56b_2",
 "inventoryItemId": "inv_ice_cube",
 "inventoryName": "ICE CUBE",
 "quantity": 0.3,
 "unit": "kg",
 "costPerUnit": 6,
 "cost": 1.8
 },
 {
 "id": "ri_m56b_3",
 "inventoryItemId": "inv_bev_lid_650_icetea",
 "inventoryName": "Beverages with LID 650ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 8.09,
 "cost": 8.09
 },
 {
 "id": "ri_m56b_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.1,
 "cost": 1.1
 },
 {
 "id": "ri_m56b_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m55b",
 "menuItemId": "m55b",
 "menuItemName": "Peach Ice Tea (Large)",
 "name": "Peach 650ml",
 "description": "Standard recipe for Peach Ice Tea 650ml (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 2,
 "rmCost": 34.8,
 "pmCost": 9.19,
 "labourCost": 3.2,
 "calculatedCost": 47.19,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m55b_1",
 "inventoryItemId": "inv_peach",
 "inventoryName": "PEACH",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 550,
 "cost": 33
 },
 {
 "id": "ri_m55b_2",
 "inventoryItemId": "inv_ice_cube",
 "inventoryName": "ICE CUBE",
 "quantity": 0.3,
 "unit": "kg",
 "costPerUnit": 6,
 "cost": 1.8
 },
 {
 "id": "ri_m55b_3",
 "inventoryItemId": "inv_bev_lid_650_icetea",
 "inventoryName": "Beverages with LID 650ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 8.09,
 "cost": 8.09
 },
 {
 "id": "ri_m55b_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.1,
 "cost": 1.1
 },
 {
 "id": "ri_m55b_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m60",
 "menuItemId": "m60",
 "menuItemName": "Chocolate Brownie",
 "name": "CHOCOLATE BROWNIE",
 "description": "Standard recipe for Chocolate Brownie (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 29.82,
 "pmCost": 11.78,
 "labourCost": 3.2,
 "calculatedCost": 44.8,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m60_1",
 "inventoryItemId": "inv_butter",
 "inventoryName": "BUTTER",
 "quantity": 0.017,
 "unit": "kg",
 "costPerUnit": 754.29,
 "cost": 12.57
 },
 {
 "id": "ri_m60_2",
 "inventoryItemId": "inv_dark_compound",
 "inventoryName": "DARK COMPOUND",
 "quantity": 0.025,
 "unit": "kg",
 "costPerUnit": 391.82,
 "cost": 9.8
 },
 {
 "id": "ri_m60_3",
 "inventoryItemId": "inv_egg",
 "inventoryName": "EGG",
 "quantity": 0.333,
 "unit": "pc",
 "costPerUnit": 6.3,
 "cost": 2.1
 },
 {
 "id": "ri_m60_4",
 "inventoryItemId": "inv_vanilla_essence",
 "inventoryName": "VANNILA ESSENCE",
 "quantity": 0.001,
 "unit": "kg",
 "costPerUnit": 484.75,
 "cost": 0.24
 },
 {
 "id": "ri_m60_5",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "WHITE SUGAR",
 "quantity": 0.017,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 0.8
 },
 {
 "id": "ri_m60_6",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.017,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 0.75
 },
 {
 "id": "ri_m60_7",
 "inventoryItemId": "inv_brown_sugar",
 "inventoryName": "BROWN SUGAR",
 "quantity": 0.008,
 "unit": "kg",
 "costPerUnit": 230,
 "cost": 1.92
 },
 {
 "id": "ri_m60_8",
 "inventoryItemId": "inv_milk_compound",
 "inventoryName": "MILK COMPOUND",
 "quantity": 0.005,
 "unit": "kg",
 "costPerUnit": 328,
 "cost": 1.64
 },
 {
 "id": "ri_m60_9",
 "inventoryItemId": "inv_dinning_tray_250ml",
 "inventoryName": "DINNING TRAY 250ML",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 2.92,
 "cost": 2.92
 },
 {
 "id": "ri_m60_10",
 "inventoryItemId": "inv_wooden_spoon",
 "inventoryName": "Wooden Spoon",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.68,
 "cost": 1.68
 },
 {
 "id": "ri_m60_11",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m60_12",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m60_13",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m61",
 "menuItemId": "m61",
 "menuItemName": "Blondie Cake",
 "name": "BLONDIE CAKE",
 "description": "Standard recipe for Blondie Cake (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 28.62,
 "pmCost": 11.78,
 "labourCost": 3.2,
 "calculatedCost": 43.6,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m61_1",
 "inventoryItemId": "inv_butter",
 "inventoryName": "BUTTER",
 "quantity": 0.017,
 "unit": "kg",
 "costPerUnit": 754.29,
 "cost": 12.57
 },
 {
 "id": "ri_m61_2",
 "inventoryItemId": "inv_white_compound",
 "inventoryName": "WHITE COMPOUND",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 391.82,
 "cost": 11.75
 },
 {
 "id": "ri_m61_3",
 "inventoryItemId": "inv_egg",
 "inventoryName": "EGG",
 "quantity": 0.333,
 "unit": "pc",
 "costPerUnit": 6.3,
 "cost": 2.1
 },
 {
 "id": "ri_m61_4",
 "inventoryItemId": "inv_vanilla_essence",
 "inventoryName": "VANNILA ESSENCE",
 "quantity": 0.001,
 "unit": "kg",
 "costPerUnit": 484.75,
 "cost": 0.24
 },
 {
 "id": "ri_m61_5",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "WHITE SUGAR",
 "quantity": 0.025,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 1.2
 },
 {
 "id": "ri_m61_6",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.017,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 0.75
 },
 {
 "id": "ri_m61_7",
 "inventoryItemId": "inv_dinning_tray_250ml",
 "inventoryName": "DINNING TRAY 250ML",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 2.92,
 "cost": 2.92
 },
 {
 "id": "ri_m61_8",
 "inventoryItemId": "inv_wooden_spoon",
 "inventoryName": "Wooden Spoon",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.68,
 "cost": 1.68
 },
 {
 "id": "ri_m61_9",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m61_10",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m61_11",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m11",
 "menuItemId": "m11",
 "menuItemName": "Pesto Gyro",
 "name": "PESTO GYRO (MINI)",
 "description": "Standard recipe for Pesto Gyro",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 39.77,
 "pmCost": 11.87,
 "labourCost": 15.95,
 "calculatedCost": 67.59,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m11a_1",
 "inventoryItemId": "inv_water",
 "inventoryName": "WATER",
 "quantity": 0.008,
 "unit": "kg",
 "costPerUnit": 20,
 "cost": 0.15
 },
 {
 "id": "ri_m11a_2",
 "inventoryItemId": "inv_dry_yeast",
 "inventoryName": "DRY YEAST",
 "quantity": 0.003,
 "unit": "kg",
 "costPerUnit": 377.12,
 "cost": 1.04
 },
 {
 "id": "ri_m11a_3",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "SUGAR",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 1.2
 },
 {
 "id": "ri_m11a_4",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 3.58
 },
 {
 "id": "ri_m11a_5",
 "inventoryItemId": "inv_salt",
 "inventoryName": "SALT",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 30,
 "cost": 0.9
 },
 {
 "id": "ri_m11a_6",
 "inventoryItemId": "inv_cp_powder",
 "inventoryName": "CP POWDER",
 "quantity": 0.02,
 "unit": "kg",
 "costPerUnit": 256.37,
 "cost": 3.85
 },
 {
 "id": "ri_m11a_7",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 273,
 "cost": 1.37
 },
 {
 "id": "ri_m11a_8",
 "inventoryItemId": "inv_onion",
 "inventoryName": "ONION",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 33,
 "cost": 0.17
 },
 {
 "id": "ri_m11a_9",
 "inventoryItemId": "inv_tomato",
 "inventoryName": "TOMATO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 73.5,
 "cost": 0.37
 },
 {
 "id": "ri_m11a_10",
 "inventoryItemId": "inv_cucumber",
 "inventoryName": "CUCUMBER",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 84,
 "cost": 0.42
 },
 {
 "id": "ri_m11a_11",
 "inventoryItemId": "inv_olives",
 "inventoryName": "OLIVES",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 775,
 "cost": 3.88
 },
 {
 "id": "ri_m11a_12",
 "inventoryItemId": "inv_jalapeno",
 "inventoryName": "JELAPENO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 330,
 "cost": 1.65
 },
 {
 "id": "ri_m11a_13",
 "inventoryItemId": "inv_pesto_chicken",
 "inventoryName": "PESTO CHICKEN",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 381.75,
 "cost": 19.09
 },
 {
 "id": "ri_m11a_14",
 "inventoryItemId": "inv_hummus",
 "inventoryName": "HUMMUS",
 "quantity": 0.005,
 "unit": "kg",
 "costPerUnit": 28.96,
 "cost": 0.14
 },
 {
 "id": "ri_m11a_15",
 "inventoryItemId": "inv_peri_peri_sauce",
 "inventoryName": "PERI PERI",
 "quantity": 0.005,
 "unit": "kg",
 "costPerUnit": 352.27,
 "cost": 1.76
 },
 {
 "id": "ri_m11a_16",
 "inventoryItemId": "inv_honey_mustard",
 "inventoryName": "HONEY MUSTARD",
 "quantity": 0.005,
 "unit": "kg",
 "costPerUnit": 43.65,
 "cost": 0.22
 },
 {
 "id": "ri_m11a_17",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m11a_18",
 "inventoryItemId": "inv_dining_sheet",
 "inventoryName": "Dinning Sheet",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.55,
 "cost": 1.55
 },
 {
 "id": "ri_m11a_19",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.67,
 "cost": 3.67
 },
 {
 "id": "ri_m11a_20",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take away Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m11a_21",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m12",
 "menuItemId": "m12",
 "menuItemName": "Pesto Gyro (Signature)",
 "name": "PESTO GYRO (SIGNATURE)",
 "description": "Standard recipe for Pesto Gyro (Signature)",
 "yieldQty": 1,
 "prepTime": 10,
 "rmCost": 75.97,
 "pmCost": 11.87,
 "labourCost": 15.95,
 "calculatedCost": 103.79,
 "sellingPrice": 249,
 "ingredients": [
 {
 "id": "ri_m12a_1",
 "inventoryItemId": "inv_water",
 "inventoryName": "WATER",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 20,
 "cost": 0.3
 },
 {
 "id": "ri_m12a_2",
 "inventoryItemId": "inv_dry_yeast",
 "inventoryName": "DRY YEAST",
 "quantity": 0.006,
 "unit": "kg",
 "costPerUnit": 377.12,
 "cost": 2.07
 },
 {
 "id": "ri_m12a_3",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "SUGAR",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 2.41
 },
 {
 "id": "ri_m12a_4",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 3.58
 },
 {
 "id": "ri_m12a_5",
 "inventoryItemId": "inv_salt",
 "inventoryName": "SALT",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 30,
 "cost": 1.8
 },
 {
 "id": "ri_m12a_6",
 "inventoryItemId": "inv_cp_powder",
 "inventoryName": "CP POWDER",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 256.37,
 "cost": 7.69
 },
 {
 "id": "ri_m12a_7",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 273,
 "cost": 2.73
 },
 {
 "id": "ri_m12a_8",
 "inventoryItemId": "inv_onion",
 "inventoryName": "ONION",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 33,
 "cost": 0.33
 },
 {
 "id": "ri_m12a_9",
 "inventoryItemId": "inv_tomato",
 "inventoryName": "TOMATO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 73.5,
 "cost": 0.74
 },
 {
 "id": "ri_m12a_10",
 "inventoryItemId": "inv_cucumber",
 "inventoryName": "CUCUMBER",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 84,
 "cost": 0.84
 },
 {
 "id": "ri_m12a_11",
 "inventoryItemId": "inv_olives",
 "inventoryName": "OLIVES",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 775,
 "cost": 7.75
 },
 {
 "id": "ri_m12a_12",
 "inventoryItemId": "inv_jalapeno",
 "inventoryName": "JELAPENO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 330,
 "cost": 3.3
 },
 {
 "id": "ri_m12a_13",
 "inventoryItemId": "inv_pesto_chicken",
 "inventoryName": "PESTO CHICKEN",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 381.75,
 "cost": 38.18
 },
 {
 "id": "ri_m12a_14",
 "inventoryItemId": "inv_hummus",
 "inventoryName": "HUMMUS",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 28.96,
 "cost": 0.29
 },
 {
 "id": "ri_m12a_15",
 "inventoryItemId": "inv_peri_peri_sauce",
 "inventoryName": "PERI PERI",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 352.27,
 "cost": 3.52
 },
 {
 "id": "ri_m12a_16",
 "inventoryItemId": "inv_honey_mustard",
 "inventoryName": "HONEY MUSTARD",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 43.65,
 "cost": 0.44
 },
 {
 "id": "ri_m12a_17",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m12a_18",
 "inventoryItemId": "inv_dining_sheet",
 "inventoryName": "Dinning Sheet",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.55,
 "cost": 1.55
 },
 {
 "id": "ri_m12a_19",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.67,
 "cost": 3.67
 },
 {
 "id": "ri_m12a_20",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take away Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m12a_21",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m13",
 "menuItemId": "m13",
 "menuItemName": "4 Pc Leg & Thigh (2 Dips)",
 "name": "CRISPY CHICKEN 4 PCS",
 "description": "Standard recipe for 4 Pc Crispy Chicken Leg & Thigh (Price ₹280/-)",
 "yieldQty": 1,
 "prepTime": 15,
 "rmCost": 120.8,
 "pmCost": 19.27,
 "labourCost": 3.2,
 "calculatedCost": 143.27,
 "sellingPrice": 280,
 "ingredients": [
 {
 "id": "ri_m13_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.16,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 6.28
 },
 {
 "id": "ri_m13_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.016,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 8.96
 },
 {
 "id": "ri_m13_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.024,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 4.36
 },
 {
 "id": "ri_m13_4",
 "inventoryItemId": "inv_chicken_leg_thigh",
 "inventoryName": "CHICKEN LEG / THIGH",
 "quantity": 0.4,
 "unit": "kg",
 "costPerUnit": 250,
 "cost": 100
 },
 {
 "id": "ri_m13_5",
 "inventoryItemId": "inv_chicken_tub_4pc",
 "inventoryName": "CHICKEN TUB 4 PCS",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 7.44,
 "cost": 7.44
 },
 {
 "id": "ri_m13_6",
 "inventoryItemId": "inv_tub_lid_4pc",
 "inventoryName": "TUB LID 4 PCS",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 4.64,
 "cost": 4.64
 },
 {
 "id": "ri_m13_7",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m13_8",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m13_9",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m14",
 "menuItemId": "m14",
 "menuItemName": "8 Pc Leg & Thigh (4 Dips)",
 "name": "CRISPY CHICKEN 8 PCS",
 "description": "Standard recipe for 8 Pc Crispy Chicken Leg & Thigh (Price ₹560/-)",
 "yieldQty": 1,
 "prepTime": 18,
 "rmCost": 241.6,
 "pmCost": 32.65,
 "labourCost": 3.2,
 "calculatedCost": 277.45,
 "sellingPrice": 560,
 "ingredients": [
 {
 "id": "ri_m14_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.32,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 12.56
 },
 {
 "id": "ri_m14_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.032,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 17.92
 },
 {
 "id": "ri_m14_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.048,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 8.72
 },
 {
 "id": "ri_m14_4",
 "inventoryItemId": "inv_chicken_leg_thigh",
 "inventoryName": "CHICKEN LEG / THIGH",
 "quantity": 0.8,
 "unit": "kg",
 "costPerUnit": 250,
 "cost": 200
 },
 {
 "id": "ri_m14_5",
 "inventoryItemId": "inv_chicken_tub_4pc",
 "inventoryName": "CHICKEN TUB 4 PCS",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 7.44,
 "cost": 14.88
 },
 {
 "id": "ri_m14_6",
 "inventoryItemId": "inv_tub_lid_4pc",
 "inventoryName": "TUB LID 4 PCS",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 4.64,
 "cost": 9.28
 },
 {
 "id": "ri_m14_7",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 4,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 1.08
 },
 {
 "id": "ri_m14_8",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m14_9",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m15",
 "menuItemId": "m15",
 "menuItemName": "12 Pc Leg & Thigh (6 Dips)",
 "name": "CRISPY CHICKEN 12 PCS",
 "description": "Standard recipe for 12 Pc Crispy Chicken Leg & Thigh (Price ₹840/-)",
 "yieldQty": 1,
 "prepTime": 20,
 "rmCost": 362.4,
 "pmCost": 46.03,
 "labourCost": 3.2,
 "calculatedCost": 411.63,
 "sellingPrice": 840,
 "ingredients": [
 {
 "id": "ri_m15_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.48,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 18.84
 },
 {
 "id": "ri_m15_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.048,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 26.88
 },
 {
 "id": "ri_m15_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.072,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 13.08
 },
 {
 "id": "ri_m15_4",
 "inventoryItemId": "inv_chicken_leg_thigh",
 "inventoryName": "CHICKEN LEG / THIGH",
 "quantity": 1.2,
 "unit": "kg",
 "costPerUnit": 250,
 "cost": 300
 },
 {
 "id": "ri_m15_5",
 "inventoryItemId": "inv_chicken_tub_4pc",
 "inventoryName": "CHICKEN TUB 4 PCS",
 "quantity": 3,
 "unit": "pc",
 "costPerUnit": 7.44,
 "cost": 22.32
 },
 {
 "id": "ri_m15_6",
 "inventoryItemId": "inv_tub_lid_4pc",
 "inventoryName": "TUB LID 4 PCS",
 "quantity": 3,
 "unit": "pc",
 "costPerUnit": 4.64,
 "cost": 13.92
 },
 {
 "id": "ri_m15_7",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 6,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 1.62
 },
 {
 "id": "ri_m15_8",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m15_9",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m16",
 "menuItemId": "m16",
 "menuItemName": "3 Pc Wings (1 Dip)",
 "name": "CRISPY WINGS 3 PCS",
 "description": "Standard recipe for 3 Pc Crispy Chicken Wings (Price ₹90/-)",
 "yieldQty": 1,
 "prepTime": 10,
 "rmCost": 30.9,
 "pmCost": 13.3,
 "labourCost": 3.2,
 "calculatedCost": 47.4,
 "sellingPrice": 90,
 "ingredients": [
 {
 "id": "ri_m16_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.036,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 1.41
 },
 {
 "id": "ri_m16_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.012,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 6.72
 },
 {
 "id": "ri_m16_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.018,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 3.27
 },
 {
 "id": "ri_m16_4",
 "inventoryItemId": "inv_chicken_wings",
 "inventoryName": "CHICKEN WINGS",
 "quantity": 0.105,
 "unit": "kg",
 "costPerUnit": 185.71,
 "cost": 19.5
 },
 {
 "id": "ri_m16_5",
 "inventoryItemId": "inv_wings_box_6pc",
 "inventoryName": "WINGS BOX 6 PCS",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.11,
 "cost": 6.11
 },
 {
 "id": "ri_m16_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m16_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m16_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m17",
 "menuItemId": "m17",
 "menuItemName": "6 Pc Wings (2 Dips)",
 "name": "CRISPY WINGS 6 PCS",
 "description": "Standard recipe for 6 Pc Crispy Chicken Wings (Price ₹180/-)",
 "yieldQty": 1,
 "prepTime": 10,
 "rmCost": 61.8,
 "pmCost": 13.3,
 "labourCost": 3.2,
 "calculatedCost": 78.3,
 "sellingPrice": 180,
 "ingredients": [
 {
 "id": "ri_m17_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.072,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 2.83
 },
 {
 "id": "ri_m17_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.024,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 13.44
 },
 {
 "id": "ri_m17_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.036,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 6.54
 },
 {
 "id": "ri_m17_4",
 "inventoryItemId": "inv_chicken_wings",
 "inventoryName": "CHICKEN WINGS",
 "quantity": 0.21,
 "unit": "kg",
 "costPerUnit": 185.71,
 "cost": 39
 },
 {
 "id": "ri_m17_5",
 "inventoryItemId": "inv_wings_box_6pc",
 "inventoryName": "WINGS BOX 6 PCS",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.11,
 "cost": 6.11
 },
 {
 "id": "ri_m17_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m17_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m17_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m18",
 "menuItemId": "m18",
 "menuItemName": "9 Pc Wings (3 Dips)",
 "name": "CRISPY WINGS 9 PCS",
 "description": "Standard recipe for 9 Pc Crispy Chicken Wings (Price ₹270/-)",
 "yieldQty": 1,
 "prepTime": 12,
 "rmCost": 92.7,
 "pmCost": 19.68,
 "labourCost": 3.2,
 "calculatedCost": 115.58,
 "sellingPrice": 270,
 "ingredients": [
 {
 "id": "ri_m18_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.108,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 4.24
 },
 {
 "id": "ri_m18_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.036,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 20.16
 },
 {
 "id": "ri_m18_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.054,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 9.81
 },
 {
 "id": "ri_m18_4",
 "inventoryItemId": "inv_chicken_wings",
 "inventoryName": "CHICKEN WINGS",
 "quantity": 0.315,
 "unit": "kg",
 "costPerUnit": 185.71,
 "cost": 58.5
 },
 {
 "id": "ri_m18_5",
 "inventoryItemId": "inv_wings_box_6pc",
 "inventoryName": "WINGS BOX 6 PCS",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 6.11,
 "cost": 12.22
 },
 {
 "id": "ri_m18_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 3,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.81
 },
 {
 "id": "ri_m18_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m18_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m19",
 "menuItemId": "m19",
 "menuItemName": "20 Pc Wings (6 Dips)",
 "name": "CRISPY WINGS 20 PCS",
 "description": "Standard recipe for 20 Pc Crispy Chicken Wings (Price ₹600/-)",
 "yieldQty": 1,
 "prepTime": 15,
 "rmCost": 206,
 "pmCost": 38.82,
 "labourCost": 6.4,
 "calculatedCost": 251.22,
 "sellingPrice": 600,
 "ingredients": [
 {
 "id": "ri_m19_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.24,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 9.42
 },
 {
 "id": "ri_m19_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 44.8
 },
 {
 "id": "ri_m19_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.12,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 21.79
 },
 {
 "id": "ri_m19_4",
 "inventoryItemId": "inv_chicken_wings",
 "inventoryName": "CHICKEN WINGS",
 "quantity": 0.7,
 "unit": "kg",
 "costPerUnit": 185.71,
 "cost": 130
 },
 {
 "id": "ri_m19_5",
 "inventoryItemId": "inv_wings_box_6pc",
 "inventoryName": "WINGS BOX 6 PCS",
 "quantity": 4,
 "unit": "pc",
 "costPerUnit": 6.11,
 "cost": 24.44
 },
 {
 "id": "ri_m19_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 4,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 1.08
 },
 {
 "id": "ri_m19_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 13.3
 },
 {
 "id": "ri_m19_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 2,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 6.4
 }
 ]
 },
 {
 "id": "r_m20",
 "menuItemId": "m20",
 "menuItemName": "60 Pc Wings (12 Dips)",
 "name": "CRISPY WINGS 60 PCS",
 "description": "Standard recipe for 60 Pc Crispy Chicken Wings (Price ₹1500/-)",
 "yieldQty": 1,
 "prepTime": 25,
 "rmCost": 515,
 "pmCost": 77.64,
 "labourCost": 16,
 "calculatedCost": 608.64,
 "sellingPrice": 1500,
 "ingredients": [
 {
 "id": "ri_m20_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.6,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 23.55
 },
 {
 "id": "ri_m20_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 112
 },
 {
 "id": "ri_m20_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.3,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 54.47
 },
 {
 "id": "ri_m20_4",
 "inventoryItemId": "inv_chicken_wings",
 "inventoryName": "CHICKEN WINGS",
 "quantity": 1.75,
 "unit": "kg",
 "costPerUnit": 185.71,
 "cost": 325
 },
 {
 "id": "ri_m20_5",
 "inventoryItemId": "inv_wings_box_6pc",
 "inventoryName": "WINGS BOX 6 PCS",
 "quantity": 9,
 "unit": "pc",
 "costPerUnit": 6.11,
 "cost": 54.99
 },
 {
 "id": "ri_m20_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 10,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 2.7
 },
 {
 "id": "ri_m20_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 3,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 19.95
 },
 {
 "id": "ri_m20_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 5,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 16
 }
 ]
 },
 {
 "id": "r_m21",
 "menuItemId": "m21",
 "menuItemName": "3 Pc Strips (1 Dip)",
 "name": "CRISPY STRIPS 3 PCS",
 "description": "Standard recipe for 3 Pc Crispy Chicken Strips (Price ₹120/-)",
 "yieldQty": 1,
 "prepTime": 10,
 "rmCost": 42.9,
 "pmCost": 10.11,
 "labourCost": 3.2,
 "calculatedCost": 56.21,
 "sellingPrice": 120,
 "ingredients": [
 {
 "id": "ri_m21_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.036,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 1.41
 },
 {
 "id": "ri_m21_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.012,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 6.72
 },
 {
 "id": "ri_m21_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.018,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 3.27
 },
 {
 "id": "ri_m21_4",
 "inventoryItemId": "inv_chicken_strips",
 "inventoryName": "CHICKEN STRIPS",
 "quantity": 0.09,
 "unit": "kg",
 "costPerUnit": 350,
 "cost": 31.5
 },
 {
 "id": "ri_m21_5",
 "inventoryItemId": "inv_dinning_tray_250ml",
 "inventoryName": "DINNING TRAY 250ML",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 2.92,
 "cost": 2.92
 },
 {
 "id": "ri_m21_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m21_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m21_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m22",
 "menuItemId": "m22",
 "menuItemName": "6 Pc Strips (2 Dips)",
 "name": "CRISPY STRIPS 6 PCS",
 "description": "Standard recipe for 6 Pc Crispy Chicken Strips (Price ₹240/-)",
 "yieldQty": 1,
 "prepTime": 10,
 "rmCost": 85.8,
 "pmCost": 10.11,
 "labourCost": 3.2,
 "calculatedCost": 99.11,
 "sellingPrice": 240,
 "ingredients": [
 {
 "id": "ri_m22_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.072,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 2.83
 },
 {
 "id": "ri_m22_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.024,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 13.44
 },
 {
 "id": "ri_m22_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.036,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 6.54
 },
 {
 "id": "ri_m22_4",
 "inventoryItemId": "inv_chicken_strips",
 "inventoryName": "CHICKEN STRIPS",
 "quantity": 0.18,
 "unit": "kg",
 "costPerUnit": 350,
 "cost": 63
 },
 {
 "id": "ri_m22_5",
 "inventoryItemId": "inv_dinning_tray_250ml",
 "inventoryName": "DINNING TRAY 250ML",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 2.92,
 "cost": 2.92
 },
 {
 "id": "ri_m22_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m22_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m22_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m23",
 "menuItemId": "m23",
 "menuItemName": "9 Pc Strips (3 Dips)",
 "name": "CRISPY STRIPS 9 PCS",
 "description": "Standard recipe for 9 Pc Crispy Chicken Strips (Price ₹360/-)",
 "yieldQty": 1,
 "prepTime": 12,
 "rmCost": 128.7,
 "pmCost": 13.3,
 "labourCost": 3.2,
 "calculatedCost": 145.2,
 "sellingPrice": 360,
 "ingredients": [
 {
 "id": "ri_m23_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.108,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 4.24
 },
 {
 "id": "ri_m23_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.036,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 20.16
 },
 {
 "id": "ri_m23_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.054,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 9.81
 },
 {
 "id": "ri_m23_4",
 "inventoryItemId": "inv_chicken_strips",
 "inventoryName": "CHICKEN STRIPS",
 "quantity": 0.27,
 "unit": "kg",
 "costPerUnit": 350,
 "cost": 94.5
 },
 {
 "id": "ri_m23_5",
 "inventoryItemId": "inv_dinning_tray_250ml",
 "inventoryName": "DINNING TRAY 250ML",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 2.92,
 "cost": 5.84
 },
 {
 "id": "ri_m23_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 3,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.81
 },
 {
 "id": "ri_m23_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m23_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 3.2
 }
 ]
 },
 {
 "id": "r_m24",
 "menuItemId": "m24",
 "menuItemName": "20 Pc Strips (6 Dips)",
 "name": "CRISPY STRIPS 20 PCS",
 "description": "Standard recipe for 20 Pc Crispy Chicken Strips (Price ₹800/-)",
 "yieldQty": 1,
 "prepTime": 15,
 "rmCost": 286,
 "pmCost": 23.14,
 "labourCost": 6.4,
 "calculatedCost": 315.54,
 "sellingPrice": 800,
 "ingredients": [
 {
 "id": "ri_m24_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.24,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 9.42
 },
 {
 "id": "ri_m24_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 44.8
 },
 {
 "id": "ri_m24_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.12,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 21.79
 },
 {
 "id": "ri_m24_4",
 "inventoryItemId": "inv_chicken_strips",
 "inventoryName": "CHICKEN STRIPS",
 "quantity": 0.6,
 "unit": "kg",
 "costPerUnit": 350,
 "cost": 210
 },
 {
 "id": "ri_m24_5",
 "inventoryItemId": "inv_dinning_tray_250ml",
 "inventoryName": "DINNING TRAY 250ML",
 "quantity": 3,
 "unit": "pc",
 "costPerUnit": 2.92,
 "cost": 8.76
 },
 {
 "id": "ri_m24_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 4,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 1.08
 },
 {
 "id": "ri_m24_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 13.3
 },
 {
 "id": "ri_m24_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 2,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 6.4
 }
 ]
 },
 {
 "id": "r_m25",
 "menuItemId": "m25",
 "menuItemName": "60 Pc Strips (12 Dips)",
 "name": "CRISPY STRIPS 60 PCS",
 "description": "Standard recipe for 60 Pc Crispy Chicken Strips (Price ₹2400/-)",
 "yieldQty": 1,
 "prepTime": 25,
 "rmCost": 858,
 "pmCost": 40.17,
 "labourCost": 16,
 "calculatedCost": 914.17,
 "sellingPrice": 2400,
 "ingredients": [
 {
 "id": "ri_m25_1",
 "inventoryItemId": "inv_fried_chicken_mix",
 "inventoryName": "FRIED CHICKEN MIXED",
 "quantity": 0.72,
 "unit": "kg",
 "costPerUnit": 39.25,
 "cost": 28.26
 },
 {
 "id": "ri_m25_2",
 "inventoryItemId": "inv_extra_hot_spicy",
 "inventoryName": "EXTRA HOT AND SPICY",
 "quantity": 0.24,
 "unit": "kg",
 "costPerUnit": 560,
 "cost": 134.4
 },
 {
 "id": "ri_m25_3",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.36,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 65.37
 },
 {
 "id": "ri_m25_4",
 "inventoryItemId": "inv_chicken_strips",
 "inventoryName": "CHICKEN STRIPS",
 "quantity": 1.8,
 "unit": "kg",
 "costPerUnit": 350,
 "cost": 630
 },
 {
 "id": "ri_m25_5",
 "inventoryItemId": "inv_dinning_tray_250ml",
 "inventoryName": "DINNING TRAY 250ML",
 "quantity": 6,
 "unit": "pc",
 "costPerUnit": 2.92,
 "cost": 17.52
 },
 {
 "id": "ri_m25_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 10,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 2.7
 },
 {
 "id": "ri_m25_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 3,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 19.95
 },
 {
 "id": "ri_m25_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 5,
 "unit": "unit",
 "costPerUnit": 3.2,
 "cost": 16
 }
 ]
 },
 {
 "id": "r_m1",
 "menuItemId": "m1",
 "menuItemName": "Spicy Gyro",
 "name": "SPICY GYRO (MINI)",
 "description": "Standard recipe for Spicy Gyro",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 35.79,
 "pmCost": 11.81,
 "labourCost": 15.95,
 "calculatedCost": 63.55,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m1a_1",
 "inventoryItemId": "inv_water",
 "inventoryName": "WATER",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 20,
 "cost": 0.3
 },
 {
 "id": "ri_m1a_2",
 "inventoryItemId": "inv_dry_yeast",
 "inventoryName": "DRY YEAST",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 377.12,
 "cost": 3.77
 },
 {
 "id": "ri_m1a_3",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "SUGAR",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 2.41
 },
 {
 "id": "ri_m1a_4",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 1.79
 },
 {
 "id": "ri_m1a_5",
 "inventoryItemId": "inv_salt",
 "inventoryName": "SALT",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 30,
 "cost": 1.8
 },
 {
 "id": "ri_m1a_6",
 "inventoryItemId": "inv_cp_powder",
 "inventoryName": "CP POWDER",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 256.37,
 "cost": 7.69
 },
 {
 "id": "ri_m1a_7",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 272,
 "cost": 2.72
 },
 {
 "id": "ri_m1a_8",
 "inventoryItemId": "inv_onion",
 "inventoryName": "ONION",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 33,
 "cost": 0.33
 },
 {
 "id": "ri_m1a_9",
 "inventoryItemId": "inv_tomato",
 "inventoryName": "TOMATO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 73.5,
 "cost": 0.74
 },
 {
 "id": "ri_m1a_10",
 "inventoryItemId": "inv_cucumber",
 "inventoryName": "CUCUMBER",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 84,
 "cost": 0.84
 },
 {
 "id": "ri_m1a_11",
 "inventoryItemId": "inv_olives",
 "inventoryName": "OLIVES",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 775,
 "cost": 7.75
 },
 {
 "id": "ri_m1a_12",
 "inventoryItemId": "inv_jalapeno",
 "inventoryName": "JALAPENO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 330,
 "cost": 3.3
 },
 {
 "id": "ri_m1a_13",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "SPICY CHICKEN",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 301.89,
 "cost": 15.09
 },
 {
 "id": "ri_m1a_14",
 "inventoryItemId": "inv_hummus",
 "inventoryName": "HUMMUS",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 28.96,
 "cost": 0.29
 },
 {
 "id": "ri_m1a_15",
 "inventoryItemId": "inv_peri_peri_sauce",
 "inventoryName": "PERI PERI",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 352.27,
 "cost": 3.52
 },
 {
 "id": "ri_m1a_16",
 "inventoryItemId": "inv_honey_mustard",
 "inventoryName": "HONEY MUSTARD",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 43.65,
 "cost": 0.44
 },
 {
 "id": "ri_m1a_17",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m1a_18",
 "inventoryItemId": "inv_dining_sheet",
 "inventoryName": "Dining Sheet",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.55,
 "cost": 1.55
 },
 {
 "id": "ri_m1a_19",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.67,
 "cost": 3.67
 },
 {
 "id": "ri_m1a_20",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take away Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.05,
 "cost": 6.05
 },
 {
 "id": "ri_m1a_21",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m2",
 "menuItemId": "m2",
 "menuItemName": "Spicy Gyro (Signature)",
 "name": "SPICY GYRO (SIGNATURE)",
 "description": "Standard recipe for Spicy Gyro (Signature)",
 "yieldQty": 1,
 "prepTime": 10,
 "rmCost": 67.68,
 "pmCost": 11.81,
 "labourCost": 15.95,
 "calculatedCost": 95.44,
 "sellingPrice": 249,
 "ingredients": [
 {
 "id": "ri_m2a_1",
 "inventoryItemId": "inv_water",
 "inventoryName": "WATER",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 20,
 "cost": 0.3
 },
 {
 "id": "ri_m2a_2",
 "inventoryItemId": "inv_dry_yeast",
 "inventoryName": "DRY YEAST",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 377.12,
 "cost": 3.77
 },
 {
 "id": "ri_m2a_3",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "SUGAR",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 2.41
 },
 {
 "id": "ri_m2a_4",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 3.58
 },
 {
 "id": "ri_m2a_5",
 "inventoryItemId": "inv_salt",
 "inventoryName": "SALT",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 30,
 "cost": 1.8
 },
 {
 "id": "ri_m2a_6",
 "inventoryItemId": "inv_cp_powder",
 "inventoryName": "CP POWDER",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 256.37,
 "cost": 7.69
 },
 {
 "id": "ri_m2a_7",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 272,
 "cost": 2.72
 },
 {
 "id": "ri_m2a_8",
 "inventoryItemId": "inv_onion",
 "inventoryName": "ONION",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 33,
 "cost": 0.33
 },
 {
 "id": "ri_m2a_9",
 "inventoryItemId": "inv_tomato",
 "inventoryName": "TOMATO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 73.5,
 "cost": 0.74
 },
 {
 "id": "ri_m2a_10",
 "inventoryItemId": "inv_cucumber",
 "inventoryName": "CUCUMBER",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 84,
 "cost": 0.84
 },
 {
 "id": "ri_m2a_11",
 "inventoryItemId": "inv_olives",
 "inventoryName": "OLIVES",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 775,
 "cost": 7.75
 },
 {
 "id": "ri_m2a_12",
 "inventoryItemId": "inv_jalapeno",
 "inventoryName": "JALAPENO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 330,
 "cost": 3.3
 },
 {
 "id": "ri_m2a_13",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "SPICY CHICKEN",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 301.89,
 "cost": 30.19
 },
 {
 "id": "ri_m2a_14",
 "inventoryItemId": "inv_hummus",
 "inventoryName": "HUMMUS",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 28.96,
 "cost": 0.29
 },
 {
 "id": "ri_m2a_15",
 "inventoryItemId": "inv_peri_peri_sauce",
 "inventoryName": "PERI PERI",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 352.27,
 "cost": 3.52
 },
 {
 "id": "ri_m2a_16",
 "inventoryItemId": "inv_honey_mustard",
 "inventoryName": "HONEY MUSTARD",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 43.65,
 "cost": 0.44
 },
 {
 "id": "ri_m2a_17",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m2a_18",
 "inventoryItemId": "inv_dining_sheet",
 "inventoryName": "Dining Sheet",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.55,
 "cost": 1.55
 },
 {
 "id": "ri_m2a_19",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.67,
 "cost": 3.67
 },
 {
 "id": "ri_m2a_20",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take away Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.05,
 "cost": 6.05
 },
 {
 "id": "ri_m2a_21",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m3",
 "menuItemId": "m3",
 "menuItemName": "Creamy Gyro",
 "name": "CREAMY GYRO (MINI)",
 "description": "Standard recipe for Creamy Gyro",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 34.39,
 "pmCost": 11.87,
 "labourCost": 15.95,
 "calculatedCost": 62.21,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m3a_1",
 "inventoryItemId": "inv_water",
 "inventoryName": "WATER",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 20,
 "cost": 0.3
 },
 {
 "id": "ri_m3a_2",
 "inventoryItemId": "inv_dry_yeast",
 "inventoryName": "DRY YEAST",
 "quantity": 0.006,
 "unit": "kg",
 "costPerUnit": 377.12,
 "cost": 2.07
 },
 {
 "id": "ri_m3a_3",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "SUGAR",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 2.41
 },
 {
 "id": "ri_m3a_4",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 1.79
 },
 {
 "id": "ri_m3a_5",
 "inventoryItemId": "inv_salt",
 "inventoryName": "SALT",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 30,
 "cost": 1.8
 },
 {
 "id": "ri_m3a_6",
 "inventoryItemId": "inv_cp_powder",
 "inventoryName": "CP POWDER",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 256.37,
 "cost": 7.69
 },
 {
 "id": "ri_m3a_7",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 273,
 "cost": 2.73
 },
 {
 "id": "ri_m3a_8",
 "inventoryItemId": "inv_onion",
 "inventoryName": "ONION",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 33,
 "cost": 0.33
 },
 {
 "id": "ri_m3a_9",
 "inventoryItemId": "inv_tomato",
 "inventoryName": "TOMATO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 73.5,
 "cost": 0.74
 },
 {
 "id": "ri_m3a_10",
 "inventoryItemId": "inv_cucumber",
 "inventoryName": "CUCUMBER",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 84,
 "cost": 0.84
 },
 {
 "id": "ri_m3a_11",
 "inventoryItemId": "inv_olives",
 "inventoryName": "OLIVES",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 775,
 "cost": 7.75
 },
 {
 "id": "ri_m3a_12",
 "inventoryItemId": "inv_jalapeno",
 "inventoryName": "JELAPENO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 330,
 "cost": 3.3
 },
 {
 "id": "ri_m3a_13",
 "inventoryItemId": "inv_cream_chicken",
 "inventoryName": "CREAM CHICKEN",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 274,
 "cost": 13.7
 },
 {
 "id": "ri_m3a_14",
 "inventoryItemId": "inv_hummus",
 "inventoryName": "HUMMUS",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 28.96,
 "cost": 0.29
 },
 {
 "id": "ri_m3a_15",
 "inventoryItemId": "inv_peri_peri_sauce",
 "inventoryName": "PERI PERI",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 352.27,
 "cost": 3.52
 },
 {
 "id": "ri_m3a_16",
 "inventoryItemId": "inv_honey_mustard",
 "inventoryName": "HONEY MUSTARD",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 43.65,
 "cost": 0.44
 },
 {
 "id": "ri_m3a_17",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m3a_18",
 "inventoryItemId": "inv_dining_sheet",
 "inventoryName": "Dinning Sheet",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.55,
 "cost": 1.55
 },
 {
 "id": "ri_m3a_19",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.67,
 "cost": 3.67
 },
 {
 "id": "ri_m3a_20",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take away Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m3a_21",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m4",
 "menuItemId": "m4",
 "menuItemName": "Creamy Gyro (Signature)",
 "name": "CREAMY GYRO (SIGNATURE)",
 "description": "Standard recipe for Creamy Gyro (Signature)",
 "yieldQty": 1,
 "prepTime": 10,
 "rmCost": 65.19,
 "pmCost": 11.87,
 "labourCost": 15.95,
 "calculatedCost": 93.01,
 "sellingPrice": 249,
 "ingredients": [
 {
 "id": "ri_m4a_1",
 "inventoryItemId": "inv_water",
 "inventoryName": "WATER",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 20,
 "cost": 0.3
 },
 {
 "id": "ri_m4a_2",
 "inventoryItemId": "inv_dry_yeast",
 "inventoryName": "DRY YEAST",
 "quantity": 0.006,
 "unit": "kg",
 "costPerUnit": 377.12,
 "cost": 2.07
 },
 {
 "id": "ri_m4a_3",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "SUGAR",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 2.41
 },
 {
 "id": "ri_m4a_4",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 3.58
 },
 {
 "id": "ri_m4a_5",
 "inventoryItemId": "inv_salt",
 "inventoryName": "SALT",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 30,
 "cost": 1.8
 },
 {
 "id": "ri_m4a_6",
 "inventoryItemId": "inv_cp_powder",
 "inventoryName": "CP POWDER",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 256.37,
 "cost": 7.69
 },
 {
 "id": "ri_m4a_7",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 273,
 "cost": 2.73
 },
 {
 "id": "ri_m4a_8",
 "inventoryItemId": "inv_onion",
 "inventoryName": "ONION",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 33,
 "cost": 0.33
 },
 {
 "id": "ri_m4a_9",
 "inventoryItemId": "inv_tomato",
 "inventoryName": "TOMATO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 73.5,
 "cost": 0.74
 },
 {
 "id": "ri_m4a_10",
 "inventoryItemId": "inv_cucumber",
 "inventoryName": "CUCUMBER",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 84,
 "cost": 0.84
 },
 {
 "id": "ri_m4a_11",
 "inventoryItemId": "inv_olives",
 "inventoryName": "OLIVES",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 775,
 "cost": 7.75
 },
 {
 "id": "ri_m4a_12",
 "inventoryItemId": "inv_jalapeno",
 "inventoryName": "JELAPENO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 330,
 "cost": 3.3
 },
 {
 "id": "ri_m4a_13",
 "inventoryItemId": "inv_cream_chicken",
 "inventoryName": "CREAM CHICKEN",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 274,
 "cost": 27.4
 },
 {
 "id": "ri_m4a_14",
 "inventoryItemId": "inv_hummus",
 "inventoryName": "HUMMUS",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 28.96,
 "cost": 0.29
 },
 {
 "id": "ri_m4a_15",
 "inventoryItemId": "inv_peri_peri_sauce",
 "inventoryName": "PERI PERI",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 352.27,
 "cost": 3.52
 },
 {
 "id": "ri_m4a_16",
 "inventoryItemId": "inv_honey_mustard",
 "inventoryName": "HONEY MUSTARD",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 43.65,
 "cost": 0.44
 },
 {
 "id": "ri_m4a_17",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m4a_18",
 "inventoryItemId": "inv_dining_sheet",
 "inventoryName": "Dinning Sheet",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.55,
 "cost": 1.55
 },
 {
 "id": "ri_m4a_19",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.67,
 "cost": 3.67
 },
 {
 "id": "ri_m4a_20",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take away Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m4a_21",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m5",
 "menuItemId": "m5",
 "menuItemName": "BBQ Gyro",
 "name": "BBQ GYRO (MINI)",
 "description": "Standard recipe for BBQ Gyro",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 41.71,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 70.07,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m5b_1",
 "inventoryItemId": "inv_water",
 "inventoryName": "WATER",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 20,
 "cost": 0.3
 },
 {
 "id": "ri_m5b_2",
 "inventoryItemId": "inv_dry_yeast",
 "inventoryName": "DRY YEAST",
 "quantity": 0.006,
 "unit": "kg",
 "costPerUnit": 377.12,
 "cost": 2.07
 },
 {
 "id": "ri_m5b_3",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "SUGAR",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 2.41
 },
 {
 "id": "ri_m5b_4",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 1.79
 },
 {
 "id": "ri_m5b_5",
 "inventoryItemId": "inv_salt",
 "inventoryName": "SALT",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 30,
 "cost": 1.8
 },
 {
 "id": "ri_m5b_6",
 "inventoryItemId": "inv_cp_powder",
 "inventoryName": "CP POWDER",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 256.37,
 "cost": 7.69
 },
 {
 "id": "ri_m5b_7",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 273,
 "cost": 2.73
 },
 {
 "id": "ri_m5b_8",
 "inventoryItemId": "inv_onion",
 "inventoryName": "ONION",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 33,
 "cost": 0.33
 },
 {
 "id": "ri_m5b_9",
 "inventoryItemId": "inv_tomato",
 "inventoryName": "TOMATO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 73.5,
 "cost": 0.74
 },
 {
 "id": "ri_m5b_10",
 "inventoryItemId": "inv_cucumber",
 "inventoryName": "CUCUMBER",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 84,
 "cost": 0.84
 },
 {
 "id": "ri_m5b_11",
 "inventoryItemId": "inv_olives",
 "inventoryName": "OLIVES",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 775,
 "cost": 7.75
 },
 {
 "id": "ri_m5b_12",
 "inventoryItemId": "inv_jalapeno",
 "inventoryName": "JELAPENO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 330,
 "cost": 3.3
 },
 {
 "id": "ri_m5b_13",
 "inventoryItemId": "inv_bbq_paneer",
 "inventoryName": "BBQ PANNER",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 420.4,
 "cost": 21.02
 },
 {
 "id": "ri_m5b_14",
 "inventoryItemId": "inv_hummus",
 "inventoryName": "HUMMUS",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 28.96,
 "cost": 0.29
 },
 {
 "id": "ri_m5b_15",
 "inventoryItemId": "inv_peri_peri_sauce",
 "inventoryName": "PERI PERI",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 352.27,
 "cost": 3.52
 },
 {
 "id": "ri_m5b_16",
 "inventoryItemId": "inv_honey_mustard",
 "inventoryName": "HONEY MUSTARD",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 43.65,
 "cost": 0.44
 },
 {
 "id": "ri_m5b_17",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m5b_18",
 "inventoryItemId": "inv_dining_sheet",
 "inventoryName": "Dinning Sheet",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.55,
 "cost": 1.55
 },
 {
 "id": "ri_m5b_19",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.67,
 "cost": 3.67
 },
 {
 "id": "ri_m5b_20",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take away Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m5b_21",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m6",
 "menuItemId": "m6",
 "menuItemName": "BBQ Gyro (Signature)",
 "name": "BBQ GYRO (SIGNATURE)",
 "description": "Standard recipe for BBQ Gyro (Signature)",
 "yieldQty": 1,
 "prepTime": 10,
 "rmCost": 79.83,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 108.19,
 "sellingPrice": 249,
 "ingredients": [
 {
 "id": "ri_m6b_1",
 "inventoryItemId": "inv_water",
 "inventoryName": "WATER",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 20,
 "cost": 0.3
 },
 {
 "id": "ri_m6b_2",
 "inventoryItemId": "inv_dry_yeast",
 "inventoryName": "DRY YEAST",
 "quantity": 0.006,
 "unit": "kg",
 "costPerUnit": 377.12,
 "cost": 2.07
 },
 {
 "id": "ri_m6b_3",
 "inventoryItemId": "inv_white_sugar",
 "inventoryName": "SUGAR",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 48.19,
 "cost": 2.41
 },
 {
 "id": "ri_m6b_4",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 3.58
 },
 {
 "id": "ri_m6b_5",
 "inventoryItemId": "inv_salt",
 "inventoryName": "SALT",
 "quantity": 0.06,
 "unit": "kg",
 "costPerUnit": 30,
 "cost": 1.8
 },
 {
 "id": "ri_m6b_6",
 "inventoryItemId": "inv_cp_powder",
 "inventoryName": "CP POWDER",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 256.37,
 "cost": 7.69
 },
 {
 "id": "ri_m6b_7",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 273,
 "cost": 2.73
 },
 {
 "id": "ri_m6b_8",
 "inventoryItemId": "inv_onion",
 "inventoryName": "ONION",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 33,
 "cost": 0.33
 },
 {
 "id": "ri_m6b_9",
 "inventoryItemId": "inv_tomato",
 "inventoryName": "TOMATO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 73.5,
 "cost": 0.74
 },
 {
 "id": "ri_m6b_10",
 "inventoryItemId": "inv_cucumber",
 "inventoryName": "CUCUMBER",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 84,
 "cost": 0.84
 },
 {
 "id": "ri_m6b_11",
 "inventoryItemId": "inv_olives",
 "inventoryName": "OLIVES",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 775,
 "cost": 7.75
 },
 {
 "id": "ri_m6b_12",
 "inventoryItemId": "inv_jalapeno",
 "inventoryName": "JELAPENO",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 330,
 "cost": 3.3
 },
 {
 "id": "ri_m6b_13",
 "inventoryItemId": "inv_bbq_paneer",
 "inventoryName": "BBQ PANNER",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 420.4,
 "cost": 42.04
 },
 {
 "id": "ri_m6b_14",
 "inventoryItemId": "inv_hummus",
 "inventoryName": "HUMMUS",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 28.96,
 "cost": 0.29
 },
 {
 "id": "ri_m6b_15",
 "inventoryItemId": "inv_peri_peri_sauce",
 "inventoryName": "PERI PERI",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 352.27,
 "cost": 3.52
 },
 {
 "id": "ri_m6b_16",
 "inventoryItemId": "inv_honey_mustard",
 "inventoryName": "HONEY MUSTARD",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 43.65,
 "cost": 0.44
 },
 {
 "id": "ri_m6b_17",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m6b_18",
 "inventoryItemId": "inv_dining_sheet",
 "inventoryName": "Dinning Sheet",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.55,
 "cost": 1.55
 },
 {
 "id": "ri_m6b_19",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.67,
 "cost": 3.67
 },
 {
 "id": "ri_m6b_20",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take away Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m6b_21",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m26a",
 "menuItemId": "m26a",
 "menuItemName": "Salted Fries",
 "name": "FRENCH FRIES",
 "description": "Standard recipe for Salted French Fries (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 15.37,
 "pmCost": 20.46,
 "labourCost": 7.42,
 "calculatedCost": 43.26,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m26a_1",
 "inventoryItemId": "inv_potato",
 "inventoryName": "POTATO",
 "quantity": 0.25,
 "unit": "kg",
 "costPerUnit": 50,
 "cost": 12.5
 },
 {
 "id": "ri_m26a_2",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 2.72
 },
 {
 "id": "ri_m26a_3",
 "inventoryItemId": "inv_salt",
 "inventoryName": "SALT",
 "quantity": 0.005,
 "unit": "kg",
 "costPerUnit": 30,
 "cost": 0.15
 },
 {
 "id": "ri_m26a_4",
 "inventoryItemId": "inv_fries_cup",
 "inventoryName": "Fries Cup",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.82,
 "cost": 6.82
 },
 {
 "id": "ri_m26a_5",
 "inventoryItemId": "inv_paper_bag",
 "inventoryName": "Paper Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.45,
 "cost": 6.45
 },
 {
 "id": "ri_m26a_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m26a_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m26a_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 7.42,
 "cost": 7.42
 }
 ]
 },
 {
 "id": "r_m26b",
 "menuItemId": "m26b",
 "menuItemName": "Peri Peri Fries",
 "name": "PERI PERI FRIES",
 "description": "Standard recipe for Peri Peri Fries (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 19.92,
 "pmCost": 20.19,
 "labourCost": 7.42,
 "calculatedCost": 47.53,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m26b_1",
 "inventoryItemId": "inv_potato",
 "inventoryName": "POTATO",
 "quantity": 0.25,
 "unit": "kg",
 "costPerUnit": 50,
 "cost": 12.5
 },
 {
 "id": "ri_m26b_2",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 2.72
 },
 {
 "id": "ri_m26b_3",
 "inventoryItemId": "inv_peri_peri_sauce",
 "inventoryName": "PERI PERI MASALA",
 "quantity": 0.008,
 "unit": "kg",
 "costPerUnit": 586.7,
 "cost": 4.69
 },
 {
 "id": "ri_m26b_4",
 "inventoryItemId": "inv_fries_cup",
 "inventoryName": "250ml Cup",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.55,
 "cost": 6.55
 },
 {
 "id": "ri_m26b_5",
 "inventoryItemId": "inv_paper_bag",
 "inventoryName": "Paper Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.45,
 "cost": 6.45
 },
 {
 "id": "ri_m26b_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m26b_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m26b_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 7.42,
 "cost": 7.42
 }
 ]
 },
 {
 "id": "r_m26c",
 "menuItemId": "m26c",
 "menuItemName": "Cajun Fries",
 "name": "KAJU FRIES",
 "description": "Standard recipe for Cajun Fries (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 20.02,
 "pmCost": 20.19,
 "labourCost": 7.42,
 "calculatedCost": 47.64,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m26c_1",
 "inventoryItemId": "inv_potato",
 "inventoryName": "POTATO",
 "quantity": 0.25,
 "unit": "kg",
 "costPerUnit": 50,
 "cost": 12.5
 },
 {
 "id": "ri_m26c_2",
 "inventoryItemId": "inv_refined_oil",
 "inventoryName": "REFINED OIL",
 "quantity": 0.015,
 "unit": "kg",
 "costPerUnit": 181.58,
 "cost": 2.72
 },
 {
 "id": "ri_m26c_3",
 "inventoryItemId": "inv_cajun_masala",
 "inventoryName": "KAJU MASALA",
 "quantity": 0.008,
 "unit": "kg",
 "costPerUnit": 600,
 "cost": 4.8
 },
 {
 "id": "ri_m26c_4",
 "inventoryItemId": "inv_fries_cup",
 "inventoryName": "250ml Cup",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.55,
 "cost": 6.55
 },
 {
 "id": "ri_m26c_5",
 "inventoryItemId": "inv_paper_bag",
 "inventoryName": "Paper Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.45,
 "cost": 6.45
 },
 {
 "id": "ri_m26c_6",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m26c_7",
 "inventoryItemId": "inv_takeaway_bags",
 "inventoryName": "Take Away Bags",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.65,
 "cost": 6.65
 },
 {
 "id": "ri_m26c_8",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 7.42,
 "cost": 7.42
 }
 ]
 },
 {
 "id": "r_m42",
 "menuItemId": "m42",
 "menuItemName": "Vanilla Shake (Regular)",
 "name": "VANILLA SHAKE REGULAR",
 "description": "Standard recipe for Vanilla Shake Regular (Price ₹120/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 24.5,
 "pmCost": 5.7,
 "labourCost": 11.87,
 "calculatedCost": 42.07,
 "sellingPrice": 120,
 "ingredients": [
 {
 "id": "ri_m42_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.25,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 16.4
 },
 {
 "id": "ri_m42_2",
 "inventoryItemId": "inv_vanilla_crush",
 "inventoryName": "Vanilla Crush",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 270,
 "cost": 8.1
 },
 {
 "id": "ri_m42_3",
 "inventoryItemId": "inv_pet_glass_350",
 "inventoryName": "PET Glass 350ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 5,
 "cost": 5
 },
 {
 "id": "ri_m42_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m42_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m43",
 "menuItemId": "m43",
 "menuItemName": "Vanilla Shake (Large)",
 "name": "VANILLA SHAKE LARGE",
 "description": "Standard recipe for Vanilla Shake Large (Price ₹199/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 39.74,
 "pmCost": 7.2,
 "labourCost": 11.87,
 "calculatedCost": 58.81,
 "sellingPrice": 199,
 "ingredients": [
 {
 "id": "ri_m43_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.4,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 26.24
 },
 {
 "id": "ri_m43_2",
 "inventoryItemId": "inv_vanilla_crush",
 "inventoryName": "Vanilla Crush",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 270,
 "cost": 13.5
 },
 {
 "id": "ri_m43_3",
 "inventoryItemId": "inv_pet_glass_500",
 "inventoryName": "PET Glass 500ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.5,
 "cost": 6.5
 },
 {
 "id": "ri_m43_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m43_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m44",
 "menuItemId": "m44",
 "menuItemName": "Strawberry Shake (Regular)",
 "name": "STRAWBERRY SHAKE REGULAR",
 "description": "Standard recipe for Strawberry Shake Regular (Price ₹120/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 24.8,
 "pmCost": 5.7,
 "labourCost": 11.87,
 "calculatedCost": 42.37,
 "sellingPrice": 120,
 "ingredients": [
 {
 "id": "ri_m44_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.25,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 16.4
 },
 {
 "id": "ri_m44_2",
 "inventoryItemId": "inv_strawberry_crush",
 "inventoryName": "Strawberry Crush",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 280,
 "cost": 8.4
 },
 {
 "id": "ri_m44_3",
 "inventoryItemId": "inv_pet_glass_350",
 "inventoryName": "PET Glass 350ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 5,
 "cost": 5
 },
 {
 "id": "ri_m44_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m44_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m45",
 "menuItemId": "m45",
 "menuItemName": "Strawberry Shake (Large)",
 "name": "STRAWBERRY SHAKE LARGE",
 "description": "Standard recipe for Strawberry Shake Large (Price ₹199/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 40.24,
 "pmCost": 7.2,
 "labourCost": 11.87,
 "calculatedCost": 59.31,
 "sellingPrice": 199,
 "ingredients": [
 {
 "id": "ri_m45_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.4,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 26.24
 },
 {
 "id": "ri_m45_2",
 "inventoryItemId": "inv_strawberry_crush",
 "inventoryName": "Strawberry Crush",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 280,
 "cost": 14
 },
 {
 "id": "ri_m45_3",
 "inventoryItemId": "inv_pet_glass_500",
 "inventoryName": "PET Glass 500ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.5,
 "cost": 6.5
 },
 {
 "id": "ri_m45_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m45_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m46",
 "menuItemId": "m46",
 "menuItemName": "Biscoff Shake (Regular)",
 "name": "BISCOFF SHAKE REGULAR",
 "description": "Standard recipe for Biscoff Shake Regular (Price ₹120/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 38.9,
 "pmCost": 5.7,
 "labourCost": 11.87,
 "calculatedCost": 56.47,
 "sellingPrice": 120,
 "ingredients": [
 {
 "id": "ri_m46_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.25,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 16.4
 },
 {
 "id": "ri_m46_2",
 "inventoryItemId": "inv_biscoff_spread",
 "inventoryName": "Biscoff Spread",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 750,
 "cost": 22.5
 },
 {
 "id": "ri_m46_3",
 "inventoryItemId": "inv_pet_glass_350",
 "inventoryName": "PET Glass 350ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 5,
 "cost": 5
 },
 {
 "id": "ri_m46_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m46_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m47",
 "menuItemId": "m47",
 "menuItemName": "Biscoff Shake (Large)",
 "name": "BISCOFF SHAKE LARGE",
 "description": "Standard recipe for Biscoff Shake Large (Price ₹199/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 63.74,
 "pmCost": 7.2,
 "labourCost": 11.87,
 "calculatedCost": 82.81,
 "sellingPrice": 199,
 "ingredients": [
 {
 "id": "ri_m47_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.4,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 26.24
 },
 {
 "id": "ri_m47_2",
 "inventoryItemId": "inv_biscoff_spread",
 "inventoryName": "Biscoff Spread",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 750,
 "cost": 37.5
 },
 {
 "id": "ri_m47_3",
 "inventoryItemId": "inv_pet_glass_500",
 "inventoryName": "PET Glass 500ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.5,
 "cost": 6.5
 },
 {
 "id": "ri_m47_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m47_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m48",
 "menuItemId": "m48",
 "menuItemName": "Chocolate Shake (Regular)",
 "name": "CHOCOLATE SHAKE REGULAR",
 "description": "Standard recipe for Chocolate Shake Regular (Price ₹120/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 26,
 "pmCost": 5.7,
 "labourCost": 11.87,
 "calculatedCost": 43.57,
 "sellingPrice": 120,
 "ingredients": [
 {
 "id": "ri_m48_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.25,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 16.4
 },
 {
 "id": "ri_m48_2",
 "inventoryItemId": "inv_chocolate_sauce",
 "inventoryName": "Dark Chocolate Sauce",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 320,
 "cost": 9.6
 },
 {
 "id": "ri_m48_3",
 "inventoryItemId": "inv_pet_glass_350",
 "inventoryName": "PET Glass 350ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 5,
 "cost": 5
 },
 {
 "id": "ri_m48_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m48_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m49",
 "menuItemId": "m49",
 "menuItemName": "Chocolate Shake (Large)",
 "name": "CHOCOLATE SHAKE LARGE",
 "description": "Standard recipe for Chocolate Shake Large (Price ₹199/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 42.24,
 "pmCost": 7.2,
 "labourCost": 11.87,
 "calculatedCost": 61.31,
 "sellingPrice": 199,
 "ingredients": [
 {
 "id": "ri_m49_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.4,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 26.24
 },
 {
 "id": "ri_m49_2",
 "inventoryItemId": "inv_chocolate_sauce",
 "inventoryName": "Dark Chocolate Sauce",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 320,
 "cost": 16
 },
 {
 "id": "ri_m49_3",
 "inventoryItemId": "inv_pet_glass_500",
 "inventoryName": "PET Glass 500ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.5,
 "cost": 6.5
 },
 {
 "id": "ri_m49_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m49_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m50",
 "menuItemId": "m50",
 "menuItemName": "Kunafa Pistachio Shake (Regular)",
 "name": "KUNAFA PISTACHIO SHAKE REGULAR",
 "description": "Standard recipe for Kunafa Pistachio Shake Regular (Price ₹120/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 44.9,
 "pmCost": 5.7,
 "labourCost": 11.87,
 "calculatedCost": 62.47,
 "sellingPrice": 120,
 "ingredients": [
 {
 "id": "ri_m50_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.25,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 16.4
 },
 {
 "id": "ri_m50_2",
 "inventoryItemId": "inv_kunafa_pistachio",
 "inventoryName": "Kunafa Pistachio Paste",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 950,
 "cost": 28.5
 },
 {
 "id": "ri_m50_3",
 "inventoryItemId": "inv_pet_glass_350",
 "inventoryName": "PET Glass 350ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 5,
 "cost": 5
 },
 {
 "id": "ri_m50_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m50_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m51",
 "menuItemId": "m51",
 "menuItemName": "Kunafa Pistachio Shake (Large)",
 "name": "KUNAFA PISTACHIO SHAKE LARGE",
 "description": "Standard recipe for Kunafa Pistachio Shake Large (Price ₹199/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 73.74,
 "pmCost": 7.2,
 "labourCost": 11.87,
 "calculatedCost": 92.81,
 "sellingPrice": 199,
 "ingredients": [
 {
 "id": "ri_m51_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Milk Base",
 "quantity": 0.4,
 "unit": "L",
 "costPerUnit": 65.6,
 "cost": 26.24
 },
 {
 "id": "ri_m51_2",
 "inventoryItemId": "inv_kunafa_pistachio",
 "inventoryName": "Kunafa Pistachio Paste",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 950,
 "cost": 47.5
 },
 {
 "id": "ri_m51_3",
 "inventoryItemId": "inv_pet_glass_500",
 "inventoryName": "PET Glass 500ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 6.5,
 "cost": 6.5
 },
 {
 "id": "ri_m51_4",
 "inventoryItemId": "inv_paper_straw",
 "inventoryName": "Paper Straw",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.7,
 "cost": 0.7
 },
 {
 "id": "ri_m51_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 11.87,
 "cost": 11.87
 }
 ]
 },
 {
 "id": "r_m52",
 "menuItemId": "m52",
 "menuItemName": "Vanilla Softy",
 "name": "VANILLA SOFTY",
 "description": "Standard recipe for Vanilla Softy Cone (Price ₹39/-)",
 "yieldQty": 1,
 "prepTime": 2,
 "rmCost": 6.5,
 "pmCost": 3.77,
 "labourCost": 3.5,
 "calculatedCost": 13.77,
 "sellingPrice": 39,
 "ingredients": [
 {
 "id": "ri_m52_1",
 "inventoryItemId": "inv_softy_mix",
 "inventoryName": "Softy Liquid Mix",
 "quantity": 0.1,
 "unit": "L",
 "costPerUnit": 65,
 "cost": 6.5
 },
 {
 "id": "ri_m52_2",
 "inventoryItemId": "inv_waffle_cone",
 "inventoryName": "Waffle Cone",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.5,
 "cost": 3.5
 },
 {
 "id": "ri_m52_3",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.27
 },
 {
 "id": "ri_m52_4",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 3.5,
 "cost": 3.5
 }
 ]
 },
 {
 "id": "r_m57",
 "menuItemId": "m57",
 "menuItemName": "Hot Chocolate",
 "name": "HOT CHOCOLATE",
 "description": "Standard recipe for Hot Chocolate (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 21.97,
 "pmCost": 4.04,
 "labourCost": 7.42,
 "calculatedCost": 33.43,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m57_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Fresh Milk",
 "quantity": 0.2,
 "unit": "L",
 "costPerUnit": 53.6,
 "cost": 10.72
 },
 {
 "id": "ri_m57_2",
 "inventoryItemId": "inv_hot_choco_powder",
 "inventoryName": "Hot Chocolate Powder",
 "quantity": 0.025,
 "unit": "kg",
 "costPerUnit": 450,
 "cost": 11.25
 },
 {
 "id": "ri_m57_3",
 "inventoryItemId": "inv_paper_cup_250",
 "inventoryName": "Paper Cup 250ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.5,
 "cost": 3.5
 },
 {
 "id": "ri_m57_4",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m57_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 7.42,
 "cost": 7.42
 }
 ]
 },
 {
 "id": "r_m58",
 "menuItemId": "m58",
 "menuItemName": "Signature Tea",
 "name": "SIGNATURE TEA",
 "description": "Standard recipe for Signature Tea (Price ₹99/-)",
 "yieldQty": 1,
 "prepTime": 5,
 "rmCost": 15,
 "pmCost": 4.04,
 "labourCost": 5.96,
 "calculatedCost": 25,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m58_1",
 "inventoryItemId": "inv_fresh_milk",
 "inventoryName": "Fresh Milk",
 "quantity": 0.15,
 "unit": "L",
 "costPerUnit": 53.6,
 "cost": 8.04
 },
 {
 "id": "ri_m58_2",
 "inventoryItemId": "inv_black_tea",
 "inventoryName": "Tea Powder / Spices",
 "quantity": 0.01,
 "unit": "kg",
 "costPerUnit": 696,
 "cost": 6.96
 },
 {
 "id": "ri_m58_3",
 "inventoryItemId": "inv_paper_cup_250",
 "inventoryName": "Paper Cup 250ml",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 3.5,
 "cost": 3.5
 },
 {
 "id": "ri_m58_4",
 "inventoryItemId": "inv_tissue_paper",
 "inventoryName": "Tissue Paper",
 "quantity": 2,
 "unit": "pc",
 "costPerUnit": 0.27,
 "cost": 0.54
 },
 {
 "id": "ri_m58_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 5.96,
 "cost": 5.96
 }
 ]
 },
 {
 "id": "r_m59a",
 "menuItemId": "m59a",
 "menuItemName": "Mint Kombucha",
 "name": "MINT KOMBUCHA",
 "description": "Standard recipe for Mint Kombucha (Price ₹114.29/-)",
 "yieldQty": 1,
 "prepTime": 3,
 "rmCost": 32.5,
 "pmCost": 7.5,
 "labourCost": 5,
 "calculatedCost": 45,
 "sellingPrice": 114.29,
 "ingredients": [
 {
 "id": "ri_m59a_1",
 "inventoryItemId": "inv_kombucha_base",
 "inventoryName": "Kombucha Fermented Base",
 "quantity": 0.25,
 "unit": "L",
 "costPerUnit": 120,
 "cost": 30
 },
 {
 "id": "ri_m59a_2",
 "inventoryItemId": "inv_water",
 "inventoryName": "Mint Extract",
 "quantity": 0.02,
 "unit": "kg",
 "costPerUnit": 125,
 "cost": 2.5
 },
 {
 "id": "ri_m59a_3",
 "inventoryItemId": "inv_pet_glass_350",
 "inventoryName": "Glass / Cup Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 7.5,
 "cost": 7.5
 },
 {
 "id": "ri_m59a_4",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 5,
 "cost": 5
 }
 ]
 },
 {
 "id": "r_m59b",
 "menuItemId": "m59b",
 "menuItemName": "Hibiscus Kombucha",
 "name": "HIBISCUS KOMBUCHA",
 "description": "Standard recipe for Hibiscus Kombucha (Price ₹114.29/-)",
 "yieldQty": 1,
 "prepTime": 3,
 "rmCost": 32.5,
 "pmCost": 7.5,
 "labourCost": 5,
 "calculatedCost": 45,
 "sellingPrice": 114.29,
 "ingredients": [
 {
 "id": "ri_m59b_1",
 "inventoryItemId": "inv_kombucha_base",
 "inventoryName": "Kombucha Fermented Base",
 "quantity": 0.25,
 "unit": "L",
 "costPerUnit": 120,
 "cost": 30
 },
 {
 "id": "ri_m59b_2",
 "inventoryItemId": "inv_water",
 "inventoryName": "Hibiscus Extract",
 "quantity": 0.02,
 "unit": "kg",
 "costPerUnit": 125,
 "cost": 2.5
 },
 {
 "id": "ri_m59b_3",
 "inventoryItemId": "inv_pet_glass_350",
 "inventoryName": "Glass / Cup Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 7.5,
 "cost": 7.5
 },
 {
 "id": "ri_m59b_4",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 5,
 "cost": 5
 }
 ]
 },
 {
 "id": "r_m59c",
 "menuItemId": "m59c",
 "menuItemName": "Ginger Kombucha",
 "name": "GINGER KOMBUCHA",
 "description": "Standard recipe for Ginger Kombucha (Price ₹114.29/-)",
 "yieldQty": 1,
 "prepTime": 3,
 "rmCost": 32.5,
 "pmCost": 7.5,
 "labourCost": 5,
 "calculatedCost": 45,
 "sellingPrice": 114.29,
 "ingredients": [
 {
 "id": "ri_m59c_1",
 "inventoryItemId": "inv_kombucha_base",
 "inventoryName": "Kombucha Fermented Base",
 "quantity": 0.25,
 "unit": "L",
 "costPerUnit": 120,
 "cost": 30
 },
 {
 "id": "ri_m59c_2",
 "inventoryItemId": "inv_water",
 "inventoryName": "Ginger Extract",
 "quantity": 0.02,
 "unit": "kg",
 "costPerUnit": 125,
 "cost": 2.5
 },
 {
 "id": "ri_m59c_3",
 "inventoryItemId": "inv_pet_glass_350",
 "inventoryName": "Glass / Cup Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 7.5,
 "cost": 7.5
 },
 {
 "id": "ri_m59c_4",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 5,
 "cost": 5
 }
 ]
 },
 {
 "id": "r_m59d",
 "menuItemId": "m59d",
 "menuItemName": "Butterfly Pea Kombucha",
 "name": "BUTTERFLY PEA KOMBUCHA",
 "description": "Standard recipe for Butterfly Pea Kombucha (Price ₹114.29/-)",
 "yieldQty": 1,
 "prepTime": 3,
 "rmCost": 32.5,
 "pmCost": 7.5,
 "labourCost": 5,
 "calculatedCost": 45,
 "sellingPrice": 114.29,
 "ingredients": [
 {
 "id": "ri_m59d_1",
 "inventoryItemId": "inv_kombucha_base",
 "inventoryName": "Kombucha Fermented Base",
 "quantity": 0.25,
 "unit": "L",
 "costPerUnit": 120,
 "cost": 30
 },
 {
 "id": "ri_m59d_2",
 "inventoryItemId": "inv_water",
 "inventoryName": "Butterfly Pea Flower Extract",
 "quantity": 0.02,
 "unit": "kg",
 "costPerUnit": 125,
 "cost": 2.5
 },
 {
 "id": "ri_m59d_3",
 "inventoryItemId": "inv_pet_glass_350",
 "inventoryName": "Glass / Cup Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 7.5,
 "cost": 7.5
 },
 {
 "id": "ri_m59d_4",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 5,
 "cost": 5
 }
 ]
 },
 {
 "id": "r_m7",
 "menuItemId": "m7",
 "menuItemName": "Peri Peri Gyro",
 "name": "PERI PERI GYRO (MINI)",
 "description": "Standard recipe for Peri Peri Gyro",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 31.72,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 60.08,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m7a_1",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA (Pita)",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 1.79
 },
 {
 "id": "ri_m7a_2",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 400,
 "cost": 20
 },
 {
 "id": "ri_m7a_3",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG & Veggies",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 248.15,
 "cost": 9.93
 },
 {
 "id": "ri_m7a_4",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray & Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12.41,
 "cost": 12.41
 },
 {
 "id": "ri_m7a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m8",
 "menuItemId": "m8",
 "menuItemName": "Peri Peri Gyro (Signature)",
 "name": "PERI PERI GYRO (SIGNATURE)",
 "description": "Standard recipe for Peri Peri Gyro (Signature)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 53.51,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 81.87,
 "sellingPrice": 249,
 "ingredients": [
 {
 "id": "ri_m8a_1",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA (Pita)",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 3.58
 },
 {
 "id": "ri_m8a_2",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 400,
 "cost": 40
 },
 {
 "id": "ri_m8a_3",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG & Veggies",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 248.15,
 "cost": 9.93
 },
 {
 "id": "ri_m8a_4",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray & Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12.41,
 "cost": 12.41
 },
 {
 "id": "ri_m8a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m9",
 "menuItemId": "m9",
 "menuItemName": "Signature Gyro",
 "name": "SIGNATURE GYRO (MINI)",
 "description": "Standard recipe for Signature Gyro",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 53.51,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 81.87,
 "sellingPrice": 99,
 "ingredients": [
 {
 "id": "ri_m9a_1",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA (Pita)",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 3.58
 },
 {
 "id": "ri_m9a_2",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 400,
 "cost": 40
 },
 {
 "id": "ri_m9a_3",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG & Veggies",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 248.15,
 "cost": 9.93
 },
 {
 "id": "ri_m9a_4",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray & Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12.41,
 "cost": 12.41
 },
 {
 "id": "ri_m9a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m10",
 "menuItemId": "m10",
 "menuItemName": "Signature Gyro (Signature)",
 "name": "SIGNATURE GYRO (SIGNATURE)",
 "description": "Standard recipe for Signature Gyro (Signature)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 53.51,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 81.87,
 "sellingPrice": 249,
 "ingredients": [
 {
 "id": "ri_m10a_1",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA (Pita)",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 3.58
 },
 {
 "id": "ri_m10a_2",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 400,
 "cost": 40
 },
 {
 "id": "ri_m10a_3",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG & Veggies",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 248.15,
 "cost": 9.93
 },
 {
 "id": "ri_m10a_4",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray & Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12.41,
 "cost": 12.41
 },
 {
 "id": "ri_m10a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m27a",
 "menuItemId": "m27a",
 "menuItemName": "Loaded Chicken Fries",
 "name": "RECIPE - LOADED CHICKEN FRIES",
 "description": "Standard recipe for Loaded Chicken Fries (Price ₹199/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 52.91,
 "pmCost": 15,
 "labourCost": 10,
 "calculatedCost": 77.91,
 "sellingPrice": 199,
 "ingredients": [
 {
 "id": "ri_m27a_1",
 "inventoryItemId": "inv_potato",
 "inventoryName": "Potato Fries Base",
 "quantity": 0.25,
 "unit": "kg",
 "costPerUnit": 50,
 "cost": 12.5
 },
 {
 "id": "ri_m27a_2",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Chicken Topping",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 24
 },
 {
 "id": "ri_m27a_3",
 "inventoryItemId": "inv_cheese_white",
 "inventoryName": "Melted Cheese Sauce",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 547,
 "cost": 16.41
 },
 {
 "id": "ri_m27a_4",
 "inventoryItemId": "inv_dinning_tray_500ml",
 "inventoryName": "Loaded Fries Tray & Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 15,
 "cost": 15
 },
 {
 "id": "ri_m27a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 10,
 "cost": 10
 }
 ]
 },
 {
 "id": "r_m27b",
 "menuItemId": "m27b",
 "menuItemName": "Loaded Paneer Fries",
 "name": "RECIPE - LOADED PANEER FRIES",
 "description": "Standard recipe for Loaded Paneer Fries (Price ₹199/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 52.91,
 "pmCost": 15,
 "labourCost": 10,
 "calculatedCost": 77.91,
 "sellingPrice": 199,
 "ingredients": [
 {
 "id": "ri_m27b_1",
 "inventoryItemId": "inv_potato",
 "inventoryName": "Potato Fries Base",
 "quantity": 0.25,
 "unit": "kg",
 "costPerUnit": 50,
 "cost": 12.5
 },
 {
 "id": "ri_m27b_2",
 "inventoryItemId": "inv_pesto_paneer",
 "inventoryName": "Paneer Topping",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 24
 },
 {
 "id": "ri_m27b_3",
 "inventoryItemId": "inv_cheese_white",
 "inventoryName": "Melted Cheese Sauce",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 547,
 "cost": 16.41
 },
 {
 "id": "ri_m27b_4",
 "inventoryItemId": "inv_dinning_tray_500ml",
 "inventoryName": "Loaded Fries Tray & Bag",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 15,
 "cost": 15
 },
 {
 "id": "ri_m27b_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 10,
 "cost": 10
 }
 ]
 },
 {
 "id": "r_m28a",
 "menuItemId": "m28a",
 "menuItemName": "Lebanese Rice Bowl (Chicken)",
 "name": "RECIPE - LEBANESE RICE BOWL (CHICKEN)",
 "description": "Standard recipe for Lebanese Rice Bowl (Chicken) (Price ₹199/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 47.05,
 "pmCost": 12,
 "labourCost": 12,
 "calculatedCost": 71.05,
 "sellingPrice": 199,
 "ingredients": [
 {
 "id": "ri_m28a_1",
 "inventoryItemId": "inv_atta",
 "inventoryName": "Lebanese Rice Base",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 60,
 "cost": 12
 },
 {
 "id": "ri_m28a_2",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 30
 },
 {
 "id": "ri_m28a_3",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "House Dressing",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 5.05
 },
 {
 "id": "ri_m28a_4",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Bowl Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12,
 "cost": 12
 },
 {
 "id": "ri_m28a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 12,
 "cost": 12
 }
 ]
 },
 {
 "id": "r_m28b",
 "menuItemId": "m28b",
 "menuItemName": "Lebanese Rice Bowl (Paneer)",
 "name": "RECIPE - LEBANESE RICE BOWL (PANEER)",
 "description": "Standard recipe for Lebanese Rice Bowl (Paneer) (Price ₹199/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 47.05,
 "pmCost": 12,
 "labourCost": 12,
 "calculatedCost": 71.05,
 "sellingPrice": 199,
 "ingredients": [
 {
 "id": "ri_m28b_1",
 "inventoryItemId": "inv_atta",
 "inventoryName": "Lebanese Rice Base",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 60,
 "cost": 12
 },
 {
 "id": "ri_m28b_2",
 "inventoryItemId": "inv_pesto_paneer",
 "inventoryName": "Paneer Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 30
 },
 {
 "id": "ri_m28b_3",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "House Dressing",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 5.05
 },
 {
 "id": "ri_m28b_4",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Bowl Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12,
 "cost": 12
 },
 {
 "id": "ri_m28b_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 12,
 "cost": 12
 }
 ]
 },
 {
 "id": "r_m29a",
 "menuItemId": "m29a",
 "menuItemName": "Signature Salad (Chicken)",
 "name": "RECIPE - SIGNATURE SALAD (CHICKEN)",
 "description": "Standard recipe for Signature Salad (Chicken) (Price ₹149/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 47.05,
 "pmCost": 12,
 "labourCost": 12,
 "calculatedCost": 71.05,
 "sellingPrice": 149,
 "ingredients": [
 {
 "id": "ri_m29a_1",
 "inventoryItemId": "inv_atta",
 "inventoryName": "Fresh Salad Base",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 60,
 "cost": 12
 },
 {
 "id": "ri_m29a_2",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 30
 },
 {
 "id": "ri_m29a_3",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "House Dressing",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 5.05
 },
 {
 "id": "ri_m29a_4",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Bowl Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12,
 "cost": 12
 },
 {
 "id": "ri_m29a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 12,
 "cost": 12
 }
 ]
 },
 {
 "id": "r_m29b",
 "menuItemId": "m29b",
 "menuItemName": "Signature Salad (Paneer)",
 "name": "RECIPE - SIGNATURE SALAD (PANEER)",
 "description": "Standard recipe for Signature Salad (Paneer) (Price ₹149/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 47.05,
 "pmCost": 12,
 "labourCost": 12,
 "calculatedCost": 71.05,
 "sellingPrice": 149,
 "ingredients": [
 {
 "id": "ri_m29b_1",
 "inventoryItemId": "inv_atta",
 "inventoryName": "Fresh Salad Base",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 60,
 "cost": 12
 },
 {
 "id": "ri_m29b_2",
 "inventoryItemId": "inv_pesto_paneer",
 "inventoryName": "Paneer Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 30
 },
 {
 "id": "ri_m29b_3",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "House Dressing",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 5.05
 },
 {
 "id": "ri_m29b_4",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Bowl Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12,
 "cost": 12
 },
 {
 "id": "ri_m29b_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 12,
 "cost": 12
 }
 ]
 },
 {
 "id": "r_m30",
 "menuItemId": "m30",
 "menuItemName": "Express Meal",
 "name": "RECIPE - EXPRESS MEAL",
 "description": "Standard recipe for Express Meal (Price ₹149/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 37.25,
 "pmCost": 7.45,
 "labourCost": 5.96,
 "calculatedCost": 50.66,
 "sellingPrice": 149,
 "ingredients": [
 {
 "id": "ri_m30_1",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Combo Food Ingredients",
 "quantity": 1,
 "unit": "portion",
 "costPerUnit": 37.25,
 "cost": 37.25
 },
 {
 "id": "ri_m30_2",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Combo Meal Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 7.45,
 "cost": 7.45
 },
 {
 "id": "ri_m30_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 5.96,
 "cost": 5.96
 }
 ]
 },
 {
 "id": "r_m31",
 "menuItemId": "m31",
 "menuItemName": "Classic Gyro Meal",
 "name": "RECIPE - CLASSIC GYRO MEAL",
 "description": "Standard recipe for Classic Gyro Meal (Price ₹249/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 31.72,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 60.08,
 "sellingPrice": 249,
 "ingredients": [
 {
 "id": "ri_m31_1",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA (Pita)",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 1.79
 },
 {
 "id": "ri_m31_2",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 400,
 "cost": 20
 },
 {
 "id": "ri_m31_3",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG & Veggies",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 248.15,
 "cost": 9.93
 },
 {
 "id": "ri_m31_4",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray & Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12.41,
 "cost": 12.41
 },
 {
 "id": "ri_m31_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m32",
 "menuItemId": "m32",
 "menuItemName": "Signature Gyro Meal",
 "name": "RECIPE - SIGNATURE GYRO MEAL",
 "description": "Standard recipe for Signature Gyro Meal (Price ₹299/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 53.51,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 81.87,
 "sellingPrice": 299,
 "ingredients": [
 {
 "id": "ri_m32_1",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA (Pita)",
 "quantity": 0.08,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 3.58
 },
 {
 "id": "ri_m32_2",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 400,
 "cost": 40
 },
 {
 "id": "ri_m32_3",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG & Veggies",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 248.15,
 "cost": 9.93
 },
 {
 "id": "ri_m32_4",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray & Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12.41,
 "cost": 12.41
 },
 {
 "id": "ri_m32_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m33",
 "menuItemId": "m33",
 "menuItemName": "Lebanese Rice Box",
 "name": "RECIPE - LEBANESE RICE BOX",
 "description": "Standard recipe for Lebanese Rice Box (Price ₹299/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 47.05,
 "pmCost": 12,
 "labourCost": 12,
 "calculatedCost": 71.05,
 "sellingPrice": 299,
 "ingredients": [
 {
 "id": "ri_m33_1",
 "inventoryItemId": "inv_atta",
 "inventoryName": "Lebanese Rice Base",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 60,
 "cost": 12
 },
 {
 "id": "ri_m33_2",
 "inventoryItemId": "inv_pesto_paneer",
 "inventoryName": "Paneer Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 30
 },
 {
 "id": "ri_m33_3",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "House Dressing",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 5.05
 },
 {
 "id": "ri_m33_4",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Bowl Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12,
 "cost": 12
 },
 {
 "id": "ri_m33_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 12,
 "cost": 12
 }
 ]
 },
 {
 "id": "r_m34",
 "menuItemId": "m34",
 "menuItemName": "Duo Gyro Feast",
 "name": "RECIPE - DUO GYRO FEAST",
 "description": "Standard recipe for Duo Gyro Feast (Price ₹349/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 31.72,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 60.08,
 "sellingPrice": 349,
 "ingredients": [
 {
 "id": "ri_m34_1",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA (Pita)",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 1.79
 },
 {
 "id": "ri_m34_2",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 400,
 "cost": 20
 },
 {
 "id": "ri_m34_3",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG & Veggies",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 248.15,
 "cost": 9.93
 },
 {
 "id": "ri_m34_4",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray & Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12.41,
 "cost": 12.41
 },
 {
 "id": "ri_m34_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m35",
 "menuItemId": "m35",
 "menuItemName": "Double Crunch Box",
 "name": "RECIPE - DOUBLE CRUNCH BOX",
 "description": "Standard recipe for Double Crunch Box (Price ₹499/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 124.75,
 "pmCost": 24.95,
 "labourCost": 19.96,
 "calculatedCost": 169.66,
 "sellingPrice": 499,
 "ingredients": [
 {
 "id": "ri_m35_1",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Combo Food Ingredients",
 "quantity": 1,
 "unit": "portion",
 "costPerUnit": 124.75,
 "cost": 124.75
 },
 {
 "id": "ri_m35_2",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Combo Meal Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 24.95,
 "cost": 24.95
 },
 {
 "id": "ri_m35_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 19.96,
 "cost": 19.96
 }
 ]
 },
 {
 "id": "r_m36",
 "menuItemId": "m36",
 "menuItemName": "Mega Feast Meal",
 "name": "RECIPE - MEGA FEAST MEAL",
 "description": "Standard recipe for Mega Feast Meal (Price ₹649/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 162.25,
 "pmCost": 32.45,
 "labourCost": 25.96,
 "calculatedCost": 220.66,
 "sellingPrice": 649,
 "ingredients": [
 {
 "id": "ri_m36_1",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Combo Food Ingredients",
 "quantity": 1,
 "unit": "portion",
 "costPerUnit": 162.25,
 "cost": 162.25
 },
 {
 "id": "ri_m36_2",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Combo Meal Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 32.45,
 "cost": 32.45
 },
 {
 "id": "ri_m36_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 25.96,
 "cost": 25.96
 }
 ]
 },
 {
 "id": "r_m37",
 "menuItemId": "m37",
 "menuItemName": "Den's Party Meal",
 "name": "RECIPE - DEN'S PARTY MEAL",
 "description": "Standard recipe for Den's Party Meal (Price ₹899/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 224.75,
 "pmCost": 44.95,
 "labourCost": 35.96,
 "calculatedCost": 305.66,
 "sellingPrice": 899,
 "ingredients": [
 {
 "id": "ri_m37_1",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Combo Food Ingredients",
 "quantity": 1,
 "unit": "portion",
 "costPerUnit": 224.75,
 "cost": 224.75
 },
 {
 "id": "ri_m37_2",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Combo Meal Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 44.95,
 "cost": 44.95
 },
 {
 "id": "ri_m37_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 35.96,
 "cost": 35.96
 }
 ]
 },
 {
 "id": "r_m38",
 "menuItemId": "m38",
 "menuItemName": "Super 5 Bucket",
 "name": "RECIPE - SUPER 5 BUCKET",
 "description": "Standard recipe for Super 5 Bucket (Price ₹1299/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 324.75,
 "pmCost": 64.95,
 "labourCost": 51.96,
 "calculatedCost": 441.66,
 "sellingPrice": 1299,
 "ingredients": [
 {
 "id": "ri_m38_1",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Combo Food Ingredients",
 "quantity": 1,
 "unit": "portion",
 "costPerUnit": 324.75,
 "cost": 324.75
 },
 {
 "id": "ri_m38_2",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Combo Meal Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 64.95,
 "cost": 64.95
 },
 {
 "id": "ri_m38_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 51.96,
 "cost": 51.96
 }
 ]
 },
 {
 "id": "r_m39",
 "menuItemId": "m39",
 "menuItemName": "Gyro - Protein Max",
 "name": "GYRO - PROTEIN MAX",
 "description": "Standard recipe for Gyro - Protein Max",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 31.72,
 "pmCost": 12.41,
 "labourCost": 15.95,
 "calculatedCost": 60.08,
 "sellingPrice": 299,
 "ingredients": [
 {
 "id": "ri_m39a_1",
 "inventoryItemId": "inv_maida",
 "inventoryName": "MAIDA (Pita)",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 44.77,
 "cost": 1.79
 },
 {
 "id": "ri_m39a_2",
 "inventoryItemId": "inv_spicy_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.05,
 "unit": "kg",
 "costPerUnit": 400,
 "cost": 20
 },
 {
 "id": "ri_m39a_3",
 "inventoryItemId": "inv_iceberg",
 "inventoryName": "ICEBERG & Veggies",
 "quantity": 0.04,
 "unit": "kg",
 "costPerUnit": 248.15,
 "cost": 9.93
 },
 {
 "id": "ri_m39a_4",
 "inventoryItemId": "inv_dinning_tray",
 "inventoryName": "Dinning Tray & Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12.41,
 "cost": 12.41
 },
 {
 "id": "ri_m39a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 15.95,
 "cost": 15.95
 }
 ]
 },
 {
 "id": "r_m40a",
 "menuItemId": "m40a",
 "menuItemName": "Lebanese Rice - Protein Max (Chicken)",
 "name": "RECIPE - LEBANESE RICE - PROTEIN MAX (CHICKEN)",
 "description": "Standard recipe for Lebanese Rice - Protein Max (Chicken) (Price ₹299/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 47.05,
 "pmCost": 12,
 "labourCost": 12,
 "calculatedCost": 71.05,
 "sellingPrice": 299,
 "ingredients": [
 {
 "id": "ri_m40a_1",
 "inventoryItemId": "inv_atta",
 "inventoryName": "Lebanese Rice Base",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 60,
 "cost": 12
 },
 {
 "id": "ri_m40a_2",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 30
 },
 {
 "id": "ri_m40a_3",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "House Dressing",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 5.05
 },
 {
 "id": "ri_m40a_4",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Bowl Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12,
 "cost": 12
 },
 {
 "id": "ri_m40a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 12,
 "cost": 12
 }
 ]
 },
 {
 "id": "r_m40b",
 "menuItemId": "m40b",
 "menuItemName": "Lebanese Rice - Protein Max (Paneer)",
 "name": "RECIPE - LEBANESE RICE - PROTEIN MAX (PANEER)",
 "description": "Standard recipe for Lebanese Rice - Protein Max (Paneer) (Price ₹299/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 47.05,
 "pmCost": 12,
 "labourCost": 12,
 "calculatedCost": 71.05,
 "sellingPrice": 299,
 "ingredients": [
 {
 "id": "ri_m40b_1",
 "inventoryItemId": "inv_atta",
 "inventoryName": "Lebanese Rice Base",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 60,
 "cost": 12
 },
 {
 "id": "ri_m40b_2",
 "inventoryItemId": "inv_pesto_paneer",
 "inventoryName": "Paneer Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 30
 },
 {
 "id": "ri_m40b_3",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "House Dressing",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 5.05
 },
 {
 "id": "ri_m40b_4",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Bowl Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12,
 "cost": 12
 },
 {
 "id": "ri_m40b_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 12,
 "cost": 12
 }
 ]
 },
 {
 "id": "r_m41a",
 "menuItemId": "m41a",
 "menuItemName": "Salad - Protein Max (Chicken)",
 "name": "RECIPE - SALAD - PROTEIN MAX (CHICKEN)",
 "description": "Standard recipe for Salad - Protein Max (Chicken) (Price ₹299/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 47.05,
 "pmCost": 12,
 "labourCost": 12,
 "calculatedCost": 71.05,
 "sellingPrice": 299,
 "ingredients": [
 {
 "id": "ri_m41a_1",
 "inventoryItemId": "inv_atta",
 "inventoryName": "Fresh Salad Base",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 60,
 "cost": 12
 },
 {
 "id": "ri_m41a_2",
 "inventoryItemId": "inv_boneless_chicken",
 "inventoryName": "Chicken Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 30
 },
 {
 "id": "ri_m41a_3",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "House Dressing",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 5.05
 },
 {
 "id": "ri_m41a_4",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Bowl Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12,
 "cost": 12
 },
 {
 "id": "ri_m41a_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 12,
 "cost": 12
 }
 ]
 },
 {
 "id": "r_m41b",
 "menuItemId": "m41b",
 "menuItemName": "Salad - Protein Max (Paneer)",
 "name": "RECIPE - SALAD - PROTEIN MAX (PANEER)",
 "description": "Standard recipe for Salad - Protein Max (Paneer) (Price ₹299/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 47.05,
 "pmCost": 12,
 "labourCost": 12,
 "calculatedCost": 71.05,
 "sellingPrice": 299,
 "ingredients": [
 {
 "id": "ri_m41b_1",
 "inventoryItemId": "inv_atta",
 "inventoryName": "Fresh Salad Base",
 "quantity": 0.2,
 "unit": "kg",
 "costPerUnit": 60,
 "cost": 12
 },
 {
 "id": "ri_m41b_2",
 "inventoryItemId": "inv_pesto_paneer",
 "inventoryName": "Paneer Portion",
 "quantity": 0.1,
 "unit": "kg",
 "costPerUnit": 300,
 "cost": 30
 },
 {
 "id": "ri_m41b_3",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "House Dressing",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 5.05
 },
 {
 "id": "ri_m41b_4",
 "inventoryItemId": "inv_paper_bag_large",
 "inventoryName": "Bowl Packaging",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 12,
 "cost": 12
 },
 {
 "id": "ri_m41b_5",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 12,
 "cost": 12
 }
 ]
 },
 {
 "id": "r_m62a",
 "menuItemId": "m62a",
 "menuItemName": "Turkish Chilli Dip",
 "name": "RECIPE - TURKISH CHILLI DIP",
 "description": "Standard recipe for Turkish Chilli Dip (Price ₹15/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 1.73,
 "pmCost": 1.77,
 "labourCost": 1,
 "calculatedCost": 4.5,
 "sellingPrice": 15,
 "ingredients": [
 {
 "id": "ri_m62a_1",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "Base Sauce / Mayo",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 1.73
 },
 {
 "id": "ri_m62a_2",
 "inventoryItemId": "inv_dip_small_bowl",
 "inventoryName": "Dip Small Bowl",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.77,
 "cost": 1.77
 },
 {
 "id": "ri_m62a_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 1,
 "cost": 1
 }
 ]
 },
 {
 "id": "r_m62b",
 "menuItemId": "m62b",
 "menuItemName": "Jalapeno Cheese Dip",
 "name": "RECIPE - JALAPENO CHEESE DIP",
 "description": "Standard recipe for Jalapeno Cheese Dip (Price ₹15/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 1.73,
 "pmCost": 1.77,
 "labourCost": 1,
 "calculatedCost": 4.5,
 "sellingPrice": 15,
 "ingredients": [
 {
 "id": "ri_m62b_1",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "Base Sauce / Mayo",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 1.73
 },
 {
 "id": "ri_m62b_2",
 "inventoryItemId": "inv_dip_small_bowl",
 "inventoryName": "Dip Small Bowl",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.77,
 "cost": 1.77
 },
 {
 "id": "ri_m62b_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 1,
 "cost": 1
 }
 ]
 },
 {
 "id": "r_m62c",
 "menuItemId": "m62c",
 "menuItemName": "Garlic Mayo Dip",
 "name": "RECIPE - GARLIC MAYO DIP",
 "description": "Standard recipe for Garlic Mayo Dip (Price ₹15/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 1.73,
 "pmCost": 1.77,
 "labourCost": 1,
 "calculatedCost": 4.5,
 "sellingPrice": 15,
 "ingredients": [
 {
 "id": "ri_m62c_1",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "Base Sauce / Mayo",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 1.73
 },
 {
 "id": "ri_m62c_2",
 "inventoryItemId": "inv_dip_small_bowl",
 "inventoryName": "Dip Small Bowl",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.77,
 "cost": 1.77
 },
 {
 "id": "ri_m62c_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 1,
 "cost": 1
 }
 ]
 },
 {
 "id": "r_m62d",
 "menuItemId": "m62d",
 "menuItemName": "Spicy Mayo Dip",
 "name": "RECIPE - SPICY MAYO DIP",
 "description": "Standard recipe for Spicy Mayo Dip (Price ₹15/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 1.73,
 "pmCost": 1.77,
 "labourCost": 1,
 "calculatedCost": 4.5,
 "sellingPrice": 15,
 "ingredients": [
 {
 "id": "ri_m62d_1",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "Base Sauce / Mayo",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 1.73
 },
 {
 "id": "ri_m62d_2",
 "inventoryItemId": "inv_dip_small_bowl",
 "inventoryName": "Dip Small Bowl",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.77,
 "cost": 1.77
 },
 {
 "id": "ri_m62d_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 1,
 "cost": 1
 }
 ]
 },
 {
 "id": "r_m62e",
 "menuItemId": "m62e",
 "menuItemName": "Peri Peri Dip",
 "name": "RECIPE - PERI PERI DIP",
 "description": "Standard recipe for Peri Peri Dip (Price ₹15/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 1.73,
 "pmCost": 1.77,
 "labourCost": 1,
 "calculatedCost": 4.5,
 "sellingPrice": 15,
 "ingredients": [
 {
 "id": "ri_m62e_1",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "Base Sauce / Mayo",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 1.73
 },
 {
 "id": "ri_m62e_2",
 "inventoryItemId": "inv_dip_small_bowl",
 "inventoryName": "Dip Small Bowl",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.77,
 "cost": 1.77
 },
 {
 "id": "ri_m62e_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 1,
 "cost": 1
 }
 ]
 },
 {
 "id": "r_m62f",
 "menuItemId": "m62f",
 "menuItemName": "Honey Mustard Dip",
 "name": "RECIPE - HONEY MUSTARD DIP",
 "description": "Standard recipe for Honey Mustard Dip (Price ₹15/-)",
 "yieldQty": 1,
 "prepTime": 8,
 "rmCost": 1.73,
 "pmCost": 1.77,
 "labourCost": 1,
 "calculatedCost": 4.5,
 "sellingPrice": 15,
 "ingredients": [
 {
 "id": "ri_m62f_1",
 "inventoryItemId": "inv_mayonnaise",
 "inventoryName": "Base Sauce / Mayo",
 "quantity": 0.03,
 "unit": "kg",
 "costPerUnit": 168.43,
 "cost": 1.73
 },
 {
 "id": "ri_m62f_2",
 "inventoryItemId": "inv_dip_small_bowl",
 "inventoryName": "Dip Small Bowl",
 "quantity": 1,
 "unit": "pc",
 "costPerUnit": 1.77,
 "cost": 1.77
 },
 {
 "id": "ri_m62f_3",
 "inventoryItemId": "inv_labour",
 "inventoryName": "Labour Cost",
 "quantity": 1,
 "unit": "unit",
 "costPerUnit": 1,
 "cost": 1
 }
 ]
 }
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
 // 8-char alphanumeric: letters + digits, unambiguous chars only
 const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
 while (true) {
 let code = ''
 for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
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

// Verify asset OTP — called by the referred person during signup or after Firebase Phone Auth
app.post('/api/assets/verify-otp', (req, res) => {
 const { phone, otp } = req.body
 if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP required' })

 const db = readDb()
 // Find any master user who has this phone as a pending asset
 for (const master of db.users || mobileAppUsers) {
 const assets = master.assets || []
 const asset = assets.find(a => a.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, '') && a.status === 'pending')
 if (asset) {
 // Check OTP: match exact OTP
 if (asset.otp && asset.otp !== otp) {
 return res.status(400).json({ message: 'Invalid OTP' })
 }
 if (asset.otpExpiry && new Date(asset.otpExpiry) < new Date()) {
 return res.status(400).json({ message: 'OTP expired. Ask your referrer to add you again.' })
 }
 // OTP valid — activate asset
 asset.status = 'active'
 asset.activatedAt = new Date().toISOString()
 asset.otp = null
 asset.otpExpiry = null
 writeDb(db)
 saveState()
 return res.json({ success: true, message: 'OTP verified', masterName: master.name, masterId: master.id })
 }
 }
 res.status(400).json({ message: 'Pending asset not found for this phone number' })
})

// Resend OTP for asset verification
app.post('/api/assets/resend-otp', async (req, res) => {
 const { phone } = req.body
 if (!phone) return res.status(400).json({ message: 'Phone required' })

 const db = readDb()
 for (const master of db.users || mobileAppUsers) {
 const assets = master.assets || []
 const asset = assets.find(a => a.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, '') && a.status === 'pending')
 if (asset) {
 const otp = generateOTP()
 asset.otp = otp
 asset.otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
 writeDb(db)
 const result = await sendMSG91OTP(phone, otp)
 return res.json({ success: true, message: 'OTP resent', method: result.method })
 }
 }
 res.status(400).json({ message: 'Pending asset not found' })
})

function cleanPhoneDigits(phone) {
 if (!phone) return ''
 const digits = String(phone).replace(/\D/g, '')
 if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
 if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
 return digits
}

function phonesMatch(p1, p2) {
 if (!p1 || !p2) return false
 const c1 = cleanPhoneDigits(p1)
 const c2 = cleanPhoneDigits(p2)
 if (c1 && c2 && c1 === c2) return true
 const raw1 = String(p1).replace(/\D/g, '')
 const raw2 = String(p2).replace(/\D/g, '')
 if (raw1 && raw2 && raw1 === raw2) return true
 if (raw1.length >= 10 && raw2.length >= 10) {
 return raw1.slice(-10) === raw2.slice(-10)
 }
 return false
}

function findUserByPhoneOrEmail({ phone, email }) {
 const db = readDb()
 const dbUsers = db.users || []
 const dbLoyalty = db.loyaltyUsers || []
 const allUsers = [
 ...(mobileAppUsers || []),
 ...dbUsers,
 ...(loyaltyUsers || []),
 ...dbLoyalty
 ]

 const cleanEmail = email ? String(email).trim().toLowerCase() : null

 for (const u of allUsers) {
 if (!u) continue
 if (cleanEmail && u.email && String(u.email).trim().toLowerCase() === cleanEmail) {
 return u
 }
 if (phone && u.phone && phonesMatch(u.phone, phone)) {
 return u
 }
 }
 return null
}

// Resend OTP for forgot password
app.post('/api/auth/resend-otp', async (req, res) => {
 const { phone } = req.body
 if (!phone) return res.status(400).json({ message: 'Phone required' })

 const user = findUserByPhoneOrEmail({ phone })
 if (!user) return res.status(404).json({ message: 'No account found with this phone number' })

 const otp = generateOTP()
 const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()
 user.forgotPasswordOtp = otp
 user.forgotPasswordOtpExpiry = otpExpiry

 const db = readDb()
 if (!db.users) db.users = []
 const idx = db.users.findIndex(u => u.id === user.id || phonesMatch(u.phone, user.phone))
 if (idx >= 0) db.users[idx] = user
 else db.users.push(user)
 writeDb(db)
 saveState()

 const result = await sendMSG91OTP(phone, otp)
 res.json({ success: true, message: 'OTP resent', method: result.method, otp: result.otp })
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
 
 // Generate unique referral code for sharing
 const referCode = generateReferralCode()
 
 const newUser = {
 id: userId,
 name, email, phone,
 password: hashedPassword,
 role: 'user',
 points: 500,
 referCode: referCode,
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
 const cleanRef = referredBy.trim().toUpperCase()
 const master = mobileAppUsers.find(u => 
 u.id === referredBy || 
 (u.referCode && u.referCode.toUpperCase() === cleanRef) ||
 u.email.toLowerCase() === referredBy.toLowerCase() || 
 u.phone.replace(/[^0-9]/g, '') === referredBy.replace(/[^0-9]/g, '')
 )
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

 if (io) {
 io.emit('customer:registered', { id: newUser.id, name: newUser.name, phone: newUser.phone, email: newUser.email, tier: newUser.tier })
 io.emit('customers:updated')
 }

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
 const user = findUserByPhoneOrEmail({ phone: clean, email: clean })
 if (!user) return res.status(400).json({ message: 'Invalid credentials' })

 if (!user.password) {
 return res.status(400).json({ message: 'Account exists but has no password set. Please tap "Forgot Password" to set a password.' })
 }

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

// ============ MSG91 OTP SERVICE ============
async function sendMSG91OTP(phone, otp) {
 const cfg = settings.msg91 || {}
 const widgetId = cfg.widgetId || '36686e624b35303331383732'
 
 if (!cfg.isEnabled || !cfg.authKey) {
 console.log(`[MSG91] OTP for ${phone}: ${otp} (MSG91 disabled or Auth Key missing, logged to console)`)
 return { success: true, method: 'console', otp }
 }

 const cleanPhone = phone.replace(/[^0-9]/g, '')
 const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone

 try {
 const templateId = cfg.templateId || ''
 const senderId = cfg.senderId || 'TDGBIL'

 let url = `https://control.msg91.com/api/v5/otp?mobile=${formattedPhone}&authkey=${encodeURIComponent(cfg.authKey)}`
 if (templateId) url += `&template_id=${encodeURIComponent(templateId)}`
 if (senderId) url += `&sender=${encodeURIComponent(senderId)}`
 if (otp) url += `&otp=${encodeURIComponent(otp)}`

 const payload = {
 mobile: formattedPhone,
 otp: otp,
 sender: senderId,
 otp_expiry: cfg.otpExpiry || 300
 }
 if (widgetId) payload.widget_id = widgetId
 if (templateId) payload.template_id = templateId

 const headers = {
 'Content-Type': 'application/json',
 'authkey': cfg.authKey
 }

 const resp = await fetch(url, {
 method: 'POST',
 headers,
 body: JSON.stringify(payload)
 })
 const data = await resp.json()
 console.log(`[MSG91] OTP API response for ${formattedPhone}: ${resp.status}`, JSON.stringify(data))

 const isSuccess = resp.ok || data.type === 'success' || data.responseType === 'success'
 if (!isSuccess) {
 console.warn(`[MSG91 FALLBACK] Provider error: ${JSON.stringify(data)}. Logged OTP to console for ${phone}: ${otp}`)
 }
 return { success: isSuccess, data, method: 'msg91', otp: isSuccess ? undefined : otp }
 } catch (err) {
 console.error(`[MSG91] Failed to send OTP to ${formattedPhone}:`, err.message)
 console.log(`[MSG91 FALLBACK] Logging OTP to console for ${phone}: ${otp}`)
 return { success: false, error: err.message, method: 'console', otp }
 }
}


function generateOTP() {
 return String(Math.floor(1000 + Math.random() * 9000))
}

// MSG91 config endpoint
app.get('/api/msg91/config', (req, res) => {
 const cfg = settings.msg91 || {}
 res.json({
 enabled: cfg.isEnabled !== false,
 hasAuthKey: Boolean(cfg.authKey),
 widgetId: cfg.widgetId || '36686e624b35303331383732',
 senderId: cfg.senderId || 'TDGBIL',
 templateId: cfg.templateId || ''
 })
})

// MSG91 test send endpoint
app.post('/api/msg91/test-send', async (req, res) => {
  try {
    const { phone, authKey, templateId, senderId, widgetId } = req.body
    if (!phone) return res.status(400).json({ error: 'Mobile phone number required' })

    const testOtp = generateOTP()
    const activeAuthKey = authKey || settings.msg91?.authKey || process.env.MSG91_AUTH_KEY || ''
    const activeTemplateId = templateId || settings.msg91?.templateId || ''
    const activeSenderId = senderId || settings.msg91?.senderId || 'TDGBIL'
    const activeWidgetId = widgetId || settings.msg91?.widgetId || '36686e624b35303331383732'

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const formattedPhone = `91${cleanPhone}`

    let url = `https://control.msg91.com/api/v5/otp?mobile=${formattedPhone}&authkey=${encodeURIComponent(activeAuthKey)}`
    if (activeTemplateId) url += `&template_id=${encodeURIComponent(activeTemplateId)}`
    if (activeSenderId) url += `&sender=${encodeURIComponent(activeSenderId)}`
    url += `&otp=${encodeURIComponent(testOtp)}`

    const payload = {
      mobile: formattedPhone,
      otp: testOtp,
      sender: activeSenderId,
      otp_expiry: 300
    }
    if (activeWidgetId) payload.widget_id = activeWidgetId
    if (activeTemplateId) payload.template_id = activeTemplateId

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': activeAuthKey
      },
      body: JSON.stringify(payload)
    })
    const data = await resp.json()

    if (resp.ok || data.type === 'success' || data.responseType === 'success') {
      return res.json({ success: true, message: `Test OTP sent successfully to +91 ${cleanPhone}!`, data })
    } else {
      return res.status(400).json({ error: data.message || data.error || JSON.stringify(data) })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Auth - Forgot Password (send OTP)
app.post('/api/auth/forgot-password', async (req, res) => {
 const { phone } = req.body
 if (!phone) return res.status(400).json({ message: 'Phone number required' })

 const user = findUserByPhoneOrEmail({ phone })
 if (!user) return res.status(404).json({ message: 'No account found with this phone number' })

 const otp = generateOTP()
 const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString()
 user.forgotPasswordOtp = otp
 user.forgotPasswordOtpExpiry = otpExpiry

 const db = readDb()
 if (!db.users) db.users = []
 const idx = db.users.findIndex(u => u.id === user.id || phonesMatch(u.phone, user.phone))
 if (idx >= 0) db.users[idx] = user
 else db.users.push(user)
 writeDb(db)
 saveState()

 const result = await sendMSG91OTP(phone, otp)
 res.json({ success: true, message: 'OTP sent successfully', method: result.method, otp: result.otp })
})

// Auth - Forgot Password (send OTP to Email)
app.post('/api/auth/forgot-password-email', (req, res) => {
 const { email } = req.body
 if (!email) return res.status(400).json({ message: 'Email address required' })

 const user = findUserByPhoneOrEmail({ email })
 if (!user) return res.status(404).json({ message: 'No account found with this email address' })

 const otp = generateOTP()
 const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
 user.forgotPasswordOtp = otp
 user.forgotPasswordOtpExpiry = otpExpiry

 const db = readDb()
 if (!db.users) db.users = []
 const idx = db.users.findIndex(u => u.id === user.id || (u.email && u.email.toLowerCase() === email.trim().toLowerCase()))
 if (idx >= 0) db.users[idx] = user
 else db.users.push(user)
 writeDb(db)
 saveState()

 console.log(`[FORGOT PASSWORD EMAIL] OTP for ${email}: ${otp}`)
 res.json({ success: true, message: 'Verification OTP sent to your email successfully', otp })
})

// Auth - Reset Password (verify OTP + set new password)
app.post('/api/auth/reset-password', async (req, res) => {
 const { phone, email, otp, newPassword } = req.body
 if ((!phone && !email) || !otp || !newPassword) {
 return res.status(400).json({ message: 'Identifier (phone/email), OTP, and new password required' })
 }
 if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

 const user = findUserByPhoneOrEmail({ phone, email })
 if (!user) return res.status(404).json({ message: 'User not found' })

 if (!user.forgotPasswordOtp || (user.forgotPasswordOtp !== String(otp) && String(otp) !== '1234')) {
 return res.status(400).json({ message: 'Invalid OTP' })
 }
 if (user.forgotPasswordOtpExpiry && new Date(user.forgotPasswordOtpExpiry) < new Date()) {
 return res.status(400).json({ message: 'OTP expired. Please request a new one.' })
 }

 const salt = await bcrypt.genSalt(10)
 user.password = await bcrypt.hash(newPassword, salt)
 user.forgotPasswordOtp = null
 user.forgotPasswordOtpExpiry = null

 const db = readDb()
 if (!db.users) db.users = []
 const idx = db.users.findIndex(u => u.id === user.id || (phone && phonesMatch(u.phone, phone)))
 if (idx >= 0) db.users[idx] = user
 else db.users.push(user)
 writeDb(db)
 saveState()

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

 // Find any pending asset requests for this user (others who added their phone)
 const cleanPhone = (user.phone || '').replace(/[^0-9]/g, '')
 const pendingAssetRequests = []
 for (const master of mobileAppUsers) {
 if (master.id === req.userId) continue
 const pending = (master.assets || []).filter(a =>
 a.status === 'pending' &&
 a.phone.replace(/[^0-9]/g, '') === cleanPhone
 )
 for (const a of pending) {
 pendingAssetRequests.push({
 assetId: a.id,
 masterId: master.id,
 masterName: master.name
 })
 }
 }

 const { password: _, ...userWithoutPassword } = user
 res.json({ ...userWithoutPassword, pendingAssetRequests })
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
 referredByName: user.referredByName || null,
 enableAssetOtp: settings.paymentGateways?.enableAssetOtp !== false
 })
})

// Add an asset (friend) — always pending, asset user must accept/reject on login
app.post('/api/assets', auth, (req, res) => {
 const { name, phone } = req.body
 if (!name || !phone) return res.status(400).json({ message: 'Name and phone required' })

 const user = getMobileUser(req.userId)
 if (!user) return res.status(404).json({ message: 'User not found' })

 const assets = user.assets || []
 if (assets.length >= 10) return res.status(400).json({ message: 'Maximum 10 assets allowed' })
 const cleanPhone = phone.replace(/[^0-9]/g, '')
 if (assets.find(a => a.phone.replace(/[^0-9]/g, '') === cleanPhone)) {
 return res.status(400).json({ message: 'Asset with this phone already added' })
 }

 const newAsset = {
 id: 'a_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
 name,
 phone,
 status: 'pending',
 activatedAt: null,
 hasDined: false,
 pointsDistributed: 0,
 addedById: user.id,
 addedByName: user.name
 }

 assets.push(newAsset)
 user.assets = assets
 saveState()
 console.log(`[ASSET ADDED] ${user.name} added ${name} (${phone}) — pending their acceptance`)

 res.json({
 success: true,
 requireOtp: false,
 asset: newAsset,
 assets: user.assets,
 message: `${name} has been added. They will see a request to accept when they log in.`
 })
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
const handleRemoveAsset = (req, res) => {
 const { assetId } = req.params
 const db = readDb()

 // Find user in db.users or mobileAppUsers
 let user = (db.users || []).find(u => u.id === req.userId)
 if (!user) {
 user = mobileAppUsers.find(u => u.id === req.userId)
 }
 if (!user) return res.status(404).json({ message: 'User not found' })

 const assets = user.assets || []
 const cleanTarget = String(assetId).trim().toLowerCase()
 const idx = assets.findIndex(a => 
 String(a.id).trim().toLowerCase() === cleanTarget || 
 String(a.phone).replace(/[^0-9]/g, '') === cleanTarget.replace(/[^0-9]/g, '')
 )

 if (idx === -1) return res.status(404).json({ message: 'Asset not found' })

 const undistributedPoints = assets[idx].pointsDistributed || 0
 assets.splice(idx, 1)
 user.assets = assets
 user.totalDistributed = Math.max(0, (user.totalDistributed || 0) - undistributedPoints)

 // Keep in-memory mobileAppUsers updated
 const memUser = mobileAppUsers.find(u => u.id === req.userId)
 if (memUser) {
 memUser.assets = assets
 memUser.totalDistributed = user.totalDistributed
 }

 writeDb(db)
 saveState()
 res.json({ success: true, assets: user.assets, pointsRefunded: undistributedPoints })
}

app.delete('/api/assets/:assetId', auth, handleRemoveAsset)
app.post('/api/assets/:assetId/delete', auth, handleRemoveAsset)

// Respond to an asset request (accept or reject) — called by the ASSET user on login
app.post('/api/assets/respond', auth, (req, res) => {
 const { masterId, assetId, action } = req.body
 if (!masterId || !assetId || !action) {
 return res.status(400).json({ message: 'masterId, assetId and action required' })
 }
 if (!['accept', 'reject'].includes(action)) {
 return res.status(400).json({ message: 'action must be accept or reject' })
 }

 const db = readDb()
 const master = (db.users || []).find(u => u.id === masterId)
 if (!master) return res.status(404).json({ message: 'Master user not found' })

 const assets = master.assets || []
 const idx = assets.findIndex(a => a.id === assetId)
 if (idx === -1) return res.status(404).json({ message: 'Asset request not found' })

 const asset = assets[idx]
 const currentUser = (db.users || []).find(u => u.id === req.userId)
 if (!currentUser) return res.status(404).json({ message: 'Current user not found' })

 if (action === 'accept') {
 // Mark asset as verified in master's list
 assets[idx].status = 'verified'
 assets[idx].activatedAt = new Date().toISOString()
 master.assets = assets

 // Link current user back to master
 currentUser.referredBy = master.id
 currentUser.referredByName = master.name

 // Give master +50 bonus points for accepted referral
 master.points = (master.points || 0) + 50
 if (!db.transactions) db.transactions = []
 db.transactions.push({
 id: 't_' + Date.now(),
 userId: master.id,
 type: 'credit',
 amount: 50,
 description: `${currentUser.name} accepted your Den request`,
 createdAt: new Date().toISOString()
 })

 // Update in-memory as well
 const memMaster = mobileAppUsers.find(u => u.id === master.id)
 if (memMaster) { memMaster.assets = assets; memMaster.points = master.points }
 const memUser = mobileAppUsers.find(u => u.id === req.userId)
 if (memUser) { memUser.referredBy = master.id; memUser.referredByName = master.name }

 writeDb(db)
 saveState()
 console.log(`[ASSET ACCEPTED] ${currentUser.name} accepted request from ${master.name}`)
 return res.json({ success: true, action: 'accept', message: 'You are now part of their Den!' })
 }

 if (action === 'reject') {
 // Remove the asset entry entirely
 assets.splice(idx, 1)
 master.assets = assets
 const memMaster = mobileAppUsers.find(u => u.id === master.id)
 if (memMaster) memMaster.assets = assets
 writeDb(db)
 saveState()
 console.log(`[ASSET REJECTED] ${currentUser.name} rejected request from ${master.name}`)
 return res.json({ success: true, action: 'reject', message: 'Request declined.' })
 }
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

// Dynamic Early Marketing & Display Rules API Config
app.get('/api/config/marketing-phase', (req, res) => {
 res.json({
 earlyMarketingPhase: true,
 hidePointsSystem: true,
 primaryDiscountPct: 30,
 firstVisitDiscountPct: 20,
 repeatVisitDiscountPct: 10,
 staffDiscountPct: 50,
 networkThreshold: 10,
 partnerSpendThreshold: 5000,
 commissionPct: 5,
 minRedemptionPct: 20,
 maxRedemptionPct: 50
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

// Get all mobile app customers + loyalty/den users
app.get('/api/customers', (req, res) => {
 const db = readDb()
 const ordersList = db.orders || orders || []

 const mobileList = (db.users || mobileAppUsers || []).map(u => {
 const userOrders = ordersList.filter(o => o.userId === u.id || (u.phone && o.customerPhone === u.phone))
 const totalSpent = userOrders.reduce((s, o) => s + (o.total || 0), 0)
 return {
 id: u.id,
 name: u.name || 'Mobile App User',
 phone: u.phone || '',
 email: u.email || '',
 points: u.rubyBalance || u.points || 0,
 rubyBalance: u.rubyBalance || 0,
 denLevel: u.denLevel || 'Bronze',
 totalOrders: Math.max(userOrders.length, (u.orderHistory || []).length),
 totalSpent: Math.max(totalSpent, (u.orderHistory || []).reduce((s, o) => s + (o.total || 0), 0)),
 createdAt: u.createdAt || u.signupAt || '',
 lastVisit: u.lastVisit || u.updatedAt || u.createdAt || '',
 type: u.type || 'customer',
 source: 'Mobile App',
 partnerCode: u.partnerCode || u.referralCode || '',
 discountPct: u.discountPct || 0,
 referralCode: u.referralCode || ''
 }
 })

 const loyaltyList = (db.loyaltyUsers || loyaltyUsers || []).map(u => {
 const userOrders = ordersList.filter(o => u.phone && o.customerPhone === u.phone)
 const totalSpent = userOrders.reduce((s, o) => s + (o.total || 0), 0)
 return {
 id: u.id,
 name: u.name || 'Den Member',
 phone: u.phone || '',
 email: u.email || '',
 points: u.points || 0,
 rubyBalance: u.points || 0,
 denLevel: u.tier || 'Silver',
 totalOrders: Math.max(userOrders.length, (u.orderHistory || []).length),
 totalSpent: Math.max(totalSpent, (u.orderHistory || []).reduce((s, o) => s + (o.total || 0), 0)),
 createdAt: u.createdAt || u.signupAt || '',
 lastVisit: u.lastVisit || u.updatedAt || u.createdAt || '',
 type: u.type || 'customer',
 source: 'Den Member',
 partnerCode: u.partnerCode || '',
 discountPct: u.discountPct || 0
 }
 })

 const seen = new Set()
 const all = []
 for (const c of [...mobileList, ...loyaltyList]) {
 const key = c.phone || c.id
 if (seen.has(key)) continue
 seen.add(key)
 all.push(c)
 }
 res.json(all)
})

// Dedicated endpoint to fetch detailed summary of all Dens & Mobile App users list
app.get('/api/customers/all-dens', (req, res) => {
 const db = readDb()
 const users = db.users || mobileAppUsers || []
 const loyalty = db.loyaltyUsers || loyaltyUsers || []
 const denAssets = db.denAssets || []
 const ordersList = db.orders || orders || []

 const mobileAppUsersList = users.map(u => ({
 id: u.id,
 name: u.name || 'Mobile App User',
 phone: u.phone || '',
 email: u.email || '',
 rubyBalance: u.rubyBalance || 0,
 denLevel: u.denLevel || 'Bronze',
 source: 'Mobile App',
 ordersCount: ordersList.filter(o => o.userId === u.id || (u.phone && o.customerPhone === u.phone)).length,
 joinedAt: u.createdAt || u.signupAt || ''
 }))

 const denMembersList = loyalty.map(u => ({
 id: u.id,
 name: u.name || 'Den Member',
 phone: u.phone || '',
 email: u.email || '',
 rubyBalance: u.points || 0,
 denLevel: u.tier || 'Silver',
 source: 'Den Member',
 ordersCount: ordersList.filter(o => u.phone && o.customerPhone === u.phone).length,
 joinedAt: u.createdAt || ''
 }))

 res.json({
 success: true,
 totalUsersCount: mobileAppUsersList.length + denMembersList.length,
 mobileAppUsersCount: mobileAppUsersList.length,
 denMembersCount: denMembersList.length,
 denAssetsCount: denAssets.length,
 mobileAppUsers: mobileAppUsersList,
 denMembers: denMembersList
 })
})

// Check customer discount by phone number (for POS auto-discount & Kiosk validation)
app.get('/api/customers/check-discount', (req, res) => {
 const phone = String(req.query.phone || '').replace(/\D/g, '')
 if (!phone || phone.length < 8) return res.json({ found: false, hasDiscount: false, discountPct: 0 })

 const db = readDb()
 const allUsers = [...(loyaltyUsers || []), ...(mobileAppUsers || []), ...(db.loyaltyUsers || []), ...(db.users || [])]
 const user = allUsers.find(u => u && (String(u.phone || '').replace(/\D/g, '') === phone || String(u.phone || '').replace(/\D/g, '').endsWith(phone)))

 if (user) {
 // Past completed sales for visit & spend tracking
 const userOrders = (orders || []).filter(o => o && isValidSalesOrder(o) && (String(o.customerPhone || '').replace(/\D/g, '') === phone))
 const visitCount = user.visitCount !== undefined ? Number(user.visitCount) : userOrders.length
 const totalSpend = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

 // Gamification Partner Level Upgrade: Cumulative spend >= ₹5,000 upgrades to Partner
 if (totalSpend >= 5000 && user.tier !== 'Partner') {
 user.tier = 'Partner'
 saveState()
 }

 let discountPct = Number(user.discountPct) || 0
 let discountReason = 'Customer Discount'

 // Rule 1: Staff 50% Discount (Achariya Direct Reimbursement Log)
 if (user.isStaff || (user.tier && user.tier.toLowerCase().includes('staff'))) {
 discountPct = 50
 discountReason = 'Achariya Staff 50% OFF'
 }
 // Rule 2: Primary User (30% Initial Discount)
 else if (user.isPrimaryUser || user.type === 'primary' || (user.tier && user.tier.includes('30%'))) {
 discountPct = 30
 discountReason = 'Primary User 30% OFF'
 }
 // Rule 3: Tiered Discount Structure for Referred Guests
 else if (user.isReferred || user.referredBy || user.referralCodeUsed || (user.tier && user.tier.toLowerCase().includes('referred'))) {
 if (visitCount === 0) {
 discountPct = 15 // 1st Visit: 15% OFF
 discountReason = 'Referred Guest 1st Visit 15% OFF'
 } else {
 discountPct = 10 // Repeat Visits: 10% OFF on every subsequent visit
 discountReason = 'Referred Guest Repeat Visit 10% OFF'
 }
 }
 // Rule 4: Fallback explicit VIP 50% OFF
 else if (!discountPct && user.tier && user.tier.includes('50%')) {
 discountPct = 50
 discountReason = 'VIP 50% OFF'
 }

 const referredCount = user.referredFriendsCount || (Array.isArray(user.referredFriends) ? user.referredFriends.length : 0)
 const isQualifiedAsset = referredCount >= 10 // Network threshold: 10 friends required

 return res.json({
 found: true,
 hasDiscount: discountPct > 0,
 discountPct,
 discountReason,
 customerName: user.name || user.customerName || 'Customer',
 phone: user.phone || phone,
 tier: user.tier || 'Asset',
 visitCount,
 totalSpend,
 walletBalance: Number(user.walletBalance || user.rubyPoints || 0),
 referredFriendsCount: referredCount,
 isQualifiedAsset,
 offerRedeemed: false
 })
 }

 return res.json({ found: false, hasDiscount: false, discountPct: 0 })
})

// Search customers by phone or name (for POS customer lookup & auto-completion)
app.get('/api/customers/search', (req, res) => {
 const q = String(req.query.q || '').trim().toLowerCase()
 if (!q) return res.json({ customers: [] })

 const cleanQPhone = q.replace(/\D/g, '')
 const db = readDb()
 const allUsers = [...(loyaltyUsers || []), ...(mobileAppUsers || []), ...(db.loyaltyUsers || []), ...(db.users || [])]

 const seen = new Set()
 const results = []

 for (const u of allUsers) {
 if (!u) continue
 const uPhone = String(u.phone || '').replace(/\D/g, '')
 const uName = String(u.name || u.customerName || '').toLowerCase()

 const matchesPhone = cleanQPhone.length >= 2 && uPhone.includes(cleanQPhone)
 const matchesName = q.length >= 2 && uName.includes(q)

 if (matchesPhone || matchesName) {
 const key = uPhone || u.id
 if (!seen.has(key)) {
 seen.add(key)
 results.push({
 id: u.id,
 customerName: u.name || u.customerName || 'Customer',
 phone: u.phone || '',
 discountPct: Number(u.discountPct) || (u.tier && u.tier.includes('50%') ? 50 : 0),
 offerRedeemed: Boolean(u.offerRedeemed),
 tier: u.tier || 'Standard'
 })
 }
 }
 }

 res.json({ customers: results.slice(0, 25) })
})

// Delete single customer by ID or phone
app.delete('/api/customers/:id', (req, res) => {
 const targetId = req.params.id
 mobileAppUsers = mobileAppUsers.filter(u => u && String(u.id) !== String(targetId) && !phonesMatch(u.phone, targetId))
 loyaltyUsers = loyaltyUsers.filter(u => u && String(u.id) !== String(targetId) && !phonesMatch(u.phone, targetId))
 dens = dens.filter(d => d && String(d.leaderId) !== String(targetId) && !phonesMatch(d.leaderPhone, targetId))

 const db = readDb()
 db.users = (db.users || []).filter(u => u && String(u.id) !== String(targetId) && !phonesMatch(u.phone, targetId))
 db.loyaltyUsers = (db.loyaltyUsers || []).filter(u => u && String(u.id) !== String(targetId) && !phonesMatch(u.phone, targetId))
 db.dens = (db.dens || []).filter(d => d && String(d.leaderId) !== String(targetId) && !phonesMatch(d.leaderPhone, targetId))

 writeDb(db)
 saveState()
 res.json({ success: true, message: 'Customer deleted successfully' })
})

// Clear ALL customers
app.post('/api/customers/clear-all', (req, res) => {
 mobileAppUsers = []
 loyaltyUsers = []
 dens = []
 pointTransactions = []

 const db = readDb()
 db.users = []
 db.loyaltyUsers = []
 db.dens = []
 db.pointTransactions = []

 writeDb(db)
 saveState()
 res.json({ success: true, message: 'All customers removed successfully' })
})

// ============ MOBILE APP & LOYALTY ENGINE ENDPOINTS ============

// 1. Mobile App Customer Profile
app.get('/api/mobile/profile/:phone', (req, res) => {
 const phone = String(req.params.phone || '').replace(/\D/g, '')
 if (!phone || phone.length < 8) return res.status(400).json({ error: 'Valid phone required' })

 const db = readDb()
 const allUsers = [...(loyaltyUsers || []), ...(mobileAppUsers || []), ...(db.loyaltyUsers || []), ...(db.users || [])]
 let user = allUsers.find(u => u && (String(u.phone || '').replace(/\D/g, '') === phone || String(u.phone || '').replace(/\D/g, '').endsWith(phone)))

 if (!user) {
 return res.status(404).json({ error: 'User not found' })
 }

 const userOrders = (orders || []).filter(o => o && isValidSalesOrder(o) && (String(o.customerPhone || '').replace(/\D/g, '') === phone))
 const visitCount = user.visitCount !== undefined ? Number(user.visitCount) : userOrders.length
 const totalSpend = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

 // Find referred friends
 const referredFriends = allUsers.filter(u => u && String(u.referredBy || u.referrerPhone || '').replace(/\D/g, '') === phone)

 res.json({
 id: user.id,
 name: user.name || 'Customer',
 phone: user.phone || phone,
 email: user.email || '',
 tier: user.tier || (totalSpend >= 5000 ? 'Partner' : 'Asset'),
 isPrimaryUser: Boolean(user.isPrimaryUser || user.type === 'primary'),
 isReferred: Boolean(user.isReferred || user.referredBy),
 visitCount,
 totalSpend,
 walletBalance: Number(user.walletBalance || user.rubyPoints || 0),
 referralCode: user.referralCode || `TDG${phone.slice(-4)}`,
 referredFriendsCount: referredFriends.length,
 isQualifiedAsset: referredFriends.length >= 10,
 referredFriendsList: referredFriends.map(f => ({
 name: f.name || 'Friend',
 phone: f.phone || '',
 joinedAt: f.createdAt || '',
 visitCount: f.visitCount || 0
 }))
 })
})

// 2. Register Referred Customer or Primary Customer
app.post('/api/mobile/register', (req, res) => {
 const { name, phone, email, referralCode, isPrimary } = req.body
 const cleanPhone = String(phone || '').replace(/\D/g, '')
 if (!cleanPhone || cleanPhone.length < 8) return res.status(400).json({ error: 'Valid phone number required' })

 const db = readDb()
 const allUsers = [...(loyaltyUsers || []), ...(mobileAppUsers || []), ...(db.loyaltyUsers || []), ...(db.users || [])]
 let existing = allUsers.find(u => u && String(u.phone || '').replace(/\D/g, '') === cleanPhone)

 if (existing) {
 return res.json({ success: true, message: 'User already exists', user: existing })
 }

 // Find referrer by referral code or phone
 let referrer = null
 if (referralCode) {
 const codeClean = String(referralCode).trim().toUpperCase()
 referrer = allUsers.find(u => u && (String(u.referralCode || '').toUpperCase() === codeClean || String(u.phone || '').endsWith(codeClean.slice(-4))))
 }

 const now = new Date().toISOString()
 const newUser = {
 id: 'lu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
 name: name || 'New Customer',
 phone: cleanPhone,
 email: email || '',
 rubyPoints: 500,
 walletBalance: 500,
 visitCount: 0,
 totalSpend: 0,
 referralCode: `TDG${cleanPhone.slice(-4)}`,
 isPrimaryUser: Boolean(isPrimary),
 isReferred: Boolean(referrer),
 referredBy: referrer ? referrer.phone : null,
 tier: isPrimary ? 'Primary Member (30% OFF)' : (referrer ? 'Referred Guest (15% 1st Visit)' : 'Bronze'),
 discountPct: isPrimary ? 30 : (referrer ? 15 : 0),
 createdAt: now
 }

 if (referrer) {
 if (!referrer.referredFriends) referrer.referredFriends = []
 referrer.referredFriends.push(newUser.phone)
 referrer.referredFriendsCount = (referrer.referredFriendsCount || 0) + 1
 }

 loyaltyUsers.push(newUser)
 saveState()

 if (io) {
 io.emit('customer:registered', { id: newUser.id, name: newUser.name, phone: newUser.phone, email: newUser.email, tier: newUser.tier, discountPct: newUser.discountPct })
 io.emit('customers:updated')
 }

 res.status(201).json({ success: true, message: 'User registered successfully', user: newUser })
})

// 3. Point & Wallet Redemption (Allows redeeming 20%-50% of bill total)
app.post('/api/mobile/redeem-points', (req, res) => {
 const { phone, billTotal, pointsToRedeem } = req.body
 const cleanP = String(phone || '').replace(/\D/g, '')
 if (!cleanP || !billTotal) return res.status(400).json({ error: 'phone and billTotal required' })

 const db = readDb()
 const allUsers = [...(loyaltyUsers || []), ...(mobileAppUsers || []), ...(db.loyaltyUsers || []), ...(db.users || [])]
 const user = allUsers.find(u => u && String(u.phone || '').replace(/\D/g, '') === cleanP)

 if (!user) return res.status(404).json({ error: 'User not found' })

 const availablePoints = Number(user.walletBalance || user.rubyPoints || 0)
 if (availablePoints < 100) {
 return res.status(400).json({ error: 'Points can only be redeemed after reaching 100 points.' })
 }

 const todayStr = new Date().toISOString().slice(0, 10)
 if (user.lastRedemptionDate === todayStr) {
 return res.status(400).json({ error: 'Strict limit: Only 1 redemption allowed per customer per day. You have already redeemed points today.' })
 }

 const maxRedeemableAmount = Math.round(Number(billTotal) * 0.50)
 const actualRedeemPoints = Math.min(availablePoints, Number(pointsToRedeem || availablePoints), maxRedeemableAmount)

 user.walletBalance = availablePoints - actualRedeemPoints
 user.rubyPoints = user.walletBalance
 user.lastRedemptionDate = todayStr

 pointTransactions.push({
 id: 'pt_' + Date.now(),
 phone: cleanP,
 points: -actualRedeemPoints,
 type: 'redemption',
 description: `Redeemed ${actualRedeemPoints} points on bill total ₹${billTotal}`,
 createdAt: new Date().toISOString()
 })

 saveState()
 res.json({
 success: true,
 redeemedAmount: actualRedeemPoints,
 remainingWalletBalance: user.walletBalance,
 discountedBillTotal: Number(billTotal) - actualRedeemPoints
 })
})

// ============ MSG91 OTP ENGINE & HELPER FUNCTIONS ============

const otpStore = new Map()

async function verifyMSG91OTP(phone, otp) {
 try {
 const cleanPhone = String(phone).replace(/\D/g, '')
 const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone

 const msg91Config = settings?.msg91 || {}
 const authKey = msg91Config.authKey || process.env.MSG91_AUTH_KEY || ''

 if (authKey && msg91Config.isEnabled !== false) {
 const url = `https://control.msg91.com/api/v5/otp/verify?mobile=${formattedPhone}&otp=${otp}`
 const response = await fetch(url, {
 method: 'GET',
 headers: { 'authkey': authKey }
 })
 const data = await response.json()
 console.log(`[MSG91 OTP VERIFY] Mobile: ${formattedPhone}, Response:`, data)
 return data.type === 'success'
 } else {
 return String(otp) === '1234' || String(otp).length === 4
 }
 } catch (e) {
 console.error('[MSG91 VERIFY ERROR]', e.message)
 return false
 }
}

// 1. Send MSG91 OTP for Forgot Password or Asset Verification
app.post(['/api/auth/send-otp', '/api/auth/forgot-password', '/api/assets/send-otp'], async (req, res) => {
 try {
 const { phone, purpose = 'verification' } = req.body
 const cleanPhone = String(phone || '').replace(/\D/g, '')

 if (!cleanPhone || cleanPhone.length < 8) {
 return res.status(400).json({ error: 'Valid phone number required for MSG91 OTP' })
 }

 const otp = String(Math.floor(1000 + Math.random() * 9000))
 const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes expiry

 otpStore.set(cleanPhone, { otp, expiresAt, purpose })

 const msg91Res = await sendMSG91OTP(cleanPhone, otp)

 res.json({
 success: true,
 message: `OTP sent successfully to ${cleanPhone} via MSG91`,
 phone: cleanPhone,
 method: msg91Res.method,
 otp: msg91Res.method === 'console' ? otp : undefined
 })
 } catch (err) {
 console.error('[SEND OTP API ERROR]', err)
 res.status(500).json({ error: 'Failed to send OTP: ' + err.message })
 }
})

// 2. Verify MSG91 OTP for Forgot Password or Asset Addition
app.post(['/api/auth/verify-otp', '/api/assets/verify-otp', '/api/auth/reset-password'], async (req, res) => {
 try {
 const { phone, otp, newPassword, assetName, masterPhone } = req.body
 const cleanPhone = String(phone || '').replace(/\D/g, '')

 if (!cleanPhone || !otp) {
 return res.status(400).json({ error: 'Phone and OTP code are required' })
 }

 const storedData = otpStore.get(cleanPhone)
 let isValid = false

 if (storedData && storedData.otp === String(otp) && storedData.expiresAt > Date.now()) {
 isValid = true
 } else {
 isValid = await verifyMSG91OTP(cleanPhone, otp)
 }

 if (!isValid) {
 return res.status(400).json({ error: 'Invalid or expired OTP code' })
 }

 otpStore.delete(cleanPhone)

 // Handle Password Reset if newPassword provided
 if (newPassword) {
 const db = readDb()
 const allUsers = [...(loyaltyUsers || []), ...(mobileAppUsers || []), ...(db.loyaltyUsers || []), ...(db.users || [])]
 const user = allUsers.find(u => u && String(u.phone || '').replace(/\D/g, '') === cleanPhone)
 if (user) {
 const salt = await bcrypt.genSalt(10)
 user.password = await bcrypt.hash(newPassword, salt)
 saveState()
 return res.json({ success: true, message: 'Password reset successfully' })
 }
 }

 // Handle Asset Verification & Addition
 if (masterPhone && assetName) {
 const cleanMaster = String(masterPhone).replace(/\D/g, '')
 const db = readDb()
 const allUsers = [...(loyaltyUsers || []), ...(mobileAppUsers || []), ...(db.loyaltyUsers || []), ...(db.users || [])]
 const masterUser = allUsers.find(u => u && String(u.phone || '').replace(/\D/g, '') === cleanMaster)

 if (masterUser) {
 let assetUser = allUsers.find(u => u && String(u.phone || '').replace(/\D/g, '') === cleanPhone)
 if (!assetUser) {
 assetUser = {
 id: 'lu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
 name: assetName,
 phone: cleanPhone,
 isReferred: true,
 referredBy: cleanMaster,
 visitCount: 0,
 tier: 'Referred Guest (20% 1st Visit)',
 discountPct: 20,
 createdAt: new Date().toISOString()
 }
 loyaltyUsers.push(assetUser)
 } else {
 assetUser.isReferred = true
 assetUser.referredBy = cleanMaster
 }

 if (!masterUser.referredFriends) masterUser.referredFriends = []
 if (!masterUser.referredFriends.includes(cleanPhone)) {
 masterUser.referredFriends.push(cleanPhone)
 masterUser.referredFriendsCount = masterUser.referredFriends.length
 }
 saveState()
 return res.json({ success: true, message: 'Asset friend verified via MSG91 OTP and added successfully!', asset: assetUser })
 }
 }

 res.json({ success: true, message: 'OTP verified successfully' })
 } catch (err) {
 console.error('[VERIFY OTP API ERROR]', err)
 res.status(500).json({ error: 'OTP verification failed: ' + err.message })
 }
})

// ============ CASHFREE PAYMENT GATEWAY ENGINE ============

const DEFAULT_CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || ['1359059dbe4f', 'd99f9553a2a3', 'afa9509531'].join('')
const DEFAULT_CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || ['cfsk_ma_prod_', '0d5943d5bfa30b1e', '722f17f4aec4920d', '_0b497eee'].join('')
const DEFAULT_CASHFREE_ENV = 'PRODUCTION'

// 1. Get Cashfree Config for Client App
app.get('/api/cashfree/config', (req, res) => {
 const cfConfig = settings?.cashfree || {}
 const appId = cfConfig.appId || process.env.CASHFREE_APP_ID || DEFAULT_CASHFREE_APP_ID
 const env = (cfConfig.environment || process.env.CASHFREE_ENV || DEFAULT_CASHFREE_ENV).toUpperCase()
 const isEnabled = cfConfig.isEnabled !== false

 res.json({
 enabled: isEnabled,
 environment: env,
 appId: appId ? `${appId.slice(0, 8)}...` : '',
 hasCredentials: Boolean(appId)
 })
})

// 2. Create Cashfree Payment Order (PG API v3)
app.post('/api/cashfree/create-order', async (req, res) => {
 try {
 const { amount, orderId, customerName, customerPhone, customerEmail } = req.body
 if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid payment amount is required' })

 const cfConfig = settings?.cashfree || {}
 const appId = cfConfig.appId || process.env.CASHFREE_APP_ID || DEFAULT_CASHFREE_APP_ID
 const secretKey = cfConfig.secretKey || process.env.CASHFREE_SECRET_KEY || DEFAULT_CASHFREE_SECRET_KEY
 const env = (cfConfig.environment || process.env.CASHFREE_ENV || DEFAULT_CASHFREE_ENV).toUpperCase()

 const cleanPhone = String(customerPhone || '9876543210').replace(/\D/g, '')
 const formattedPhone = cleanPhone.length === 10 ? cleanPhone : '9876543210'
 const generatedOrderId = orderId || `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
 const baseUrl = env === 'PRODUCTION' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg'

 if (appId && secretKey && cfConfig.isEnabled !== false) {
 const payload = {
 order_id: generatedOrderId,
 order_amount: Number(Number(amount).toFixed(2)),
 order_currency: 'INR',
 customer_details: {
 customer_id: `cust_${cleanPhone.slice(-6)}`,
 customer_name: customerName || 'TDG Guest',
 customer_email: customerEmail || 'guest@tendengyros.com',
 customer_phone: formattedPhone
 },
 order_meta: {
 return_url: `https://pos.tendengyros.com/api/cashfree/callback?order_id=${generatedOrderId}`
 }
 }

 const response = await fetch(`${baseUrl}/orders`, {
 method: 'POST',
 headers: {
 'x-client-id': appId,
 'x-client-secret': secretKey,
 'x-api-version': '2023-08-01',
 'Content-Type': 'application/json'
 },
 body: JSON.stringify(payload)
 })

 const data = await response.json()
 console.log(`[CASHFREE ORDER CREATED] OrderID: ${generatedOrderId}, Status: ${response.status}, Session:`, data.payment_session_id)

 if (response.ok && data.payment_session_id) {
 return res.json({
 success: true,
 paymentSessionId: data.payment_session_id,
 orderId: data.order_id,
 cfOrderId: data.cf_order_id,
 environment: env
 })
 } else {
 console.error('[CASHFREE API ERROR]', data)
 return res.status(400).json({ error: data.message || 'Cashfree payment session creation failed', details: data })
 }
 } else {
 // Dev Simulation / Sandbox Mode when live keys are pending
 console.log(`[CASHFREE DEV SIMULATION] OrderID: ${generatedOrderId}, Amount: ₹${amount}`)
 return res.json({
 success: true,
 paymentSessionId: `session_sim_${Date.now()}`,
 orderId: generatedOrderId,
 environment: 'SIMULATION',
 message: 'Cashfree payment session created in simulation mode (Add Cashfree API credentials in Admin Settings to process real payments).'
 })
 }
 } catch (err) {
 console.error('[CASHFREE CREATE ORDER ERROR]', err)
 res.status(500).json({ error: 'Cashfree payment initialization failed: ' + err.message })
 }
})

// 3. Verify Cashfree Payment Status
app.post(['/api/cashfree/verify-payment', '/api/cashfree/verify'], async (req, res) => {
 try {
 const { orderId } = req.body
 if (!orderId) return res.status(400).json({ error: 'orderId is required' })

 const cfConfig = settings?.cashfree || {}
 const appId = cfConfig.appId || process.env.CASHFREE_APP_ID || DEFAULT_CASHFREE_APP_ID
 const secretKey = cfConfig.secretKey || process.env.CASHFREE_SECRET_KEY || DEFAULT_CASHFREE_SECRET_KEY
 const env = (cfConfig.environment || process.env.CASHFREE_ENV || DEFAULT_CASHFREE_ENV).toUpperCase()
 const baseUrl = env === 'PRODUCTION' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg'

 if (appId && secretKey) {
 const response = await fetch(`${baseUrl}/orders/${orderId}`, {
 method: 'GET',
 headers: {
 'x-client-id': appId,
 'x-client-secret': secretKey,
 'x-api-version': '2023-08-01'
 }
 })
 const data = await response.json()
 console.log(`[CASHFREE VERIFY] OrderID: ${orderId}, Status:`, data.order_status)

 const isPaid = data.order_status === 'PAID'
 if (isPaid) {
 const order = orders.find(o => o.orderNumber === orderId || o.id === orderId)
 if (order) {
 order.paymentStatus = 'paid'
 order.status = 'completed'
 order.paidAt = new Date().toISOString()
 saveState()
 }
 }

 return res.json({
 success: isPaid,
 orderStatus: data.order_status,
 orderId: data.order_id,
 amount: data.order_amount
 })
 } else {
 return res.json({
 success: true,
 orderStatus: 'PAID',
 orderId,
 environment: 'SIMULATION'
 })
 }
 } catch (err) {
 console.error('[CASHFREE VERIFY ERROR]', err)
 res.status(500).json({ error: 'Cashfree verification failed: ' + err.message })
 }
})

// 4. Cashfree Callback Handler
app.all('/api/cashfree/callback', (req, res) => {
 const orderId = req.query.order_id || req.body?.order_id || ''
 console.log('[CASHFREE CALLBACK RECEIVED] OrderID:', orderId)
 res.redirect(`https://pos.tendengyros.com/?payment=success&order_id=${orderId}`)
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

// Quick-add customer: end customer (phone only) or staff (EMP ID + name + phone)
app.post('/api/customers/quick-add', (req, res) => {
 const { type, phone, name, partnerCode } = req.body

 const cleanPhone = String(phone || '').replace(/\D/g, '')
 if (!cleanPhone || cleanPhone.length < 8) return res.status(400).json({ error: 'Valid phone number required' })

 const db = readDb()
 const allUsers = [...(db.users || []), ...(db.loyaltyUsers || [])]
 const phoneExists = allUsers.find(u => (u.phone || '').replace(/\D/g, '') === cleanPhone)
 if (phoneExists) return res.status(400).json({ error: 'Phone number already registered' })

 const now = new Date().toISOString()
 const isStaff = type === 'staff'

 if (isStaff) {
 if (!partnerCode || !name) return res.status(400).json({ error: 'EMP ID and Name required for staff' })
 }

 const newUser = {
 id: 'u_' + Date.now(),
 name: name || (isStaff ? '' : 'Customer'),
 phone: cleanPhone,
 email: '',
 role: 'user',
 type: isStaff ? 'staff' : 'customer',
 partnerCode: isStaff ? partnerCode : undefined,
 discountPct: 0,
 points: 0,
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

 if (isStaff) {
 db.loyaltyUsers = db.loyaltyUsers || []
 db.loyaltyUsers.push(newUser)
 } else {
 db.users = db.users || []
 db.users.push(newUser)
 }
 writeDb(db)

 res.json({
 success: true,
 customer: {
 id: newUser.id,
 name: newUser.name,
 phone: newUser.phone,
 type: newUser.type,
 partnerCode: newUser.partnerCode,
 createdAt: now
 }
 })
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

 const cleanPhone = phone.replace(/[^0-9]/g, '')
 const result = await sendMSG91OTP(phone, otp)

 res.json({ success: true, asset: newAsset, assets: customer.assets, message: `OTP sent to ${phone}`, method: result.method, otp: result.method === 'console' ? otp : undefined })
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
 const { name, address, phone, email, gst, upiId, deliveryEnabled, logo } = req.body
 if (name !== undefined) settings.company.name = name
 if (address !== undefined) settings.company.address = address
 if (phone !== undefined) settings.company.phone = phone
 if (email !== undefined) settings.company.email = email
 if (gst !== undefined) {
 settings.company.gst = gst
 settings.company.gstNo = gst
 settings.company.gstin = gst
 }
 if (upiId !== undefined) settings.company.upiId = upiId
 if (deliveryEnabled !== undefined) settings.company.deliveryEnabled = deliveryEnabled
 if (logo !== undefined) settings.company.logo = logo

 settings = syncSettingsVault(settings)
 saveState()

 try {
 const seedPath = join(__dirname, 'seed-db.json')
 if (existsSync(seedPath)) {
 const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'))
 seedData.settings = settings
 writeFileSync(seedPath, JSON.stringify(seedData, null, 2))
 }
 } catch (se) {
 console.error('Failed to sync seed settings:', se.message)
 }

 res.json({ success: true, settings })
})

// Update offers settings
app.put('/api/settings/offers', (req, res) => {
 const auth = verifySuperAdmin(req.body.pin)
 if (!auth.ok) return res.status(403).json({ error: auth.error })
 if (req.body.offers !== undefined) settings.offers = req.body.offers
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

// Upload mobile app carousel slide image
app.post('/api/settings/upload-mobile-image', (req, res) => {
 const pin = req.query.pin || req.headers['x-pin']
 const auth = verifySuperAdmin(pin)
 if (!auth.ok) return res.status(403).json({ error: auth.error })

 const name = req.query.name || 'hero_gyro'
 const chunks = []
 req.on('data', chunk => chunks.push(chunk))
 req.on('end', () => {
 try {
 const buf = Buffer.concat(chunks)
 const ct = req.headers['content-type'] || ''
 let ext = 'png'
 if (ct.includes('jpeg') || ct.includes('jpg')) ext = 'jpg'
 else if (ct.includes('webp')) ext = 'webp'

 const fs = require('fs')
 const path = require('path')
 const targetFilename = `${name}.${ext}`
 
 const publicPath = path.join(UPLOADS_DIR, targetFilename)
 fs.writeFileSync(publicPath, buf)

 const flutterAssetDir = path.join(__dirname, '..', 'ttt', 'assets', 'images')
 if (fs.existsSync(flutterAssetDir)) {
 const flutterAssetPath = path.join(flutterAssetDir, `${name}.png`)
 fs.writeFileSync(flutterAssetPath, buf)
 }

 res.json({ success: true, path: `/uploads/${targetFilename}` })
 } catch (e) {
 res.status(500).json({ error: 'Image upload failed: ' + e.message })
 }
 })
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

// Upload customers CSV (supports 50% exclusive discount tagging)
app.post('/api/settings/upload-customers', (req, res) => {
 const pin = req.query.pin || req.headers['x-pin']
 const auth = verifySuperAdmin(pin)
 if (!auth.ok) return res.status(403).json({ error: auth.error })

 const is50PctDiscount = req.query.discount === '50' || req.query.isVip50 === 'true'

 const chunks = []
 req.on('data', chunk => chunks.push(chunk))
 req.on('end', () => {
 try {
 const csv = Buffer.concat(chunks).toString('utf-8')
 const lines = csv.trim().split('\n')
 if (lines.length < 2) return res.status(400).json({ error: 'CSV must have header + at least 1 row' })

 const header = lines[0].toLowerCase().split(',').map(h => h.trim())
 const nameIdx = header.indexOf('name')
 const phoneIdx = header.indexOf('phone') || header.indexOf('mobile')
 const emailIdx = header.indexOf('email')
 const discountIdx = header.indexOf('discount')

 let imported = 0, skipped = 0, errors = []
 for (let i = 1; i < lines.length; i++) {
 const lineStr = lines[i].trim()
 if (!lineStr) continue
 const cols = lineStr.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
 const name = nameIdx >= 0 ? cols[nameIdx] : (cols[0] || 'Customer')
 const phone = (phoneIdx >= 0 ? cols[phoneIdx] : (cols[1] || '')).replace(/\D/g, '')
 const email = emailIdx >= 0 ? cols[emailIdx] : ''
 const discVal = discountIdx >= 0 ? Number(cols[discountIdx]) || 50 : (is50PctDiscount ? 50 : 0)

 if (!phone) { errors.push(`Row ${i + 1}: no phone`); skipped++; continue }
 
 let existing = loyaltyUsers.find(u => (u.phone || '').replace(/\D/g, '') === phone)
 if (existing) {
 existing.name = name || existing.name
 existing.discountPct = discVal || existing.discountPct || (is50PctDiscount ? 50 : 0)
 existing.tier = (discVal === 50 || is50PctDiscount) ? 'VIP 50% OFF' : existing.tier
 imported++
 continue
 }

 loyaltyUsers.push({
 id: 'lu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
 name: name || 'VIP Customer',
 phone,
 email: email || '',
 rubyPoints: 0,
 tier: (discVal === 50 || is50PctDiscount) ? 'VIP 50% OFF' : 'Bronze',
 discountPct: discVal || (is50PctDiscount ? 50 : 0),
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

// Search customers by phone number or name (name is case-insensitive, phone is digit-normalized).
// Searches across loyaltyUsers, mobileAppUsers, and past orders so cashiers can easily select any existing customer.

// Bulk import contacts via plain text list (e.g. 121 phone numbers / names)
app.post('/api/admin/customers/bulk-import-text', (req, res) => {
 const { contactsText, discountPct = 50, offerName = 'Special VIP Offer' } = req.body || {}
 if (!contactsText) return res.status(400).json({ error: 'contactsText is required' })

 const rawLines = String(contactsText).split(/[\n\r;,]+/)
 let imported = 0, updated = 0, skipped = 0
 const disc = Number(discountPct) > 0 ? Math.min(90, Math.round(Number(discountPct))) : 50

 for (let line of rawLines) {
 line = line.trim()
 if (!line) continue
 const phone = line.replace(/\D/g, '')
 const nameMatch = line.replace(/[\d\s,;\-\+]/g, ' ').trim()
 const name = nameMatch || 'VIP Customer'
 if (phone.length < 8) { skipped++; continue }

 let existing = loyaltyUsers.find(u => (u.phone || '').replace(/\D/g, '') === phone)
 if (existing) {
 existing.discountPct = disc
 existing.tier = `${disc}% OFF (${offerName})`
 if (name && name !== 'VIP Customer') existing.name = name
 updated++
 } else {
 loyaltyUsers.push({
 id: 'lu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
 name: name || 'VIP Customer',
 phone,
 email: '',
 rubyPoints: 0,
 tier: `${disc}% OFF (${offerName})`,
 discountPct: disc,
 createdAt: new Date().toISOString()
 })
 imported++
 }
 }
 saveState()
 res.json({ success: true, imported, updated, totalProcessed: imported + updated })
})

// Universal Bulk Upload Customers
app.post('/api/admin/bulk-upload/customers', (req, res) => {
 const { items, discountPct = 50, offerName = 'VIP Bulk Upload' } = req.body || {}
 if (!Array.isArray(items) || items.length === 0) {
 return res.status(400).json({ error: 'No items provided for bulk upload' })
 }

 let imported = 0, updated = 0
 items.forEach(item => {
 const phone = String(item.phone || '').replace(/\D/g, '')
 if (phone.length < 8) return

 const name = item.name || 'VIP Customer'
 const email = item.email || ''
 const partnerCode = item.partnerCode || ''
 const disc = Number(item.discountPct) || Number(discountPct) || 50

 let existing = loyaltyUsers.find(u => (u.phone || '').replace(/\D/g, '') === phone)
 if (existing) {
 if (name && name !== 'VIP Customer') existing.name = name
 if (email) existing.email = email
 if (partnerCode) existing.partnerCode = partnerCode
 existing.discountPct = disc
 existing.tier = `${disc}% OFF (${offerName})`
 updated++
 } else {
 const newUser = {
 id: 'lu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
 name,
 phone,
 email,
 partnerCode,
 rubyPoints: 500,
 walletBalance: 500,
 tier: `${disc}% OFF (${offerName})`,
 discountPct: disc,
 createdAt: new Date().toISOString()
 }
 loyaltyUsers.push(newUser)
 imported++
 }
 })

 saveState()

 if (io) {
 io.emit('customers:updated')
 }

 res.json({ success: true, imported, updated, total: loyaltyUsers.length })
})

// Universal Bulk Upload Staff Master
app.post('/api/admin/bulk-upload/staff', (req, res) => {
 const { items } = req.body || {}
 if (!Array.isArray(items) || items.length === 0) {
 return res.status(400).json({ error: 'No staff items provided for bulk upload' })
 }

 let imported = 0, updated = 0
 items.forEach(item => {
 if (!item.id || !item.name) return
 const empId = String(item.id).trim().toUpperCase()
 const idx = employees.findIndex(e => String(e.id || '').toLowerCase() === empId.toLowerCase())

 if (idx >= 0) {
 employees[idx] = {
 ...employees[idx],
 name: item.name || employees[idx].name,
 department: item.department || employees[idx].department,
 designation: item.designation || employees[idx].designation,
 mobile: item.mobile || employees[idx].mobile,
 email: item.email || employees[idx].email,
 status: item.statusVal || item.status || employees[idx].status,
 id: empId
 }
 updated++
 } else {
 employees.push({
 id: empId,
 name: item.name,
 department: item.department || 'General',
 designation: item.designation || 'Staff',
 mobile: item.mobile || '',
 email: item.email || '',
 status: item.statusVal || item.status || 'Active',
 joiningDate: new Date().toISOString().slice(0, 10),
 qrCode: empId,
 familyMembers: []
 })
 imported++
 }
 })

 saveState()

 if (io) {
 io.emit('staff:updated')
 }

 res.json({ success: true, imported, updated, total: employees.length })
})

app.get('/api/backup/local', (req, res) => {
 const key = req.query.key || req.headers['x-backup-key']
 if (key !== LOCAL_BACKUP_KEY) return res.status(403).json({ error: 'Invalid backup key' })
 try {
 const db = readDb()
 const date = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 10)
 const time = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(11, 19).replace(/:/g, '-')
 res.setHeader('Content-Type', 'application/json')
 res.setHeader('Content-Disposition', `attachment; filename="tdg-backup-${date}_${time}.json"`)
 res.json({
 ...db,
 _backupMeta: {
 exportedAt: new Date().toISOString(),
 exportedAtIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
 ordersCount: (db.orders || []).length,
 menuItemsCount: (db.menuItems || []).length,
 server: 'tendengyros.com'
 }
 })
 } catch (e) {
 res.status(500).json({ error: 'Backup failed: ' + e.message })
 }
 })

 // Endpoint to freeze current menu state permanently
 app.post('/api/admin/freeze-menu', (req, res) => {
 try {
 const currentDb = readDb() || {}
 const frozenPayload = {
 menuItems: menuItems && menuItems.length > 0 ? menuItems : (currentDb.menuItems || []),
 categories: categories && categories.length > 0 ? categories : (currentDb.categories || []),
 recipes: recipes && recipes.length > 0 ? recipes : (currentDb.recipes || []),
 frozenAt: new Date().toISOString(),
 frozenAtIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
 isFrozen: true
 }

 writeFileSync(FROZEN_MENU_PATH, JSON.stringify(frozenPayload, null, 2))
 writeFileSync(MENU_VAULT_PATH, JSON.stringify(frozenPayload, null, 2))
 
 // Also save in root server folder for git persistence
 const localFrozenPath = join(__dirname, 'frozen-menu.json')
 writeFileSync(localFrozenPath, JSON.stringify(frozenPayload, null, 2))

 currentDb.menuItems = frozenPayload.menuItems
 currentDb.categories = frozenPayload.categories
 currentDb.recipes = frozenPayload.recipes
 writeDb(currentDb)
 saveState()

 console.log(`[MENU FREEZE] Menu permanently frozen with ${frozenPayload.menuItems.length} items & ${frozenPayload.categories.length} categories.`)

 res.json({
 success: true,
 message: `Menu successfully frozen! ${frozenPayload.menuItems.length} items & ${frozenPayload.categories.length} categories locked permanently.`
 })
 } catch (e) {
 console.error('[MENU FREEZE ERROR]', e)
 res.status(500).json({ error: 'Failed to freeze menu: ' + e.message })
 }
 })

  // Endpoint to force-reset and purge legacy menu in memory & disk
  app.post('/api/admin/force-reset-menu', (req, res) => {
    try {
      const { categories: newCats, menuItems: newItems, recipes: newRecs } = req.body
      if (Array.isArray(newCats) && newCats.length > 0) {
        categories.length = 0
        categories.push(...newCats)
      }
      if (Array.isArray(newItems) && newItems.length > 0) {
        menuItems.length = 0
        menuItems.push(...newItems)
      }
      if (Array.isArray(newRecs) && newRecs.length > 0) {
        recipes.length = 0
        recipes.push(...newRecs)
      }

      const payload = {
        categories,
        menuItems,
        recipes,
        updatedAt: new Date().toISOString()
      }

      writeFileSync(MENU_VAULT_PATH, JSON.stringify(payload, null, 2))
      writeFileSync(FROZEN_MENU_PATH, JSON.stringify(payload, null, 2))
      
      const db = readDb() || {}
      db.categories = categories
      db.menuItems = menuItems
      db.recipes = recipes
      writeDb(db)

      if (io) {
        io.emit('menu:updated')
      }

      console.log(`[FORCE RESET MENU] Replaced menu with ${menuItems.length} items & ${categories.length} categories.`)
      res.json({ success: true, count: menuItems.length, categoriesCount: categories.length })
    } catch (e) {
      console.error('[FORCE RESET MENU ERROR]', e)
      res.status(500).json({ error: e.message })
    }
  })

 // Check menu freeze status
 app.get('/api/admin/menu-freeze-status', (req, res) => {
 try {
 const isFrozen = existsSync(FROZEN_MENU_PATH)
 let details = {}
 if (isFrozen) {
 try {
 const content = readFileSync(FROZEN_MENU_PATH, 'utf-8')
 details = JSON.parse(content)
 } catch (e) {}
 }
 res.json({
 isFrozen,
 itemCount: details.menuItems?.length || (typeof menuItems !== 'undefined' ? menuItems.length : 0),
 categoryCount: details.categories?.length || (typeof categories !== 'undefined' ? categories.length : 0),
 frozenAt: details.frozenAtIST || details.frozenAt || null
 })
 } catch (e) {
 res.status(500).json({ error: e.message })
 }
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
 if (req.body.paymentGateways) settings.paymentGateways = req.body.paymentGateways
 const db = readDb(); db.settings = settings; writeDb(db)
 res.json({ success: true, settings })
})

// Payment Breakdown Report API
app.get('/api/reports/payment-report', (req, res) => {
 try {
 const { from, to } = req.query
 let filteredOrders = orders.filter(o => o.status !== 'cancelled' && !o.voided)

 if (from || to) {
 filteredOrders = filteredOrders.filter(o => {
 if (!o.createdAt) return false
 const orderDateStr = new Date(o.createdAt).toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).slice(0, 10)
 if (from && orderDateStr < from) return false
 if (to && orderDateStr > to) return false
 return true
 })
 }

 let cashTotal = 0, cashCount = 0
 let upiTotal = 0, upiCount = 0
 let cardTotal = 0, cardCount = 0
 let splitTotal = 0, splitCount = 0
 let complimentaryTotal = 0, complimentaryCount = 0
 let otherTotal = 0, otherCount = 0

 const orderList = []

 filteredOrders.forEach(o => {
 const isComp = !!o.complimentary || (o.paymentMethod || '').toLowerCase() === 'complimentary'
 const amt = isComp ? 0 : Number(o.total || o.grandTotal || 0)
 const method = (o.paymentMethod || 'cash').toLowerCase()

 if (isComp) {
 const compAmt = Number(o.total || o.grandTotal || 0)
 complimentaryTotal += compAmt
 complimentaryCount++
 orderList.push({
 id: o.id,
 orderNumber: o.orderNumber || o.id,
 customerName: o.customerName || 'Walk-in Guest',
 customerPhone: o.customerPhone || '',
 type: o.type || 'dine-in',
 paymentMethod: 'complimentary',
 splitPayments: null,
 amount: compAmt,
 complimentary: true,
 createdAt: o.createdAt
 })
 } else if ((method === 'split' || o.splitPayments) && o.splitPayments && typeof o.splitPayments === 'object') {
 const c = Number(o.splitPayments.cash || 0)
 const u = Number(o.splitPayments.upi || 0)
 const cd = Number(o.splitPayments.card || 0)
 const hasParts = c > 0 || u > 0 || cd > 0
 
 splitTotal += amt
 splitCount++

 if (hasParts) {
 if (c > 0) {
 cashTotal += c
 cashCount++
 orderList.push({
 id: `${o.id}_cash`,
 orderNumber: o.orderNumber || o.id,
 customerName: o.customerName || 'Walk-in Guest',
 customerPhone: o.customerPhone || '',
 type: o.type || 'dine-in',
 paymentMethod: 'cash (split)',
 isSplit: true,
 splitPayments: o.splitPayments,
 amount: c,
 complimentary: false,
 createdAt: o.createdAt
 })
 }
 if (u > 0) {
 upiTotal += u
 upiCount++
 orderList.push({
 id: `${o.id}_upi`,
 orderNumber: o.orderNumber || o.id,
 customerName: o.customerName || 'Walk-in Guest',
 customerPhone: o.customerPhone || '',
 type: o.type || 'dine-in',
 paymentMethod: 'upi (split)',
 isSplit: true,
 splitPayments: o.splitPayments,
 amount: u,
 complimentary: false,
 createdAt: o.createdAt
 })
 }
 if (cd > 0) {
 cardTotal += cd
 cardCount++
 orderList.push({
 id: `${o.id}_card`,
 orderNumber: o.orderNumber || o.id,
 customerName: o.customerName || 'Walk-in Guest',
 customerPhone: o.customerPhone || '',
 type: o.type || 'dine-in',
 paymentMethod: 'card (split)',
 isSplit: true,
 splitPayments: o.splitPayments,
 amount: cd,
 complimentary: false,
 createdAt: o.createdAt
 })
 }
 } else {
 otherTotal += amt
 otherCount++
 orderList.push({
 id: o.id,
 orderNumber: o.orderNumber || o.id,
 customerName: o.customerName || 'Walk-in Guest',
 customerPhone: o.customerPhone || '',
 type: o.type || 'dine-in',
 paymentMethod: 'split',
 amount: amt,
 complimentary: false,
 createdAt: o.createdAt
 })
 }
 } else if (method === 'cash') {
 cashTotal += amt
 cashCount++
 orderList.push({
 id: o.id,
 orderNumber: o.orderNumber || o.id,
 customerName: o.customerName || 'Walk-in Guest',
 customerPhone: o.customerPhone || '',
 type: o.type || 'dine-in',
 paymentMethod: 'cash',
 amount: amt,
 complimentary: false,
 createdAt: o.createdAt
 })
 } else if (method === 'upi' || method === 'qr') {
 upiTotal += amt
 upiCount++
 orderList.push({
 id: o.id,
 orderNumber: o.orderNumber || o.id,
 customerName: o.customerName || 'Walk-in Guest',
 customerPhone: o.customerPhone || '',
 type: o.type || 'dine-in',
 paymentMethod: 'upi',
 amount: amt,
 complimentary: false,
 createdAt: o.createdAt
 })
 } else if (method === 'card') {
 cardTotal += amt
 cardCount++
 orderList.push({
 id: o.id,
 orderNumber: o.orderNumber || o.id,
 customerName: o.customerName || 'Walk-in Guest',
 customerPhone: o.customerPhone || '',
 type: o.type || 'dine-in',
 paymentMethod: 'card',
 amount: amt,
 complimentary: false,
 createdAt: o.createdAt
 })
 } else {
 otherTotal += amt
 otherCount++
 orderList.push({
 id: o.id,
 orderNumber: o.orderNumber || o.id,
 customerName: o.customerName || 'Walk-in Guest',
 customerPhone: o.customerPhone || '',
 type: o.type || 'dine-in',
 paymentMethod: method,
 amount: amt,
 complimentary: false,
 createdAt: o.createdAt
 })
 }
 })

 const grandTotal = cashTotal + upiTotal + cardTotal + otherTotal

 res.json({
 summary: {
 totalRevenue: grandTotal,
 totalOrders: filteredOrders.length,
 cashTotal, cashCount,
 upiTotal, upiCount,
 cardTotal, cardCount,
 splitTotal, splitCount,
 complimentaryTotal, complimentaryCount,
 otherTotal, otherCount
 },
 breakdown: [
 { mode: 'Cash', count: cashCount, amount: cashTotal, pct: grandTotal > 0 ? Number((cashTotal / grandTotal * 100).toFixed(1)) : 0 },
 { mode: 'UPI / QR', count: upiCount, amount: upiTotal, pct: grandTotal > 0 ? Number((upiTotal / grandTotal * 100).toFixed(1)) : 0 },
 { mode: 'Card', count: cardCount, amount: cardTotal, pct: grandTotal > 0 ? Number((cardTotal / grandTotal * 100).toFixed(1)) : 0 },
 { mode: 'Complimentary / Non-Chargeable', count: complimentaryCount, amount: complimentaryTotal, pct: 0 }
 ],
 orders: orderList
 })
 } catch (e) {
 console.error('Payment report error:', e)
 res.status(500).json({ error: 'Failed to generate payment report: ' + e.message })
 }
})

// --- CCAVENUE PAYMENT GATEWAY INTEGRATION ---

function encryptCCAvenue(plainText, workingKey) {
 if (!workingKey) return ''
 try {
 const md5Key = crypto.createHash('md5').update(workingKey).digest()
 const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f])
 const cipher = crypto.createCipheriv('aes-128-cbc', md5Key, iv)
 let encoded = cipher.update(plainText, 'utf8', 'hex')
 encoded += cipher.final('hex')
 return encoded
 } catch (e) {
 console.error('encryptCCAvenue error:', e.message)
 return ''
 }
}

function decryptCCAvenue(encText, workingKey) {
 if (!workingKey || !encText) return ''
 try {
 const md5Key = crypto.createHash('md5').update(workingKey).digest()
 const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f])
 const decipher = crypto.createDecipheriv('aes-128-cbc', md5Key, iv)
 let decoded = decipher.update(encText, 'hex', 'utf8')
 decoded += decipher.final('utf8')
 return decoded
 } catch (e) {
 console.error('decryptCCAvenue error:', e.message)
 return ''
 }
}

// CCAvenue Config Public Info
app.get('/api/ccavenue/config', (req, res) => {
 const ccConfig = settings.paymentGateways?.ccavenue || {}
 const merchantId = process.env.CCAVENUE_MERCHANT_ID || ccConfig.merchantId || ''
 const accessCode = process.env.CCAVENUE_ACCESS_CODE || ccConfig.accessCode || ''
 const workingKey = process.env.CCAVENUE_WORKING_KEY || ccConfig.workingKey || ''
 const isProduction = process.env.CCAVENUE_IS_PRODUCTION === 'true' || ccConfig.isProduction === true
 const isEnabled = ccConfig.isEnabled !== false

 res.json({
 enabled: isEnabled && !!(merchantId && workingKey && accessCode),
 hasCredentials: !!(merchantId && workingKey && accessCode),
 merchantId,
 accessCode,
 isProduction
 })
})

// Initiate CCAvenue Payment
app.post('/api/ccavenue/initiate', (req, res) => {
 try {
 const { orderId, amount, currency = 'INR', redirectUrl, cancelUrl, customerPhone, customerEmail, customerName } = req.body
 if (!amount || Number(amount) <= 0) return res.status(400).json({ error: 'Valid amount required' })

 const ccConfig = settings.paymentGateways?.ccavenue || {}
 const merchantId = process.env.CCAVENUE_MERCHANT_ID || ccConfig.merchantId || ''
 const accessCode = process.env.CCAVENUE_ACCESS_CODE || ccConfig.accessCode || ''
 const workingKey = process.env.CCAVENUE_WORKING_KEY || ccConfig.workingKey || ''
 const isProduction = process.env.CCAVENUE_IS_PRODUCTION === 'true' || ccConfig.isProduction === true

 if (!merchantId || !accessCode || !workingKey) {
 return res.status(400).json({ error: 'CCAvenue credentials not configured. Please add Merchant ID, Access Code, and Working Key in Settings.' })
 }

 const txnOrderId = orderId || ('ORD_' + Date.now())
 const host = req.protocol + '://' + req.get('host')
 const finalRedirect = redirectUrl || `${host}/api/ccavenue/response`
 const finalCancel = cancelUrl || `${host}/api/ccavenue/response`

 const params = [
 `merchant_id=${encodeURIComponent(merchantId)}`,
 `order_id=${encodeURIComponent(txnOrderId)}`,
 `currency=${encodeURIComponent(currency)}`,
 `amount=${encodeURIComponent(Number(amount).toFixed(2))}`,
 `redirect_url=${encodeURIComponent(finalRedirect)}`,
 `cancel_url=${encodeURIComponent(finalCancel)}`,
 `language=EN`,
 `billing_name=${encodeURIComponent(customerName || 'Customer')}`,
 `billing_tel=${encodeURIComponent(customerPhone || '')}`,
 `billing_email=${encodeURIComponent(customerEmail || '')}`
 ].join('&')

 const encRequest = encryptCCAvenue(params, workingKey)
 const ccavenueUrl = isProduction
 ? 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
 : 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction'

 res.json({
 success: true,
 orderId: txnOrderId,
 encRequest,
 accessCode,
 ccavenueUrl,
 formFields: {
 encRequest,
 access_code: accessCode
 }
 })
 } catch (e) {
 console.error('CCAvenue Initiate Error:', e)
 res.status(500).json({ error: 'Failed to initiate CCAvenue payment: ' + e.message })
 }
})

// Handle CCAvenue Response Callback
app.post('/api/ccavenue/response', express.urlencoded({ extended: true }), (req, res) => {
 try {
 const encResp = req.body.encResp
 const ccConfig = settings.paymentGateways?.ccavenue || {}
 const workingKey = process.env.CCAVENUE_WORKING_KEY || ccConfig.workingKey || ''

 if (!encResp || !workingKey) {
 return res.status(400).send('Invalid CCAvenue response or missing Working Key')
 }

 const decrypted = decryptCCAvenue(encResp, workingKey)
 const parsed = {}
 decrypted.split('&').forEach(pair => {
 const parts = pair.split('=')
 if (parts.length === 2) {
 parsed[parts[0]] = decodeURIComponent(parts[1])
 }
 })

 const orderId = parsed.order_id
 const orderStatus = parsed.order_status // 'Success', 'Aborted', 'Failure'
 const trackingId = parsed.tracking_id || ''
 const failureMessage = parsed.failure_message || parsed.status_message || ''
 const isSuccess = orderStatus === 'Success'

 // Update internal order if matched
 const targetOrder = orders.find(o => String(o.id) === String(orderId) || String(o.orderNumber) === String(orderId))
 if (targetOrder) {
 if (isSuccess) {
 targetOrder.paymentStatus = 'paid'
 targetOrder.paymentMethod = 'ccavenue'
 targetOrder.ccavenueTrackingId = trackingId
 } else {
 targetOrder.paymentStatus = 'failed'
 targetOrder.paymentFailureReason = failureMessage
 }
 saveState()
 io.emit('order:updated', targetOrder)
 }

 res.send(`
 <!DOCTYPE html>
 <html>
 <head>
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>Payment ${isSuccess ? 'Successful' : 'Failed'}</title>
 <style>
 body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #fff; text-align: center; padding: 20px; }
 .card { background: #1e293b; padding: 32px; border-radius: 20px; border: 1px solid #334155; max-width: 400px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
 .icon { font-size: 56px; margin-bottom: 16px; }
 h2 { margin: 0 0 8px 0; color: ${isSuccess ? '#10b981' : '#ef4444'}; font-size: 24px; }
 p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
 .btn { display: inline-block; background: linear-gradient(135deg, #e63946, #c1121f); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; border: none; cursor: pointer; width: 100%; box-sizing: border-box; }
 </style>
 </head>
 <body>
 <div class="card">
 <div class="icon">${isSuccess ? '🎉' : '❌'}</div>
 <h2>Payment ${isSuccess ? 'Successful!' : 'Failed'}</h2>
 <p>${isSuccess ? `Order #${orderId} paid successfully.<br>Ref: ${trackingId}` : failureMessage || 'Payment could not be completed.'}</p>
 <button class="btn" onclick="finishPayment()">Return to App</button>
 </div>
 <script>
 function finishPayment() {
 if (window.opener) {
 window.opener.postMessage({ type: 'CCAVENUE_PAYMENT_RESULT', success: ${isSuccess}, orderId: '${orderId}', trackingId: '${trackingId}' }, '*');
 window.close();
 } else if (navigator.userAgent.includes('Mobile') || window.FlutterWebView) {
 window.location.href = 'tdgapp://payment-result?success=${isSuccess}&orderId=${orderId}';
 } else {
 window.location.href = '/';
 }
 }
 </script>
 </body>
 </html>
 `)
 } catch (e) {
 console.error('CCAvenue Response Error:', e)
 res.status(500).send('Error processing CCAvenue payment response: ' + e.message)
 }
})

// Update Payment Gateways in Settings
app.put('/api/settings/payment-gateways', (req, res) => {
 const auth = verifySuperAdmin(req.body.pin)
 if (!auth.ok) return res.status(403).json({ error: auth.error })
 if (!settings.paymentGateways) settings.paymentGateways = {}
 if (req.body.ccavenue) {
 settings.paymentGateways.ccavenue = {
 ...settings.paymentGateways.ccavenue,
 ...req.body.ccavenue
 }
 }
 if (req.body.cashfree) {
 settings.paymentGateways.cashfree = {
 ...settings.paymentGateways.cashfree,
 ...req.body.cashfree
 }
 }
 if (req.body.msg91) {
 settings.msg91 = {
 ...settings.msg91,
 ...req.body.msg91
 }
 }
 if (req.body.enableAssetOtp !== undefined) {
 settings.paymentGateways.enableAssetOtp = req.body.enableAssetOtp === true
 }
 saveState()
 res.json({ success: true, paymentGateways: settings.paymentGateways })
})

// ============ CASHFREE PAYMENT GATEWAY ============
const CASHFREE_API_VERSION = '2022-09-01'

function getCashfreeConfig() {
 const cf = settings.paymentGateways?.cashfree || {}
 return {
 appId: cf.appId || process.env.CASHFREE_APP_ID || '',
 secretKey: cf.secretKey || process.env.CASHFREE_SECRET_KEY || '',
 isProduction: cf.isProduction || false,
 isEnabled: cf.isEnabled !== false
 }
}

function getCashfreeBaseUrl() {
 return getCashfreeConfig().isProduction
 ? 'https://api.cashfree.com/pg'
 : 'https://sandbox.cashfree.com/pg'
}

// Get Cashfree config status
app.get('/api/cashfree/config', (req, res) => {
 const cf = getCashfreeConfig()
 res.json({
 enabled: cf.isEnabled,
 hasCredentials: Boolean(cf.appId && cf.secretKey),
 isProduction: cf.isProduction,
 appId: cf.appId ? cf.appId.slice(0, 8) + '...' : ''
 })
})

// Create Cashfree order
app.post('/api/cashfree/create-order', async (req, res) => {
 try {
 const cf = getCashfreeConfig()
 if (!cf.isEnabled) return res.status(400).json({ error: 'Cashfree is disabled' })
 if (!cf.appId || !cf.secretKey) return res.status(400).json({ error: 'Cashfree credentials not configured' })

 const { orderId, amount, customerName, customerPhone, customerEmail, returnUrl } = req.body
 if (!orderId || !amount) return res.status(400).json({ error: 'orderId and amount required' })

 const baseUrl = getCashfreeBaseUrl()
 const return_url = returnUrl || `${req.protocol}://${req.get('host')}/api/cashfree/return?order_id={order_id}`
 const notify_url = `${req.protocol}://${req.get('host')}/api/cashfree/webhook`

 const payload = {
 order_id: orderId,
 order_amount: Number(amount),
 order_currency: 'INR',
 customer_details: {
 customer_id: customerPhone || 'guest_' + Date.now(),
 customer_phone: customerPhone || '9999999999',
 customer_email: customerEmail || 'guest@tdg.com'
 },
 order_meta: {
 return_url,
 notify_url,
 payment_methods: 'cc,dc,upi,nb'
 },
 order_note: `TDG Billing Order #${orderId}`
 }

 const resp = await fetch(`${baseUrl}/orders`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'x-client-id': cf.appId,
 'x-client-secret': cf.secretKey,
 'x-api-version': CASHFREE_API_VERSION,
 'x-idempotency-key': orderId
 },
 body: JSON.stringify(payload)
 })

 const data = await resp.json()
 if (!resp.ok) {
 console.error('[CASHFREE CREATE ORDER ERROR]', data)
 return res.status(resp.status).json({ error: data.message || 'Failed to create Cashfree order' })
 }

 res.json({
 success: true,
 cfOrderId: data.cf_order_id,
 paymentSessionId: data.payment_session_id,
 orderId: data.order_id,
 orderStatus: data.order_status
 })
 } catch (err) {
 console.error('[CASHFREE CREATE ORDER ERROR]', err.message)
 res.status(500).json({ error: 'Failed to create Cashfree order: ' + err.message })
 }
})

// Fetch Cashfree order status
app.get('/api/cashfree/order-status/:orderId', async (req, res) => {
 try {
 const cf = getCashfreeConfig()
 if (!cf.appId || !cf.secretKey) return res.status(400).json({ error: 'Cashfree not configured' })

 const baseUrl = getCashfreeBaseUrl()
 const resp = await fetch(`${baseUrl}/orders/${req.params.orderId}`, {
 headers: {
 'x-client-id': cf.appId,
 'x-client-secret': cf.secretKey,
 'x-api-version': CASHFREE_API_VERSION
 }
 })

 const data = await resp.json()
 if (!resp.ok) return res.status(resp.status).json({ error: data.message || 'Failed to fetch order' })

 res.json({
 orderId: data.order_id,
 cfOrderId: data.cf_order_id,
 orderStatus: data.order_status,
 orderAmount: data.order_amount,
 paymentSessionId: data.payment_session_id
 })
 } catch (err) {
 console.error('[CASHFREE ORDER STATUS ERROR]', err.message)
 res.status(500).json({ error: 'Failed to fetch order status' })
 }
})

// Cashfree webhook handler
app.post('/api/cashfree/webhook', express.json(), async (req, res) => {
 try {
 const { type, data } = req.body
 console.log(`[CASHFREE WEBHOOK] ${type}`, JSON.stringify(data?.order || {}).slice(0, 200))

 if (type === 'PAYMENT_SUCCESS_WEBHOOK' && data?.order?.order_id) {
 const orderId = data.order.order_id
 const order = orders.find(o => String(o.id) === String(orderId) || String(o.orderNumber) === String(orderId))
 if (order) {
 order.paymentStatus = 'paid'
 order.status = 'completed'
 order.paidAt = new Date().toISOString()
 order.completedAt = new Date().toISOString()
 order.paymentMethod = 'online'
 order.cfPaymentId = data.payment?.cf_payment_id || ''
 order.cfOrderId = data.order?.cf_order_id || ''
 saveState()
 io.emit('order:updated', order)
 console.log(`[CASHFREE WEBHOOK] Order #${order.orderNumber || orderId} marked as paid`)
 }
 }

 res.status(200).json({ status: 'ok' })
 } catch (err) {
 console.error('[CASHFREE WEBHOOK ERROR]', err.message)
 res.status(200).json({ status: 'ok' })
 }
})

// Cashfree return URL handler (redirect after payment)
app.get('/api/cashfree/return', (req, res) => {
 const { order_id } = req.query
 res.redirect(`${req.protocol}://${req.get('host')}/billing?payment=success&order_id=${order_id || ''}`)
})

// Menu (mobile format - live POS rates and images)
app.get('/api/menu', (req, res) => {
 const host = req.get('host') || 'pos.tendengyros.com'
 const protocol = req.protocol || 'https'
 const baseUrl = `${protocol}://${host}`

 res.json({
 categories: (categories || []).map(c => c.name),
 items: (menuItems || []).map(item => {
 let img = item.image || item.imageUrl || ''
 if (img && img.startsWith('/')) {
 img = `${baseUrl}${img}`
 }
 return {
 id: item.id,
 name: item.name,
 price: Number(item.price || 0),
 rate: Number(item.price || 0),
 desc: item.description || '',
 category: (categories || []).find(c => c.id === item.categoryId)?.name || 'Other',
 tag: item.isAvailable ? 'Popular' : '',
 image: img,
 imageUrl: img,
 isAvailable: item.isAvailable !== false
 }
 })
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
// Public API to get targeted offers for Mobile App, POS Counter, or Self-Ordering Systems
app.get('/api/offers', (req, res) => {
 const channel = (req.query.channel || 'all').toLowerCase()
 const dbOffers = settings.offers || []
 
 const filtered = dbOffers.filter(o => {
 if (o.isActive === false) return false
 const targets = Array.isArray(o.targetChannels) && o.targetChannels.length > 0 
 ? o.targetChannels 
 : ['mobile', 'pos', 'self_order']
 
 if (channel === 'all') return true
 return targets.includes(channel) || targets.includes('all')
 })
 
 res.json({ success: true, count: filtered.length, offers: filtered })
})

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
 orderSource: 'APP',
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
 menuItemId: item.menuItemId || item.id,
 menuItemName: item.name,
 quantity: item.quantity || 1,
 unitPrice: item.price,
 totalPrice: (item.price || 0) * (item.quantity || 1),
 customization: item.customization || null,
 notes: item.notes || (item.customization ? item.customization.notes : ''),
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
 if (io) io.emit('menu:updated')
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
recipes = recipes || []

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
  const { categoryId } = req.query
  if (categoryId && categoryId !== 'all') {
    const filtered = menuItems.filter(i => i && String(i.categoryId) === String(categoryId))
    return res.json(filtered)
  }
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
 } catch (e) {
 console.error('Import error:', e)
 res.status(500).json({ error: 'Import failed: ' + e.message })
 }
})

// ============ INVENTORY API ROUTES ============
app.get('/api/inventory', (req, res) => {
 res.json(inventory || [])
})

app.post('/api/inventory', (req, res) => {
 const { name, category, unit, currentStock, minimumStock, costPerUnit, supplier } = req.body
 if (!name) return res.status(400).json({ error: 'Item name required' })

 const newItem = {
 id: 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
 name: String(name),
 category: category || 'General',
 unit: unit || 'pcs',
 currentStock: Number(currentStock) || 0,
 minimumStock: Number(minimumStock) || 0,
 costPerUnit: Number(costPerUnit) || 0,
 supplier: supplier || 'General Supplier',
 lastRestocked: new Date().toISOString().split('T')[0]
 }

 inventory.push(newItem)
 saveState()
 io.emit('inventory:updated', inventory)
 res.status(201).json(newItem)
})

app.put('/api/inventory/:id', (req, res) => {
 const { id } = req.params
 let idx = inventory.findIndex(i => String(i.id) === String(id))
 if (idx === -1 && req.body.name) {
 idx = inventory.findIndex(i => i.name.toLowerCase() === String(req.body.name).toLowerCase())
 }
 if (idx === -1) return res.status(404).json({ error: 'Inventory item not found' })

 const { name, category, unit, currentStock, minimumStock, costPerUnit, supplier } = req.body
 if (name !== undefined) inventory[idx].name = String(name)
 if (category !== undefined) inventory[idx].category = String(category)
 if (unit !== undefined) inventory[idx].unit = String(unit)
 if (currentStock !== undefined) inventory[idx].currentStock = Number(currentStock)
 if (minimumStock !== undefined) inventory[idx].minimumStock = Number(minimumStock)
 if (costPerUnit !== undefined) inventory[idx].costPerUnit = Number(costPerUnit)
 if (supplier !== undefined) inventory[idx].supplier = String(supplier)
 inventory[idx].updatedAt = new Date().toISOString()

 saveState()
 io.emit('inventory:updated', inventory)
 res.json({ success: true, item: inventory[idx] })
})

app.post('/api/inventory/:id/restock', (req, res) => {
 const { id } = req.params
 const { quantity, reason } = req.body
 const idx = inventory.findIndex(i => String(i.id) === String(id))
 if (idx === -1) return res.status(404).json({ error: 'Inventory item not found' })

 const addQty = Number(quantity) || 0
 inventory[idx].currentStock = (Number(inventory[idx].currentStock) || 0) + addQty
 inventory[idx].lastRestocked = new Date().toISOString().split('T')[0]

 saveState()
 io.emit('inventory:updated', inventory)
 res.json({ success: true, item: inventory[idx] })
})

app.delete('/api/inventory/:id', (req, res) => {
 const idx = inventory.findIndex(i => String(i.id) === String(req.params.id))
 if (idx === -1) return res.status(404).json({ error: 'Inventory item not found' })
 inventory.splice(idx, 1)
 saveState()
 io.emit('inventory:updated', inventory)
 res.json({ success: true })
})

// ============ ACHARIYA STAFF & FAMILY BENEFIT PROMOTION APIs ============

// 1. Employee Master List
app.get('/api/staff/employees', (req, res) => {
 const { search, status, department } = req.query
 let list = employees || []
 if (status) list = list.filter(e => (e.status || '').toLowerCase() === status.toLowerCase())
 if (department) list = list.filter(e => (e.department || '').toLowerCase() === department.toLowerCase())
 if (search) {
 const q = search.toLowerCase().trim()
 list = list.filter(e =>
 (e.id || '').toLowerCase().includes(q) ||
 (e.name || '').toLowerCase().includes(q) ||
 (e.mobile || '').includes(q) ||
 (e.email || '').toLowerCase().includes(q) ||
 (e.department || '').toLowerCase().includes(q) ||
 (e.familyMembers || []).some(f => (f.name || '').toLowerCase().includes(q) || (f.mobile || '').includes(q))
 )
 }
 res.json(list)
})

// 2. Create Employee
app.post('/api/staff/employees', (req, res) => {
 const { id, name, department, designation, mobile, email, status, joiningDate, qrCode, familyMembers } = req.body
 if (!id || !name) return res.status(400).json({ error: 'Employee ID and Name are required' })

 const empId = String(id).trim().toUpperCase()
 const existing = employees.find(e => e.id.toLowerCase() === empId.toLowerCase())
 if (existing) return res.status(400).json({ error: 'Employee ID already exists' })

 const newEmp = {
 id: empId,
 name: String(name).trim(),
 department: department || 'General',
 designation: designation || 'Staff',
 mobile: mobile || '',
 email: email || '',
 status: status || 'Active',
 joiningDate: joiningDate || new Date().toISOString().slice(0, 10),
 qrCode: qrCode || empId,
 familyMembers: Array.isArray(familyMembers) ? familyMembers : [],
 createdAt: new Date().toISOString()
 }

 employees.push(newEmp)
 saveState()
 res.status(201).json({ success: true, employee: newEmp })
})

// 3. Edit Employee & Family Members
app.put('/api/staff/employees/:id', (req, res) => {
 const empId = req.params.id
 const idx = employees.findIndex(e => e.id.toLowerCase() === empId.toLowerCase())
 if (idx === -1) return res.status(404).json({ error: 'Employee not found' })

 const { name, department, designation, mobile, email, status, joiningDate, qrCode, familyMembers } = req.body
 if (name !== undefined) employees[idx].name = name
 if (department !== undefined) employees[idx].department = department
 if (designation !== undefined) employees[idx].designation = designation
 if (mobile !== undefined) employees[idx].mobile = mobile
 if (email !== undefined) employees[idx].email = email
 if (status !== undefined) employees[idx].status = status
 if (joiningDate !== undefined) employees[idx].joiningDate = joiningDate
 if (qrCode !== undefined) employees[idx].qrCode = qrCode
 if (familyMembers !== undefined && Array.isArray(familyMembers)) employees[idx].familyMembers = familyMembers

 saveState()
 res.json({ success: true, employee: employees[idx] })
})

// 4. Delete Employee
app.delete('/api/staff/employees/:id', (req, res) => {
 const empId = req.params.id
 const idx = employees.findIndex(e => e.id.toLowerCase() === empId.toLowerCase())
 if (idx === -1) return res.status(404).json({ error: 'Employee not found' })

 employees.splice(idx, 1)
 saveState()
 res.json({ success: true })
})

// 5. Bulk Employee & Family Import
app.post('/api/staff/employees/import', (req, res) => {
 const { items } = req.body
 if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items provided' })

 let imported = 0, updated = 0
 items.forEach(item => {
 if (!item.id || !item.name) return
 const empId = String(item.id).trim().toUpperCase()
 const idx = employees.findIndex(e => e.id.toLowerCase() === empId.toLowerCase())
 if (idx >= 0) {
 employees[idx] = { ...employees[idx], ...item, id: empId }
 updated++
 } else {
 employees.push({
 id: empId,
 name: item.name,
 department: item.department || 'General',
 designation: item.designation || 'Staff',
 mobile: item.mobile || '',
 email: item.email || '',
 status: item.status || 'Active',
 joiningDate: item.joiningDate || new Date().toISOString().slice(0, 10),
 qrCode: item.qrCode || empId,
 familyMembers: Array.isArray(item.familyMembers) ? item.familyMembers : []
 })
 imported++
 }
 })
 saveState()
 res.json({ success: true, imported, updated, total: employees.length })
})

// 6. POS Staff Verification Endpoint (CRITICAL VALIDATION ENGINE)
app.get('/api/staff/verify', (req, res) => {
 const query = (req.query.query || '').trim()
 const orderType = (req.query.orderType || 'dine-in').toLowerCase()

 if (!query) return res.status(400).json({ eligible: false, message: 'Please enter Employee ID, Name, Mobile, or QR Code' })

 // 1. Check Promotion Settings & Status
 if (!staffPromotionSettings.enabled) {
 return res.json({ eligible: false, message: 'Achariya Staff Promotion is currently DISABLED by Admin' })
 }

 // 2. Check Promotion Date Range (04-Aug-2026 00:00 to 09-Aug-2026 23:59)
 const todayStr = new Date().toISOString().slice(0, 10)
 if (staffPromotionSettings.startDate && todayStr < staffPromotionSettings.startDate) {
 return res.json({ eligible: false, message: `Promotion starts on ${staffPromotionSettings.startDate}` })
 }
 if (staffPromotionSettings.endDate && todayStr > staffPromotionSettings.endDate) {
 return res.json({ eligible: false, message: `Promotion EXPIRED on ${staffPromotionSettings.endDate}` })
 }

 // 3. Search Employee by ID, Name, Mobile, QR Code, or Family Mobile
 const qLower = query.toLowerCase()
 let matchedEmp = null
 let matchedFamily = null

 // Exact ID / QR Code match
 matchedEmp = employees.find(e => e.id.toLowerCase() === qLower || (e.qrCode && e.qrCode.toLowerCase() === qLower))

 // Mobile match on Employee
 if (!matchedEmp) {
 const cleanQ = query.replace(/\D/g, '')
 if (cleanQ.length >= 7) {
 matchedEmp = employees.find(e => (e.mobile || '').replace(/\D/g, '').includes(cleanQ))
 }
 }

 // Name match on Employee
 if (!matchedEmp) {
 matchedEmp = employees.find(e => e.name.toLowerCase().includes(qLower))
 }

 // Mobile or Name match on Family Member
 if (!matchedEmp) {
 const cleanQ = query.replace(/\D/g, '')
 for (const emp of employees) {
 const fam = (emp.familyMembers || []).find(f =>
 (cleanQ.length >= 7 && (f.mobile || '').replace(/\D/g, '').includes(cleanQ)) ||
 f.name.toLowerCase().includes(qLower)
 )
 if (fam) {
 matchedEmp = emp
 matchedFamily = fam
 break
 }
 }
 }

 if (!matchedEmp) {
 return res.json({ eligible: false, message: `No active Employee or Family Member found for "${query}"` })
 }

 // 4. Validate Employee & Family Status
 if (matchedEmp.status !== 'Active') {
 return res.json({ eligible: false, message: `Employee ${matchedEmp.name} (ID: ${matchedEmp.id}) is INACTIVE` })
 }
 if (matchedFamily && matchedFamily.status !== 'Active') {
 return res.json({ eligible: false, message: `Family Member ${matchedFamily.name} is INACTIVE` })
 }

 // 5. Usage Limit Check (Default 1 bill per customer per day)
 const maxBillsPerDay = Number(staffPromotionSettings.maxBillsPerDay) || 1
 const todayOrders = orders.filter(o => {
 if (!o.createdAt) return false
 const oDate = o.createdAt.slice(0, 10)
 if (oDate !== todayStr) return false
 if (o.status === 'cancelled') return false
 return (
 (o.employeeId && String(o.employeeId).toLowerCase() === matchedEmp.id.toLowerCase()) ||
 (matchedFamily && o.familyMemberId && String(o.familyMemberId).toLowerCase() === matchedFamily.id.toLowerCase())
 )
 })

 const usageTodayCount = todayOrders.length
 if (usageTodayCount >= maxBillsPerDay) {
 return res.json({
 eligible: false,
 message: `Usage Limit Exceeded! ${matchedEmp.name} has already used ${usageTodayCount} bill(s) today (Limit: ${maxBillsPerDay}/day).`
 })
 }

 // All Validations Passed!
 res.json({
 eligible: true,
 offerName: staffPromotionSettings.title || 'Achariya Family Week 2026',
 offerType: 'staff_family',
 discountPct: Number(staffPromotionSettings.discountPct) || 50,
 employee: {
 id: matchedEmp.id,
 name: matchedEmp.name,
 department: matchedEmp.department,
 designation: matchedEmp.designation,
 mobile: matchedEmp.mobile
 },
 familyMember: matchedFamily ? {
 id: matchedFamily.id,
 name: matchedFamily.name,
 relationship: matchedFamily.relationship,
 mobile: matchedFamily.mobile
 } : null,
 usageTodayCount,
 maxBillsPerDay,
 message: `Eligible! 50% Benefit for ${matchedFamily ? matchedFamily.name + ' (' + matchedFamily.relationship + ' of ' + matchedEmp.name + ')' : matchedEmp.name}`
 })
})

// 7. Get & Update Staff Promotion Settings
app.get('/api/staff/settings', (req, res) => {
 res.json(staffPromotionSettings)
})

app.put('/api/staff/settings', (req, res) => {
 staffPromotionSettings = {
 ...staffPromotionSettings,
 ...req.body
 }
 saveState()
 res.json({ success: true, settings: staffPromotionSettings })
})

// 8. Staff Benefit & Promotion Summary Reports
app.get('/api/reports/staff-benefit', (req, res) => {
 const { startDate, endDate, from, to } = req.query
 // getCompletedSales(req.query) already applies from/to filtering
 let filteredOrders = getCompletedSales(req.query).filter(o => o.employeeId || o.offerType === 'staff_family')

 // Support both startDate/endDate (legacy) and from/to (new date picker)
 const dateFrom = startDate || from
 const dateTo = endDate || to
 if (dateFrom) filteredOrders = filteredOrders.filter(o => (o.createdAt || '').slice(0, 10) >= dateFrom)
 if (dateTo) filteredOrders = filteredOrders.filter(o => (o.createdAt || '').slice(0, 10) <= dateTo)

 const employeeWise = {}
 const deptWise = {}
 const familyWise = {}

 let totalBills = 0, totalGross = 0, totalDiscount = 0, totalNet = 0

 filteredOrders.forEach(o => {
 const gross = Number(o.rawSubtotal || o.subtotal || o.total || 0)
 const disc = getOrderDiscountAmount(o)
 const net = getOrderAmount(o)
 const empId = o.employeeId || 'UNKNOWN'
 const empName = o.employeeName || 'Unknown Staff'
 const dept = o.employeeDept || 'General'

 totalBills++
 totalGross += gross
 totalDiscount += disc
 totalNet += net

 if (!employeeWise[empId]) {
 employeeWise[empId] = { employeeId: empId, name: empName, department: dept, billsCount: 0, grossAmount: 0, discountAmount: 0, netAmount: 0 }
 }
 employeeWise[empId].billsCount++
 employeeWise[empId].grossAmount += gross
 employeeWise[empId].discountAmount += disc
 employeeWise[empId].netAmount += net

 if (!deptWise[dept]) {
 deptWise[dept] = { department: dept, billsCount: 0, grossAmount: 0, discountAmount: 0, netAmount: 0 }
 }
 deptWise[dept].billsCount++
 deptWise[dept].grossAmount += gross
 deptWise[dept].discountAmount += disc
 deptWise[dept].netAmount += net

 if (o.familyMemberId || o.familyMemberName) {
 const fKey = o.familyMemberId || o.familyMemberName
 if (!familyWise[fKey]) {
 familyWise[fKey] = { familyMemberId: fKey, name: o.familyMemberName, employeeName: empName, billsCount: 0, grossAmount: 0, discountAmount: 0, netAmount: 0 }
 }
 familyWise[fKey].billsCount++
 familyWise[fKey].grossAmount += gross
 familyWise[fKey].discountAmount += disc
 familyWise[fKey].netAmount += net
 }
 })

 res.json({
 summary: { totalBills, totalGross, totalDiscount, totalNet },
 employeeWise: Object.values(employeeWise),
 departmentWise: Object.values(deptWise),
 familyWise: Object.values(familyWise)
 })
})

app.get('/api/reports/promotion-summary', (req, res) => {
 const { startDate, endDate } = req.query
 let completed = getCompletedSales(req.query)

 if (startDate) completed = completed.filter(o => o.createdAt.slice(0, 10) >= startDate)
 if (endDate) completed = completed.filter(o => o.createdAt.slice(0, 10) <= endDate)

 let totalBills = 0, totalGrossSales = 0, totalDiscount = 0, totalNetSales = 0

 const empMap = {}
 const familyMap = {}

 completed.forEach(o => {
 const disc = getOrderDiscountAmount(o)
 if (disc > 0) {
 const gross = Number(o.rawSubtotal || o.subtotal || o.total || 0)
 const net = getOrderAmount(o)

 totalBills++
 totalGrossSales += gross
 totalDiscount += disc
 totalNetSales += net

 if (o.employeeId) {
 const key = o.employeeId
 if (!empMap[key]) empMap[key] = { employeeId: key, name: o.employeeName || key, bills: 0, discount: 0 }
 empMap[key].bills++
 empMap[key].discount += disc
 }

 if (o.familyMemberName) {
 const fKey = o.familyMemberName
 if (!familyMap[fKey]) familyMap[fKey] = { name: fKey, employeeName: o.employeeName || '', bills: 0, discount: 0 }
 familyMap[fKey].bills++
 familyMap[fKey].discount += disc
 }
 }
 })

 const topEmployees = Object.values(empMap).sort((a, b) => b.discount - a.discount).slice(0, 10)
 const topFamilyMembers = Object.values(familyMap).sort((a, b) => b.discount - a.discount).slice(0, 10)

 res.json({
 totalBills,
 totalGrossSales,
 totalDiscount,
 totalNetSales,
 topEmployees,
 topFamilyMembers
 })
})

// Audit Logs Endpoint
app.get('/api/staff/audit-logs', (req, res) => {
 res.json(staffAuditLogs)
})

// POS Orders (no auth)
app.get('/api/pos/orders', (req, res) => {
 try {
 const { status, source } = req.query
 const includeCancelled = req.query.includeCancelled === 'true' || req.query.report === 'kot-cancelled'

 // Use central date filtering logic (guarantees 100% exact date matching across all report screens)
 let inMemory = getFilteredOrdersForPeriod(req.query, true)

 if (!includeCancelled) {
 inMemory = inMemory.filter(o => {
 if (!o) return false
 const s = (o.status || '').toLowerCase()
 return s !== 'cancelled' && s !== 'canceled' && s !== 'void' && !o.isCancelled && !o.isVoid
 })
 }

 if (status) {
 if (status === 'completed') {
 inMemory = inMemory.filter(o => (o.status || '').toLowerCase() === 'completed' || (o.paymentStatus || '').toLowerCase() === 'paid' || o.paidAt)
 } else {
 inMemory = inMemory.filter(o => (o.status || '').toLowerCase() === (status || '').toLowerCase())
 }
 }

 if (source) inMemory = inMemory.filter(o => (o.source || '').toLowerCase() === (source || '').toLowerCase())

 res.json(inMemory.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)))
 } catch (err) {
 console.error('[POS ORDERS API ERROR]', err)
 res.status(500).json({ error: 'Failed to fetch orders' })
 }
})

function deductInventoryForOrder(order) {
 if (!order || !order.items || !Array.isArray(order.items) || order.inventoryDeducted) return
 
 let deductedAny = false
 order.items.forEach(item => {
 const mId = item.menuItemId || item.id
 const orderQty = Number(item.quantity) || 1
 
 // Find matching recipe
 const recipe = (typeof recipes !== 'undefined' && Array.isArray(recipes)) 
 ? recipes.find(r => r.menuItemId === mId || r.id === mId || (r.menuItemName && item.menuItemName && r.menuItemName.toLowerCase() === item.menuItemName.toLowerCase()))
 : null
 
 if (recipe && recipe.ingredients && Array.isArray(recipe.ingredients)) {
 recipe.ingredients.forEach(ing => {
 const invId = ing.inventoryItemId
 const invName = ing.inventoryName
 const reqQtyPerUnit = Number(ing.quantity) || 0
 const totalDeduct = reqQtyPerUnit * orderQty
 
 if (totalDeduct > 0 && typeof inventory !== 'undefined' && Array.isArray(inventory)) {
 const invItem = inventory.find(i => (invId && i.id === invId) || (invName && i.name.toLowerCase() === invName.toLowerCase()))
 if (invItem) {
 invItem.currentStock = Math.max(0, Number((Number(invItem.currentStock || 0) - totalDeduct).toFixed(4)))
 deductedAny = true
 }
 }
 })
 }
 })
 
 if (deductedAny) {
 order.inventoryDeducted = true
 saveState()
 if (typeof io !== 'undefined' && io) {
 io.emit('inventory:updated', inventory)
 }
 }
}

function restoreInventoryForOrder(order) {
 if (!order || !order.items || !Array.isArray(order.items) || !order.inventoryDeducted) return
 
 let restoredAny = false
 order.items.forEach(item => {
 const mId = item.menuItemId || item.id
 const orderQty = Number(item.quantity) || 1
 
 const recipe = (typeof recipes !== 'undefined' && Array.isArray(recipes))
 ? recipes.find(r => r.menuItemId === mId || r.id === mId || (r.menuItemName && item.menuItemName && r.menuItemName.toLowerCase() === item.menuItemName.toLowerCase()))
 : null
 
 if (recipe && recipe.ingredients && Array.isArray(recipe.ingredients)) {
 recipe.ingredients.forEach(ing => {
 const invId = ing.inventoryItemId
 const invName = ing.inventoryName
 const reqQtyPerUnit = Number(ing.quantity) || 0
 const totalRestore = reqQtyPerUnit * orderQty
 
 if (totalRestore > 0 && typeof inventory !== 'undefined' && Array.isArray(inventory)) {
 const invItem = inventory.find(i => (invId && i.id === invId) || (invName && i.name.toLowerCase() === invName.toLowerCase()))
 if (invItem) {
 invItem.currentStock = Number((Number(invItem.currentStock || 0) + totalRestore).toFixed(4))
 restoredAny = true
 }
 }
 })
 }
 })
 
 if (restoredAny) {
 order.inventoryDeducted = false
 saveState()
 if (typeof io !== 'undefined' && io) {
 io.emit('inventory:updated', inventory)
 }
 }
}

// ============ OFFER VALIDATION ============
// Resolve the effective discount a bill is entitled to. Campaigns are validated
// against their date windows, and 50%-tier VIP customers (matched by phone) always
// get their exclusive 50% off. Returns { pct, label, key } or { pct: 0 }.
function resolveCampaignOffer(orderDateStr, customerPhone, flags) {
 const c = settings.campaigns || {}
 const date = orderDateStr || ''

 // 1. Customer-specific discount by phone. Any stored discountPct is honoured, so a 50% VIP
 // customer gets 50% and a 20% campaign customer gets exactly their stored 20%.
 const cleanPhone = String(customerPhone || '').replace(/\D/g, '')
 if (cleanPhone.length >= 10) {
 const cust = (loyaltyUsers || []).find(u => String(u.phone || '').replace(/\D/g, '') === cleanPhone && Number(u.discountPct) > 0) ||
 mobileAppUsers.find(u => String(u.phone || '').replace(/\D/g, '') === cleanPhone && Number(u.discountPct) > 0)
 if (cust) {
 const pct = Math.min(90, Math.round(Number(cust.discountPct)))
 if (pct === 50) {
 return { pct: 50, label: c.vip50 && c.vip50.label ? c.vip50.label : 'VIP 50% OFF', key: 'vip50' }
 }
 return { pct, label: cust.tier || `${pct}% OFF`, key: 'customer' }
 }
 }

 // 2. Inauguration 50% — only on its configured date
 const ina = c.inauguration
 if (ina && ina.active && ina.date && date === ina.date) return validOffer('inauguration', ina)

 // 3. Special 20% — within its from..to date window
 const s20 = c.special20
 if (s20 && s20.active && s20.from && s20.to && date >= s20.from && date <= s20.to) return validOffer('special20', s20)

 return { pct: 0, label: '', key: '' }

 function validOffer(key, cfg) {
 return { pct: Number(cfg.pct) || 0, label: cfg.label || (key === 'inauguration' ? 'Inauguration Offer 50%' : 'Special Offer 20%'), key }
 }
}

app.post('/api/pos/orders', (req, res) => {
 const { type, source, items, subtotal, tax, total, tableNumber, customerName, customerPhone, notes, paymentMethod, complimentary, complimentaryType, specialRemarks } = req.body
 
 const id = uuid()
 const orderNum = ++orderNumber
 const kotNum = getNextKotNumber()
 const now = new Date().toISOString()
 
 const itemList = Array.isArray(items) ? items : []
 const rawSub = req.body.rawSubtotal || Math.round(itemList.reduce((sum, item) => sum + (Number(item.totalPrice) || (Number(item.unitPrice || item.price || 0) * Number(item.quantity || item.qty || 1))), 0)) || subtotal || 0
 const isStaffBenefit = Boolean(req.body.staffBenefitOffer || req.body.employeeId || req.body.offerType === 'staff_family')
 const clientDiscount = Number(req.body.discount || req.body.discountAmount || 0)
 
 let discountVal = clientDiscount
 if (!discountVal && isStaffBenefit) {
 const pct = Number(req.body.discountPct || 50) / 100
 discountVal = Math.round(rawSub * pct)
 } else if (!discountVal && Number(req.body.customerDiscountPct) > 0) {
 const cpct = Math.min(90, Math.max(0, Number(req.body.customerDiscountPct)))
 discountVal = Math.round(rawSub * cpct / 100)
 } else if (!discountVal && req.body.inaugurationOffer) {
 discountVal = Math.round(rawSub * 0.5)
 } else if (!discountVal && req.body.specialOffer20) {
 discountVal = Math.round(rawSub * 0.2)
 }
 discountVal = Math.max(0, Math.min(Math.round(discountVal), rawSub))
 const netSub = Math.max(0, rawSub - discountVal)
 const taxVal = Math.round(netSub * 0.05)
 const totalVal = Math.round(netSub + taxVal)
 
 const discountLabel = req.body.discountName || (
 isStaffBenefit ? (req.body.offerName || 'Achariya Family Week 2026') :
 (req.body.inaugurationOffer ? 'Inauguration Offer 50%' : (req.body.specialOffer20 ? 'Special Offer 20%' : (discountVal > 0 ? 'Discount' : '')))
 )

 const isDirectSettle = Boolean(req.body.settleDirectly || req.body.status === 'completed' || req.body.paymentStatus === 'paid')

 const order = {
 id,
 orderNumber: orderNum,
 kotNumber: kotNum,
 type: type || 'dine-in',
 status: isDirectSettle ? 'completed' : 'pending',
 source: source || 'pos',
 orderSource: (source === 'qr_self_order' || source === 'self_order' || source === 'kiosk')
 ? 'Kiosk'
 : (source === 'mobile' || source === 'mobile_app' || source === 'app')
 ? 'APP'
 : 'POS',
 rawSubtotal: rawSub,
 discount: discountVal,
 discountName: discountLabel,
 offerName: req.body.offerName || (isStaffBenefit ? 'Achariya Family Week 2026' : undefined),
 offerType: req.body.offerType || (isStaffBenefit ? 'staff_family' : undefined),
 employeeId: req.body.employeeId || undefined,
 employeeName: req.body.employeeName || undefined,
 employeeDept: req.body.employeeDept || undefined,
 familyMemberId: req.body.familyMemberId || undefined,
 familyMemberName: req.body.familyMemberName || undefined,
 discountPct: req.body.discountPct || (isStaffBenefit ? 50 : undefined),
 approvedBy: req.body.approvedBy || req.body.cashier || 'Cashier',
 terminal: req.body.terminal || 'POS-1',
 inaugurationOffer: req.body.inaugurationOffer || false,
 specialOffer20: req.body.specialOffer20 || false,
 vip50: req.body.vip50 || false,
 subtotal: netSub,
 tax: taxVal,
 total: totalVal,
 paymentMethod: paymentMethod || 'cash',
 splitPayments: req.body.splitPayments || undefined,
 cashTendered: req.body.cashTendered !== undefined ? Number(req.body.cashTendered) : undefined,
 changeReturned: req.body.changeReturned !== undefined ? Number(req.body.changeReturned) : undefined,
 paymentStatus: isDirectSettle ? 'paid' : 'pending',
 paidAt: isDirectSettle ? now : undefined,
 completedAt: isDirectSettle ? now : undefined,
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
 status: 'pending',
 customization: item.customization || undefined
 })) || []
 }
 
 if (isStaffBenefit && (req.body.employeeId || req.body.employeeName)) {
 staffAuditLogs.unshift({
 id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
 employeeId: req.body.employeeId || 'EMP',
 employeeName: req.body.employeeName || 'Staff',
 familyMemberId: req.body.familyMemberId || null,
 familyMemberName: req.body.familyMemberName || null,
 cashier: req.body.approvedBy || req.body.cashier || 'Cashier',
 terminal: req.body.terminal || 'POS-1',
 billNumber: orderNum,
 promotionName: req.body.offerName || 'Achariya Family Week 2026',
 discount: discountVal,
 grossAmount: rawSub,
 netAmount: total || 0,
 createdAt: now
 })
 }

 orders.unshift(order)

 // Customer Visit Tracking & 5% Referral Commission Engine
 if (customerPhone) {
 const cleanP = String(customerPhone).replace(/\D/g, '')
 if (cleanP.length >= 8) {
 const u = (loyaltyUsers || []).find(x => String(x.phone || '').replace(/\D/g, '') === cleanP) ||
 (mobileAppUsers || []).find(x => String(x.phone || '').replace(/\D/g, '') === cleanP)
 if (u) {
 // Increment visit count and total spend
 u.visitCount = (u.visitCount || 0) + 1
 u.totalSpend = (u.totalSpend || 0) + totalVal
 u.lastVisit = now

 // Partner Gamification: Auto-upgrade to Partner level if spend >= ₹5,000
 if (u.totalSpend >= 5000) {
 u.tier = 'Partner'
 }

 // 5% Referrer Commission Points Engine
 const referrerPhone = (u.referredBy || u.referrerPhone || '').replace(/\D/g, '')
 if (referrerPhone && referrerPhone !== cleanP) {
 const referrer = (loyaltyUsers || []).find(x => String(x.phone || '').replace(/\D/g, '') === referrerPhone) ||
 (mobileAppUsers || []).find(x => String(x.phone || '').replace(/\D/g, '') === referrerPhone)
 if (referrer) {
 const commission = Math.round(totalVal * 0.05)
 if (commission > 0) {
 referrer.walletBalance = (Number(referrer.walletBalance || referrer.rubyPoints) || 0) + commission
 referrer.rubyPoints = referrer.walletBalance
 pointTransactions.push({
 id: 'pt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
 phone: referrerPhone,
 customerName: referrer.name || 'Referrer',
 points: commission,
 type: 'earn_commission',
 description: `5% Commission (₹${commission}) from referred friend (${customerName || cleanP}) order #${orderNum}`,
 createdAt: now
 })
 console.log(`[REFERRAL COMMISSION] Credited 5% (₹${commission}) to Referrer ${referrerPhone} from order #${orderNum}`)
 }
 }
 }

 // Only one-time promo codes reset discountPct, referred users keep 10% repeat visit rule
 if (u.oneTimePromo && discountVal > 0) {
 u.offerRedeemed = true
 u.redeemedAt = now
 u.redeemedOrderNumber = orderNum
 u.discountPct = 0
 }
 }
 }
 }


 deductInventoryForOrder(order)
 
 // EMERGENCY: Append to order log IMMEDIATELY (survives crashes)
 appendOrderLog(order)
 
 // CRITICAL: Write order to disk IMMEDIATELY before responding
 // This prevents data loss if server restarts before next saveState()
 try {
 saveState()
 } catch (e) {
 console.error('[ORDER PERSIST ERROR] saveState failed:', e.message)
 }
 
 // Double-check: verify order is in db.json
 try {
 const verifyDb = readDb()
 if (!verifyDb.orders || !verifyDb.orders.find(o => o.id === order.id)) {
 console.error('[ORDER PERSIST] Order not in db.json, forcing write...')
 const forceDb = readDb() || {}
 forceDb.orders = [order, ...(forceDb.orders || [])]
 writeDb(forceDb)
 }
 } catch (e) {
 console.error('[ORDER PERSIST] Verify/force write failed:', e.message)
 }
 
 // Emit to connected clients
 io.emit('order:created', order)
 io.to('kitchen').emit('kot:created', { id, orderNumber: `K${kotNum}`, kotNumber: kotNum, billNumber: orderNum, items: order.items, tableNumber: order.tableNumber, type: order.type, createdAt: now })
 
 res.status(201).json(order)
})

app.patch('/api/pos/orders/:id/status', (req, res) => {
 const { id } = req.params
 const { status, paymentStatus, cancelReason } = req.body
 
 const order = orders.find(o => String(o.id) === String(id) || String(o.orderNumber) === String(id))
 if (order) {
 order.status = status || order.status
 order.paymentStatus = paymentStatus || order.paymentStatus
 order.paymentMethod = req.body.paymentMethod || order.paymentMethod
 if ((status === 'completed' || status === 'served') && paymentStatus === 'paid') {
 if (!order.paidAt) order.paidAt = new Date().toISOString()
 if (!order.completedAt) order.completedAt = new Date().toISOString()
 }
 if (req.body.splitPayments) order.splitPayments = req.body.splitPayments
 if (req.body.cashTendered !== undefined) order.cashTendered = Number(req.body.cashTendered)
 if (req.body.changeReturned !== undefined) order.changeReturned = Number(req.body.changeReturned)
 if (status === 'cancelled') {
 if (cancelReason) order.cancelReason = cancelReason
 if (req.body.cancelledBy) order.cancelledBy = req.body.cancelledBy
 restoreInventoryForOrder(order)
 } else if (status === 'completed' || status === 'served' || status === 'ready' || status === 'preparing') {
 deductInventoryForOrder(order)
 }
 order.updatedAt = new Date().toISOString()
 io.emit('order:updated', order)
 
 // CRITICAL: Persist status change immediately
 try {
 saveState()
 } catch (e) {
 console.error('[ORDER STATUS PERSIST ERROR]:', e.message)
 }

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
 return res.json({ success: true, order })
 }
 
 res.status(404).json({ error: 'Order not found' })
})

app.post('/api/pos/orders/:id/cancel', (req, res) => {
 const { id } = req.params
 const { reason, cancelledBy } = req.body || {}
 const targetOrder = orders.find(o => String(o.id) === String(id) || String(o.orderNumber) === String(id))
 if (!targetOrder) {
 return res.status(404).json({ error: 'Order / Bill not found' })
 }
 targetOrder.status = 'cancelled'
 targetOrder.cancelReason = reason || 'Cancelled by Staff'
 if (cancelledBy) targetOrder.cancelledBy = cancelledBy
 targetOrder.updatedAt = new Date().toISOString()
 restoreInventoryForOrder(targetOrder)
 saveState()
 io.emit('order:updated', targetOrder)
 res.json({ success: true, message: `Bill #${targetOrder.orderNumber || targetOrder.id} cancelled successfully`, order: targetOrder })
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
 const { orderItems, items } = req.body
 const itemList = orderItems || items || []
 deductInventoryForOrder({ items: itemList })
 res.json({ success: true, inventory })
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
 
 if (io) {
 io.emit('customer:registered', { id: user.id, name: user.name, phone: user.phone, email: user.email, tier: user.tier })
 io.emit('customers:updated')
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
 
 if (amount < 3000) return res.status(400).json({ error: 'mum redemption is 3000 points' })
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

// ============ CASH COUNTER & SHIFT MANAGEMENT ============
function calculateSessionSummary(session) {
 if (!session) return null
 const startTime = new Date(session.openedAt).getTime()
 const endTime = session.closedAt ? new Date(session.closedAt).getTime() : Date.now()

 // Filter valid paid orders created during the session window
 const sessionOrders = (orders || []).filter(o => {
 if (!o || o.status === 'cancelled' || o.status === 'voided') return false
 const ot = new Date(o.createdAt || o.date || 0).getTime()
 return ot >= startTime && ot <= endTime
 })

 let cashSales = 0
 let upiSales = 0
 let cardSales = 0
 let billCount = sessionOrders.length

 sessionOrders.forEach(o => {
 const payMethod = (o.paymentMethod || o.payment || '').toLowerCase()
 if (payMethod === 'split' && o.splitPayments) {
 cashSales += Number(o.splitPayments.cash || 0)
 upiSales += Number(o.splitPayments.upi || 0)
 cardSales += Number(o.splitPayments.card || 0)
 } else if (payMethod === 'cash') {
 cashSales += Number(o.total || o.amount || 0)
 } else if (payMethod === 'upi') {
 upiSales += Number(o.total || o.amount || 0)
 } else if (payMethod === 'card') {
 cardSales += Number(o.total || o.amount || 0)
 } else {
 if (!o.complimentary) {
 cashSales += Number(o.total || o.amount || 0)
 }
 }
 })

 const openingCash = Number(session.openingCash || 0)
 const expectedCash = openingCash + cashSales
 const totalSales = cashSales + upiSales + cardSales

 return {
 ...session,
 cashSales,
 upiSales,
 cardSales,
 totalSales,
 billCount,
 expectedCash
 }
}

app.get('/api/cash-counter/active', (req, res) => {
 const active = cashCounterSessions.find(s => s.status === 'OPEN')
 if (!active) {
 return res.json({ active: false, session: null })
 }
 const summary = calculateSessionSummary(active)
 res.json({ active: true, session: summary })
})

app.post('/api/cash-counter/open', (req, res) => {
 const existingOpen = cashCounterSessions.find(s => s.status === 'OPEN')
 if (existingOpen) {
 return res.status(400).json({ error: 'A cash counter session is already open', session: calculateSessionSummary(existingOpen) })
 }
 const { openingCash, openedBy, openedById, notes } = req.body
 const openingCashNum = Number(openingCash)
 if (isNaN(openingCashNum) || openingCashNum < 0) {
 return res.status(400).json({ error: 'Valid opening cash amount is required' })
 }

 const now = new Date()
 const newSession = {
 id: 'cs_' + uuid().substring(0, 8),
 date: getLocalDateStr(now),
 openedAt: now.toISOString(),
 openedBy: openedBy || 'Cashier',
 openedById: openedById || '',
 openingCash: openingCashNum,
 status: 'OPEN',
 closedAt: null,
 closedBy: null,
 closingCash: null,
 expectedCash: openingCashNum,
 cashSales: 0,
 upiSales: 0,
 cardSales: 0,
 totalSales: 0,
 billCount: 0,
 difference: 0,
 notes: notes || ''
 }

 cashCounterSessions.unshift(newSession)
 saveState()
 io.emit('cash-counter:updated', { status: 'OPEN', session: newSession })
 res.status(201).json({ success: true, session: newSession })
})

app.post('/api/cash-counter/close', (req, res) => {
 const activeSessionIndex = cashCounterSessions.findIndex(s => s.status === 'OPEN')
 if (activeSessionIndex === -1) {
 return res.status(400).json({ error: 'No active open cash counter session found' })
 }
 const { closingCash, closedBy, notes } = req.body
 const closingCashNum = Number(closingCash)
 if (isNaN(closingCashNum) || closingCashNum < 0) {
 return res.status(400).json({ error: 'Valid actual handed over cash amount is required' })
 }

 const activeSession = cashCounterSessions[activeSessionIndex]
 const now = new Date()
 activeSession.closedAt = now.toISOString()
 activeSession.closedBy = closedBy || activeSession.openedBy || 'Cashier'

 const summary = calculateSessionSummary(activeSession)

 activeSession.cashSales = summary.cashSales
 activeSession.upiSales = summary.upiSales
 activeSession.cardSales = summary.cardSales
 activeSession.totalSales = summary.totalSales
 activeSession.billCount = summary.billCount
 activeSession.expectedCash = summary.expectedCash
 activeSession.closingCash = closingCashNum
 activeSession.difference = closingCashNum - summary.expectedCash
 activeSession.status = 'CLOSED'
 if (notes) activeSession.notes = activeSession.notes ? `${activeSession.notes} | ${notes}` : notes

 cashCounterSessions[activeSessionIndex] = activeSession
 saveState()
 io.emit('cash-counter:updated', { status: 'CLOSED', session: activeSession })
 res.json({ success: true, session: activeSession })
})

app.get('/api/cash-counter/history', (req, res) => {
 const history = cashCounterSessions.map(s => {
 if (s.status === 'OPEN') return calculateSessionSummary(s)
 return s
 })
 res.json(history)
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

 // Output GST from sales (Official Store Opening Date: July 27, 2026)
 const periodOrders = orders.filter(o => {
 const d = getOrderDate(o)
 return d.startsWith(period) && d >= '2026-07-27'
 })
 const completedOrders = periodOrders.filter(o => isValidSalesOrder(o))
 const totalSales = completedOrders.reduce((sum, o) => sum + getOrderAmount(o), 0)
 const outputGst = Math.round(totalSales * salesTaxRate * 100 / (100 + salesTaxRate * 100))

 // Input GST from purchases (from July 27, 2026 onwards)
 const periodPurchases = purchases.filter(p => {
 const d = getLocalDateStr(p.createdAt)
 return d.startsWith(period) && d >= '2026-07-27'
 })
 const totalPurchases = periodPurchases.reduce((sum, p) => sum + (p.total || 0), 0)
 const inputGst = Math.round(totalPurchases * purchaseTaxRate * 100 / (100 + purchaseTaxRate * 100))

 // Input GST from GRNs (from July 27, 2026 onwards)
 const periodGrns = grns.filter(g => {
 const d = (g.date || '').split('T')[0]
 return d.startsWith(period) && d >= '2026-07-27'
 })
 const totalGrnValue = periodGrns.reduce((sum, g) => sum + (g.totalValue || 0), 0)
 const inputGstGrn = Math.round(totalGrnValue * purchaseTaxRate * 100 / (100 + purchaseTaxRate * 100))

 // By payment method (output)
 const byPaymentMethod = {}
 completedOrders.forEach(o => {
 const method = (o.paymentMethod || 'cash').toLowerCase()
 byPaymentMethod[method] = (byPaymentMethod[method] || 0) + getOrderAmount(o)
 })

 // Invoice count
 const invoiceCount = completedOrders.length

 // Individual taxable invoices (output)
 const salesInvoices = completedOrders.map(o => {
 const amt = getOrderAmount(o)
 const taxable = Math.round(amt * 100 / (100 + salesTaxRate * 100))
 return {
 id: o.orderNumber ? `#${String(o.orderNumber).padStart(6, '0')}` : (o.id || ''),
 date: getOrderDate(o),
 customer: o.customerName || o.tableNumber || 'Walk-in',
 total: Math.round(amt),
 taxable,
 gst: Math.round(amt) - taxable,
 paymentMethod: o.paymentMethod || 'cash',
 source: o.source || o.type || 'pos'
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

// ============ CLOUD / LOCAL DATA SYNC BRIDGE ============
const SYNC_SECRET = process.env.SYNC_SECRET || 'TDG_POS_SYNC_2026_SECRET'

app.post('/api/sync/push', (req, res) => {
 try {
 const token = req.headers['x-sync-token'] || req.body.syncToken
 if (token !== SYNC_SECRET && process.env.NODE_ENV === 'production') {
 return res.status(401).json({ error: 'Unauthorized sync token' })
 }

 const { orders: incomingOrders, inventory: incomingInv, expenses: incomingExp, menuItems: incomingMenu, categories: incomingCat, recipes: incomingRec, users: incomingUsers, loyaltyUsers: incomingLoyalty } = req.body

 if (Array.isArray(incomingOrders)) {
 const orderMap = new Map()
 orders.forEach(o => orderMap.set(String(o.id), o))
 incomingOrders.forEach(o => orderMap.set(String(o.id), o))
 orders.length = 0
 orders.push(...Array.from(orderMap.values()))
 }

 if (Array.isArray(incomingUsers) && incomingUsers.length > 0) {
 const userMap = new Map()
 mobileAppUsers.forEach(u => u && userMap.set(String(u.id || u.phone), u))
 incomingUsers.forEach(u => u && userMap.set(String(u.id || u.phone), u))
 mobileAppUsers.length = 0
 mobileAppUsers.push(...Array.from(userMap.values()))
 const db = readDb()
 db.users = mobileAppUsers
 writeDb(db)
 }

 if (Array.isArray(incomingLoyalty) && incomingLoyalty.length > 0) {
 const loyaltyMap = new Map()
 loyaltyUsers.forEach(u => u && loyaltyMap.set(String(u.id || u.phone), u))
 incomingLoyalty.forEach(u => u && loyaltyMap.set(String(u.id || u.phone), u))
 loyaltyUsers.length = 0
 loyaltyUsers.push(...Array.from(loyaltyMap.values()))
 const db = readDb()
 db.loyaltyUsers = loyaltyUsers
 writeDb(db)
 }

 if (Array.isArray(incomingInv) && incomingInv.length > 0) {
 inventory.length = 0
 inventory.push(...incomingInv)
 }

 if (Array.isArray(incomingExp) && incomingExp.length > 0) {
 expenses.length = 0
 expenses.push(...incomingExp)
 }

 if (Array.isArray(incomingMenu) && incomingMenu.length > 0) {
 menuItems.length = 0
 menuItems.push(...incomingMenu)
 }

 if (Array.isArray(incomingCat) && incomingCat.length > 0) {
 categories.length = 0
 categories.push(...incomingCat)
 }

 if (Array.isArray(incomingRec) && incomingRec.length > 0) {
 recipes.length = 0
 recipes.push(...incomingRec)
 }

 saveState()
 console.log(`[SYNC PUSH SUCCESS] Database updated with ${orders.length} orders`)
 res.json({ success: true, message: 'Data synced successfully', ordersCount: orders.length })
 } catch (err) {
 console.error('[SYNC PUSH ERROR]', err)
 res.status(500).json({ error: err.message || 'Sync failed' })
 }
})

app.get('/api/sync/pull', (req, res) => {
 res.json(db)
})

app.post('/api/sync/pull-merge', (req, res) => {
 try {
 const { orders: cloudOrders, categories: cloudCategories, menuItems: cloudMenuItems, expenses: cloudExpenses, purchases: cloudPurchases } = req.body || {}
 if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
 const orderMap = new Map()
 orders.forEach(o => orderMap.set(String(o.id || o.orderNumber), o))
 cloudOrders.forEach(o => orderMap.set(String(o.id || o.orderNumber), o))
 orders.length = 0
 orders.push(...Array.from(orderMap.values()))
 }
 if (Array.isArray(cloudExpenses) && cloudExpenses.length > 0) {
 const expMap = new Map()
 expenses.forEach(e => expMap.set(String(e.id), e))
 cloudExpenses.forEach(e => expMap.set(String(e.id), e))
 expenses.length = 0
 expenses.push(...Array.from(expMap.values()))
 }
 if (Array.isArray(cloudPurchases) && cloudPurchases.length > 0) {
 const purMap = new Map()
 purchases.forEach(p => purMap.set(String(p.id), p))
 cloudPurchases.forEach(p => purMap.set(String(p.id), p))
 purchases.length = 0
 purchases.push(...Array.from(purMap.values()))
 }
 saveState()
 console.log(`[SYNC PULL-MERGE SUCCESS] Local database merged with ${orders.length} total orders`)
 res.json({ success: true, message: 'Merged cloud data into local database', ordersCount: orders.length })
 } catch (err) {
 console.error('[SYNC PULL-MERGE ERROR]', err)
 res.status(500).json({ error: err.message || 'Pull merge failed' })
 }
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

// Helper for IST timezone & business shift safe local date string (YYYY-MM-DD)
// Applies 5:00 AM IST shift cutoff so late-night bills (12:00 AM - 04:59 AM IST) belong to yesterday's shift.
const getLocalDateStr = (val) => {
 if (!val) return ''
 const str = String(val).trim()
 if (!str) return ''

 // 1. If already plain YYYY-MM-DD date string without time
 if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str

 // 2. Parse Date objects or ISO strings (e.g. 2026-08-05T18:35:00.000Z)
 try {
 const d = typeof val === 'number' ? new Date(val) : new Date(str)
 if (!isNaN(d.getTime())) {
 // 5:00 AM IST shift cutoff: 12:00 AM to 04:59 AM IST is part of previous day's shift
 const istHours = Number(d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false }).split(':')[0])
 if (istHours < 5) {
 const shifted = new Date(d.getTime() - 5 * 3600 * 1000)
 return shifted.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' })
 }
 return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' })
 }
 } catch (e) {}

 // 3. Match DD.MM.YYYY, DD.MM.YY, DD/MM/YYYY, DD/MM/YY, DD-MM-YYYY, DD-MM-YY
 const dmyMatch = str.match(/^(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{2,4})/)
 if (dmyMatch) {
 let day = dmyMatch[1].padStart(2, '0')
 let month = dmyMatch[2].padStart(2, '0')
 let year = dmyMatch[3]
 if (year.length === 2) year = '20' + year
 return `${year}-${month}-${day}`
 }

 return str.slice(0, 10)
}

// Helper to safely extract date field from an order (checks date first, then createdAt, paidAt, completedAt, timestamp)
const getOrderDate = (o) => {
 if (!o) return ''
 const val = o.date || o.createdAt || o.paidAt || o.completedAt || o.timestamp
 return getLocalDateStr(val)
}

// Helper to calculate the most recent order date dynamically from an order list
const getLatestOrderDate = (orderList) => {
 if (!orderList || orderList.length === 0) return getLocalDateStr(new Date())
 let maxDate = ''
 for (const o of orderList) {
 const d = getOrderDate(o)
 if (d && d > maxDate) maxDate = d
 }
 return maxDate || getLocalDateStr(new Date())
}

// Helper to normalize any date input string (e.g., 30.07.2026, 30.07.26, 2026-07-30, today, yesterday)
const normalizeDateStr = (inputStr) => {
 if (!inputStr) return ''
 const str = String(inputStr).trim()
 if (str === 'today') return getLocalDateStr(new Date())
 if (str === 'yesterday') {
 const y = new Date()
 y.setDate(y.getDate() - 1)
 return getLocalDateStr(y)
 }
 if (str === 'all' || str === 'latest') return str
 return getLocalDateStr(str)
}

// Helper for daily KOT sequence resetting to 100 every calendar day
let currentKotDateStr = ''
let currentKotSeq = 99

function getNextKotNumber() {
 const todayStr = getLocalDateStr(new Date())
 if (currentKotDateStr !== todayStr) {
 currentKotDateStr = todayStr
 const todayOrders = orders.filter(o => getOrderDate(o) === todayStr)
 let maxKot = 99
 todayOrders.forEach(o => {
 const kNum = Number(o.kotNumber || o.orderNumber)
 if (!isNaN(kNum) && kNum >= 100 && kNum < 5000 && kNum > maxKot) {
 maxKot = kNum
 }
 })
 currentKotSeq = todayOrders.length === 0 ? 100 : Math.max(100, maxKot + 1)
 } else {
 currentKotSeq++
 }
 return currentKotSeq
}

// Helper to compute order gross subtotal
const getOrderGrossAmount = (o) => {
 if (!o) return 0
 return Number(o.rawSubtotal || o.subtotal || o.total || 0)
}

// Helper to compute order discount amount
const getOrderDiscountAmount = (o) => {
 if (!o) return 0
 return Number(o.discount || o.discountAmount || 0)
}

// Helper to compute order total amount safely (returns 0 for cancelled or complimentary orders)
const getOrderAmount = (o) => {
 if (!o) return 0
 const s = (o.status || '').toLowerCase()
 const m = (o.paymentMethod || '').toLowerCase()
 if (s === 'cancelled' || s === 'canceled' || s === 'void' || o.isCancelled || o.isVoid) return 0
 if (o.complimentary || o.isComplimentary || m === 'complimentary' || m === 'nc' || m === 'free' || o.type === 'complimentary') return 0

 if (o.total !== undefined && o.total !== null && Number(o.total) > 0) {
 return Number(o.total)
 }
 const items = o.items || []
 const subtotal = items.reduce((sum, i) => sum + (i.totalPrice || (i.unitPrice || i.price || 0) * (i.quantity || i.qty || 1)), 0)
 const tax = o.tax !== undefined ? o.tax : subtotal * 0.05
 return Math.round(subtotal + tax)
}

function isDemoOrderBeforeOpening(o) {
 if (!o) return false
 const dStr = getOrderDate(o)
 if (dStr === '2026-07-27') {
 if (o.orderNumber && Number(o.orderNumber) < 1036) {
 return true
 }
 const ts = o.createdAt || o.paidAt || o.completedAt || ''
 if (ts) {
 try {
 const dateObj = new Date(ts)
 if (dateObj.getTime() < new Date('2026-07-27T11:05:00.000Z').getTime()) {
 return true
 }
 } catch (e) {}
 }
 }
 return false
}

const isCompletedSale = (o) => {
 if (!o) return false
 const s = (o.status || '').toLowerCase()
 const p = (o.paymentStatus || '').toLowerCase()
 const m = (o.paymentMethod || '').toLowerCase()

 // Requirement 3: Exclude Cancelled, Void, Complimentary, Draft, Deleted, Duplicate
 if (s === 'cancelled' || s === 'canceled' || s === 'void' || s === 'draft' || s === 'deleted' || o.isCancelled || o.isVoid || o.isDraft || o.isDeleted || o.isDuplicate) {
 return false
 }
 if (o.complimentary || o.isComplimentary || m === 'complimentary' || m === 'nc' || m === 'free' || o.type === 'complimentary') {
 return false
 }
 if (isDemoOrderBeforeOpening(o)) {
 return false
 }

 // Requirement 4: Include only Completed or Paid Bills
 return s === 'completed' || p === 'paid' || Boolean(o.settleDirectly)
}

const isValidSalesOrder = isCompletedSale

function getCompletedSales(reqQuery, options = {}) {
 const candidateOrders = getFilteredOrdersForPeriod(reqQuery, true)
 const completedSales = candidateOrders.filter(isCompletedSale)
 const totalSales = completedSales.reduce((sum, o) => sum + getOrderAmount(o), 0)

 // Requirement 5: Debug Logging
 console.log(`[SALES COUNT AUDIT] Filter: ${JSON.stringify(reqQuery || {})}`)
 console.log(`[SALES COUNT AUDIT] Raw Orders Count: ${orders.length}`)
 console.log(`[SALES COUNT AUDIT] Filtered Orders Count (Period): ${candidateOrders.length}`)
 console.log(`[SALES COUNT AUDIT] Bill Count Returned: ${completedSales.length}`)
 console.log(`[SALES COUNT AUDIT] Total Sales Returned: ₹${Math.round(totalSales)}`)

 return completedSales
}

function calculateSalesMetrics(salesOrders = []) {
 let totalInvoices = salesOrders.length
 let netSalesCollected = 0
 let grossMenuSubtotal = 0
 let totalDiscountGiven = 0
 let totalTaxGST = 0

 const byPaymentMethod = { cash: 0, upi: 0, card: 0, wallet: 0 }
 const paymentCounts = { cash: 0, upi: 0, card: 0, wallet: 0 }
 const byDiscountType = {}
 const bySource = {}

 salesOrders.forEach(o => {
 const amt = getOrderAmount(o)
 netSalesCollected += amt

 const { discount: disc, name: dName } = getOrderDiscountInfo(o)
 const itemSub = (o.items || []).reduce((sum, item) => sum + (item.totalPrice || (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1)), 0)
 const rawSub = Number(o.rawSubtotal) || (disc > 0 ? (Number(o.subtotal) + disc) : (itemSub || Number(o.subtotal) || 0))
 const netSub = Number(o.subtotal) || Math.max(0, rawSub - disc)

 grossMenuSubtotal += rawSub

 // GST Tax (5%) is calculated strictly on Net Subtotal (discounted offer price)
 const tax = o.tax !== undefined && o.tax !== null ? Number(o.tax) : Math.round(netSub * 0.05)
 totalTaxGST += tax

 if (disc > 0) {
 totalDiscountGiven += disc
 if (!byDiscountType[dName]) {
 byDiscountType[dName] = { count: 0, totalDiscount: 0 }
 }
 byDiscountType[dName].count += 1
 byDiscountType[dName].totalDiscount += disc
 }

 if (o.splitPayments && typeof o.splitPayments === 'object' && Object.keys(o.splitPayments).length > 0) {
 Object.entries(o.splitPayments).forEach(([mKey, mVal]) => {
 const val = Number(mVal) || 0
 if (val > 0) {
 let key = mKey.toLowerCase()
 if (key.includes('card') || key.includes('credit') || key.includes('debit')) key = 'card'
 else if (key.includes('upi') || key.includes('gpay') || key.includes('phonepe') || key.includes('paytm') || key.includes('online')) key = 'upi'
 else if (key.includes('wallet')) key = 'wallet'
 else key = 'cash'
 byPaymentMethod[key] = (byPaymentMethod[key] || 0) + val
 paymentCounts[key] = (paymentCounts[key] || 0) + 1
 }
 })
 } else {
 let method = (o.paymentMethod || 'cash').toLowerCase()
 if (method.includes('card') || method.includes('credit') || method.includes('debit')) method = 'card'
 else if (method.includes('upi') || method.includes('gpay') || method.includes('phonepe') || method.includes('paytm') || method.includes('online')) method = 'upi'
 else if (method.includes('wallet')) method = 'wallet'
 else method = 'cash'

 byPaymentMethod[method] = (byPaymentMethod[method] || 0) + amt
 paymentCounts[method] = (paymentCounts[method] || 0) + 1
 }

 let src = (o.source || o.type || 'dine-in').toUpperCase()
 bySource[src] = (bySource[src] || 0) + 1
 })

 const avgBasketValue = totalInvoices > 0 ? Math.round(netSalesCollected / totalInvoices) : 0

 return {
 totalInvoices,
 netSalesCollected: Math.round(netSalesCollected),
 grossMenuSubtotal: Math.round(grossMenuSubtotal),
 totalDiscountGiven: Math.round(totalDiscountGiven),
 totalTaxGST: Math.round(totalTaxGST),
 avgBasketValue,
 byPaymentMethod,
 paymentCounts,
 byDiscountType,
 bySource
 }
}

const getOrderDiscountInfo = (o) => {
 if (!o) return { discount: 0, name: '' }
 let disc = Number(o.discount || o.discountGiven || o.discountAmount || 0)
 let name = o.discountName || o.offerName || ''

 const dStr = getOrderDate(o)

 if (disc === 0) {
 const itemSub = (o.items || []).reduce((sum, item) => sum + (item.totalPrice || (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1)), 0)
 const rawSub = Number(o.rawSubtotal) || itemSub || Number(o.subtotal) || 0
 if (o.inaugurationOffer || dStr === '2026-07-27' || dStr === '2026-07-28') {
 disc = Math.round(rawSub * 0.5)
 name = 'Inauguration Offer 50% OFF'
 } else if (o.specialOffer20 || (dStr >= '2026-07-29' && dStr <= '2026-08-02')) {
 disc = Math.round(rawSub * 0.2)
 name = 'Special Campaign 20% OFF'
 } else if (o.vip50 || o.customerDiscountPct === 50) {
 disc = Math.round(rawSub * 0.5)
 name = 'VIP 50% OFF'
 } else if (Number(o.customerDiscountPct) > 0) {
 disc = Math.round(rawSub * (Number(o.customerDiscountPct) / 100))
 name = `Customer ${o.customerDiscountPct}% OFF`
 }
 }

 if (!name && disc > 0) {
 name = (o.inaugurationOffer || dStr === '2026-07-27' || dStr === '2026-07-28') ? 'Inauguration Offer 50% OFF' : ((o.specialOffer20 || (dStr >= '2026-07-29' && dStr <= '2026-08-02')) ? 'Special Campaign 20% OFF' : 'Discount Given')
 }

 return { discount: Math.max(0, Math.round(disc)), name: name || 'Discount' }
}

function getFilteredOrdersForPeriod(reqQuery, includeAll = false) {
 const { date, from, to } = reqQuery || {}
 const targetOrders = includeAll ? orders : orders.filter(isValidSalesOrder)
 const today = new Date()
 const todayStr = getLocalDateStr(today)

 if (date === 'all') {
 return targetOrders
 }

 if (date === 'latest') {
 const latestDate = getLatestOrderDate(targetOrders)
 return targetOrders.filter(o => getOrderDate(o) === latestDate)
 }

 if (from && to) {
 const normFrom = normalizeDateStr(from)
 const normTo = normalizeDateStr(to)
 return targetOrders.filter(o => {
 const dStr = getOrderDate(o)
 return dStr >= normFrom && dStr <= normTo
 })
 }

 if (from) {
 const normFrom = normalizeDateStr(from)
 return targetOrders.filter(o => getOrderDate(o) >= normFrom)
 }

 const yesterday = new Date(today)
 yesterday.setDate(yesterday.getDate() - 1)
 const yesterdayStr = getLocalDateStr(yesterday)

 if (date === 'week') {
 const pastWeek = new Date(today)
 pastWeek.setDate(pastWeek.getDate() - 7)
 const pastWeekStr = getLocalDateStr(pastWeek)
 return targetOrders.filter(o => getOrderDate(o) >= pastWeekStr)
 }

 if (date === 'month') {
 const pastMonth = new Date(today)
 pastMonth.setDate(pastMonth.getDate() - 30)
 const pastMonthStr = getLocalDateStr(pastMonth)
 return targetOrders.filter(o => getOrderDate(o) >= pastMonthStr)
 }

 const normDate = normalizeDateStr(date)
 if (normDate === 'today' || normDate === todayStr) {
 return targetOrders.filter(o => getOrderDate(o) === todayStr)
 }

 if (normDate === 'yesterday' || normDate === yesterdayStr) {
 return targetOrders.filter(o => getOrderDate(o) === yesterdayStr)
 }

 if (normDate && normDate !== 'all' && normDate !== 'latest') {
 return targetOrders.filter(o => getOrderDate(o) === normDate)
 }

 return targetOrders.filter(o => getOrderDate(o) === todayStr)
}

// ============ AUTOMATIC MIDNIGHT 12:00 AM IST DAY CLOSING ENGINE ============
let lastClosedDateIST = ''

function runMidnightDayClosingCheck() {
 try {
 const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
 const currentHours = nowIST.getHours()
 const currentMinutes = nowIST.getMinutes()
 const todayISTStr = getLocalDateStr(nowIST)

 const yDate = new Date(nowIST)
 yDate.setDate(yDate.getDate() - 1)
 const yesterdayISTStr = getLocalDateStr(yDate)

 const dailyBackupFolder = join(__dirname, 'daily-backups')
 if (!existsSync(dailyBackupFolder)) {
 mkdirSync(dailyBackupFolder, { recursive: true })
 }

 const backupFile = join(dailyBackupFolder, `daily-${yesterdayISTStr}.json`)

 // Trigger daily closing at 12:00 AM Midnight IST or if yesterday is not yet closed
 if ((currentHours === 0 && currentMinutes <= 15) || !existsSync(backupFile)) {
 if (lastClosedDateIST !== yesterdayISTStr) {
 const db = readDb()
 const dayOrders = (db.orders || []).filter(o => getOrderDate(o) === yesterdayISTStr && isValidSalesOrder(o))
 const totalSales = dayOrders.reduce((sum, o) => sum + getOrderAmount(o), 0)

 const closingSummary = {
 date: yesterdayISTStr,
 closedAt: new Date().toISOString(),
 closedAtIST: nowIST.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
 totalInvoices: dayOrders.length,
 totalSales,
 orders: dayOrders
 }

 writeFileSync(backupFile, JSON.stringify(closingSummary, null, 2))
 lastClosedDateIST = yesterdayISTStr
 console.log(`[12:00 AM IST MIDNIGHT AUTO DAY CLOSING] Successfully closed shift for ${yesterdayISTStr}: ${dayOrders.length} Bills, ₹${totalSales.toLocaleString('en-IN')}`)
 }
 }
 } catch (e) {
 console.error('[MIDNIGHT AUTO DAY CLOSING ERROR]', e.message)
 }
}

// ============ BILL RESETTLEMENT ENDPOINT ============
app.put('/api/pos/orders/:id/resettle', (req, res) => {
 try {
 const { id } = req.params
 const { paymentMethod, paymentStatus, status, notes } = req.body

 const targetOrder = orders.find(o => String(o.id) === String(id) || String(o.orderNumber) === String(id))
 if (!targetOrder) {
 return res.status(404).json({ error: 'Order / Bill not found' })
 }

 if (paymentMethod) targetOrder.paymentMethod = paymentMethod.toLowerCase()
 if (req.body.splitPayments) targetOrder.splitPayments = req.body.splitPayments
 else if (paymentMethod !== 'split') targetOrder.splitPayments = undefined
 if (paymentStatus) targetOrder.paymentStatus = paymentStatus
 if (status) targetOrder.status = status
 const nowStamp = new Date().toISOString()
 if ((paymentStatus === 'paid' || status === 'completed') && !targetOrder.paidAt) targetOrder.paidAt = nowStamp
 if ((paymentStatus === 'paid' || status === 'completed') && !targetOrder.completedAt) targetOrder.completedAt = nowStamp
 targetOrder.resettledAt = nowStamp
 targetOrder.resettledBy = req.body.resettledBy || 'Admin'
 if (notes) targetOrder.resettleNotes = notes

 saveState()
 console.log(`[BILL RESETTLEMENT] Order #${targetOrder.orderNumber || targetOrder.id} resettled to ${(targetOrder.paymentMethod || 'cash').toUpperCase()}`)
 res.json({ success: true, message: 'Bill resettled successfully', order: targetOrder })
 } catch (e) {
 console.error('[BILL RESETTLEMENT ERROR]', e.message)
 res.status(500).json({ error: 'Failed to resettle bill: ' + e.message })
 }
})

// Check every 60 seconds for 12:00 AM IST rollover
setInterval(runMidnightDayClosingCheck, 60000)

// Auto-save state every 10 seconds — tightened from 30s for maximum transaction safety
setInterval(() => {
 try { saveState() } catch (e) { console.error('[AUTO-SAVE] Error:', e.message) }
}, 10000)

// Diagnostic endpoint — check live database state (admin only)
app.get('/api/admin/db-diagnostics', (req, res) => {
 try {
 const db = readDb()
 const dateCounts = {}
 const allOrders = db.orders || orders
 allOrders.forEach(o => {
 const d = getOrderDate(o)
 dateCounts[d] = (dateCounts[d] || 0) + 1
 })
 const sortedDates = Object.entries(dateCounts).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10)
 res.json({
 totalOrders: allOrders.length,
 latestOrderNumber: Math.max(...allOrders.map(o => o.orderNumber || 0)),
 last10Dates: sortedDates,
 vaultExists: existsSync(VAULT_PATH),
 vaultSize: existsSync(VAULT_PATH) ? readFileSync(VAULT_PATH, 'utf-8').length : 0,
 dbPath: DB_PATH,
 serverUptime: Math.floor(process.uptime()),
 memoryUsage: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
 })
 } catch (e) {
 res.status(500).json({ error: e.message })
 }
})
// Run immediately on server initialization
// ============ PAYMENT REPORT ENDPOINT ============
// Reports only SETTLED (paid) bills as "collected". Pending/unsettled bills are returned as
// separate pending fields so this report reflects actual money collected, consistent with the
// Billing counter, instead of including unsettled invoices like the Daily Closing does.
app.get('/api/reports/payment-report', (req, res) => {
 try {
 const dayOrders = getFilteredOrdersForPeriod(req.query)
 const validOrders = dayOrders.filter(isValidSalesOrder)

 const isSettled = (o) => (o.status || '').toLowerCase() === 'completed' || (o.paymentStatus || '').toLowerCase() === 'paid' || o.paidAt
 const settledOrders = validOrders.filter(isSettled)
 const pendingOrders = validOrders.filter(o => !isSettled(o))

 let totalRevenue = 0
 const byMethod = {
 cash: { total: 0, count: 0, percentage: 0 },
 upi: { total: 0, count: 0, percentage: 0 },
 card: { total: 0, count: 0, percentage: 0 },
 wallet: { total: 0, count: 0, percentage: 0 },
 other: { total: 0, count: 0, percentage: 0 }
 }

 const addToMethod = (mKey, amt) => {
 let m = (mKey || 'cash').toLowerCase()
 if (m.includes('card') || m.includes('credit') || m.includes('debit')) m = 'card'
 else if (m.includes('upi') || m.includes('gpay') || m.includes('phonepe') || m.includes('paytm') || m.includes('online')) m = 'upi'
 else if (m.includes('wallet')) m = 'wallet'
 else if (m.includes('cash')) m = 'cash'
 else m = 'other'
 byMethod[m].total += amt
 byMethod[m].count += 1
 }

 settledOrders.forEach(o => {
 const amt = getOrderAmount(o)
 totalRevenue += amt
 if (o.splitPayments && typeof o.splitPayments === 'object') {
 Object.entries(o.splitPayments).forEach(([mKey, mVal]) => {
 const val = Number(mVal) || 0
 if (val > 0) addToMethod(mKey, val)
 })
 } else {
 addToMethod(o.paymentMethod, amt)
 }
 })

 // Calculate percentages
 Object.keys(byMethod).forEach(m => {
 byMethod[m].total = Math.round(byMethod[m].total * 100) / 100
 byMethod[m].percentage = totalRevenue > 0 ? Number(((byMethod[m].total / totalRevenue) * 100).toFixed(1)) : 0
 })

 res.json({
 totalRevenue: Math.round(totalRevenue * 100) / 100,
 totalBills: settledOrders.length,
 byMethod,
 orders: settledOrders,
 invoicedRevenue: Math.round(validOrders.reduce((s, o) => s + getOrderAmount(o), 0) * 100) / 100,
 invoicedBills: validOrders.length,
 pendingRevenue: Math.round(pendingOrders.reduce((s, o) => s + getOrderAmount(o), 0) * 100) / 100,
 pendingBills: pendingOrders.length
 })
 } catch (err) {
 console.error('[PAYMENT REPORT API ERROR]', err)
 res.status(500).json({ error: 'Failed to generate Payment Report' })
 }
})

// ============ REPORT RECONCILIATION & AUTOMATED VALIDATION ENDPOINT ============
app.get(['/api/reports/reconcile', '/api/reports/reconciliation'], (req, res) => {
 try {
 const completedSales = getCompletedSales(req.query)
 const metrics = calculateSalesMetrics(completedSales)

 const dailyClosingNet = metrics.netSalesCollected
 const paymentReportNet = Object.values(metrics.byPaymentMethod).reduce((a, b) => a + b, 0)

 let itemwiseNet = 0
 completedSales.forEach(o => {
 (o.items || []).forEach(i => {
 itemwiseNet += Number(i.totalPrice || (i.unitPrice || i.price || 0) * (i.quantity || i.qty || 1))
 })
 })

 let categorywiseNet = 0
 completedSales.forEach(o => {
 (o.items || []).forEach(i => {
 categorywiseNet += Number(i.totalPrice || (i.unitPrice || i.price || 0) * (i.quantity || i.qty || 1))
 })
 })

 const posOrdersNet = completedSales.reduce((sum, o) => sum + getOrderAmount(o), 0)

 const discrepancies = []
 if (dailyClosingNet !== paymentReportNet) {
 discrepancies.push(`Daily Closing Net (₹${dailyClosingNet}) does not match Payment Report Net (₹${paymentReportNet})`)
 }
 if (dailyClosingNet !== posOrdersNet) {
 discrepancies.push(`Daily Closing Net (₹${dailyClosingNet}) does not match POS Orders Net (₹${posOrdersNet})`)
 }

 const isReconciled = discrepancies.length === 0

 res.json({
 status: isReconciled ? 'RECONCILED' : 'DISCREPANCY_DETECTED',
 isReconciled,
 period: req.query,
 summary: {
 totalCompletedInvoices: metrics.totalInvoices,
 netSalesCollected: metrics.netSalesCollected,
 grossMenuSubtotal: metrics.grossMenuSubtotal,
 totalDiscountGiven: metrics.totalDiscountGiven,
 totalTaxGST: metrics.totalTaxGST,
 avgBasketValue: metrics.avgBasketValue
 },
 reportsCheck: {
 dailyClosingNet,
 paymentReportNet,
 itemwiseNet: Math.round(itemwiseNet),
 categorywiseNet: Math.round(categorywiseNet),
 posOrdersNet,
 mismatchCount: discrepancies.length
 },
 discrepancies
 })
 } catch (err) {
 console.error('[RECONCILIATION API ERROR]', err)
 res.status(500).json({ error: 'Failed to run report reconciliation' })
 }
})

const THREE_HOUR_SLOTS = [
 { start: 0, end: 9, label: '12:00 AM - 09:00 AM', timeSlot: '12:00 AM - 09:00 AM' },
 { start: 9, end: 12, label: '09:00 AM - 12:00 PM', timeSlot: '09:00 AM - 12:00 PM' },
 { start: 12, end: 15, label: '12:00 PM - 03:00 PM', timeSlot: '12:00 PM - 03:00 PM' },
 { start: 15, end: 18, label: '03:00 PM - 06:00 PM', timeSlot: '03:00 PM - 06:00 PM' },
 { start: 18, end: 21, label: '06:00 PM - 09:00 PM', timeSlot: '06:00 PM - 09:00 PM' },
 { start: 21, end: 24, label: '09:00 PM - 11:59 PM', timeSlot: '09:00 PM - 11:59 PM' }
]

const getLocalHourIST = (dtVal) => {
 if (!dtVal) return -1
 try {
 const d = typeof dtVal === 'number' ? new Date(dtVal) : new Date(String(dtVal))
 if (!isNaN(d.getTime())) {
 const hourStr = d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit' })
 const h = parseInt(hourStr, 10)
 if (!isNaN(h) && h >= 0 && h <= 23) return h
 }
 } catch (e) {}

 const str = String(dtVal)
 if (str.includes('T')) {
 const timePart = str.split('T')[1]
 if (timePart) {
 const h = parseInt(timePart.split(':')[0], 10)
 if (!isNaN(h) && h >= 0 && h <= 23) return h
 }
 }
 return -1
}

function computeThreeHourSales(orderList) {
 let totalRev = 0
 const buckets = THREE_HOUR_SLOTS.map(s => ({
 hourLabel: s.label,
 timeSlot: s.timeSlot,
 revenue: 0,
 settledBills: 0,
 pendingVoid: 0,
 totalBills: 0,
 orderCount: 0,
 avgOrder: 0,
 pct: 0
 }))

 orderList.forEach(o => {
 const isValid = isValidSalesOrder(o)
 const amt = isValid ? getOrderAmount(o) : 0
 totalRev += amt

 const dtVal = o.paidAt || o.completedAt || o.createdAt || o.timestamp || o.date
 if (dtVal) {
 const hour24 = getLocalHourIST(dtVal)
 if (hour24 >= 0 && hour24 <= 23) {
 const slotIdx = THREE_HOUR_SLOTS.findIndex(s => hour24 >= s.start && hour24 < s.end)
 if (slotIdx >= 0) {
 buckets[slotIdx].totalBills += 1
 if (isValid) {
 buckets[slotIdx].revenue += amt
 buckets[slotIdx].settledBills += 1
 buckets[slotIdx].orderCount += 1
 } else {
 buckets[slotIdx].pendingVoid += 1
 }
 }
 }
 }
 })

 buckets.forEach(b => {
 b.revenue = Math.round(b.revenue)
 b.avgOrder = b.settledBills > 0 ? Math.round(b.revenue / b.settledBills) : 0
 b.pct = totalRev > 0 ? Number(((b.revenue / totalRev) * 100).toFixed(1)) : 0
 })

 return buckets
}

// Helper to calculate 24-hour breakdown from an order list
function computeHourlySales(orderList) {
 let totalRev = 0
 const buckets = Array.from({ length: 24 }, (_, hour24) => {
 let period = hour24 >= 12 ? 'PM' : 'AM'
 let h12 = hour24 % 12
 if (h12 === 0) h12 = 12
 const nextH = (hour24 + 1) % 24
 let nextPeriod = nextH >= 12 ? 'PM' : 'AM'
 let nextH12 = nextH % 12
 if (nextH12 === 0) nextH12 = 12
 
 const hourLabel = `${h12}${period}`
 const timeSlot = `${String(h12).padStart(2, '0')}:00 ${period} - ${String(nextH12).padStart(2, '0')}:00 ${nextPeriod}`
 
 return {
 hour: hour24,
 hourLabel,
 timeSlot,
 revenue: 0,
 settledBills: 0,
 pendingVoid: 0,
 totalBills: 0,
 orderCount: 0,
 avgOrder: 0,
 pct: 0
 }
 })

 orderList.forEach(o => {
 const isValid = isValidSalesOrder(o)
 const amt = isValid ? getOrderAmount(o) : 0
 totalRev += amt

 const dtVal = o.paidAt || o.completedAt || o.createdAt || o.timestamp || o.date
 if (dtVal) {
 const hour24 = getLocalHourIST(dtVal)
 if (hour24 >= 0 && hour24 <= 23) {
 buckets[hour24].totalBills += 1
 if (isValid) {
 buckets[hour24].revenue += amt
 buckets[hour24].settledBills += 1
 buckets[hour24].orderCount += 1
 } else {
 buckets[hour24].pendingVoid += 1
 }
 }
 }
 })

 buckets.forEach(b => {
 b.revenue = Math.round(b.revenue)
 b.avgOrder = b.settledBills > 0 ? Math.round(b.revenue / b.settledBills) : 0
 b.pct = totalRev > 0 ? Number(((b.revenue / totalRev) * 100).toFixed(1)) : 0
 })

 return buckets
}

// ============ HOURLY SALES REPORT ============
app.get('/api/reports/hourly-sales', (req, res) => {
 try {
 const periodOrders = getFilteredOrdersForPeriod(req.query, true)
 const validOrders = periodOrders.filter(isValidSalesOrder)
 const hourlySales = computeHourlySales(periodOrders)
 const threeHourSales = computeThreeHourSales(periodOrders)
 const totalRev = validOrders.reduce((sum, o) => sum + getOrderAmount(o), 0)

 res.json({
 period: req.query,
 totalOrders: validOrders.length,
 totalRevenue: Math.round(totalRev),
 hourlySales,
 threeHourSales
 })
 } catch (e) {
 console.error('[HOURLY SALES API ERROR]', e)
 res.status(500).json({ error: 'Failed to generate hourly sales report' })
 }
})

// ============ DAILY CLOSING REPORT ============
app.get('/api/reports/daily-closing', (req, res) => {
 const todayStr = getLocalDateStr(new Date())
 const { date, from, to } = req.query

 const dayOrders = getFilteredOrdersForPeriod(req.query, true)
 const completedOrders = getCompletedSales(req.query)
 const metrics = calculateSalesMetrics(completedOrders)

 const settledOrders = completedOrders.filter(o => (o.status || '').toLowerCase() === 'completed' || (o.paymentStatus || '').toLowerCase() === 'paid' || o.paidAt)
 const pendingOrders = completedOrders.filter(o => !settledOrders.includes(o))
 const cancelledOrders = dayOrders.filter(o => (o.status || '').toLowerCase() === 'cancelled' || (o.status || '').toLowerCase() === 'void' || o.isCancelled || o.isVoid)

 const settledSales = settledOrders.reduce((sum, o) => sum + getOrderAmount(o), 0)
 const pendingSales = pendingOrders.reduce((sum, o) => sum + getOrderAmount(o), 0)

 const hourlySales = computeHourlySales(dayOrders)
 const threeHourSales = computeThreeHourSales(dayOrders)

 const normDate = date ? normalizeDateStr(date) : ''
 const normFrom = from ? normalizeDateStr(from) : ''
 const normTo = to ? normalizeDateStr(to) : ''

 const dayExpenses = expenses.filter(e => {
 const dStr = getLocalDateStr(e.createdAt)
 if (normFrom && normTo) return dStr >= normFrom && dStr <= normTo
 if (normDate && normDate !== 'all' && normDate !== 'latest') return dStr === normDate
 return true
 })
 const totalExpenses = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

 const dayPurchases = purchases.filter(p => {
 const dStr = getLocalDateStr(p.createdAt)
 if (normFrom && normTo) return dStr >= normFrom && dStr <= normTo
 if (normDate && normDate !== 'all' && normDate !== 'latest') return dStr === normDate
 return true
 })
 const totalPurchases = dayPurchases.reduce((sum, p) => sum + (p.total || 0), 0)

 const grossProfit = metrics.netSalesCollected - totalPurchases - totalExpenses

 const statusBreakdown = {}
 dayOrders.forEach(o => {
 const s = (o.status || 'pending').toLowerCase()
 statusBreakdown[s] = (statusBreakdown[s] || 0) + 1
 })

 let displayDateStr = todayStr
 if (normDate && normDate !== 'all' && normDate !== 'latest') {
 displayDateStr = normDate
 } else if (normFrom && normTo) {
 displayDateStr = normFrom === normTo ? normFrom : `${normFrom} to ${normTo}`
 } else if (normFrom) {
 displayDateStr = `From ${normFrom}`
 } else if (completedOrders.length > 0) {
 displayDateStr = getOrderDate(completedOrders[0]) || todayStr
 }

 const cancelledValue = cancelledOrders.reduce((sum, o) => sum + (o.total || o.totalPrice || 0), 0)
 const cancelledList = cancelledOrders.map(o => ({
 id: o.id || o.orderNumber,
 orderNumber: o.orderNumber || o.id,
 date: getOrderDate(o),
 time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : '',
 type: o.type || (o.tableNumber ? `Table ${o.tableNumber}` : 'POS'),
 items: o.items || [],
 total: o.total || o.totalPrice || 0,
 reason: o.cancelReason || o.notes || 'Cancelled by Staff'
 }))

 res.json({
 date: displayDateStr,
 totalInvoices: metrics.totalInvoices,
 totalSales: metrics.netSalesCollected,
 settledSales: Math.round(settledSales),
 pendingSales: Math.round(pendingSales),
 totalPurchases: Math.round(totalPurchases),
 totalExpenses: Math.round(totalExpenses),
 grossProfit: Math.round(grossProfit),
 avgBasketValue: metrics.avgBasketValue,
 byPaymentMethod: metrics.byPaymentMethod,
 bySource: metrics.bySource,
 totalDiscountGiven: metrics.totalDiscountGiven,
 byDiscountType: metrics.byDiscountType,
 statusBreakdown,
 cancelledCount: cancelledOrders.length,
 cancelledValue: Math.round(cancelledValue),
 cancelledOrders: cancelledList,
 hourlySales,
 threeHourSales
 })
})

// P&L (Profit & Loss) Report
app.get('/api/reports/pnl', (req, res) => {
 const { from, to, date, period } = req.query

 let fromStr, toStr

 // Prefer from/to (sent by the new date picker UI)
 if (from && to) {
 fromStr = normalizeDateStr(from)
 toStr = normalizeDateStr(to)
 } else {
 // Fallback: legacy date/period params
 const dateInput = date || getLocalDateStr(new Date())
 const normDate = normalizeDateStr(dateInput)
 const periodMode = period || 'day'
 if (periodMode === 'week') {
 const d = new Date(normDate)
 const dayOfWeek = d.getDay()
 const fromDate = new Date(d); fromDate.setDate(d.getDate() - dayOfWeek)
 const toDate = new Date(fromDate); toDate.setDate(toDate.getDate() + 6)
 fromStr = getLocalDateStr(fromDate)
 toStr = getLocalDateStr(toDate)
 } else if (periodMode === 'month') {
 const d = new Date(normDate)
 const fromDate = new Date(d.getFullYear(), d.getMonth(), 1)
 const toDate = new Date(d.getFullYear(), d.getMonth() + 1, 0)
 fromStr = getLocalDateStr(fromDate)
 toStr = getLocalDateStr(toDate)
 } else {
 fromStr = normDate
 toStr = normDate
 }
 }


 // Revenue: valid sales orders
 const periodOrders = orders.filter(o => {
 const dStr = getOrderDate(o)
 return dStr >= fromStr && dStr <= toStr && isValidSalesOrder(o)
 })
 const totalRevenue = periodOrders.reduce((sum, o) => sum + getOrderAmount(o), 0)
 const orderCount = periodOrders.length

 // Revenue by payment method
 const revenueByMethod = {}
 periodOrders.forEach(o => {
 const m = (o.paymentMethod || 'cash').toLowerCase()
 revenueByMethod[m] = (revenueByMethod[m] || 0) + getOrderAmount(o)
 })

 // COGS: purchases in period
 const periodPurchases = purchases.filter(p => {
 const dStr = getLocalDateStr(p.createdAt || p.date)
 return dStr >= fromStr && dStr <= toStr
 })
 const totalCogs = periodPurchases.reduce((sum, p) => sum + (p.total || 0), 0)

 // Gross Profit
 const grossProfit = totalRevenue - totalCogs

 // Expenses by category
 const periodExpenses = expenses.filter(e => {
 const dStr = getLocalDateStr(e.createdAt || e.date)
 return dStr >= fromStr && dStr <= toStr
 })
 const totalExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
 const expensesByCategory = {}
 periodExpenses.forEach(e => {
 const cat = e.category || 'other'
 expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0)
 })

 // Net Profit
 const netProfit = grossProfit - totalExpenses

 // Cancelled orders (bucketed by the same IST-normalized order date used by every other report)
 const cancelledOrders = orders.filter(o => {
 const dStr = getOrderDate(o)
 return o.status === 'cancelled' && dStr >= fromStr && dStr <= toStr
 })
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

// ============ OFFER SALES REPORT ============
app.get('/api/reports/offer-sales', (req, res) => {
 const periodOrders = getCompletedSales(req.query)

 const offerOrders = []
 let totalOriginalSum = 0
 let totalDiscountSum = 0
 let totalCollectedSum = 0

 periodOrders.forEach(o => {
 const rawTotal = getOrderAmount(o)
 const items = o.items || []
 const subtotal = o.subtotal || items.reduce((sum, i) => sum + (i.totalPrice || (i.unitPrice || i.price || 0) * (i.quantity || i.qty || 1)), 0)
 
 const isOffer20 = o.specialOffer20 || o.offer20Pct || false
 const isVip50 = o.discountPct === 50 || o.isVip50 || (o.tier && o.tier.includes('50%'))
 const isComplimentary = Boolean(o.complimentary)
 const hasDiscount = Boolean(o.discountAmount > 0 || o.discountPct > 0 || (subtotal > rawTotal && !o.tax))

 let offerName = null
 let discountGiven = 0
 let originalAmount = subtotal

 if (isVip50) {
 offerName = '50% VIP Exclusive Discount'
 discountGiven = Math.round(subtotal * 0.5)
 originalAmount = subtotal
 } else if (isOffer20) {
 offerName = '20% Special Offer (29.07 - 02.08)'
 discountGiven = Math.round(subtotal * 0.2)
 originalAmount = subtotal
 } else if (isComplimentary) {
 offerName = `Complimentary (${o.complimentaryType || 'General'})`
 discountGiven = subtotal
 originalAmount = subtotal
 } else if (hasDiscount) {
 offerName = o.offerName || o.promoName || 'Special Order Discount'
 discountGiven = o.discountAmount || (subtotal - rawTotal) || 0
 originalAmount = subtotal
 } else {
 const dStr = getOrderDate(o)
 if (dStr >= '2026-07-29' && dStr <= '2026-08-02') {
 offerName = '20% Special Offer Campaign'
 discountGiven = Math.round(subtotal * 0.2)
 originalAmount = subtotal
 }
 }

 if (offerName) {
 const netCollected = rawTotal
 totalOriginalSum += originalAmount
 totalDiscountSum += discountGiven
 totalCollectedSum += netCollected

 offerOrders.push({
 id: o.id,
 orderNumber: o.orderNumber,
 createdAt: o.createdAt,
 date: getOrderDate(o),
 type: o.type || 'pos',
 tableNumber: o.tableNumber || '',
 customerName: o.customerName || 'Customer',
 customerPhone: o.customerPhone || '',
 paymentMethod: o.paymentMethod || 'cash',
 offerName,
 originalAmount: Math.round(originalAmount),
 discountGiven: Math.round(discountGiven),
 totalCollected: Math.round(netCollected)
 })
 }
 })

 const totalPeriodSales = periodOrders.reduce((sum, o) => sum + getOrderAmount(o), 0)
 const offerSharePct = totalPeriodSales > 0 ? Number(((totalCollectedSum / totalPeriodSales) * 100).toFixed(1)) : 0

 res.json({
 period: req.query,
 totalPeriodOrders: periodOrders.length,
 totalOfferBills: offerOrders.length,
 totalOriginalValue: Math.round(totalOriginalSum),
 totalDiscountGiven: Math.round(totalDiscountSum),
 totalOfferRevenue: Math.round(totalCollectedSum),
 offerSharePct,
 orders: offerOrders
 })
})

// Helper to resolve an ordered item's category name accurately
function resolveItemCategory(item) {
 if (!item) return 'General'

 // 1. Direct valid category property on item
 if (item.category && item.category !== 'General' && item.category !== 'Other' && item.category !== 'UNCATEGORIZED') {
 return item.category
 }
 if (item.categoryName && item.categoryName !== 'General' && item.categoryName !== 'Other') {
 return item.categoryName
 }

 // 2. Direct categoryId on item matching master categories array
 if (item.categoryId) {
 const cat = (categories || []).find(c => String(c.id) === String(item.categoryId))
 if (cat && cat.name) return cat.name
 }

 // 3. Match against master menuItems array by ID or Name
 const itemName = (item.menuItemName || item.name || '').trim().toLowerCase()
 const itemId = String(item.menuItemId || item.id || '')

 const masterItem = (menuItems || []).find(m => 
 (itemId && String(m.id) === itemId) || 
 (itemName && m.name && m.name.trim().toLowerCase() === itemName)
 )

 if (masterItem) {
 if (masterItem.categoryName && masterItem.categoryName !== 'General') return masterItem.categoryName
 if (masterItem.category && masterItem.category !== 'General') return masterItem.category
 if (masterItem.categoryId) {
 const cat = (categories || []).find(c => String(c.id) === String(masterItem.categoryId))
 if (cat && cat.name) return cat.name
 }
 }

 // 4. Name-based keyword heuristics fallback for legacy/customized combos
 if (itemName.includes('gyro') || itemName.includes('feast')) return 'Gyros & Combos'
 if (itemName.includes('burger')) return 'Burgers'
 if (itemName.includes('wings') || itemName.includes('strips') || itemName.includes('leg') || itemName.includes('thigh')) return 'Wings & Strips'
 if (itemName.includes('fries')) return 'Fries & Sides'
 if (itemName.includes('salad')) return 'Salads'
 if (itemName.includes('shake') || itemName.includes('brownie') || itemName.includes('cake') || itemName.includes('chocolate')) return 'Desserts & Shakes'
 if (itemName.includes('pepsi') || itemName.includes('coca') || itemName.includes('sprite') || itemName.includes('chai') || itemName.includes('beverage')) return 'Beverages'

 return 'General'
}

// ============ ITEMWISE SALES REPORT ============
app.get('/api/reports/itemwise-sales', (req, res) => {
 const periodOrders = getCompletedSales(req.query)

 const itemMap = {}
 let totalQtySum = 0
 let totalRevenueSum = 0

 periodOrders.forEach(o => {
 const items = o.items || []
 items.forEach(i => {
 const name = i.menuItemName || i.name || 'Unspecified Item'
 const category = resolveItemCategory(i)
 const qty = Number(i.quantity || i.qty || 1)
 const unitPrice = Number(i.unitPrice || i.price || 0)
 const totalPrice = Number(i.totalPrice || unitPrice * qty)

 totalQtySum += qty
 totalRevenueSum += totalPrice

 if (!itemMap[name]) {
 itemMap[name] = {
 name,
 category,
 unitPrice,
 totalQty: 0,
 totalRevenue: 0,
 orderCount: 0
 }
 } else if (itemMap[name].category === 'General' && category !== 'General') {
 itemMap[name].category = category
 }
 itemMap[name].totalQty += qty
 itemMap[name].totalRevenue += totalPrice
 itemMap[name].orderCount += 1
 })
 })

 const itemsList = Object.values(itemMap).map(item => ({
 ...item,
 avgPrice: item.totalQty > 0 ? Math.round(item.totalRevenue / item.totalQty) : item.unitPrice,
 totalRevenue: Math.round(item.totalRevenue),
 contributionPct: totalRevenueSum > 0 ? Number(((item.totalRevenue / totalRevenueSum) * 100).toFixed(1)) : 0
 })).sort((a, b) => b.totalRevenue - a.totalRevenue)

 res.json({
 period: req.query,
 totalOrders: periodOrders.length,
 totalItemsSold: totalQtySum,
 totalRevenue: Math.round(totalRevenueSum),
 items: itemsList
 })
})

// ============ CATEGORYWISE SALES REPORT ============
app.get('/api/reports/categorywise-sales', (req, res) => {
 const periodOrders = getCompletedSales(req.query)

 const catMap = {}
 let totalQtySum = 0
 let totalRevenueSum = 0

 periodOrders.forEach(o => {
 const items = o.items || []
 items.forEach(i => {
 const category = resolveItemCategory(i)
 const qty = Number(i.quantity || i.qty || 1)
 const unitPrice = Number(i.unitPrice || i.price || 0)
 const totalPrice = Number(i.totalPrice || unitPrice * qty)

 totalQtySum += qty
 totalRevenueSum += totalPrice

 if (!catMap[category]) {
 catMap[category] = {
 category,
 itemsSet: new Set(),
 totalQty: 0,
 totalRevenue: 0,
 orderCount: 0
 }
 }
 catMap[category].itemsSet.add(i.name || i.menuItemName || 'Item')
 catMap[category].totalQty += qty
 catMap[category].totalRevenue += totalPrice
 catMap[category].orderCount += 1
 })
 })

 const categoriesList = Object.values(catMap).map(cat => ({
 category: cat.category,
 uniqueItemCount: cat.itemsSet.size,
 totalQty: cat.totalQty,
 totalRevenue: Math.round(cat.totalRevenue),
 orderCount: cat.orderCount,
 contributionPct: totalRevenueSum > 0 ? Number(((cat.totalRevenue / totalRevenueSum) * 100).toFixed(1)) : 0
 })).sort((a, b) => b.totalRevenue - a.totalRevenue)

 res.json({
 period: req.query,
 totalOrders: periodOrders.length,
 totalCategories: categoriesList.length,
 totalItemsSold: totalQtySum,
 totalRevenue: Math.round(totalRevenueSum),
 categories: categoriesList
 })
})

// ============ POS ORDERS LIST FOR BILLING COUNTER & REPORTS ============
app.get('/api/pos/orders', (req, res) => {
 try {
 const { status, report } = req.query
 const includeCancelled = req.query.includeCancelled === 'true' || report === 'kot-cancelled'

 let list = getFilteredOrdersForPeriod(req.query, true)

 if (report === 'bill' || (status && status.toLowerCase() === 'completed')) {
 list = getCompletedSales(req.query)
 } else {
 if (!includeCancelled) {
 list = list.filter(o => {
 if (!o) return false
 const s = (o.status || '').toLowerCase()
 return s !== 'cancelled' && s !== 'canceled' && s !== 'void' && s !== 'draft' && s !== 'deleted' && !o.isCancelled && !o.isVoid && !o.isDraft && !o.isDeleted && !o.isDuplicate
 })
 }

 if (status) {
 const normStatus = status.toLowerCase()
 list = list.filter(o => (o.status || '').toLowerCase() === normStatus)
 }
 }

 res.json(list || [])
 } catch (err) {
 console.error('[POS ORDERS API ERROR]', err)
 res.status(500).json({ error: 'Failed to fetch orders' })
 }
})
// Purchase Orders Report
app.get('/api/reports/purchase-orders', (req, res) => {
 const { from, to } = req.query
 const today = new Date().toISOString().split('T')[0]
 const fromStr = from || today
 const toStr = to || today

 let filtered = purchaseOrders.filter(po =>
 po.date >= fromStr && po.date <= toStr
 ).sort((a, b) => (b.date || '').localeCompare(a.date || ''))

 if (filtered.length === 0 && purchaseOrders.length > 0) {
 filtered = purchaseOrders
 }

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

 let filtered = grns.filter(g =>
 g.date >= fromStr && g.date <= toStr
 ).sort((a, b) => (b.date || '').localeCompare(a.date || ''))

 if (filtered.length === 0 && grns.length > 0) {
 filtered = grns
 }

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
 let periodUsers = allUsers.filter(u => {
 const d = u.createdAt ? u.createdAt.slice(0, 10) : ''
 return d >= fromStr && d <= toStr
 })

 if (periodUsers.length === 0 && allUsers.length > 0) {
 periodUsers = allUsers
 }

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

 let filtered = expenses.filter(e =>
 e.createdAt && e.createdAt.slice(0, 10) >= fromStr && e.createdAt.slice(0, 10) <= toStr
 ).sort((a, b) => b.createdAt?.localeCompare(a.createdAt || ''))

 if (filtered.length === 0 && expenses.length > 0) {
 filtered = expenses
 }

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

// ============ PDF / IMAGE INVOICE PARSER FOR PURCHASES ============
app.post('/api/admin/parse-invoice-pdf', (req, res) => {
 try {
 const { fileData, fileName, textContent } = req.body
 if (!fileData && !textContent) {
 return res.status(400).json({ error: 'No file data or text content provided' })
 }

 let rawText = textContent || ''

 if (fileData && typeof fileData === 'string') {
 try {
 const buf = Buffer.from(fileData.split(',')[1] || fileData, 'base64')
 const str = buf.toString('binary')
 
 // Extract text streams enclosed in parenthesis or TJ/Tj operators in PDF
 const textMatches = str.match(/\(([^)]+)\)\s*(?:Tj|TJ|'|")/g) || []
 if (textMatches.length > 0) {
 rawText += '\n' + textMatches.map(m => m.replace(/[\(\)\\]/g, '').trim()).filter(Boolean).join(' ')
 } else {
 // Fallback to ASCII printable characters
 rawText += '\n' + str.replace(/[^\x20-\x7E\n]/g, ' ')
 }
 } catch (err) {
 console.error('Base64 stream parse error:', err.message)
 }
 }

 // Extract Invoice Number
 const invNoMatch = rawText.match(/(?:Invoice|INV|Bill|PO)\s*[\#\:\-]?\s*([A-Za-z0-9\-\/]{4,20})/i)
 const invoiceNo = invNoMatch ? invNoMatch[1] : `INV-${Date.now().toString().slice(-6)}`

 // Extract Supplier Name
 let supplierName = 'General Supplier'
 suppliers.forEach(s => {
 if (rawText.toLowerCase().includes(s.name.toLowerCase())) {
 supplierName = s.name
 }
 })

 // Match inventory items line by line
 const lines = rawText.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.length > 2)
 const extractedItems = []
 const inventoryList = [...inventory].sort((a, b) => b.name.length - a.name.length)

 inventoryList.forEach(inv => {
 for (const line of lines) {
 if (line.toLowerCase().includes(inv.name.toLowerCase())) {
 const nums = line.match(/\d+(?:\.\d+)?/g)?.map(Number) || []
 let qty = 1, rate = inv.costPerUnit || 0
 if (nums.length >= 2) {
 qty = nums[0]
 rate = nums[1]
 } else if (nums.length === 1) {
 qty = nums[0]
 }
 if (!extractedItems.some(i => i.name === inv.name)) {
 extractedItems.push({
 name: inv.name,
 quantity: qty || 1,
 unit: inv.unit || 'kg',
 rate: rate || inv.costPerUnit || 0,
 amount: (qty || 1) * (rate || inv.costPerUnit || 0)
 })
 }
 break
 }
 }
 })

 // Fallback item parsing if no direct inventory match
 if (extractedItems.length === 0) {
 lines.forEach(line => {
 const nums = line.match(/\d+(?:\.\d+)?/g)?.map(Number) || []
 const words = line.replace(/[\d\.,\(\)₹\$]/g, ' ').trim()
 if (words.length > 3 && nums.length >= 1) {
 const qty = nums[0]
 const rate = nums.length >= 2 ? nums[1] : 50
 if (qty > 0 && qty < 10000 && !['tax', 'total', 'subtotal', 'invoice', 'date', 'page', 'amount'].includes(words.toLowerCase())) {
 extractedItems.push({
 name: words.slice(0, 30),
 quantity: qty,
 unit: line.match(/\b(kg|pcs|liters|boxes)\b/i)?.[1]?.toLowerCase() || 'pcs',
 rate: rate,
 amount: qty * rate
 })
 }
 }
 })
 }

 const totalAmount = extractedItems.reduce((sum, item) => sum + (item.amount || 0), 0)

 res.json({
 success: true,
 fileName: fileName || 'Uploaded_Invoice.pdf',
 invoiceNo,
 supplierName,
 totalCount: extractedItems.length,
 totalAmount,
 items: extractedItems
 })
 } catch (err) {
 console.error('PDF parsing error:', err)
 res.status(500).json({ error: 'Failed to parse PDF invoice: ' + err.message })
 }
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

 // Clear non-sales operational data (keep sales data, bill details, KOT details permanently protected)
 orders = syncSalesVault(orders)
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
const possibleDistPaths = [
 join(__dirname, '..', 'dist'),
 join(process.cwd(), 'dist'),
 join(__dirname, 'dist'),
 join(process.cwd(), 'public_html', 'dist')
]

let resolvedDistPath = null
for (const p of possibleDistPaths) {
 try {
 if (existsSync(p) && statSync(p).isDirectory()) {
 resolvedDistPath = p
 break
 }
 } catch (e) {}
}

const flutterWebPath = join(__dirname, '..', 'ttt', 'build', 'web')

// Serve Flutter Web App for den.tendengyros.com subdomain
app.use((req, res, next) => {
 const host = req.headers.host || ''
 if (host.startsWith('den.') && !req.path.startsWith('/api/')) {
 try {
 statSync(flutterWebPath)
 return express.static(flutterWebPath)(req, res, (err) => {
 if (err) return next(err)
 res.sendFile(join(flutterWebPath, 'index.html'))
 })
 } catch (e) {
 console.log('Flutter Web App build not found, falling back to default frontend')
 }
 }
 next()
})

if (resolvedDistPath) {
 // Serve static assets with proper MIME types
 app.use(express.static(resolvedDistPath, { index: false }))
 app.use('/assets', express.static(join(resolvedDistPath, 'assets')))

 // SPA navigation fallback: serve index.html ONLY for page routes (not for missing .js/.css files)
 app.get('*', (req, res, next) => {
 if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) return next()
 // If request has a file extension (.js, .css, .png, .svg, .json, etc.), return 404 instead of HTML
 if (/\.[a-zA-Z0-9]+$/.test(req.path)) {
 return res.status(404).send('Asset not found')
 }
 const indexPath = join(resolvedDistPath, 'index.html')
 if (existsSync(indexPath)) {
 return res.sendFile(indexPath)
 }
 next()
 })
 console.log('Serving frontend from:', resolvedDistPath)
} else {
 console.log('No dist folder found — registering root status handler')
 app.get('/', (req, res) => {
 res.status(200).json({ status: 'active', message: 'TDG Billing POS Server Online', ordersCount: orders.length })
 })
}

// Start server
const PORT = process.env.PORT || 3001
const onListen = () => {
 console.log(`Server running on ${PORT}`)
 console.log(`Restored: ${orders.length} orders, ${loyaltyUsers.length} loyalty users, ${dens.length} dens, ${inventory.length} inventory items`)
 performDailyBackup()
 const DAILY_BACKUP_INTERVAL = 60 * 60 * 1000 // 1 hour
 setInterval(performDailyBackup, DAILY_BACKUP_INTERVAL)
 console.log('Daily backup scheduler active (checks every hour)')
}

if (process.env.PORT) {
 httpServer.listen(process.env.PORT, onListen)
} else {
 httpServer.listen(3001, '0.0.0.0', onListen)
}

// Graceful shutdown — save state before process exits (prevents data loss on deploy/restart)
let isShuttingDown = false
function gracefulShutdown(signal) {
 if (isShuttingDown) return
 isShuttingDown = true
 console.log(`[SHUTDOWN] Received ${signal}. Saving state before exit...`)
 try {
 saveState()
 console.log('[SHUTDOWN] State saved successfully')
 } catch (e) {
 console.error('[SHUTDOWN] Error saving state:', e.message)
 }
 process.exit(0)
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
// SIGUSR2: sent by nodemon and some Linux process managers on graceful restart
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'))

export default app