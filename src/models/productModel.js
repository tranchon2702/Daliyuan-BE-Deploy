const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nameZh: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      maxlength: 6,
      match: /^[A-Z0-9]{1,6}$/,
    },
    description: {
      type: String,
      default: '',
    },
    descriptionZh: {
      type: String,
      default: '',
    },
    shortDescription: {
      type: String,
      default: '',
    },
    shortDescriptionZh: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    // Ảnh chính - hiển thị trong list/card
    mainImage: {
      type: String,
      required: true,
    },
    // Mảng ảnh chi tiết - hiển thị trong product detail page
    images: [String],
    // Variants cho optimization (giữ nguyên cho tương lai)
    imageVariants: [
      {
        original: String,
        webp: String,
        thumbnailWebp: String,
        mediumWebp: String
      }
    ],
    productTypeImages: [
      {
        unitType: String,  // Loại đóng gói (Lốc, Thùng, Gói...)
        images: [String]   // Các ảnh tương ứng với loại đóng gói
      }
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    mainCategory: {
      type: String,
      enum: ['bánh', 'nước'],
      required: true,
    },
    unitOptions: [
      {
        unitType: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        stock: {
          type: Number,
          required: true,
          default: 0,
        }
      }
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isMustTry: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Còn hàng', 'Hết hàng', 'Ngừng kinh doanh'],
      default: 'Còn hàng',
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    numReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    giaGoi: {
      type: Number,
      default: 0,
    },
    giaThung: {
      type: Number,
      default: 0,
    },
    giaLoc: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware để tự động cập nhật trạng thái dựa trên tồn kho
// DISABLED: Chúng ta quản lý status thủ công thay vì dựa vào stock
// productSchema.pre('save', function(next) {
//   if (this.stock <= 0) {
//     this.status = 'Hết hàng';
//   } else {
//     this.status = 'Còn hàng';
//   }
//   next();
// });

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 