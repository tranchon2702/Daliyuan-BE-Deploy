const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes'); // ✅ Import settings routes

// Import database connection
const connectDB = require('./config/db');

// Create Express app
const app = express();

// Connect to database
connectDB();

// CORS configuration for production
const corsOptions = {
  origin: [
    'https://daliyuan.com.vn',
    'https://www.daliyuan.com.vn',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],  
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));

// Phục vụ các file tĩnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/images', express.static(path.join(__dirname, '../uploads/images')));
app.use('/uploads/images/original', express.static(path.join(__dirname, '../uploads/images/original')));
app.use('/uploads/images/webp', express.static(path.join(__dirname, '../uploads/images/webp')));
app.use('/uploads/images/thumbnail', express.static(path.join(__dirname, '../uploads/images/thumbnail')));
app.use('/uploads/images/medium', express.static(path.join(__dirname, '../uploads/images/medium')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/settings', settingsRoutes); // ✅ Add settings routes

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});