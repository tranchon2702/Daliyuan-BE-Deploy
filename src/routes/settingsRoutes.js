const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateStoreInfo,
  updateMaintenanceMode,
  updateSeoSettings,
  updateDeliverySettings,
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// All settings routes require admin authentication
router.use(protect, admin);

// @route   GET /api/admin/settings
// @desc    Lấy tất cả cài đặt hệ thống
// @access  Private/Admin
router.get('/', getSettings);

// @route   PUT /api/admin/settings/store
// @desc    Cập nhật thông tin cửa hàng
// @access  Private/Admin
router.put('/store', updateStoreInfo);

// @route   PUT /api/admin/settings/maintenance
// @desc    Cập nhật chế độ bảo trì
// @access  Private/Admin
router.put('/maintenance', updateMaintenanceMode);

// @route   PUT /api/admin/settings/seo
// @desc    Cập nhật cài đặt SEO
// @access  Private/Admin
router.put('/seo', updateSeoSettings);

// @route   PUT /api/admin/settings/delivery
// @desc    Cập nhật cài đặt giao hàng
// @access  Private/Admin
router.put('/delivery', updateDeliverySettings);

module.exports = router;
