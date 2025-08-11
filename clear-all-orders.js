const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./src/models/orderModel');

const clearAllOrders = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/daliyuan';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Count current orders
    const currentCount = await Order.countDocuments();
    console.log(`📊 Current orders in database: ${currentCount}`);

    if (currentCount > 0) {
      // Delete all orders
      const result = await Order.deleteMany({});
      console.log(`🗑️  Deleted ${result.deletedCount} orders`);
    } else {
      console.log('📭 Database is already empty');
    }

    // Verify deletion
    const finalCount = await Order.countDocuments();
    console.log(`📊 Final orders count: ${finalCount}`);
    
    console.log('\n✅ Database is now clean and ready for testing real orders!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

clearAllOrders();
