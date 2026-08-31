// Local Backup Utility - saves every bill to browser IndexedDB on the billing PC
// This acts as a safety net if the server fails to save a bill

const DB_NAME = 'tdg-local-backup'
const STORE_NAME = 'bills'
const DB_VERSION = 1

function openBackupDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('orderNumber', 'orderNumber', { unique: false })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

// Save a bill to local IndexedDB backup
export async function saveToLocalBackup(order) {
  try {
    if (!order || !order.id) return
    const db = await openBackupDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const record = {
        ...order,
        _savedLocally: new Date().toISOString(),
        _pcHostname: window.location.hostname
      }
      const req = store.put(record)
      req.onsuccess = () => {
        console.log('[LOCAL BACKUP] Bill #' + order.orderNumber + ' saved to IndexedDB ✅')
        resolve()
      }
      req.onerror = (e) => reject(e.target.error)
    })
  } catch (e) {
    console.warn('[LOCAL BACKUP] Failed to save to IndexedDB:', e.message)
  }
}

// Get all locally backed up bills (optionally filter by date range)
export async function getLocalBackupBills(fromDate = null, toDate = null) {
  try {
    const db = await openBackupDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = (e) => {
        let bills = e.target.result || []
        if (fromDate) bills = bills.filter(b => (b.createdAt || b.date || '') >= fromDate)
        if (toDate)   bills = bills.filter(b => (b.createdAt || b.date || '') <= toDate)
        bills.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        resolve(bills)
      }
      req.onerror = (e) => reject(e.target.error)
    })
  } catch (e) {
    console.warn('[LOCAL BACKUP] Failed to read IndexedDB:', e.message)
    return []
  }
}

// Export bills as a CSV file and trigger download on billing PC
export async function downloadBillsAsCSV(fromDate = null, toDate = null) {
  const bills = await getLocalBackupBills(fromDate, toDate)
  if (bills.length === 0) {
    alert('No local backup bills found for the selected period.')
    return 0
  }

  const rows = [
    ['Bill #', 'KOT #', 'Date (IST)', 'Time (IST)', 'Type', 'Payment', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Customer', 'Phone', 'Status', 'Source']
  ]

  for (const b of bills) {
    const dt = new Date(b.createdAt || b.date || '')
    const datePart = dt.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' })
    const timePart = dt.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
    const itemsList = (b.items || []).map(i => `${i.menuItemName}(x${i.quantity})`).join('; ')

    rows.push([
      b.orderNumber || '',
      b.kotNumber || '',
      datePart,
      timePart,
      b.type || '',
      b.paymentMethod || '',
      `"${itemsList}"`,
      b.rawSubtotal || b.subtotal || '',
      b.discount || 0,
      b.tax || 0,
      b.total || '',
      b.customerName || '',
      b.customerPhone || '',
      b.status || '',
      b.source || 'pos'
    ])
  }

  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
  link.href = url
  link.download = `TDG_Bills_LocalBackup_${today}.csv`
  link.click()
  URL.revokeObjectURL(url)

  return bills.length
}

// Get count of locally backed up bills for today
export async function getTodayLocalBackupCount() {
  try {
    const bills = await getLocalBackupBills()
    const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) // YYYY-MM-DD
    return bills.filter(b => (b.createdAt || b.date || '').startsWith(todayIST)).length
  } catch (e) {
    return 0
  }
}
