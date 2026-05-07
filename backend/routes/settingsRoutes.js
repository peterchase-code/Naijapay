const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/public', settingsController.getPublicSettings);

router.use(authMiddleware, adminMiddleware);

router.get('/', settingsController.getAllSettings);
router.put('/', apiLimiter, settingsController.updateSetting);
router.put('/batch', apiLimiter, settingsController.updateMultipleSettings);

module.exports = router;
