const catchAsync = require('../../utils/catchAsync.js');
const Coupon = require('./coupon.model.js');
const AppError = require('../../utils/AppError.js');

// Get all coupons
const getAllCoupons = catchAsync(async (req, res) => {
  let filter = {};
  
  // If vendor, only show their coupons
  if (req.user.role === 'vendor') {
    const Vendor = require('../vendor/vendor.model.js');
    const vendor = await Vendor.findOne({ userId: req.user.id });
    filter.vendorId = vendor._id;
  }
  
  const coupons = await Coupon.find(filter).sort('-createdAt');
  
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
  
  res.status(200).json({
    status: 'success',
    data: { coupon }
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
    return res.status(200).json({
      status: 'success',
      data: {
        valid: false,
        message: 'Invalid or expired coupon'
      }
    });
  }
  
  if (coupon.usedCount >= coupon.usageLimit) {
    return res.status(200).json({
      status: 'success',
      data: {
        valid: false,
        message: 'Coupon usage limit exceeded'
      }
    });
  }
  
  if (subtotal < coupon.minOrderValue) {
    return res.status(200).json({
      status: 'success',
      data: {
        valid: false,
        message: `Minimum order value of $${coupon.minOrderValue} required`
      }
    });
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

// Create coupon
const createCoupon = catchAsync(async (req, res) => {
  const couponData = {
    ...req.body,
    code: req.body.code.toUpperCase()
  };
  
  if (req.user.role === 'vendor') {
    const Vendor = require('../vendor/vendor.model.js');
    const vendor = await Vendor.findOne({ userId: req.user.id });
    couponData.createdBy = 'vendor';
    couponData.vendorId = vendor._id;
  } else {
    couponData.createdBy = 'admin';
  }
  
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
  
  await coupon.deleteOne();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getAllCoupons,
  getCoupon,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
