const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { processImages } = require('../middleware/imageProcessingMiddleware');

// Routes cho người dùng
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/featured', productController.getFeaturedProducts);
router.get('/check-code/:code', productController.checkProductCode);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// Routes cho admin
router.post('/', protect, admin, upload.array('images', 10), processImages, productController.createProduct);
router.put('/:id', protect, admin, upload.array('images', 10), processImages, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router; 