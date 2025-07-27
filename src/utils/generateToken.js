const jwt = require('jsonwebtoken');

/**
 * Tạo JWT token cho người dùng
 * @param {string} id - ID của người dùng
 * @param {boolean} isAdmin - Quyền admin
 * @returns {string} JWT token
 */
const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET || 'daliyuan_secret_key', {
    expiresIn: '30d',
  });
};

module.exports = generateToken; 