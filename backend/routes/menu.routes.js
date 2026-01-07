// routes/menu.routes.js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { upload } = require('../config/cloudinary.config');

// Public: students see menu
router.get('/', menuController.getMenu);

// Staff/Admin: manage items
router.post(
  '/',
  authMiddleware,
  requireRole('staff', 'admin'),
  upload.single('image'),
  menuController.createMenuItem
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('staff', 'admin'),
  upload.single('image'),
  menuController.updateMenuItem
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('staff', 'admin'),
  menuController.deleteMenuItem
);

module.exports = router;
