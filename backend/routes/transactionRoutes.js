const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.get('/my', transactionController.getMyTransactions);
router.post('/deposit', apiLimiter, transactionController.createDeposit);

// Admin routes
router.get('/all', adminMiddleware, transactionController.getAllTransactions);
router.put('/:id/confirm', adminMiddleware, transactionController.confirmDeposit);

module.exports = router;
