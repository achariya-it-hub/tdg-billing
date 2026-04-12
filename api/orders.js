// Simple ID generator
const genId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

// In-memory store for Vercel serverless (demo mode)
let orders = []
let orderNumber = 1000

export default function handler(req, res) {
  const { method, url, query } = req
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')
  
  // Log request
  console.log('Orders API:', method, url, query)
  
  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  
  // GET /api/orders - List orders
  if (method === 'GET' && (url === '/api/orders' || url === '/orders')) {
    const { status, source, date } = query
    let filtered = [...orders]
    
    if (status) filtered = filtered.filter(o => o.status === status)
    if (source) filtered = filtered.filter(o => o.source === source)
    if (date) filtered = filtered.filter(o => o.createdAt?.startsWith(date))
    
    return res.json(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }
  
  // POST /api/orders - Create order
  if (method === 'POST' && (url === '/api/orders' || url === '/orders')) {
    const body = req.body || {}
    const { type, source, items, subtotal, tax, discount, total, tableNumber, customerName, notes, paymentMethod } = body
    
    const id = genId()
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
      discount: discount || 0,
      total: total || 0,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending',
      tableNumber: tableNumber || null,
      customerName: customerName || '',
      notes: notes || '',
      createdAt: now,
      updatedAt: now,
      items: items?.map(item => ({
        id: genId(),
        orderId: id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes || '',
        status: 'pending'
      })) || []
    }
    
    orders.unshift(order)
    console.log('Order created:', order.id)
    return res.status(201).json(order)
  }
  
  // Default - method not allowed
  res.status(405).json({ error: 'Method not allowed', method, path: url })
}