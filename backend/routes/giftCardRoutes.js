const express = require('express');
const router = express.Router();
const giftCardController = require('../controllers/giftCardController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', giftCardController.getAll);
router.post('/', authMiddleware, adminMiddleware, giftCardController.create);
router.put('/:id', authMiddleware, adminMiddleware, giftCardController.update);
router.delete('/:id', authMiddleware, adminMiddleware, giftCardController.remove);

module.exports = router;
