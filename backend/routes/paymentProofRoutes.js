const express = require('express');
const router = express.Router();
const paymentProofController = require('../controllers/paymentProofController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

router.post('/', upload.single('screenshot'), paymentProofController.uploadProof);
router.get('/my', paymentProofController.getMyProofs);

// Admin routes
router.get('/all', adminMiddleware, paymentProofController.getAllProofs);
router.put('/:id/status', adminMiddleware, paymentProofController.updateStatus);

module.exports = router;
