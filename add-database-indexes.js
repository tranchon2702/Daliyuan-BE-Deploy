const mongoose = require('mongoose');
const path = require('path');

// Load environment variables từ đúng path
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import models
const Product = require('./src/models/productModel');

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/daliyuan';
    
    console.log('🔌 Đang kết nối MongoDB với URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in log
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    process.exit(1);
  }
};

const addIndexes = async () => {
  try {
    console.log('🔍 Thêm indexes cho Product collection...');
    
    // Index cho sorting (createdAt descending)
    await Product.collection.createIndex({ createdAt: -1 });
    console.log('✅ Index createdAt: -1');
    
    // Index cho text search (name)
    await Product.collection.createIndex({ 
      name: 'text', 
      nameZh: 'text',
      code: 'text',
      description: 'text' 
    });
    console.log('✅ Text index cho search');
    
    // Compound index cho filtering
    await Product.collection.createIndex({ 
      mainCategory: 1, 
      status: 1, 
      createdAt: -1 
    });
    console.log('✅ Compound index mainCategory + status + createdAt');
    
    // Index cho category filtering
    await Product.collection.createIndex({ category: 1, createdAt: -1 });
    console.log('✅ Index category + createdAt');
    
    // Index cho featured products
    await Product.collection.createIndex({ isFeatured: 1, createdAt: -1 });
    console.log('✅ Index isFeatured + createdAt');
    
    // Index cho stock filtering
    await Product.collection.createIndex({ stock: 1 });
    console.log('✅ Index stock');
    
    // Liệt kê tất cả indexes
    const indexes = await Product.collection.listIndexes().toArray();
    console.log('\n📊 Tất cả indexes hiện tại:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    console.log('\n🎉 Hoàn thành thêm indexes!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi thêm indexes:', error);
    process.exit(1);
  }
};

// Chạy script
connectDB().then(() => {
  addIndexes();
});
