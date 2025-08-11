const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Lấy ngày hiện tại và 30 ngày trước
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Tổng doanh thu
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Đã hủy' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Doanh thu 30 ngày gần nhất
    const recentRevenueResult = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'Đã hủy' }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const recentRevenue = recentRevenueResult[0]?.total || 0;

    // Doanh thu 30-60 ngày trước (để tính % thay đổi)
    const previousRevenueResult = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
          status: { $ne: 'Đã hủy' }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const previousRevenue = previousRevenueResult[0]?.total || 0;

    // Tính % thay đổi doanh thu
    const revenueChange = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
      : recentRevenue > 0 ? '+100.0' : '0.0';

    // Tổng số đơn hàng
    const totalOrders = await Order.countDocuments({ status: { $ne: 'Đã hủy' } });
    
    // Đơn hàng 30 ngày gần nhất
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $ne: 'Đã hủy' }
    });

    // Đơn hàng 30-60 ngày trước
    const previousOrders = await Order.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      status: { $ne: 'Đã hủy' }
    });

    // Tính % thay đổi đơn hàng
    const ordersChange = previousOrders > 0 
      ? ((recentOrders - previousOrders) / previousOrders * 100).toFixed(1)
      : recentOrders > 0 ? '+100.0' : '0.0';

    // Tổng số khách hàng (users)
    const totalCustomers = await User.countDocuments({ isAdmin: false });
    
    // Khách hàng mới 30 ngày gần nhất
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      isAdmin: false
    });

    // Khách hàng mới 30-60 ngày trước
    const previousNewCustomers = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      isAdmin: false
    });

    // Tính % thay đổi khách hàng mới
    const customersChange = previousNewCustomers > 0 
      ? ((newCustomers - previousNewCustomers) / previousNewCustomers * 100).toFixed(1)
      : newCustomers > 0 ? '+100.0' : '0.0';

    // Tổng số sản phẩm
    const totalProducts = await Product.countDocuments();

    // Sản phẩm mới 30 ngày gần nhất
    const newProducts = await Product.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Sản phẩm mới 30-60 ngày trước
    const previousNewProducts = await Product.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    // Tính % thay đổi sản phẩm
    const productsChange = previousNewProducts > 0 
      ? ((newProducts - previousNewProducts) / previousNewProducts * 100).toFixed(1)
      : newProducts > 0 ? '+100.0' : '0.0';

    // Format response
    const stats = {
      totalRevenue: {
        amount: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(totalRevenue),
        change: `${revenueChange.startsWith('-') ? '' : '+'}${revenueChange}%`
      },
      orders: {
        amount: totalOrders.toString(),
        change: `${ordersChange.startsWith('-') ? '' : '+'}${ordersChange}%`
      },
      newCustomers: {
        amount: totalCustomers.toString(),
        change: `${customersChange.startsWith('-') ? '' : '+'}${customersChange}%`
      },
      articles: {
        amount: totalProducts.toString(),
        change: `${productsChange.startsWith('-') ? '' : '+'}${productsChange}%`
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent orders for dashboard
// @route   GET /api/admin/dashboard/recent-orders
// @access  Private/Admin
const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id shippingInfo totalPrice status createdAt');

    res.json(recentOrders);
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get low stock products
// @route   GET /api/admin/dashboard/low-stock
// @access  Private/Admin
const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      stock: { $lte: 10 }
    })
    .sort({ stock: 1 })
    .limit(10)
    .select('name code stock mainImage');

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Low stock products error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
};
