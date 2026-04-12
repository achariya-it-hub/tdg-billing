import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import SQL from '../db.js';

const router = Router();

router.get('/categories', (req, res) => {
  const categories = SQL.all('SELECT * FROM categories WHERE isActive = 1 ORDER BY displayOrder');
  res.json(categories);
});

router.post('/categories', (req, res) => {
  const { name, displayOrder, color, icon } = req.body;
  const id = uuid();
  SQL.run(
    'INSERT INTO categories (id, name, displayOrder, color, icon, isActive) VALUES (?, ?, ?, ?, ?, 1)',
    [id, name, displayOrder || 0, color || '#ffffff', icon || 'utensils']
  );
  res.json({ id, name, displayOrder, color, icon, isActive: 1 });
});

router.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, displayOrder, color, icon, isActive } = req.body;
  SQL.run(
    'UPDATE categories SET name = ?, displayOrder = ?, color = ?, icon = ?, isActive = ? WHERE id = ?',
    [name, displayOrder, color, icon, isActive ? 1 : 0, id]
  );
  res.json({ success: true });
});

router.delete('/categories/:id', (req, res) => {
  const { id } = req.params;
  SQL.run('UPDATE categories SET isActive = 0 WHERE id = ?', [id]);
  res.json({ success: true });
});

router.get('/items', (req, res) => {
  const { categoryId } = req.query;
  let query = 'SELECT * FROM menu_items WHERE 1=1';
  const params = [];
  
  if (categoryId) {
    query += ' AND categoryId = ?';
    params.push(categoryId);
  }
  
  query += ' ORDER BY name';
  const items = SQL.all(query, params);
  
  const itemsWithVariants = items.map(item => {
    const variants = SQL.all('SELECT * FROM variants WHERE menuItemId = ?', [item.id]);
    const addOns = SQL.all('SELECT * FROM add_ons WHERE menuItemId = ?', [item.id]);
    return { ...item, variants, addOns, isAvailable: !!item.isAvailable };
  });
  
  res.json(itemsWithVariants);
});

router.get('/items/:id', (req, res) => {
  const { id } = req.params;
  const item = SQL.get('SELECT * FROM menu_items WHERE id = ?', [id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  
  const variants = SQL.all('SELECT * FROM variants WHERE menuItemId = ?', [id]);
  const addOns = SQL.all('SELECT * FROM add_ons WHERE menuItemId = ?', [id]);
  
  res.json({ ...item, variants, addOns, isAvailable: !!item.isAvailable });
});

router.post('/items', (req, res) => {
  const { categoryId, name, description, price, image, prepTime, variants, addOns } = req.body;
  const id = uuid();
  
  SQL.run(
    'INSERT INTO menu_items (id, categoryId, name, description, price, image, prepTime, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
    [id, categoryId, name, description || '', price, image, prepTime || 15]
  );
  
  if (variants?.length) {
    variants.forEach(v => {
      SQL.run('INSERT INTO variants (id, menuItemId, name, priceModifier) VALUES (?, ?, ?, ?)',
        [uuid(), id, v.name, v.priceModifier || 0]);
    });
  }
  
  if (addOns?.length) {
    addOns.forEach(a => {
      SQL.run('INSERT INTO add_ons (id, menuItemId, name, price) VALUES (?, ?, ?, ?)',
        [uuid(), id, a.name, a.price]);
    });
  }
  
  res.json({ id, categoryId, name, description, price, image, prepTime, variants: variants || [], addOns: addOns || [], isAvailable: true });
});

router.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const { categoryId, name, description, price, image, prepTime, variants, addOns } = req.body;
  
  SQL.run(
    'UPDATE menu_items SET categoryId = ?, name = ?, description = ?, price = ?, image = ?, prepTime = ? WHERE id = ?',
    [categoryId, name, description, price, image, prepTime, id]
  );
  
  SQL.run('DELETE FROM variants WHERE menuItemId = ?', [id]);
  SQL.run('DELETE FROM add_ons WHERE menuItemId = ?', [id]);
  
  if (variants?.length) {
    variants.forEach(v => {
      SQL.run('INSERT INTO variants (id, menuItemId, name, priceModifier) VALUES (?, ?, ?, ?)',
        [uuid(), id, v.name, v.priceModifier || 0]);
    });
  }
  
  if (addOns?.length) {
    addOns.forEach(a => {
      SQL.run('INSERT INTO add_ons (id, menuItemId, name, price) VALUES (?, ?, ?, ?)',
        [uuid(), id, a.name, a.price]);
    });
  }
  
  res.json({ success: true });
});

router.patch('/items/:id/availability', (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;
  SQL.run('UPDATE menu_items SET isAvailable = ? WHERE id = ?', [isAvailable ? 1 : 0, id]);
  res.json({ success: true });
});

router.delete('/items/:id', (req, res) => {
  const { id } = req.params;
  SQL.run('DELETE FROM menu_items WHERE id = ?', [id]);
  res.json({ success: true });
});

export default router;
