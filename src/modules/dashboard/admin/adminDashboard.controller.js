const catchAsync = require('../../../utils/catchAsync.js');
const User = require('../../user/user.model.js');
const Vendor = require('../../vendor/vendor.model.js');
const Product = require('../../product/product.model.js');
const Order = require('../../order/order.model.js');
const Category = require('../../category/category.model.js');
const Coupon = require('../../coupon/coupon.model.js');
const Payout = require('../../payout/payout.model.js');
const AppError = require('../../../utils/AppError.js');
const mongoose = require('mongoose');

// Platform overview
const getOverview = catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const newUsersToday = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
  });
  
  const totalVendors = await Vendor.countDocuments();
  const pendingVendors = await Vendor.countDocuments({ isApproved: 'pending' });
  const activeVendors = await Vendor.countDocuments({ isApproved: 'approved' });
  
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ status: 'active' });
  
  const totalOrders = await Order.countDocuments();
  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
  });
  
  const revenue = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  
  const monthRevenue = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
      }
    },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      users: { total: totalUsers, newToday: newUsersToday },
      vendors: { total: totalVendors, pending: pendingVendors, active: activeVendors },
      products: { total: totalProducts, active: activeProducts },
      orders: { total: totalOrders, today: todayOrders },
      revenue: { total: revenue[0]?.total || 0, monthly: monthRevenue[0]?.total || 0 }
    }
  });
});

// Get all users
const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  
  let filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  const users = await User.find(filter)
    .select('-password')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  
  const total = await User.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { users }
  });
});

// Ban/unban user
const toggleUserBan = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  user.isActive = !user.isActive;
  await user.save();
  
  res.status(200).json({
    status: 'success',
    message: `User ${user.isActive ? 'activated' : 'banned'} successfully`,
    data: { user }
  });
});

// Get all vendors
const getVendors = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, approvalStatus } = req.query;
  
  let filter = {};
  if (approvalStatus) filter.isApproved = approvalStatus;
  
  const vendors = await Vendor.find(filter)
    .populate('userId', 'name email')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  
  const total = await Vendor.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: vendors.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { vendors }
  });
});

// Approve/reject vendor
const updateVendorApproval = catchAsync(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const vendor = await Vendor.findById(req.params.id);
  
  if (!vendor) {
    throw new AppError('Vendor not found', 404);
  }
  
  vendor.isApproved = status;
  if (status === 'rejected') vendor.rejectionReason = rejectionReason;
  await vendor.save();
  
  res.status(200).json({
    status: 'success',
    message: `Vendor ${status}`,
    data: { vendor }
  });
});

// Get all products (admin)
const getAllProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  
  let filter = {};
  if (status) filter.status = status;
  
  const products = await Product.find(filter)
    .populate('vendorId', 'storeName')
    .populate('categoryId', 'name')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  
  const total = await Product.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { products }
  });
});

// Delete product (admin)
const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get pending payouts
const getPendingPayouts = catchAsync(async (req, res) => {
  const payouts = await Payout.find({ status: 'pending' })
    .populate('vendorId', 'storeName userId')
    .sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: payouts.length,
    data: { payouts }
  });
});

// Approve payout
const approvePayout = catchAsync(async (req, res) => {
  const payout = await Payout.findById(req.params.id);
  if (!payout) {
    throw new AppError('Payout not found', 404);
  }
  
  payout.status = 'completed';
  payout.processedAt = new Date();
  payout.completedAt = new Date();
  payout.processedBy = req.user.id;
  await payout.save();
  
  // Deduct from vendor's wallet
  const vendor = await Vendor.findById(payout.vendorId);
  const wallet = await Wallet.findOne({ userId: vendor.userId });
  if (wallet) {
    wallet.balance -= payout.amount;
    wallet.totalWithdrawn += payout.amount;
    await wallet.save();
    
    await WalletTransaction.create({
      walletId: wallet._id,
      userId: vendor.userId,
      type: 'payout',
      amount: payout.amount,
      balanceBefore: wallet.balance + payout.amount,
      balanceAfter: wallet.balance,
      description: `Payout #${payout._id}`,
      reference: payout._id,
      referenceModel: 'Payout'
    });
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Payout approved',
    data: { payout }
  });
});

// Get sales report
const getSalesReport = catchAsync(async (req, res) => {
  const { startDate, endDate, format = 'json' } = req.query;
  
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();
  
  const report = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$total' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  const totalRevenue = report.reduce((sum, day) => sum + day.totalSales, 0);
  const totalOrders = report.reduce((sum, day) => sum + day.orderCount, 0);
  
  res.status(200).json({
    status: 'success',
    data: {
      period: { start, end },
      summary: { totalRevenue, totalOrders, averageOrderValue: totalRevenue / totalOrders || 0 },
      dailyReport: report
    }
  });
});

module.exports = {
  getOverview,
  getUsers,
  toggleUserBan,
  getVendors,
  updateVendorApproval,
  getAllProducts,
  deleteProduct,
  getPendingPayouts,
  approvePayout,
  getSalesReport
};
