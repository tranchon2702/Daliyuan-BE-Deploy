# Daliyuan Backend

Backend for Daliyuan dessert shop, built with Node.js, Express, and MongoDB.

## Setup

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
4. Run the server:
```
npm run dev
```

## Seed Data

Để thêm dữ liệu mẫu vào database cho mục đích phát triển và kiểm thử, bạn có thể chạy file seed thủ công:

### Import Data

Lệnh này sẽ xóa tất cả dữ liệu hiện có và nhập dữ liệu mẫu mới:

```
node src/utils/seed.js
```

### Destroy Data

Lệnh này sẽ xóa tất cả dữ liệu trong database:

```
node src/utils/seed.js -d
```

## Test Data Includes

The seed script creates:

- **Users**: Admin user and regular users (including one with Google login)
- **Categories**: Various product categories
- **Products**: Sample products with Vietnamese and Chinese translations
- **Orders**: Sample orders in different statuses

### Admin User Credentials

- Email: admin@daliyuan.com
- Password: admin123

### Regular User Credentials

- Email: john@example.com
- Password: 123456

- Email: jane@example.com
- Password: 123456

- Email: zhang@example.com (Google login)
- Password: 123456

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `POST /api/users/google-login` - Login with Google
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create a product (Admin only)
- `PUT /api/products/:id` - Update a product (Admin only)
- `DELETE /api/products/:id` - Delete a product (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create a category (Admin only)
- `PUT /api/categories/:id` - Update a category (Admin only)
- `DELETE /api/categories/:id` - Delete a category (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get logged in user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin only) 