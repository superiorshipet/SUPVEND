const catchAsync = require('../../../utils/catchAsync.js');
const Vendor = require('../../vendor/vendor.model.js');
const Product = require('../../product/product.model.js');
const Order = require('../../order/order.model.js');
const FlashSale = require('../../flashSale/flashSale.model.js');
const { Auction } = require('../../auction/auction.model.js');
const { Wallet, WalletTransaction } = require('../../wallet/wallet.model.js');
const Payout = require('../../payout/payout.model.js');
const AppError = require('../../../utils/AppError.js');

// Overview stats
const getOverview = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    throw new AppError('Vendor not found', 404);
  }
  
  // Get date ranges
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  
  // Revenue calculation from orders
  const orders = await Order.find({
    'items.vendorId': vendor._id,
    paymentStatus: 'paid'
  });
  
  const todayRevenue = orders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.vendorId.toString() === vendor._id.toString());
    const orderDate = new Date(order.createdAt);
    if (orderDate >= today) {
      return sum + vendorItems.reduce((s, item) => s + item.total, 0);
    }
    return sum;
  }, 0);
  
  const weekRevenue = orders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.vendorId.toString() === vendor._id.toString());
    const orderDate = new Date(order.createdAt);
    if (orderDate >= weekAgo) {
      return sum + vendorItems.reduce((s, item) => s + item.total, 0);
    }
    return sum;
  }, 0);
  
  const monthRevenue = orders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.vendorId.toString() === vendor._id.toString());
    const orderDate = new Date(order.createdAt);
    if (orderDate >= monthAgo) {
      return sum + vendorItems.reduce((s, item) => s + item.total, 0);
    }
    return sum;
  }, 0);
  
  // New orders count
  const newOrders = await Order.countDocuments({
    'items.vendorId': vendor._id,
    createdAt: { $gte: weekAgo }
  });
  
  // Top selling products
  const products = await Product.find({ vendorId: vendor._id })
    .sort('-soldCount')
    .limit(5);
  
  // Sales chart data (last 30 days grouped by day)
  const salesChart = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dailyOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= date && orderDate < nextDate;
    });
    
    const dailyRevenue = dailyOrders.reduce((sum, order) => {
      const vendorItems = order.items.filter(item => item.vendorId.toString() === vendor._id.toString());
      return sum + vendorItems.reduce((s, item) => s + item.total, 0);
    }, 0);
    
    salesChart.push({
      date: date.toISOString().split('T')[0],
      revenue: dailyRevenue,
      orders: dailyOrders.length
    });
  }
  
  const wallet = await Wallet.findOne({ userId: req.user.id });
  
  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalRevenue: vendor.totalRevenue,
        availableBalance: wallet?.balance || 0,
        newOrders,
        totalProducts: products.length,
        rating: vendor.rating
      },
      topProducts: products,
      salesChart
    }
  });
});

// Get vendor products
const getProducts = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  const products = await Product.find({ vendorId: vendor._id })
    .populate('categoryId', 'name')
    .sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

// Get vendor orders
const getOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const vendor = await Vendor.findOne({ userId: req.user.id });
  
  let filter = { 'items.vendorId': vendor._id };
  if (status) filter['items.status'] = status;
  
  const orders = await Order.find(filter)
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate('userId', 'name email');
  
  // Filter to show only vendor's items per order
  orders.forEach(order => {
    order.items = order.items.filter(item => item.vendorId.toString() === vendor._id.toString());
  });
  
  const total = await Order.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: orders.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { orders }
  });
});

// Request payout
const requestPayout = catchAsync(async (req, res) => {
  const { amount, paymentMethod, paymentDetails } = req.body;
  const vendor = await Vendor.findOne({ userId: req.user.id });
  const wallet = await Wallet.findOne({ userId: req.user.id });
  
  if (!wallet || wallet.balance < amount) {
    throw new AppError('Insufficient balance', 400);
  }
  
  if (amount < 10) {
    throw new AppError('Minimum payout amount is $10', 400);
  }
  
  const payout = await Payout.create({
    vendorId: vendor._id,
    amount,
    paymentMethod,
    paymentDetails,
    requestedBy: req.user.id,
    status: 'pending'
  });
  
  res.status(201).json({
    status: 'success',
    data: { payout }
  });
});

// Get payout history
const getPayouts = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  const payouts = await Payout.find({ vendorId: vendor._id })
    .sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: payouts.length,
    data: { payouts }
  });
});

module.exports = {
  getOverview,
  getProducts,
  getOrders,
  requestPayout,
  getPayouts
};
