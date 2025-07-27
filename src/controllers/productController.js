const Product = require('../models/productModel');

// Tạo slug từ tên
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const mainCategory = req.query.mainCategory ? { mainCategory: req.query.mainCategory } : {};
    
    const count = await Product.countDocuments({ ...keyword, ...category, ...mainCategory });
    const products = await Product.find({ ...keyword, ...category, ...mainCategory })
      .populate('category', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy sản phẩm theo ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name'
    );

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy sản phẩm theo slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      'category',
      'name'
    );

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm xử lý productTypeImages trong phương thức createProduct
const createProduct = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('req.processedImages:', req.processedImages);

    const {
      name,
      nameZh,
      description,
      descriptionZh,
      price,
      discountPrice,
      stock,
      code,
      category,
      mainCategory,
      unitOptions,
      isFeatured,
      isActive,
      tags,
      isBestSeller,
      isMustTry,
      isNewArrival,
      isTrending,
    } = req.body;

    // Tạo slug từ tên sản phẩm
    const slug = createSlug(name);

    // Xử lý category - nếu là chuỗi rỗng thì set là null
    let productCategory = category;
    if (!category || category === '') {
      productCategory = null;
    }

    // Xử lý unitOptions - parse từ chuỗi JSON nếu cần
    let productUnitOptions = [];
    if (unitOptions) {
      if (typeof unitOptions === 'string') {
        try {
          productUnitOptions = JSON.parse(unitOptions);
        } catch (error) {
          return res.status(400).json({ 
            message: 'Định dạng unitOptions không hợp lệ',
            error: error.message
          });
        }
      } else {
        productUnitOptions = unitOptions;
      }
    }

    // Xử lý ảnh chính và ảnh phụ
    let mainImage = '';
    let images = [];
    let imageVariants = [];

    if (req.processedImages && req.processedImages.length > 0) {
      // Sử dụng phiên bản medium webp cho ảnh chính mặc định
      mainImage = req.processedImages[0].paths.mediumWebp || req.processedImages[0].paths.original;
      
      // Lưu tất cả các đường dẫn ảnh đã xử lý
      imageVariants = req.processedImages.map(img => ({
        original: img.paths.original,
        webp: img.paths.webp,
        thumbnailWebp: img.paths.thumbnailWebp,
        mediumWebp: img.paths.mediumWebp
      }));
      
      // Nếu có nhiều ảnh, lưu các ảnh còn lại vào mảng images
      if (req.processedImages.length > 1) {
        images = req.processedImages.slice(1).map(img => img.paths.mediumWebp || img.paths.original);
      }
    } else if (req.files && req.files.length > 0) {
      // Fallback nếu không có processedImages nhưng có files
      mainImage = `/uploads/images/original/${req.files[0].filename}`;
      
      if (req.files.length > 1) {
        images = req.files.slice(1).map(file => `/uploads/images/original/${file.filename}`);
      }
    } else {
      return res.status(400).json({
        message: 'Vui lòng tải lên ít nhất một hình ảnh cho sản phẩm'
      });
    }

    const product = await Product.create({
      name,
      nameZh,
      description,
      descriptionZh,
      slug,
      code,
      price,
      discountPrice,
      stock,
      mainImage,
      images,
      imageVariants,
      category: productCategory,
      mainCategory,
      unitOptions: productUnitOptions,
      isFeatured: isFeatured === 'true',
      isBestSeller: isBestSeller === 'true',
      isMustTry: isMustTry === 'true',
      isNewArrival: isNewArrival === 'true',
      isTrending: isTrending === 'true',
      isActive: isActive === 'true',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      // Đặt productTypeImages thành mảng rỗng để loại bỏ tính năng này
      productTypeImages: [],
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    res.status(500).json({
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message,
    });
  }
};

