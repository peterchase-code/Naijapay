const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public - get all service rates
router.get('/rates', currencyController.getAllRates);

// Public - get rate for a specific service
router.get('/rates/:serviceId', currencyController.getServiceRate);

// Authenticated - convert amount using service rate
router.post('/convert', authMiddleware, currencyController.convertCurrency);

// Admin - set/update service rate
router.put('/rates', authMiddleware, adminMiddleware, currencyController.setRate);

module.exports = router;
