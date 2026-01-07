const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const userCtrl = require('../controllers/user.controller');

router.get('/me', authMiddleware, userCtrl.getProfile);
router.patch('/me', authMiddleware, userCtrl.updateProfile);
router.patch('/me/password', authMiddleware, userCtrl.changePassword);

module.exports = router;
