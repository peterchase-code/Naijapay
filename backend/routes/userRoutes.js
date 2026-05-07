const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);

router.put('/profile', apiLimiter, userController.updateProfile);
router.put('/bank-details', apiLimiter, userController.updateBankDetails);
router.get('/bank-details', userController.getBankDetails);
router.put('/notifications', apiLimiter, userController.updateNotificationPreferences);
router.get('/credentials', userController.getMyCredentials);

module.exports = router;
