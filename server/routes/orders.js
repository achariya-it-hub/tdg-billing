import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import SQL from '../db.js';
import { io } from '../index.js';

const router = Router();

function generateOrderNumber() {
  const lastOrder = SQL.get('SELECT MAX(orderNumber) as maxNum FROM orders');
  return (lastOrder?.maxNum || 1000) + 1;
}

router.get('/', (req, res) => {
  const { status, source, date } = req.query;
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (source) {
    query += ' AND source = ?';
    params.push(source);
  }
  if (date) {
    query += ' AND DATE(createdAt) = ?';
    params.push(date);
  }
  
  query += ' ORDER BY createdAt DESC';
  const orders = SQL.all(query, params);
  
  const ordersWithItems = orders.map(order => {
    const items = SQL.all('SELECT * FROM order_items WHERE orderId = ?', [order.id]);
    return { ...order, items };
  });
  
  res.json(ordersWithItems);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const order = SQL.get('SELECT * FROM orders WHERE id = ?', [id]);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  const items = SQL.all('SELECT * FROM order_items WHERE orderId = ?', [id]);
  res.json({ ...order, items });
});

router.post('/', (req, res) => {
  const { type, source, items, subtotal, tax, discount, total, tableNumber, customerName, notes, paymentMethod } = req.body;
  
  const id = uuid();
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();
  
  SQL.run(
    `INSERT INTO orders (id, orderNumber, type, status, source, subtotal, tax, discount, total, paymentMethod, paymentStatus, tableNumber, customerName, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
    [id, orderNumber, type || 'dine-in', source || 'pos', subtotal, tax, discount || 0, total, paymentMethod, tableNumber, customerName, notes || '', now, now]
  );
  
  items.forEach(item => {
    SQL.run(
      `INSERT INTO order_items (id, orderId, menuItemId, menuItemName, variantId, variantName, quantity, unitPrice, totalPrice, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid(), id, item.menuItemId, item.menuItemName, item.variantId || null, item.variantName || null, item.quantity, item.unitPrice, item.totalPrice, item.notes || '']
    );
  });
  
  const order = SQL.get('SELECT * FROM orders WHERE id = ?', [id]);
  const orderItems = SQL.all('SELECT * FROM order_items WHERE orderId = ?', [id]);
  const fullOrder = { ...order, items: orderItems };
  
  io.to('kitchen').emit('order:created', fullOrder);
  io.to('pos').emit('order:created', fullOrder);
  io.to('online').emit('order:created', fullOrder);
  
  if (source !== 'kiosk') {
    createKOT(id, orderNumber, items);
  }
  
  res.json(fullOrder);
});

function createKOT(orderId, orderNumber, items) {
  const kotId = uuid();
  const now = new Date().toISOString();
  
  SQL.run(
    'INSERT INTO kot (id, orderId, orderNumber, status, createdAt) VALUES (?, ?, ?, ?, ?)',
    [kotId, orderId, `K${orderNumber}`, 'new', now]
  );
  
  items.forEach(item => {
    SQL.run(
      'INSERT INTO kot_items (id, kotId, name, quantity, notes) VALUES (?, ?, ?, ?, ?)',
      [uuid(), kotId, item.menuItemName, item.quantity, item.notes || '']
    );
  });
  
  const kot = {
    id: kotId,
    orderId,
    orderNumber: `K${orderNumber}`,
    status: 'new',
    createdAt: now,
    items: items.map(i => ({ name: i.menuItemName, quantity: i.quantity, notes: i.notes || '' }))
  };
  
  io.to('kitchen').emit('kot:created', kot);
}

router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const now = new Date().toISOString();
  
  if (status === 'completed') {
    SQL.run('UPDATE orders SET status = ?, updatedAt = ?, completedAt = ? WHERE id = ?',
      [status, now, now, id]);
  } else {
    SQL.run('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?',
      [status, now, id]);
  }
  
  const order = SQL.get('SELECT * FROM orders WHERE id = ?', [id]);
  const items = SQL.all('SELECT * FROM order_items WHERE orderId = ?', [id]);
  
  io.emit('order:updated', { ...order, items });
  
  res.json({ success: true, order: { ...order, items } });
});

router.patch('/:id/items/:itemId/status', (req, res) => {
  const { id, itemId } = req.params;
  const { status } = req.body;
  
  SQL.run('UPDATE order_items SET status = ? WHERE id = ? AND orderId = ?', [status, itemId, id]);
  
  const allItems = SQL.all('SELECT * FROM order_items WHERE orderId = ?', [id]);
  const allReady = allItems.every(item => item.status === 'ready' || item.status === 'served');
  
  if (allReady) {
    SQL.run('UPDATE orders SET status = ? WHERE id = ?', ['ready', id]);
  }
  
  res.json({ success: true });
});

router.post('/:id/payment', (req, res) => {
  const { id } = req.params;
  const { paymentMethod, amount } = req.body;
  const now = new Date().toISOString();
  
  SQL.run(
    'UPDATE orders SET paymentMethod = ?, paymentStatus = ?, status = ?, updatedAt = ? WHERE id = ?',
    [paymentMethod, 'paid', 'preparing', now, id]
  );
  
  const order = SQL.get('SELECT * FROM orders WHERE id = ?', [id]);
  const items = SQL.all('SELECT * FROM order_items WHERE orderId = ?', [id]);
  
  io.emit('order:updated', { ...order, items });
  
  res.json({ success: true, order: { ...order, items } });
});

router.post('/:id/refund', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const now = new Date().toISOString();
  
  SQL.run(
    'UPDATE orders SET paymentStatus = ?, status = ?, updatedAt = ? WHERE id = ?',
    ['refunded', 'cancelled', now, id]
  );
  
  res.json({ success: true });
});

export default router;
