const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware để bảo vệ các route yêu cầu đăng nhập
const protect = async (req, res, next) => {
  let token;

  console.log('🔍 protect middleware - Authorization header:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];
      console.log('🔍 protect middleware - Token extracted:', token?.substring(0, 20) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'daliyuan_secret_key');
      console.log('🔍 protect middleware - Token decoded:', decoded);

      // Lấy thông tin user từ token và gán vào req.user
      req.user = await User.findById(decoded.id).select('-password');
      console.log('🔍 protect middleware - User found:', req.user?._id);

      next();
    } catch (error) {
      console.error('❌ protect middleware error:', error);
      res.status(401);
      throw new Error('Không được phép, token không hợp lệ');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Không được phép, không có token');
  }
};

// Middleware kiểm tra quyền admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Không được phép, yêu cầu quyền admin');
  }
};

module.exports = { protect, admin }; 