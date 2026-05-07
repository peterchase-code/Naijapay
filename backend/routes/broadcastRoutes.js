const express = require('express');
const router = express.Router();
const broadcastController = require('../controllers/broadcastController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

// All routes require auth + admin
router.use(authMiddleware, adminMiddleware);

router.post('/', apiLimiter, broadcastController.createBroadcast);
router.get('/', broadcastController.getAllBroadcasts);
router.get('/:id', broadcastController.getBroadcast);
router.delete('/:id', broadcastController.deleteBroadcast);

module.exports = router;
