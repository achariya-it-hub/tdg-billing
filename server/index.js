import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import SQL from './db.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import inventoryRoutes from './routes/inventory.js';
import aggregatorRoutes from './routes/aggregators.js';
import analyticsRoutes from './routes/analytics.js';
import webhooksRoutes from './routes/webhooks.js';
import usersRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3005'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// API Routes FIRST
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/aggregators', aggregatorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/recipes', recipeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from dist folder (AFTER API routes)
app.use(express.static(join(__dirname, '..', 'dist')));

// Fallback to index.html for SPA (must be last)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join:kitchen', () => {
      socket.join('kitchen');
      console.log('Socket joined kitchen');
    });

    socket.on('join:pos', () => {
      socket.join('pos');
      console.log('Socket joined pos');
    });

    socket.on('join:online', () => {
      socket.join('online');
      console.log('Socket joined online');
    });

    socket.on('kot:create', (kotData) => {
      // Broadcast to all kitchen clients
      socket.to('kitchen').emit('kot:created', kotData);
      console.log('KOT created and sent to kitchen:', kotData.orderNumber);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

export { io };

async function start() {
  await SQL.init();
  console.log('Database initialized');
  
  const PORT = process.env.PORT || 3002;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
