import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import SQL from '../db.js';
import { io } from '../index.js';

const router = Router();

function createInternalOrder(onlineOrder, aggregator) {
  const { items, customer, delivery } = onlineOrder;
  const now = new Date().toISOString();
  
  const lastOrder = SQL.get('SELECT MAX(orderNumber) as maxNum FROM orders');
  const orderNumber = (lastOrder?.maxNum || 1000) + 1;
  const orderId = uuid();
  
  let subtotal = 0;
  const mappedItems = items.map(item => {
    const mapping = SQL.get(
      `SELECT mm.*, mi.name, mi.price FROM menu_mappings mm
       JOIN menu_items mi ON mm.internalItemId = mi.id
       WHERE mm.aggregatorId = ? AND mm.externalItemId = ?`,
      [aggregator.id, item.id]
    );
    
    const unitPrice = mapping?.priceOverride || mapping?.price || item.price || 0;
    const totalPrice = unitPrice * (item.quantity || 1);
    subtotal += totalPrice;
    
    return {
      menuItemId: mapping?.internalItemId || null,
      menuItemName: mapping?.externalItemName || item.name || 'Unknown Item',
      quantity: item.quantity || 1,
      unitPrice,
      totalPrice,
      notes: item.notes || ''
    };
  });
  
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  
  SQL.run(
    `INSERT INTO orders (id, orderNumber, type, status, source, subtotal, tax, discount, total, paymentStatus, customerName, notes, createdAt, updatedAt)
     VALUES (?, ?, 'delivery', 'pending', ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`,
    [orderId, orderNumber, aggregator.name, subtotal, tax, total, customer?.name || 'Online Customer', `Online order from ${aggregator.displayName}`, now, now]
  );
  
  mappedItems.forEach(item => {
    SQL.run(
      `INSERT INTO order_items (id, orderId, menuItemId, menuItemName, quantity, unitPrice, totalPrice, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid(), orderId, item.menuItemId, item.menuItemName, item.quantity, item.unitPrice, item.totalPrice, item.notes]
    );
  });
  
  const kotId = uuid();
  SQL.run(
    'INSERT INTO kot (id, orderId, orderNumber, status, createdAt) VALUES (?, ?, ?, ?, ?)',
    [kotId, orderId, `K${orderNumber}`, 'new', now]
  );
  
  mappedItems.forEach(item => {
    SQL.run(
      'INSERT INTO kot_items (id, kotId, name, quantity, notes) VALUES (?, ?, ?, ?, ?)',
      [uuid(), kotId, item.menuItemName, item.quantity, item.notes]
    );
  });
  
  return { orderId, orderNumber, mappedItems, subtotal, tax, total, kotId };
}

router.post('/swiggy', (req, res) => {
  const aggregator = SQL.get("SELECT * FROM aggregators WHERE name = 'swiggy' AND isActive = 1");
  if (!aggregator) {
    return res.status(404).json({ error: 'Swiggy integration not configured' });
  }
  
  const { event, data } = req.body;
  
  if (event === 'order.created' || event === 'order.placed') {
    const onlineOrderId = uuid();
    const now = new Date().toISOString();
    
    const orderData = createInternalOrder(data, aggregator);
    
    SQL.run(
      `INSERT INTO online_orders (id, externalOrderId, aggregator, orderId, platformStatus, estimatedTime, customerName, customerPhone, customerAddress, aggregatorCommission, deliveryFee, packagingFee, rawPayload, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        onlineOrderId,
        data.order_id || data.id,
        'swiggy',
        orderData.orderId,
        'received',
        data.estimated_delivery_time || aggregator.defaultPrepTime,
        data.customer?.name,
        data.customer?.phone,
        data.delivery?.address,
        data.commission || 0,
        data.delivery_charges || 0,
        data.packaging_charges || 0,
        JSON.stringify(req.body),
        now,
        now
      ]
    );
    
    io.to('kitchen').emit('kot:created', {
      id: orderData.kotId,
      orderId: orderData.orderId,
      orderNumber: `K${orderData.orderNumber}`,
      source: 'swiggy',
      priority: 'normal',
      status: 'new',
      items: orderData.mappedItems
    });
    
    io.to('online').emit('online-order:new', { 
      id: onlineOrderId, 
      externalOrderId: data.order_id,
      aggregator: 'swiggy',
      ...orderData 
    });
    
    if (aggregator.autoAcceptOrders) {
      SQL.run('UPDATE online_orders SET platformStatus = ?, updatedAt = ? WHERE id = ?',
        ['accepted', now, onlineOrderId]);
      io.to('online').emit('online-order:status', { orderId: onlineOrderId, status: 'accepted' });
    }
    
    res.json({ success: true, orderId: onlineOrderId });
  } else if (event === 'order.updated' || event === 'order.status_update') {
    const status = data.status;
    const orderId = data.order_id || data.id;
    const onlineOrder = SQL.get('SELECT * FROM online_orders WHERE externalOrderId = ? AND aggregator = ?', [orderId, 'swiggy']);
    
    if (onlineOrder) {
      SQL.run('UPDATE online_orders SET platformStatus = ?, updatedAt = ? WHERE id = ?',
        [status, new Date().toISOString(), onlineOrder.id]);
      io.to('online').emit('online-order:status', { orderId: onlineOrder.id, status });
    }
    
    res.json({ success: true });
  } else {
    res.json({ success: true, message: 'Event received' });
  }
});

