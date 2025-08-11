const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema(
  {
    // Store information
    storeName: {
      type: String,
      default: 'Daliyuan',
    },
    storeDescription: {
      type: String,
      default: 'Tiệm bánh ngọt truyền thống các loại bánh kem, mousse, và tart.',
    },
    storeAddress: {
      type: String,
      default: '654/1C, Phạm Văn Chí, P. Bình Tiên, TP. Hồ Chí Minh',
    },
    storePhone: {
      type: String,
      default: '0766 616 888',
    },
    storeEmail: {
      type: String,
      default: 'ccmm1680@gmail.com',
    },
    
    // Business information
    businessName: {
      type: String,
      default: 'CÔNG TY TNHH THƯƠNG MẠI - DỊCH VỤ - XUẤT NHẬP KHẨU TÂN THỜI ĐẠI',
    },
    taxCode: {
      type: String,
      default: '0313713055',
    },
    
    // System settings
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: 'Website đang bảo trì, vui lòng quay lại sau.',
    },
    
    // SEO settings
    seoTitle: {
      type: String,
      default: 'Daliyuan - Tiệm bánh ngọt truyền thống',
    },
    seoDescription: {
      type: String,
      default: 'Mang đến những sản phẩm bánh kẹo chất lượng cao với hương vị tuyệt vời cho mọi gia đình Việt Nam.',
    },
    seoKeywords: {
      type: String,
      default: 'bánh ngọt, bánh kem, mousse, tart, Daliyuan',
    },
    
    // Social media
    facebookUrl: {
      type: String,
      default: '',
    },
    instagramUrl: {
      type: String,
      default: '',
    },
    
    // Delivery settings
    freeShippingThreshold: {
      type: Number,
      default: 500000, // 500k VND
    },
    deliveryFee: {
      type: Number,
      default: 30000, // 30k VND
    },
    
    // Other settings
    currency: {
      type: String,
      default: 'VND',
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updateData) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updateData);
  } else {
    Object.assign(settings, updateData);
    await settings.save();
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
