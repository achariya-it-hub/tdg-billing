const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');
const authController = require('./controllers/authController');
const menuController = require('./controllers/menuController');
const orderController = require('./controllers/orderController');
const walletController = require('./controllers/walletController');
const denController = require('./controllers/denController');
const inventoryController = require('./controllers/inventoryController');
const purchaseController = require('./controllers/purchaseController');
const customerController = require('./controllers/customerController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication Routes
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', auth, authController.getProfile);
app.put('/api/auth/profile', auth, authController.updateProfile);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/forgot-password-email', authController.forgotPasswordEmail);
app.post('/api/auth/reset-password', authController.resetPassword);

// Menu Routes
app.get('/api/menu', menuController.getMenu);

// Order Routes
app.post('/api/orders', auth, orderController.createOrder);
app.get('/api/orders', auth, orderController.getOrders);

// Admin / POS Order Routes
app.get('/api/admin/orders', orderController.getAllOrders);
app.post('/api/admin/orders', orderController.createAdminOrder);
app.put('/api/admin/orders/:id/status', orderController.updateOrderStatus);

// Customer Loyalty & Rewards Admin Routes
app.get('/api/admin/customers', customerController.getCustomers);
app.put('/api/admin/customers/:id/rubies', customerController.updateCustomerRubies);
app.post('/api/admin/customers/:id/scratch', customerController.awardScratchCard);

// Inventory Routes
app.get('/api/inventory', inventoryController.getInventory);
app.put('/api/inventory', inventoryController.updateStock);

// Purchase Routes
app.get('/api/purchases', purchaseController.getPurchases);
app.post('/api/purchases', purchaseController.createPurchase);

// Wallet Routes
app.get('/api/wallet', auth, walletController.getWallet);
app.post('/api/wallet/scratch', auth, walletController.scratchCard);
app.post('/api/wallet/add', auth, walletController.addRubies);

// Den Level Routes
app.get('/api/den', auth, denController.getDenProgress);

// Base route for API check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'TDG Backend is running smoothly.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`   TDG Backend Server running on port ${PORT} `);
  console.log(`   Health Check: http://localhost:${PORT}/health `);
  console.log(`=============================================`);
});
