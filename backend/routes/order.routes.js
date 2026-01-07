// routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Student: create order + list own orders
router.post('/', authMiddleware, orderController.createOrder);
router.get('/my', authMiddleware, orderController.getMyOrders);

// Staff/Admin: view and update all orders
router.get(
  '/staff',
  authMiddleware,
  requireRole('staff', 'admin'),
  orderController.getAllOrders
);

router.patch(
  '/staff/:id/status',
  authMiddleware,
  requireRole('staff', 'admin'),
  orderController.updateOrderStatus
);

module.exports = router;
