const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./src/models/orderModel');

const cleanMockData = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/daliyuan';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find mock orders
    const mockOrders = await Order.find({
      $or: [
        { 'shippingInfo.email': { $regex: '@example.com', $options: 'i' } },
        { 'shippingInfo.fullName': { $regex: 'John Doe|Jane Doe', $options: 'i' } }
      ]
    });

    console.log(`🔍 Found ${mockOrders.length} mock orders to delete:`);
    
    mockOrders.forEach(order => {
      console.log(`   - ${order._id}: ${order.shippingInfo.fullName} (${order.shippingInfo.email})`);
    });

    if (mockOrders.length > 0) {
      // Delete mock orders
      const result = await Order.deleteMany({
        $or: [
          { 'shippingInfo.email': { $regex: '@example.com', $options: 'i' } },
          { 'shippingInfo.fullName': { $regex: 'John Doe|Jane Doe', $options: 'i' } }
        ]
      });

      console.log(`\n🗑️  Deleted ${result.deletedCount} mock orders`);
      
      // Check remaining orders
      const remainingOrders = await Order.countDocuments();
      console.log(`📊 Remaining orders in database: ${remainingOrders}`);
      
      if (remainingOrders === 0) {
        console.log('\n📭 Database is now clean! No orders remaining.');
        console.log('💡 Create real orders by placing orders through the frontend.');
      }
    } else {
      console.log('\n✅ No mock orders found - database is clean!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

cleanMockData();
