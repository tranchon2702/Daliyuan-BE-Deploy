const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getOrders,
  getMyOrders,
  searchOrders,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes (cho phép đặt hàng không cần đăng nhập)
router.post('/', protect, createOrder);

// Protected routes
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/pay').put(protect, updateOrderToPaid);

// Admin routes
router.route('/').get(protect, admin, getOrders);
router.route('/search').get(protect, admin, searchOrders);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

// Order specific routes - gộp GET và DELETE vào cùng route
router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder);

module.exports = router; 