const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./modules/auth/auth.routes.js');
const errorHandler = require('./middleware/errorHandler.js');
const AppError = require('./utils/AppError.js');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Routes
app.use('/api/v1/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;

// Import new routes
const categoryRoutes = require('./modules/category/category.routes.js');
const productRoutes = require('./modules/product/product.routes.js');

// Add routes to app
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);

// Import cart and coupon routes
const cartRoutes = require('./modules/cart/cart.routes.js');
const couponRoutes = require('./modules/coupon/coupon.routes.js');

// Add routes to app
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/coupons', couponRoutes);

// Import order routes
const orderRoutes = require('./modules/order/order.routes.js');

// Add routes to app
app.use('/api/v1/orders', orderRoutes);
