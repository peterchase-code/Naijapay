const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', apiLimiter, adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', apiLimiter, adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/unban', adminController.unbanUser);
router.put('/users/:id/balance', apiLimiter, adminController.adjustBalance);

module.exports = router;
