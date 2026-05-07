const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/forgot', authLimiter, passwordResetController.forgotPassword);
router.get('/verify', passwordResetController.verifyToken);
router.post('/reset', authLimiter, passwordResetController.resetPassword);

module.exports = router;
