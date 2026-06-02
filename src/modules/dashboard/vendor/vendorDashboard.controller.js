const catchAsync = require('../../../utils/catchAsync.js');
const Vendor = require('../../vendor/vendor.model.js');
const Product = require('../../product/product.model.js');
const Order = require('../../order/order.model.js');
const { Wallet } = require('../../wallet/wallet.model.js');
const AppError = require('../../../utils/AppError.js');

const getOverview = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  // Get products count
  const totalProducts = await Product.countDocuments({ vendorId: vendor._id });

  // Get orders for this vendor
  const orders = await Order.find({ 'items.vendorId': vendor._id });
  
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.vendorId.toString() === vendor._id.toString());
    return sum + vendorItems.reduce((s, item) => s + (item.total || 0), 0);
  }, 0);

  // Get wallet balance
  const wallet = await Wallet.findOne({ userId: req.user.id });
  const availableBalance = wallet?.balance || 0;

  // Get today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRevenue = orders.reduce((sum, order) => {
    if (new Date(order.createdAt) >= today) {
      const vendorItems = order.items.filter(item => item.vendorId.toString() === vendor._id.toString());
      return sum + vendorItems.reduce((s, item) => s + (item.total || 0), 0);
    }
    return sum;
  }, 0);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalRevenue,
        todayRevenue,
        totalOrders,
        totalProducts,
        availableBalance,
      }
    }
  });
});

const getOrders = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  const { status, page = 1, limit = 20 } = req.query;
  
  let filter = { 'items.vendorId': vendor._id };
  if (status) filter['items.status'] = status;

  const orders = await Order.find(filter)
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate('userId', 'name email');

  // Filter items to only show vendor's items
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
    orders
  });
});

const getProducts = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }

  const products = await Product.find({ vendorId: vendor._id })
    .populate('categoryId', 'name')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: products.length,
    products
  });
});

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

  const Payout = require('../../payout/payout.model.js');
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

const getPayouts = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  const Payout = require('../../payout/payout.model.js');
  const payouts = await Payout.find({ vendorId: vendor._id }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: payouts.length,
    payouts
  });
});

module.exports = {
  getOverview,
  getOrders,
  getProducts,
  requestPayout,
  getPayouts
};