router.post('/zomato', (req, res) => {
  const aggregator = SQL.get("SELECT * FROM aggregators WHERE name = 'zomato' AND isActive = 1");
  if (!aggregator) {
    return res.status(404).json({ error: 'Zomato integration not configured' });
  }
  
  const { event, order_id, status } = req.body;
  
  if (event === 'order.placed' || event === 'order.created') {
    const onlineOrderId = uuid();
    const now = new Date().toISOString();
    
    const orderData = createInternalOrder(req.body, aggregator);
    
    SQL.run(
      `INSERT INTO online_orders (id, externalOrderId, aggregator, orderId, platformStatus, customerName, customerPhone, customerAddress, rawPayload, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        onlineOrderId,
        order_id,
        'zomato',
        orderData.orderId,
        'received',
        req.body.customer?.name,
        req.body.customer?.phone,
        req.body.delivery?.address,
        JSON.stringify(req.body),
        now,
        now
      ]
    );
    
    io.to('kitchen').emit('kot:created', {
      id: orderData.kotId,
      orderId: orderData.orderId,
      orderNumber: `K${orderData.orderNumber}`,
      source: 'zomato',
      status: 'new',
      items: orderData.mappedItems
    });
    
    res.json({ success: true, orderId: onlineOrderId });
  } else if (event === 'order.cancelled' || event === 'order.completed') {
    const onlineOrder = SQL.get('SELECT * FROM online_orders WHERE externalOrderId = ? AND aggregator = ?', [order_id, 'zomato']);
    
    if (onlineOrder) {
      SQL.run('UPDATE online_orders SET platformStatus = ?, updatedAt = ? WHERE id = ?',
        [status, new Date().toISOString(), onlineOrder.id]);
    }
    
    res.json({ success: true });
  } else {
    res.json({ success: true });
  }
});

router.post('/zepto', (req, res) => {
  const aggregator = SQL.get("SELECT * FROM aggregators WHERE name = 'zepto' AND isActive = 1");
  if (!aggregator) {
    return res.status(404).json({ error: 'Zepto integration not configured' });
  }
  
  const { type, data } = req.body;
  
  if (type === 'order_created') {
    const onlineOrderId = uuid();
    const now = new Date().toISOString();
    
    const orderData = createInternalOrder(data, aggregator);
    
    SQL.run(
      `INSERT INTO online_orders (id, externalOrderId, aggregator, orderId, platformStatus, customerName, customerPhone, rawPayload, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [onlineOrderId, data.id, 'zepto', orderData.orderId, 'received', data.customer?.name, data.customer?.phone, JSON.stringify(req.body), now, now]
    );
    
    io.to('kitchen').emit('kot:created', {
      id: orderData.kotId,
      orderId: orderData.orderId,
      orderNumber: `K${orderData.orderNumber}`,
      source: 'zepto',
      status: 'new',
      items: orderData.mappedItems
    });
    
    res.json({ success: true, orderId: onlineOrderId });
  } else {
    res.json({ success: true });
  }
});

router.post('/direct', (req, res) => {
  const { items, customer, address } = req.body;
  const now = new Date().toISOString();
  
  const lastOrder = SQL.get('SELECT MAX(orderNumber) as maxNum FROM orders');
  const orderNumber = (lastOrder?.maxNum || 1000) + 1;
  const orderId = uuid();
  const directOrderId = uuid();
  
  let subtotal = 0;
  const mappedItems = items.map(item => {
    const menuItem = SQL.get('SELECT * FROM menu_items WHERE id = ?', [item.menuItemId]);
    const unitPrice = menuItem?.price || 0;
    const totalPrice = unitPrice * (item.quantity || 1);
    subtotal += totalPrice;
    
    return {
      menuItemId: item.menuItemId,
      menuItemName: menuItem?.name || 'Unknown',
      quantity: item.quantity || 1,
      unitPrice,
      totalPrice
    };
  });
  
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  
  SQL.run(
    `INSERT INTO orders (id, orderNumber, type, status, source, subtotal, tax, discount, total, paymentStatus, customerName, notes, createdAt, updatedAt)
     VALUES (?, ?, 'delivery', 'pending', 'direct', ?, ?, 0, ?, ?, ?, ?, ?, ?)`,
    [orderId, orderNumber, subtotal, tax, total, customer?.name || 'Website Customer', 'Direct website order', now, now]
  );
  
  mappedItems.forEach(item => {
    SQL.run(
      `INSERT INTO order_items (id, orderId, menuItemId, menuItemName, quantity, unitPrice, totalPrice)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuid(), orderId, item.menuItemId, item.menuItemName, item.quantity, item.unitPrice, item.totalPrice]
    );
  });
  
  SQL.run(
    `INSERT INTO online_orders (id, externalOrderId, aggregator, orderId, platformStatus, customerName, customerPhone, customerAddress, rawPayload, createdAt, updatedAt)
     VALUES (?, ?, 'direct', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [directOrderId, `DIR-${orderNumber}`, orderId, 'received', customer?.name, customer?.phone, address, JSON.stringify(req.body), now, now]
  );
  
  const kotId = uuid();
  SQL.run(
    'INSERT INTO kot (id, orderId, orderNumber, status, createdAt) VALUES (?, ?, ?, ?, ?)',
    [kotId, orderId, `K${orderNumber}`, 'new', now]
  );
  
  mappedItems.forEach(item => {
    SQL.run(
      'INSERT INTO kot_items (id, kotId, name, quantity) VALUES (?, ?, ?, ?)',
      [uuid(), kotId, item.menuItemName, item.quantity]
    );
  });
  
  io.to('kitchen').emit('kot:created', {
    id: kotId,
    orderId,
    orderNumber: `K${orderNumber}`,
    source: 'direct',
    status: 'new',
    items: mappedItems
  });
  
  res.json({ 
    success: true, 
    orderId: directOrderId,
    orderNumber: `DIR-${orderNumber}`,
    total 
  });
});

export default router;
