const Settings = require('../models/settingsModel');

// @desc    Lấy tất cả cài đặt hệ thống
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Không thể tải cài đặt hệ thống', error: error.message });
  }
};

// @desc    Cập nhật thông tin cửa hàng
// @route   PUT /api/admin/settings/store
// @access  Private/Admin
const updateStoreInfo = async (req, res) => {
  try {
    const {
      storeName,
      storeDescription,
      storeAddress,
      storePhone,
      storeEmail,
      businessName,
      taxCode,
    } = req.body;

    console.log('🔧 Updating store info:', req.body);

    const updateData = {};
    if (storeName !== undefined) updateData.storeName = storeName;
    if (storeDescription !== undefined) updateData.storeDescription = storeDescription;
    if (storeAddress !== undefined) updateData.storeAddress = storeAddress;
    if (storePhone !== undefined) updateData.storePhone = storePhone;
    if (storeEmail !== undefined) updateData.storeEmail = storeEmail;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (taxCode !== undefined) updateData.taxCode = taxCode;

    const settings = await Settings.updateSettings(updateData);
    
    console.log('✅ Store info updated successfully');
    res.json({
      message: 'Thông tin cửa hàng đã được cập nhật thành công',
      settings
    });
  } catch (error) {
    console.error('❌ Error updating store info:', error);
    res.status(500).json({ message: 'Không thể cập nhật thông tin cửa hàng', error: error.message });
  }
};

// @desc    Cập nhật chế độ bảo trì
// @route   PUT /api/admin/settings/maintenance
// @access  Private/Admin
const updateMaintenanceMode = async (req, res) => {
  try {
    const { maintenanceMode, maintenanceMessage } = req.body;

    console.log('🔧 Updating maintenance mode:', { maintenanceMode, maintenanceMessage });

    const updateData = {};
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined) updateData.maintenanceMessage = maintenanceMessage;

    const settings = await Settings.updateSettings(updateData);
    
    console.log('✅ Maintenance mode updated successfully');
    res.json({
      message: 'Chế độ bảo trì đã được cập nhật thành công',
      settings
    });
  } catch (error) {
    console.error('❌ Error updating maintenance mode:', error);
    res.status(500).json({ message: 'Không thể cập nhật chế độ bảo trì', error: error.message });
  }
};

// @desc    Cập nhật cài đặt SEO
// @route   PUT /api/admin/settings/seo
// @access  Private/Admin
const updateSeoSettings = async (req, res) => {
  try {
    const { seoTitle, seoDescription, seoKeywords } = req.body;

    console.log('🔧 Updating SEO settings:', req.body);

    const updateData = {};
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;

    const settings = await Settings.updateSettings(updateData);
    
    console.log('✅ SEO settings updated successfully');
    res.json({
      message: 'Cài đặt SEO đã được cập nhật thành công',
      settings
    });
  } catch (error) {
    console.error('❌ Error updating SEO settings:', error);
    res.status(500).json({ message: 'Không thể cập nhật cài đặt SEO', error: error.message });
  }
};

// @desc    Cập nhật cài đặt giao hàng
// @route   PUT /api/admin/settings/delivery
// @access  Private/Admin
const updateDeliverySettings = async (req, res) => {
  try {
    const { freeShippingThreshold, deliveryFee } = req.body;

    console.log('🔧 Updating delivery settings:', req.body);

    const updateData = {};
    if (freeShippingThreshold !== undefined) updateData.freeShippingThreshold = freeShippingThreshold;
    if (deliveryFee !== undefined) updateData.deliveryFee = deliveryFee;

    const settings = await Settings.updateSettings(updateData);
    
    console.log('✅ Delivery settings updated successfully');
    res.json({
      message: 'Cài đặt giao hàng đã được cập nhật thành công',
      settings
    });
  } catch (error) {
    console.error('❌ Error updating delivery settings:', error);
    res.status(500).json({ message: 'Không thể cập nhật cài đặt giao hàng', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateStoreInfo,
  updateMaintenanceMode,
  updateSeoSettings,
  updateDeliverySettings,
};
