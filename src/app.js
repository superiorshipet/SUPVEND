const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./modules/auth/auth.routes.js');
const errorHandler = require('./middleware/errorHandler.js');
const AppError = require('./utils/AppError.js');

// Import other routes
const categoryRoutes = require('./modules/category/category.routes.js');
const productRoutes = require('./modules/product/product.routes.js');
const cartRoutes = require('./modules/cart/cart.routes.js');
const couponRoutes = require('./modules/coupon/coupon.routes.js');
const orderRoutes = require('./modules/order/order.routes.js');
const flashSaleRoutes = require('./modules/flashSale/flashSale.routes.js');
const auctionRoutes = require('./modules/auction/auction.routes.js');
const { router: walletRouter, webhookRouter } = require('./modules/wallet/wallet.routes.js');
const notificationRoutes = require('./modules/notification/notification.routes.js');
const vendorDashboardRoutes = require('./modules/dashboard/vendor/vendorDashboard.routes.js');
const adminDashboardRoutes = require('./modules/dashboard/admin/adminDashboard.routes.js');

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
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/flash-sales', flashSaleRoutes);
app.use('/api/v1/auctions', auctionRoutes);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/vendor/dashboard', vendorDashboardRoutes);
app.use('/api/v1/admin/dashboard', adminDashboardRoutes);
app.use('/webhook', webhookRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 handler - catch all unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
