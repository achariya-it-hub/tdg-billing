import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import SQL from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const users = SQL.all('SELECT id, name, role, isActive, createdAt FROM users WHERE isActive = 1');
  res.json(users.map(u => ({ ...u, isActive: !!u.isActive })));
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const user = SQL.get('SELECT id, name, role, isActive, createdAt FROM users WHERE id = ?', [id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ ...user, isActive: !!user.isActive });
});

router.post('/', (req, res) => {
  const { name, role, pin } = req.body;
  const id = uuid();
  const now = new Date().toISOString();
  
  SQL.run(
    'INSERT INTO users (id, name, role, pin, isActive, createdAt) VALUES (?, ?, ?, ?, 1, ?)',
    [id, name, role, pin, now]
  );
  
  res.json({ id, name, role, isActive: true, createdAt: now });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, role, pin, isActive } = req.body;
  
  if (pin) {
    SQL.run('UPDATE users SET name = ?, role = ?, pin = ?, isActive = ? WHERE id = ?',
      [name, role, pin, isActive ? 1 : 0, id]);
  } else {
    SQL.run('UPDATE users SET name = ?, role = ?, isActive = ? WHERE id = ?',
      [name, role, isActive ? 1 : 0, id]);
  }
  
  res.json({ success: true });
});

router.post('/login', (req, res) => {
  const { pin } = req.body;
  
  const user = SQL.get('SELECT id, name, role, isActive FROM users WHERE pin = ? AND isActive = 1', [pin]);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid PIN' });
  }
  
  res.json({ 
    id: user.id,
    name: user.name,
    role: user.role,
    isActive: !!user.isActive
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  SQL.run('UPDATE users SET isActive = 0 WHERE id = ?', [id]);
  res.json({ success: true });
});

export default router;
