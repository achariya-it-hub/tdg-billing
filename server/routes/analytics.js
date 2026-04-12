import { Router } from 'express';
import SQL from '../db.js';

const router = Router();

router.get('/sales', (req, res) => {
  const { startDate, endDate } = req.query;
  
  const sales = SQL.all(
    `SELECT 
      DATE(createdAt) as date,
      COUNT(*) as orderCount,
      SUM(total) as revenue,
      AVG(total) as avgOrder,
      SUM(CASE WHEN paymentStatus = 'paid' THEN total ELSE 0 END) as collected
     FROM orders
     WHERE DATE(createdAt) BETWEEN ? AND ? AND status != 'cancelled'
     GROUP BY DATE(createdAt)
     ORDER BY date DESC`,
    [startDate || '2024-01-01', endDate || '2024-12-31']
  );
  
  res.json(sales);
});

router.get('/summary', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const todayStats = SQL.get(
    `SELECT 
      COUNT(*) as orderCount,
      SUM(total) as revenue,
      AVG(total) as avgOrder
     FROM orders
     WHERE DATE(createdAt) = ? AND status != 'cancelled'`,
    [today]
  );
  
  const yesterdayStats = SQL.get(
    `SELECT 
      COUNT(*) as orderCount,
      SUM(total) as revenue
     FROM orders
     WHERE DATE(createdAt) = ? AND status != 'cancelled'`,
    [yesterday]
  );
  
  const onlineStats = SQL.get(
    `SELECT 
      COUNT(*) as orderCount,
      SUM(o.total) as revenue
     FROM online_orders ol
     JOIN orders o ON ol.orderId = o.id
     WHERE DATE(ol.createdAt) = ? AND ol.platformStatus != 'cancelled'`,
    [today]
  );
  
  res.json({
    today: {
      orders: todayStats?.orderCount || 0,
      revenue: todayStats?.revenue || 0,
      avgOrder: todayStats?.avgOrder || 0
    },
    yesterday: {
      orders: yesterdayStats?.orderCount || 0,
      revenue: yesterdayStats?.revenue || 0
    },
    online: {
      orders: onlineStats?.orderCount || 0,
      revenue: onlineStats?.revenue || 0
    },
    revenueChange: yesterdayStats?.revenue 
      ? ((todayStats?.revenue - yesterdayStats.revenue) / yesterdayStats.revenue * 100).toFixed(1)
      : 0
  });
});

router.get('/top-items', (req, res) => {
  const { startDate, endDate, limit } = req.query;
  
  const items = SQL.all(
    `SELECT 
      menuItemName,
      SUM(quantity) as totalQty,
      SUM(totalPrice) as revenue,
      COUNT(DISTINCT orderId) as orderCount
     FROM order_items
     WHERE orderId IN (
       SELECT id FROM orders 
       WHERE DATE(createdAt) BETWEEN ? AND ? AND status != 'cancelled'
     )
     GROUP BY menuItemName
     ORDER BY totalQty DESC
     LIMIT ?`,
    [startDate || '2024-01-01', endDate || '2024-12-31', parseInt(limit) || 10]
  );
  
  res.json(items);
});

router.get('/hourly', (req, res) => {
  const { date } = req.query;
  
  const hourly = SQL.all(
    `SELECT 
      CAST(strftime('%H', createdAt) AS INTEGER) as hour,
      COUNT(*) as orderCount,
      SUM(total) as revenue
     FROM orders
     WHERE DATE(createdAt) = ? AND status != 'cancelled'
     GROUP BY hour
     ORDER BY hour`,
    [date || new Date().toISOString().split('T')[0]]
  );
  
  const allHours = Array.from({ length: 24 }, (_, i) => {
    const found = hourly.find(h => h.hour === i);
    return {
      hour: i,
      hourLabel: `${i.toString().padStart(2, '0')}:00`,
      orderCount: found?.orderCount || 0,
      revenue: found?.revenue || 0
    };
  });
  
  res.json(allHours);
});

router.get('/by-category', (req, res) => {
  const { startDate, endDate } = req.query;
  
  const byCategory = SQL.all(
    `SELECT 
      c.name as category,
      c.color,
      SUM(oi.totalPrice) as revenue,
      SUM(oi.quantity) as qty,
      COUNT(DISTINCT oi.orderId) as orders
     FROM order_items oi
     JOIN orders o ON oi.orderId = o.id
     JOIN menu_items mi ON oi.menuItemId = mi.id
     JOIN categories c ON mi.categoryId = c.id
     WHERE DATE(o.createdAt) BETWEEN ? AND ? AND o.status != 'cancelled'
     GROUP BY c.id
     ORDER BY revenue DESC`,
    [startDate || '2024-01-01', endDate || '2024-12-31']
  );
  
  res.json(byCategory);
});

router.get('/by-source', (req, res) => {
  const { startDate, endDate } = req.query;
  
  const bySource = SQL.all(
    `SELECT 
      COALESCE(ol.aggregator, o.source) as source,
      COUNT(DISTINCT o.id) as orderCount,
      SUM(o.total) as revenue,
      AVG(o.total) as avgOrder
     FROM orders o
     LEFT JOIN online_orders ol ON o.id = ol.orderId
     WHERE DATE(o.createdAt) BETWEEN ? AND ? AND o.status != 'cancelled'
     GROUP BY source
     ORDER BY revenue DESC`,
    [startDate || '2024-01-01', endDate || '2024-12-31']
  );
  
  res.json(bySource);
});

router.get('/by-payment', (req, res) => {
  const { startDate, endDate } = req.query;
  
  const byPayment = SQL.all(
    `SELECT 
      paymentMethod,
      COUNT(*) as orderCount,
      SUM(total) as revenue
     FROM orders
     WHERE DATE(createdAt) BETWEEN ? AND ? 
       AND status != 'cancelled' 
       AND paymentStatus = 'paid'
       AND paymentMethod IS NOT NULL
     GROUP BY paymentMethod
     ORDER BY revenue DESC`,
    [startDate || '2024-01-01', endDate || '2024-12-31']
  );
  
  res.json(byPayment);
});

export default router;
