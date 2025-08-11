const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./src/models/orderModel');
const Product = require('./src/models/productModel');

const createTestOrder = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/daliyuan';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get first product for order
    const product = await Product.findOne();
    if (!product) {
      console.log('❌ No products found in database. Please add products first.');
      return;
    }

    console.log('📦 Using product:', product.name);

    // Create test order
    const testOrder = new Order({
      user: null, // Guest order
      orderItems: [
        {
          name: product.name,
          qty: 2,
          image: product.mainImage || '/images/default.jpg',
          price: product.price || 50000,
          unitType: 'Gói',
          product: product._id,
        },
        {
          name: product.name,
          qty: 1,
          image: product.mainImage || '/images/default.jpg',
          price: product.price || 50000,
          unitType: 'Thùng',
          product: product._id,
        }
      ],
      shippingInfo: {
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@gmail.com',
        phone: '0901234567',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        address: '123 Nguyễn Huệ',
        note: 'Giao giờ hành chính'
      },
      paymentMethod: 'COD',
      itemsPrice: 150000,
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 150000,
      status: 'Đang xử lý',
      note: 'Đơn hàng test từ script'
    });

    const savedOrder = await testOrder.save();
    console.log('✅ Test order created successfully!');
    console.log('📋 Order details:');
    console.log(`   Order ID: ${savedOrder._id}`);
    console.log(`   Customer: ${savedOrder.shippingInfo.fullName}`);
    console.log(`   Email: ${savedOrder.shippingInfo.email}`);
    console.log(`   Phone: ${savedOrder.shippingInfo.phone}`);
    console.log(`   Total: ${savedOrder.totalPrice}đ`);
    console.log(`   Status: ${savedOrder.status}`);

    // Create another order
    const testOrder2 = new Order({
      user: null,
      orderItems: [
        {
          name: product.name,
          qty: 3,
          image: product.mainImage || '/images/default.jpg',
          price: product.price || 50000,
          unitType: 'Gói',
          product: product._id,
        }
      ],
      shippingInfo: {
        fullName: 'Trần Thị B',
        email: 'tranthib@yahoo.com',
        phone: '0987654321',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 3',
        ward: 'Phường Võ Thị Sáu',
        address: '456 Điện Biên Phủ',
        note: 'Gọi trước khi giao'
      },
      paymentMethod: 'Bank Transfer',
      itemsPrice: 150000,
      taxPrice: 0,
      shippingPrice: 30000,
      totalPrice: 180000,
      status: 'Đã xác nhận',
      note: 'Đơn hàng test 2'
    });

    const savedOrder2 = await testOrder2.save();
    console.log('✅ Second test order created!');
    console.log(`   Order ID: ${savedOrder2._id}`);
    console.log(`   Customer: ${savedOrder2.shippingInfo.fullName}`);
    console.log(`   Total: ${savedOrder2.totalPrice}đ`);

    // Count total orders
    const totalOrders = await Order.countDocuments();
    console.log(`\n📊 Total orders in database: ${totalOrders}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

createTestOrder();
