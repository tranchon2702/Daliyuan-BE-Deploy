const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingInfo,
      otherShippingInfo,
      hasOtherAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      note,
    } = req.body;

    // Kiểm tra thông tin đơn hàng
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm trong đơn hàng' });
    }

    // Tạo đơn hàng mới
    const order = new Order({
      user: req.user ? req.user._id : null,
      orderItems: orderItems.map(item => ({
        ...item,
        product: item.product,
      })),
      shippingInfo,
      otherShippingInfo: hasOtherAddress ? otherShippingInfo : {},
      hasOtherAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      note,
    });

    const createdOrder = await order.save();

    // Cập nhật số lượng tồn kho
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        // Cập nhật tồn kho theo đơn vị
        if (product.unitOptions && product.unitOptions.length > 0) {
          const unitOption = product.unitOptions.find(
            (option) => option.unitType === item.unitType
          );
          if (unitOption) {
            unitOption.stock = Math.max(0, unitOption.stock - item.qty);
          }
        }
        
        // Cập nhật tổng tồn kho
        product.stock = Math.max(0, product.stock - item.qty);
        await product.save();
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'fullName email'
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái đã thanh toán
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái đã giao hàng
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Đã giao hàng';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;

      // Cập nhật các trạng thái liên quan
      if (status === 'Đã giao hàng') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      } else if (status === 'Đã hủy') {
        // Nếu đơn hàng bị hủy, hoàn lại số lượng tồn kho
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            // Cập nhật tồn kho theo đơn vị
            if (product.unitOptions && product.unitOptions.length > 0) {
              const unitOption = product.unitOptions.find(
                (option) => option.unitType === item.unitType
              );
              if (unitOption) {
                unitOption.stock += item.qty;
              }
            }
            
            // Cập nhật tổng tồn kho
            product.stock += item.qty;
            await product.save();
          }
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    const count = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate('user', 'fullName email')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      totalOrders: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy đơn hàng của người dùng
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tìm kiếm đơn hàng
// @route   GET /api/orders/search
// @access  Private/Admin
const searchOrders = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    
    if (!keyword) {
      return res.status(400).json({ message: 'Vui lòng nhập từ khóa tìm kiếm' });
    }
    
    // Tìm kiếm theo ID đơn hàng hoặc thông tin khách hàng
    const orders = await Order.find({
      $or: [
        { _id: { $regex: keyword, $options: 'i' } },
        { 'shippingInfo.fullName': { $regex: keyword, $options: 'i' } },
        { 'shippingInfo.email': { $regex: keyword, $options: 'i' } },
        { 'shippingInfo.phone': { $regex: keyword, $options: 'i' } },
      ],
    }).populate('user', 'fullName email');
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getOrders,
  getMyOrders,
  searchOrders,
}; 