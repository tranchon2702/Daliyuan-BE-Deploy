const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./src/models/orderModel');

const checkOrders = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/daliyuan';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Count total orders
    const totalOrders = await Order.countDocuments();
    console.log(`📊 Total orders in database: ${totalOrders}`);

    if (totalOrders > 0) {
      // Get sample orders
      const sampleOrders = await Order.find().limit(5).sort({ createdAt: -1 });
      console.log('\n📋 Sample orders:');
      
      sampleOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order ID: ${order._id}`);
        console.log(`   Customer: ${order.shippingInfo?.fullName || 'N/A'}`);
        console.log(`   Email: ${order.shippingInfo?.email || 'N/A'}`);
        console.log(`   Phone: ${order.shippingInfo?.phone || 'N/A'}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Total: ${order.totalPrice}đ`);
        console.log(`   Created: ${order.createdAt}`);
        console.log('   ---');
      });

      // Check for suspicious mock data
      const mockOrders = await Order.find({
        $or: [
          { 'shippingInfo.email': { $regex: '@example.com', $options: 'i' } },
          { 'shippingInfo.fullName': { $regex: 'John Doe|Jane Doe', $options: 'i' } }
        ]
      });

      if (mockOrders.length > 0) {
        console.log(`\n⚠️  Found ${mockOrders.length} orders that look like mock data:`);
        mockOrders.forEach(order => {
          console.log(`   - ${order._id}: ${order.shippingInfo.fullName} (${order.shippingInfo.email})`);
        });
        console.log('\n🧹 Consider removing these mock orders from database');
      } else {
        console.log('\n✅ No mock data found in orders');
      }

    } else {
      console.log('\n📭 No orders in database - this is why you see empty orders list');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkOrders();
