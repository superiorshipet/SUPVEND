const catchAsync = require('../../utils/catchAsync.js');
const Coupon = require('./coupon.model.js');
const AppError = require('../../utils/AppError.js');

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

module.exports = {
  validateCoupon,
  // ... other methods
};
