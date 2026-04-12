import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import SQL from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const items = SQL.all('SELECT * FROM inventory_items ORDER BY name');
  res.json(items);
});

router.get('/alerts', (req, res) => {
  const items = SQL.all(
    'SELECT * FROM inventory_items WHERE currentStock <= minimumStock ORDER BY currentStock ASC'
  );
  res.json(items);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = SQL.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  
  const transactions = SQL.all(
    'SELECT * FROM inventory_transactions WHERE inventoryItemId = ? ORDER BY createdAt DESC LIMIT 50',
    [id]
  );
  
  res.json({ ...item, transactions });
});

router.post('/', (req, res) => {
  const { name, category, unit, currentStock, minimumStock, reorderLevel, costPerUnit, supplier } = req.body;
  const id = uuid();
  const now = new Date().toISOString();
  
  SQL.run(
    `INSERT INTO inventory_items (id, name, category, unit, currentStock, minimumStock, reorderLevel, costPerUnit, supplier, lastRestocked)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, category || 'General', unit || 'pcs', currentStock || 0, minimumStock || 10, reorderLevel || 20, costPerUnit || 0, supplier || '', now]
  );
  
  res.json({ id, name, category, unit, currentStock, minimumStock, reorderLevel, costPerUnit, supplier });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, unit, minimumStock, reorderLevel, costPerUnit, supplier } = req.body;
  
  SQL.run(
    `UPDATE inventory_items SET name = ?, category = ?, unit = ?, minimumStock = ?, reorderLevel = ?, costPerUnit = ?, supplier = ? WHERE id = ?`,
    [name, category, unit, minimumStock, reorderLevel, costPerUnit, supplier, id]
  );
  
  res.json({ success: true });
});

router.post('/:id/restock', (req, res) => {
  const { id } = req.params;
  const { quantity, reason, createdBy } = req.body;
  const now = new Date().toISOString();
  
  const item = SQL.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  
  const newStock = item.currentStock + quantity;
  
  SQL.run('UPDATE inventory_items SET currentStock = ?, lastRestocked = ? WHERE id = ?',
    [newStock, now, id]);
  
  SQL.run(
    `INSERT INTO inventory_transactions (id, inventoryItemId, type, quantity, reason, createdAt, createdBy)
     VALUES (?, ?, 'stock-in', ?, ?, ?, ?)`,
    [uuid(), id, quantity, reason || 'Restock', now, createdBy]
  );
  
  res.json({ success: true, newStock });
});

router.post('/:id/adjust', (req, res) => {
  const { id } = req.params;
  const { quantity, reason, createdBy } = req.body;
  const now = new Date().toISOString();
  
  const item = SQL.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  
  const newStock = item.currentStock + quantity;
  
  SQL.run('UPDATE inventory_items SET currentStock = ? WHERE id = ?', [newStock, id]);
  
  SQL.run(
    `INSERT INTO inventory_transactions (id, inventoryItemId, type, quantity, reason, createdAt, createdBy)
     VALUES (?, ?, 'adjustment', ?, ?, ?, ?)`,
    [uuid(), id, quantity, reason || 'Adjustment', now, createdBy]
  );
  
  res.json({ success: true, newStock });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  SQL.run('DELETE FROM inventory_items WHERE id = ?', [id]);
  res.json({ success: true });
});

export default router;
