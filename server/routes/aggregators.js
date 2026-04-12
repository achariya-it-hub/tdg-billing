import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import SQL from '../db.js';
import { io } from '../index.js';

const router = Router();

router.get('/', (req, res) => {
  const aggregators = SQL.all('SELECT * FROM aggregators ORDER BY name');
  res.json(aggregators.map(a => ({ ...a, isActive: !!a.isActive, autoAcceptOrders: !!a.autoAcceptOrders })));
});

router.post('/', (req, res) => {
  const { name, displayName, apiKey, apiSecret, storeId, webhookSecret, autoAcceptOrders, defaultPrepTime } = req.body;
  const id = uuid();
  const now = new Date().toISOString();
  
  SQL.run(
    `INSERT INTO aggregators (id, name, displayName, isActive, apiKey, apiSecret, storeId, webhookSecret, autoAcceptOrders, defaultPrepTime, createdAt, updatedAt)
     VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, displayName, apiKey, apiSecret, storeId, webhookSecret, autoAcceptOrders ? 1 : 0, defaultPrepTime || 30, now, now]
  );
  
  res.json({ id, name, displayName, isActive: false, apiKey, storeId, autoAcceptOrders, defaultPrepTime });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { displayName, apiKey, apiSecret, storeId, webhookSecret, autoAcceptOrders, defaultPrepTime } = req.body;
  const now = new Date().toISOString();
  
  SQL.run(
    `UPDATE aggregators SET displayName = ?, apiKey = ?, apiSecret = ?, storeId = ?, webhookSecret = ?, autoAcceptOrders = ?, defaultPrepTime = ?, updatedAt = ? WHERE id = ?`,
    [displayName, apiKey, apiSecret, storeId, webhookSecret, autoAcceptOrders ? 1 : 0, defaultPrepTime, now, id]
  );
  
  res.json({ success: true });
});

router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const now = new Date().toISOString();
  
  SQL.run('UPDATE aggregators SET isActive = ?, updatedAt = ? WHERE id = ?',
    [isActive ? 1 : 0, now, id]);
  
  io.emit('aggregator:status', { id, isActive: !!isActive });
  
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  SQL.run('DELETE FROM menu_mappings WHERE aggregatorId = ?', [id]);
  SQL.run('DELETE FROM aggregators WHERE id = ?', [id]);
  res.json({ success: true });
});

router.get('/orders', (req, res) => {
  const { aggregator, status, date } = req.query;
  let query = 'SELECT * FROM online_orders WHERE 1=1';
  const params = [];
  
  if (aggregator) {
    query += ' AND aggregator = ?';
    params.push(aggregator);
  }
  if (status) {
    query += ' AND platformStatus = ?';
    params.push(status);
  }
  if (date) {
    query += ' AND DATE(createdAt) = ?';
    params.push(date);
  }
  
  query += ' ORDER BY createdAt DESC';
  const orders = SQL.all(query, params);
  
  res.json(orders.map(o => ({
    ...o,
    rawPayload: o.rawPayload ? JSON.parse(o.rawPayload) : null
  })));
});

router.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = SQL.get('SELECT * FROM online_orders WHERE id = ?', [id]);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  const internalOrder = SQL.get('SELECT * FROM orders WHERE id = ?', [order.orderId]);
  const orderItems = internalOrder 
    ? SQL.all('SELECT * FROM order_items WHERE orderId = ?', [order.orderId])
    : [];
  
  res.json({
    ...order,
    rawPayload: order.rawPayload ? JSON.parse(order.rawPayload) : null,
    internalOrder: internalOrder ? { ...internalOrder, items: orderItems } : null
  });
});

router.post('/:id/accept/:orderId', async (req, res) => {
  const { id, orderId } = req.params;
  const { estimatedTime } = req.body;
  
  const aggregator = SQL.get('SELECT * FROM aggregators WHERE id = ?', [id]);
  const onlineOrder = SQL.get('SELECT * FROM online_orders WHERE id = ?', [orderId]);
  
  if (!aggregator || !onlineOrder) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  SQL.run('UPDATE online_orders SET platformStatus = ?, estimatedTime = ?, updatedAt = ? WHERE id = ?',
    ['accepted', estimatedTime || aggregator.defaultPrepTime, new Date().toISOString(), orderId]);
  
  io.to('online').emit('online-order:status', { orderId, status: 'accepted' });
  io.to('kitchen').emit('online-order:status', { orderId, status: 'accepted' });
  
  res.json({ success: true });
});

router.post('/:id/decline/:orderId', (req, res) => {
  const { id, orderId } = req.params;
  const { reason } = req.body;
  
  SQL.run('UPDATE online_orders SET platformStatus = ?, updatedAt = ? WHERE id = ?',
    ['cancelled', new Date().toISOString(), orderId]);
  
  const onlineOrder = SQL.get('SELECT orderId FROM online_orders WHERE id = ?', [orderId]);
  if (onlineOrder) {
    SQL.run('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?',
      ['cancelled', new Date().toISOString(), onlineOrder.orderId]);
  }
  
  io.to('online').emit('online-order:cancelled', { orderId, reason });
  
  res.json({ success: true });
});

router.patch('/:id/status/:orderId', (req, res) => {
  const { id, orderId } = req.params;
  const { status } = req.body;
  const now = new Date().toISOString();
  
  SQL.run('UPDATE online_orders SET platformStatus = ?, updatedAt = ? WHERE id = ?',
    [status, now, orderId]);
  
  const onlineOrder = SQL.get('SELECT orderId FROM online_orders WHERE id = ?', [orderId]);
  if (onlineOrder) {
    const internalStatus = status === 'delivered' ? 'completed' : status === 'cancelled' ? 'cancelled' : 'preparing';
    SQL.run('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?',
      [internalStatus, now, onlineOrder.orderId]);
  }
  
  io.to('online').emit('online-order:status', { orderId, status });
  io.to('kitchen').emit('online-order:status', { orderId, status });
  
  res.json({ success: true });
});

router.get('/:id/menu-mappings', (req, res) => {
  const { id } = req.params;
  const mappings = SQL.all(
    `SELECT mm.*, mi.name as internalName, mi.price as internalPrice
     FROM menu_mappings mm
     JOIN menu_items mi ON mm.internalItemId = mi.id
     WHERE mm.aggregatorId = ?`,
    [id]
  );
  res.json(mappings);
});

router.post('/:id/menu-mappings', (req, res) => {
  const { id } = req.params;
  const { mappings } = req.body;
  
  mappings.forEach(m => {
    const existing = SQL.get(
      'SELECT id FROM menu_mappings WHERE aggregatorId = ? AND internalItemId = ?',
      [id, m.internalItemId]
    );
    if (existing) {
      SQL.run(
        `UPDATE menu_mappings SET externalItemId = ?, externalItemName = ?, priceOverride = ?, isAvailable = ? WHERE id = ?`,
        [m.externalItemId, m.externalItemName, m.priceOverride, m.isAvailable ? 1 : 0, existing.id]
      );
    } else {
      SQL.run(
        `INSERT INTO menu_mappings (id, aggregatorId, internalItemId, externalItemId, externalItemName, priceOverride, isAvailable)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuid(), id, m.internalItemId, m.externalItemId, m.externalItemName, m.priceOverride, m.isAvailable ? 1 : 0]
      );
    }
  });
  
  res.json({ success: true });
});

router.get('/analytics', (req, res) => {
  const { startDate, endDate } = req.query;
  
  const orders = SQL.all(
    `SELECT aggregator, COUNT(*) as count, SUM(total) as revenue, AVG(total) as avgOrder
     FROM online_orders o
     JOIN orders r ON o.orderId = r.id
     WHERE DATE(o.createdAt) BETWEEN ? AND ?
     GROUP BY aggregator`,
    [startDate || '2024-01-01', endDate || '2024-12-31']
  );
  
  res.json(orders);
});

router.get('/health', (req, res) => {
  const aggregators = SQL.all('SELECT id, name, isActive, lastSyncAt FROM aggregators');
  res.json(aggregators.map(a => ({ ...a, isActive: !!a.isActive })));
});

export default router;
