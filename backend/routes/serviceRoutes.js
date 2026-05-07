const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/', serviceController.getAllServices);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, apiLimiter, serviceController.createService);
router.put('/:id', authMiddleware, adminMiddleware, apiLimiter, serviceController.updateService);
router.delete('/:id', authMiddleware, adminMiddleware, serviceController.deleteService);
router.put('/:id/toggle', authMiddleware, adminMiddleware, serviceController.toggleService);

module.exports = router;
