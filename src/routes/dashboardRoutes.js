const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
} = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// All dashboard routes require admin authentication
router.use(protect, admin);

// Dashboard statistics
router.get('/', getDashboardStats);
router.get('/recent-orders', getRecentOrders);
router.get('/low-stock', getLowStockProducts);

module.exports = router;
