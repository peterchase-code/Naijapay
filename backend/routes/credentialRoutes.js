const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware, adminMiddleware);

router.get('/', credentialController.getAllCredentials);
router.post('/', apiLimiter, credentialController.createCredential);
router.put('/:id', apiLimiter, credentialController.updateCredential);
router.put('/:id/assign', apiLimiter, credentialController.assignCredential);
router.put('/:id/unassign', apiLimiter, credentialController.removeAssignment);
router.delete('/:id', credentialController.deleteCredential);
router.post('/bulk-assign', apiLimiter, credentialController.assignBulk);

module.exports = router;
