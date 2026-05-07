const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);

router.get('/my', referralController.getMyReferrals);
router.get('/all', adminMiddleware, referralController.getAllReferrals);

module.exports = router;