// Thêm xử lý productTypeImages trong phương thức updateProduct
const updateProduct = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('req.processedImages:', req.processedImages);

    const { id } = req.params;
    const {
      name,
      nameZh,
      description,
      descriptionZh,
      price,
      discountPrice,
      stock,
      code,
      category,
      mainCategory,
      unitOptions,
      isFeatured,
      isActive,
      tags,
      isBestSeller,
      isMustTry,
      isNewArrival,
      isTrending,
    } = req.body;

    // Tìm sản phẩm hiện tại
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm',
      });
    }

    // Tạo slug mới nếu tên thay đổi
    let slug = existingProduct.slug;
    if (name && name !== existingProduct.name) {
      slug = createSlug(name);
    }

    // Xử lý category - nếu là chuỗi rỗng thì set là null
    let productCategory = category;
    if (category === '') {
      productCategory = null;
    }

    // Xử lý unitOptions - parse từ chuỗi JSON nếu cần
    let productUnitOptions = existingProduct.unitOptions;
    if (unitOptions) {
      if (typeof unitOptions === 'string') {
        try {
          productUnitOptions = JSON.parse(unitOptions);
        } catch (error) {
          return res.status(400).json({
            message: 'Định dạng unitOptions không hợp lệ',
            error: error.message,
          });
        }
      } else {
        productUnitOptions = unitOptions;
      }
    }

    // Xử lý ảnh chính và ảnh phụ trong updateProduct
    let mainImage = existingProduct.mainImage;
    let images = existingProduct.images || [];
    let imageVariants = existingProduct.imageVariants || [];

    console.log('Existing images:', {
      mainImage,
      imagesCount: images.length,
      imageVariantsCount: imageVariants.length
    });

    if (req.processedImages && req.processedImages.length > 0) {
      console.log(`Processing ${req.processedImages.length} new images`);
      
      // Sử dụng phiên bản medium webp cho ảnh chính mặc định
      mainImage = req.processedImages[0].paths.mediumWebp || req.processedImages[0].paths.original;
      
      // Lưu tất cả các đường dẫn ảnh đã xử lý
      const newImageVariants = req.processedImages.map(img => ({
        original: img.paths.original,
        webp: img.paths.webp,
        thumbnailWebp: img.paths.thumbnailWebp,
        mediumWebp: img.paths.mediumWebp
      }));
      
      // Nếu có nhiều ảnh, lưu các ảnh còn lại vào mảng images
      if (req.processedImages.length > 1) {
        images = req.processedImages.slice(1).map(img => img.paths.mediumWebp || img.paths.original);
      }
      
      // Cập nhật thông tin chi tiết về các biến thể ảnh
      imageVariants = newImageVariants;
      
      console.log('Updated images:', {
        mainImage,
        imagesCount: images.length,
        imageVariantsCount: imageVariants.length
      });
    } else if (req.files && req.files.length > 0) {
      // Fallback nếu không có processedImages nhưng có files
      console.log(`Processing ${req.files.length} files without processedImages`);
      
      mainImage = `/uploads/images/original/${req.files[0].filename}`;
      
      if (req.files.length > 1) {
        images = req.files.slice(1).map(file => `/uploads/images/original/${file.filename}`);
      }
      
      console.log('Updated images (fallback):', {
        mainImage,
        imagesCount: images.length
      });
    } else {
      console.log('No new images to process');
    }

    // Kiểm tra mainCategory
    if (!mainCategory) {
      return res.status(400).json({
        message: 'mainCategory là trường bắt buộc',
        value: mainCategory
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        nameZh,
        description,
        descriptionZh,
        price,
        discountPrice,
        stock,
        code,
        slug,
        category: productCategory,
        mainCategory,
        unitOptions: productUnitOptions,
        mainImage,
        images,
        imageVariants,
        isFeatured: isFeatured === 'true',
        isBestSeller: isBestSeller === 'true',
        isMustTry: isMustTry === 'true',
        isNewArrival: isNewArrival === 'true',
        isTrending: isTrending === 'true',
        isActive: isActive === 'true',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : existingProduct.tags,
        // Đặt productTypeImages thành mảng rỗng để loại bỏ tính năng này
        productTypeImages: [],
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).json({
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message,
    });
  }
};

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Đã xóa sản phẩm' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy các sản phẩm nổi bật
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name')
      .limit(limit);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy sản phẩm theo danh mục
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const count = await Product.countDocuments({
      category: req.params.categoryId,
    });
    const products = await Product.find({ category: req.params.categoryId })
      .populate('category', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lấy sản phẩm theo danh mục chính (bánh/nước)
// @route   GET /api/products/main-category/:mainCategory
// @access  Public
const getProductsByMainCategory = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const count = await Product.countDocuments({
      mainCategory: req.params.mainCategory,
    });
    const products = await Product.find({ mainCategory: req.params.mainCategory })
      .populate('category', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tạo đánh giá sản phẩm
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
      const alreadyReviewed = product.ratings.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
      }

      const review = {
        user: req.user._id,
        rating: Number(rating),
        comment,
      };

      product.ratings.push(review);
      product.numReviews = product.ratings.length;
      product.averageRating =
        product.ratings.reduce((acc, item) => item.rating + acc, 0) /
        product.ratings.length;

      await product.save();
      res.status(201).json({ message: 'Đã thêm đánh giá' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tìm kiếm sản phẩm
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { keyword, category, mainCategory } = req.query;
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    
    const searchQuery = {};
    
    // Tìm kiếm theo từ khóa
    if (keyword) {
      searchQuery.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { nameZh: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { descriptionZh: { $regex: keyword, $options: 'i' } },
        { code: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // Lọc theo danh mục
    if (category) {
      searchQuery.category = category;
    }
    
    // Lọc theo danh mục chính
    if (mainCategory) {
      searchQuery.mainCategory = mainCategory;
    }
    
    const count = await Product.countDocuments(searchQuery);
    const products = await Product.find(searchQuery)
      .populate('category', 'name')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi khi tìm kiếm sản phẩm', error: error.message });
  }
};

// @desc    Lấy danh sách danh mục
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    // Lấy tất cả các danh mục duy nhất từ sản phẩm
    const categories = await Product.distinct('category');
    
    // Lọc các giá trị null và undefined
    const validCategories = categories.filter(category => category);
    
    res.json(validCategories);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  getProductsByMainCategory,
  createProductReview,
  searchProducts,
  getCategories,
}; 