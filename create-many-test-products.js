require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/productModel');
const Category = require('./src/models/categoryModel');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daliyuan');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const createManyProducts = async () => {
  try {
    console.log('🏭 Tạo nhiều sản phẩm test để kiểm tra pagination...');
    
    // Lấy categories
    const categories = await Category.find();
    const banhCategory = categories.find(c => c.name.includes('bánh') || c.name.includes('Bánh'));
    const nuocCategory = categories.find(c => c.name.includes('nước') || c.name.includes('Nước'));
    
    const products = [];
    
    // Tạo 20 sản phẩm bánh
    for (let i = 1; i <= 20; i++) {
      products.push({
        name: `Bánh Test ${i}`,
        nameZh: `测试饼干 ${i}`,
        slug: `banh-test-${i}`,
        code: `BT${i.toString().padStart(3, '0')}`,
        description: `Mô tả bánh test số ${i}`,
        descriptionZh: `测试饼干描述 ${i}`,
        shortDescription: `Bánh ngon số ${i}`,
        shortDescriptionZh: `美味饼干 ${i}`,
        price: Math.floor(Math.random() * 100) + 50,
        mainImage: '/uploads/images/original/placeholder-banh.jpg',
        images: [],
        category: banhCategory?._id || null,
        mainCategory: 'bánh',
        stock: Math.floor(Math.random() * 100) + 10,
        isFeatured: i <= 5, // 5 sản phẩm đầu là featured
        isBestSeller: i <= 7, // 7 sản phẩm đầu là best seller
        isNewArrival: i <= 3, // 3 sản phẩm đầu là new arrival
        isMustTry: i <= 4,
        isTrending: i <= 6,
        status: 'Còn hàng',
        unitOptions: [
          {
            unitType: 'Gói',
            price: Math.floor(Math.random() * 50) + 20,
            stock: Math.floor(Math.random() * 50) + 10
          }
        ]
      });
    }
    
    // Tạo 15 sản phẩm nước
    for (let i = 1; i <= 15; i++) {
      products.push({
        name: `Nước Test ${i}`,
        nameZh: `测试饮料 ${i}`,
        slug: `nuoc-test-${i}`,
        code: `NT${i.toString().padStart(3, '0')}`,
        description: `Mô tả nước test số ${i}`,
        descriptionZh: `测试饮料描述 ${i}`,
        shortDescription: `Nước ngon số ${i}`,
        shortDescriptionZh: `美味饮料 ${i}`,
        price: Math.floor(Math.random() * 80) + 30,
        mainImage: '/uploads/images/original/placeholder-nuoc.jpg',
        images: [],
        category: nuocCategory?._id || null,
        mainCategory: 'nước',
        stock: Math.floor(Math.random() * 100) + 10,
        isFeatured: i <= 3, // 3 sản phẩm đầu là featured
        isBestSeller: i <= 5, // 5 sản phẩm đầu là best seller
        isNewArrival: i <= 2, // 2 sản phẩm đầu là new arrival
        isMustTry: i <= 3,
        isTrending: i <= 4,
        status: 'Còn hàng',
        unitOptions: [
          {
            unitType: 'Lốc',
            price: Math.floor(Math.random() * 40) + 15,
            stock: Math.floor(Math.random() * 50) + 10
          }
        ]
      });
    }
    
    // Chèn vào database
    await Product.insertMany(products);
    
    console.log(`✅ Đã tạo ${products.length} sản phẩm test!`);
    
    // Thống kê
    const stats = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ mainCategory: 'bánh' }),
      Product.countDocuments({ mainCategory: 'nước' }),
      Product.countDocuments({ isBestSeller: true }),
      Product.countDocuments({ isNewArrival: true }),
      Product.countDocuments({ isFeatured: true })
    ]);
    
    console.log('\n📊 Thống kê sau khi tạo:');
    console.log(`Total products: ${stats[0]}`);
    console.log(`Bánh: ${stats[1]}`);
    console.log(`Nước: ${stats[2]}`);
    console.log(`Best sellers: ${stats[3]}`);
    console.log(`New arrivals: ${stats[4]}`);
    console.log(`Featured: ${stats[5]}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi tạo sản phẩm:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  createManyProducts();
});
