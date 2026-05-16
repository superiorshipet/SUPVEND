const catchAsync = require('../../utils/catchAsync.js');
const Coupon = require('./coupon.model.js');
const Vendor = require('../vendor/vendor.model.js');
const AppError = require('../../utils/AppError.js');

// Get all coupons (admin/vendor)
const getCoupons = catchAsync(async (req, res) => {
  let filter = { isActive: true };
  
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    filter.createdBy = 'vendor';
    filter.vendorId = vendor._id;
  } else if (req.user.role === 'admin') {
    // Admin sees all
  } else {
    // Customers see only active public coupons
    filter.createdBy = 'admin';
    filter.endDate = { $gte: new Date() };
  }
  
  const coupons = await Coupon.find(filter)
    .sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: coupons.length,
    data: { coupons }
  });
});

// Get single coupon
const getCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  
  // Check permission
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (coupon.vendorId?.toString() !== vendor._id.toString()) {
      throw new AppError('Access denied', 403);
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: { coupon }
  });
});

// Create coupon
const createCoupon = catchAsync(async (req, res) => {
  let couponData = req.body;
  
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor || vendor.isApproved !== 'approved') {
      throw new AppError('Vendor not approved', 403);
    }
    couponData.createdBy = 'vendor';
    couponData.vendorId = vendor._id;
  } else {
    couponData.createdBy = 'admin';
  }
  
  couponData.code = couponData.code.toUpperCase();
  
  const coupon = await Coupon.create(couponData);
  
  res.status(201).json({
    status: 'success',
    data: { coupon }
  });
});

// Update coupon
const updateCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  
  // Check permission
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (coupon.vendorId?.toString() !== vendor._id.toString()) {
      throw new AppError('Access denied', 403);
    }
  }
  
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: { coupon: updatedCoupon }
  });
});

// Delete coupon
const deleteCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }
  
  // Check permission
  if (req.user.role === 'vendor') {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (coupon.vendorId?.toString() !== vendor._id.toString()) {
      throw new AppError('Access denied', 403);
    }
  }
  
  await coupon.remove();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Validate coupon (public)
const validateCoupon = catchAsync(async (req, res) => {
  const { code, subtotal } = req.body;
  
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
  
  if (!coupon) {
    throw new AppError('Invalid or expired coupon', 400);
  }
  
  if (coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('Coupon usage limit exceeded', 400);
  }
  
  if (subtotal < coupon.minOrderValue) {
    throw new AppError(`Minimum order value of $${coupon.minOrderValue} required`, 400);
  }
  
  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.value;
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      valid: true,
      coupon,
      discountAmount,
      finalTotal: subtotal - discountAmount
    }
  });
});

module.exports = {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon
};
