import { v4 as uuid } from 'uuid'

// In-memory store for Vercel serverless (demo mode)
let orders = []
let orderNumber = 1000

export default async function handler(req, res) {
  const { method } = req
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (method === 'GET') {
    const { status, source, date } = req.query
    let filtered = [...orders]
    
    if (status) filtered = filtered.filter(o => o.status === status)
    if (source) filtered = filtered.filter(o => o.source === source)
    if (date) filtered = filtered.filter(o => o.createdAt?.startsWith(date))
    
    return res.json(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }
  
  if (method === 'POST') {
    const { type, source, items, subtotal, tax, discount, total, tableNumber, customerName, notes, paymentMethod } = req.body
    
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
        id: uuid(),
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
    return res.status(201).json(order)
  }
  
  res.status(405).json({ error: 'Method not allowed' })
}