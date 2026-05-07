const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.post('/', apiLimiter, withdrawalController.createWithdrawal);
router.get('/my', withdrawalController.getMyWithdrawals);

// Admin routes
router.get('/all', adminMiddleware, withdrawalController.getAllWithdrawals);
router.put('/:id/status', adminMiddleware, withdrawalController.updateWithdrawalStatus);

module.exports = router;
