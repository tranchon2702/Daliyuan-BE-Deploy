const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./src/models/productModel');
const Category = require('./src/models/categoryModel');

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// Dữ liệu sản phẩm test
const testProducts = [
  { name: 'Bánh Cupcake Vani', nameZh: '香草杯子蛋糕', code: 'CUP001', mainCategory: 'bánh', price: 35000 },
  { name: 'Bánh Donut Chocolate', nameZh: '巧克力甜甜圈', code: 'DON001', mainCategory: 'bánh', price: 28000 },
  { name: 'Bánh Muffin Blueberry', nameZh: '蓝莓玛芬', code: 'MUF001', mainCategory: 'bánh', price: 32000 },
  { name: 'Bánh Croissant Bơ', nameZh: '牛油可颂', code: 'CRO001', mainCategory: 'bánh', price: 45000 },
  { name: 'Bánh Brownie Chocolate', nameZh: '巧克力布朗尼', code: 'BRO001', mainCategory: 'bánh', price: 38000 },
  { name: 'Bánh Cheesecake Dâu', nameZh: '草莓芝士蛋糕', code: 'CHE001', mainCategory: 'bánh', price: 55000 },
  { name: 'Nước Ép Cam Tươi', nameZh: '鲜橙汁', code: 'JUI001', mainCategory: 'nước', price: 25000 },
  { name: 'Trà Sữa Matcha', nameZh: '抹茶奶茶', code: 'TEA001', mainCategory: 'nước', price: 42000 },
  { name: 'Cà Phê Americano', nameZh: '美式咖啡', code: 'COF001', mainCategory: 'nước', price: 35000 },
  { name: 'Smoothie Xoài', nameZh: '芒果冰沙', code: 'SMO001', mainCategory: 'nước', price: 38000 },
  { name: 'Nước Dừa Tươi', nameZh: '新鲜椰子水', code: 'COC001', mainCategory: 'nước', price: 30000 },
  { name: 'Trà Đào Cam Sả', nameZh: '桃橙香茅茶', code: 'TEA002', mainCategory: 'nước', price: 40000 },
];

const createTestProducts = async () => {
  try {
    // Lấy categories có sẵn
    const banhCategory = await Category.findOne({ name: /bánh/i });
    const nuocCategory = await Category.findOne({ name: /nước/i });
    
    if (!banhCategory || !nuocCategory) {
      console.log('Categories not found, creating default categories...');
      const defaultBanhCategory = await Category.create({ name: 'Bánh ngọt', slug: 'banh-ngot' });
      const defaultNuocCategory = await Category.create({ name: 'Nước uống', slug: 'nuoc-uong' });
    }

    const finalBanhCategory = banhCategory || await Category.findOne({ name: /bánh/i });
    const finalNuocCategory = nuocCategory || await Category.findOne({ name: /nước/i });

    // Tạo products
    const productsToCreate = testProducts.map(product => ({
      ...product,
      category: product.mainCategory === 'bánh' ? finalBanhCategory._id : finalNuocCategory._id,
      description: `Mô tả chi tiết cho ${product.name}`,
      descriptionZh: `${product.nameZh}的详细描述`,
      shortDescription: `${product.name} ngon tuyệt vời`,
      shortDescriptionZh: `美味的${product.nameZh}`,
      stock: Math.floor(Math.random() * 100) + 10,
      status: 'Còn hàng',
      isFeatured: Math.random() > 0.5,
      mainImage: '/placeholder-product.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Xóa products cũ nếu có
    const existingProducts = await Product.find({ 
      code: { $in: testProducts.map(p => p.code) } 
    });

    if (existingProducts.length > 0) {
      await Product.deleteMany({ 
        code: { $in: testProducts.map(p => p.code) } 
      });
      console.log(`Đã xóa ${existingProducts.length} sản phẩm test cũ`);
    }

    // Tạo products mới
    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`✅ Đã tạo ${createdProducts.length} sản phẩm test mới`);

    // Thống kê tổng số sản phẩm
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Tổng số sản phẩm trong database: ${totalProducts}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo test products:', error);
    process.exit(1);
  }
};

// Chạy script
connectDB().then(() => {
  createTestProducts();
});
