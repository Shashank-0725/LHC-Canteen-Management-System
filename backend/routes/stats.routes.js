const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const stats = require('../controllers/stats.controller');

router.get(
  '/summary',
  authMiddleware,
  requireRole('staff', 'admin'),
  stats.getStatsSummary
);

router.get(
  '/top-items',
  authMiddleware,
  requireRole('staff', 'admin'),
  stats.getTopItems
);

router.get(
  '/weekly-revenue',
  authMiddleware,
  requireRole('staff', 'admin'),
  stats.getWeeklyRevenue
);

module.exports = router;
