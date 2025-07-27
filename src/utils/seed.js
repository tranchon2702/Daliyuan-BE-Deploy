/**
 * Seed Script cho Daliyuan Shop
 * 
 * Cách sử dụng:
 * 1. Import dữ liệu mẫu:
 *    node src/utils/seed.js
 * 
 * 2. Xóa tất cả dữ liệu:
 *    node src/utils/seed.js -d
 * 
 * Script này sẽ tạo:
 * - 4 người dùng (bao gồm 1 admin và 1 người dùng đăng nhập bằng Google)
 * - 5 danh mục sản phẩm
 * - 6 sản phẩm với tên và mô tả bằng tiếng Việt và tiếng Trung
 * - 4 đơn hàng với các trạng thái khác nhau
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config();

// Kết nối MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/daliyuan';
console.log('Connecting to MongoDB with URI:', mongoURI);

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected'.cyan.underline))
  .catch(err => {
    console.error(`Error: ${err.message}`.red.underline.bold);
    process.exit(1);
  });

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

// Dữ liệu mẫu
const users = [
  {
    fullName: 'Admin User',
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    phone: '0901234567',
    address: {
      province: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      street: '123 Lê Lợi'
    },
    isAdmin: true,
  },
  {
    fullName: 'John Doe',
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
    phone: '0909876543',
    address: {
      province: 'Hồ Chí Minh',
      district: 'Quận 3',
      ward: 'Phường 1',
      street: '456 Nguyễn Đình Chiểu'
    },
  },
  {
    fullName: 'Jane Doe',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
    phone: '0908765432',
    address: {
      province: 'Hồ Chí Minh',
      district: 'Quận 7',
      ward: 'Phường Tân Phong',
      street: '789 Nguyễn Văn Linh'
    },
  },
];

const categories = [
  {
    name: 'Bánh ngọt',
    slug: 'banh-ngot',
    description: 'Các loại bánh ngọt',
    isActive: true
  },
  {
    name: 'Bánh mặn',
    slug: 'banh-man',
    description: 'Các loại bánh mặn',
    isActive: true
  },
  {
    name: 'Nước giải khát',
    slug: 'nuoc-giai-khat',
    description: 'Các loại nước giải khát',
    isActive: true
  },
  {
    name: 'Trà sữa',
    slug: 'tra-sua',
    description: 'Các loại trà sữa',
    isActive: true
  },
];

// Hàm seed dữ liệu
const seedData = async () => {
  try {
    // Xóa dữ liệu cũ
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    console.log('Data cleared'.red.inverse);

    // Thêm users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    console.log('Users seeded'.green.inverse);

    // Thêm categories
    const createdCategories = await Category.insertMany(categories);
    
    console.log('Categories seeded'.green.inverse);

    // Tạo products
    const products = [
      // Bánh ngọt
      {
        name: 'Black Forest Cake',
        nameZh: '黑森林蛋糕',
        code: 'BFC001',
        description: 'Bánh Black Forest hộp thiếc cao cấp với lớp kem tươi mềm mịn, cherry tươi và chocolate đen Bỉ nguyên chất.',
        descriptionZh: '精致的黑森林蛋糕，搭配新鲜奶油，樱桃和比利时黑巧克力。',
        price: 399600,
        mainImage: '/uploads/images/black-forest-cake.jpg',
        category: createdCategories[0]._id,
        mainCategory: 'bánh',
        unitOptions: [
          {
            unitType: 'Gói',
            price: 399600,
            stock: 50
          },
          {
            unitType: 'Thùng',
            price: 1998000,
            stock: 10
          }
        ],
        stock: 50,
        isFeatured: true,
        status: 'Còn hàng',
      },
      {
        name: 'Chocolate Dream Cake',
        nameZh: '巧克力梦幻蛋糕',
        code: 'CDC002',
        description: 'Bánh chocolate mềm mịn với lớp kem chocolate Bỉ cao cấp và sốt chocolate đậm đà.',
        descriptionZh: '柔软的巧克力蛋糕，搭配高级比利时巧克力奶油和浓郁的巧克力酱。',
        price: 243000,
        mainImage: '/uploads/images/chocolate-cake.jpg',
        category: createdCategories[0]._id,
        mainCategory: 'bánh',
        unitOptions: [
          {
            unitType: 'Gói',
            price: 243000,
            stock: 40
          },
          {
            unitType: 'Thùng',
            price: 1215000,
            stock: 8
          }
        ],
        stock: 40,
        isFeatured: true,
        status: 'Còn hàng',
      },
      {
        name: 'Tiramisu Classic',
        nameZh: '经典提拉米苏',
        code: 'TIR003',
        description: 'Tiramisu cổ điển với lớp bánh mềm thấm cà phê, phủ lớp kem mascarpone mịn màng và bột cacao.',
        descriptionZh: '经典提拉米苏，咖啡浸泡的软蛋糕层，覆盖着丝滑的马斯卡彭奶油和可可粉。',
        price: 156000,
        mainImage: '/uploads/images/tiramisu.jpg',
        category: createdCategories[0]._id,
        mainCategory: 'bánh',
        unitOptions: [
          {
            unitType: 'Gói',
            price: 156000,
            stock: 35
          },
          {
            unitType: 'Thùng',
            price: 780000,
            stock: 7
          }
        ],
        stock: 35,
        isFeatured: false,
        status: 'Còn hàng',
      },
      
      // Bánh mặn
      {
        name: 'Bánh Mì Pate',
        nameZh: '肝酱面包',
        code: 'BMP004',
        description: 'Bánh mì giòn với pate thơm ngon, dưa chuột và rau thơm.',
        descriptionZh: '酥脆面包配美味肝酱，黄瓜和香草。',
        price: 25000,
        mainImage: '/uploads/images/banh-mi.jpg',
        category: createdCategories[1]._id,
        mainCategory: 'bánh',
        unitOptions: [
          {
            unitType: 'Gói',
            price: 25000,
            stock: 100
          },
          {
            unitType: 'Thùng',
            price: 250000,
            stock: 20
          }
        ],
        stock: 100,
        isFeatured: true,
        status: 'Còn hàng',
      },
      
      // Nước giải khát
      {
        name: 'Coca Cola',
        nameZh: '可口可乐',
        code: 'CCL005',
        description: 'Nước giải khát có gas Coca Cola.',
        descriptionZh: '碳酸饮料可口可乐。',
        price: 10000,
        mainImage: '/uploads/images/coca-cola.jpg',
        category: createdCategories[2]._id,
        mainCategory: 'nước',
        unitOptions: [
          {
            unitType: 'Lốc',
            price: 60000,
            stock: 200
          },
          {
            unitType: 'Thùng',
            price: 240000,
            stock: 50
          }
        ],
        stock: 200,
        isFeatured: false,
        status: 'Còn hàng',
      },
      {
        name: 'Nước Cam Ép',
        nameZh: '鲜榨橙汁',
        code: 'NCE006',
        description: 'Nước cam ép tươi 100% từ cam tự nhiên.',
        descriptionZh: '100%新鲜橙汁，来自天然橙子。',
        price: 25000,
        mainImage: '/uploads/images/orange-juice.jpg',
        category: createdCategories[2]._id,
        mainCategory: 'nước',
        unitOptions: [
          {
            unitType: 'Lốc',
            price: 150000,
            stock: 100
          },
          {
            unitType: 'Thùng',
            price: 600000,
            stock: 25
          }
        ],
        stock: 100,
        isFeatured: true,
        status: 'Còn hàng',
      },
      
      // Trà sữa
      {
        name: 'Trà Sữa Trân Châu',
        nameZh: '珍珠奶茶',
        code: 'TST007',
        description: 'Trà sữa truyền thống với trân châu đen dẻo.',
        descriptionZh: '传统奶茶配弹性黑珍珠。',
        price: 35000,
        mainImage: '/uploads/images/bubble-tea.jpg',
        category: createdCategories[3]._id,
        mainCategory: 'nước',
        unitOptions: [
          {
            unitType: 'Lốc',
            price: 210000,
            stock: 80
          },
          {
            unitType: 'Thùng',
            price: 840000,
            stock: 15
          }
        ],
        stock: 80,
        isFeatured: true,
        status: 'Còn hàng',
      },
    ];

    // Thêm slug cho mỗi sản phẩm
    const productsWithSlug = products.map(product => {
      return { ...product, slug: createSlug(product.name) };
    });

    // Thêm products
    const createdProducts = await Product.insertMany(productsWithSlug);

    console.log('Products seeded'.green.inverse);

    // Tạo orders
    const orders = [
      {
        user: createdUsers[1]._id,
        orderItems: [
          {
            name: 'Black Forest Cake',
            qty: 2,
            image: '/uploads/images/black-forest-cake.jpg',
            price: 399600,
            unitType: 'Gói',
            product: createdProducts[0]._id,
          },
          {
            name: 'Coca Cola',
            qty: 1,
            image: '/uploads/images/coca-cola.jpg',
            price: 10000,
            unitType: 'Lốc',
            product: createdProducts[4]._id,
          },
        ],
        shippingInfo: {
          fullName: createdUsers[1].fullName,
          email: createdUsers[1].email,
          phone: createdUsers[1].phone,
          province: createdUsers[1].address.province,
          district: createdUsers[1].address.district,
          ward: createdUsers[1].address.ward,
          address: createdUsers[1].address.street,
          note: 'Giao hàng trong giờ hành chính'
        },
        hasOtherAddress: false,
        paymentMethod: 'card',
        paymentResult: {
          id: 'ABC123',
          status: 'COMPLETED',
          update_time: Date.now(),
          email_address: 'john@example.com',
        },
        itemsPrice: 399600 * 2 + 10000,
        taxPrice: 0,
        shippingPrice: 30000,
        totalPrice: 399600 * 2 + 10000 + 30000,
        isPaid: true,
        paidAt: Date.now(),
        isDelivered: false,
        status: 'Đã xác nhận'
      },
      {
        user: createdUsers[2]._id,
        orderItems: [
          {
            name: 'Tiramisu Classic',
            qty: 1,
            image: '/uploads/images/tiramisu.jpg',
            price: 156000,
            unitType: 'Gói',
            product: createdProducts[2]._id,
          },
        ],
        shippingInfo: {
          fullName: createdUsers[2].fullName,
          email: createdUsers[2].email,
          phone: createdUsers[2].phone,
          province: createdUsers[2].address.province,
          district: createdUsers[2].address.district,
          ward: createdUsers[2].address.ward,
          address: createdUsers[2].address.street,
          note: 'Gọi điện trước khi giao'
        },
        hasOtherAddress: false,
        paymentMethod: 'cash',
        itemsPrice: 156000,
        taxPrice: 0,
        shippingPrice: 30000,
        totalPrice: 156000 + 30000,
        isPaid: false,
        isDelivered: false,
        status: 'Đang xử lý'
      },
    ];

    // Thêm orders
    await Order.insertMany(orders);

    console.log('Orders seeded'.green.inverse);
    console.log('Data seeded successfully!'.green.inverse);
    
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

seedData(); 