require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
const securityMiddleware = require('./middleware/securityMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const credentialRoutes = require('./routes/credentialRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const referralRoutes = require('./routes/referralRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentProofRoutes = require('./routes/paymentProofRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const giftCardRoutes = require('./routes/giftCardRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');
const path = require('path');

// Connect to database
connectDB();

const app = express();

// Body parser — MUST be before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(logger);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security middleware (CORS, helmet, mongo-sanitize, XSS, HPP)
securityMiddleware.forEach(middleware => app.use(middleware));

// Explicit OPTIONS preflight handler for all /api/* routes
// This ensures mobile browsers and fetch libraries get proper CORS headers
app.options('/api/*', (req, res) => {
  res.status(204).end();
});

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'NaijaPay API is running',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payment-proofs', paymentProofRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/gift-cards', giftCardRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/broadcasts', broadcastRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 to accept connections from any IP on the network
// (localhost, 127.0.0.1, 192.168.x.x, mobile devices on same Wi-Fi)
const server = app.listen(PORT, '0.0.0.0', () => {
  const addresses = Object.values(require('os').networkInterfaces())
    .flat()
    .filter(iface => iface.family === 'IPv4' && !iface.internal)
    .map(iface => iface.address);

  console.log(`\n=== NaijaPay Server ===`);
  console.log(`Port: ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Local:   http://localhost:${PORT}`);
  addresses.forEach(ip => console.log(`Network: http://${ip}:${PORT}`));
  console.log(`=======================\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  server.close(() => process.exit(1));
});
