const express = require('express');
const router = express.Router();
const couponController = require('./coupon.controller.js');
const { protect } = require('../../middleware/auth.js');
const { isVendor, isAdmin } = require('../../middleware/role.js');

// Public validation (no auth needed)
router.post('/validate', couponController.validateCoupon);

// Protected routes
router.use(protect);

// Everyone can view coupons (filtered by role)
router.get('/', couponController.getAllCoupons);
router.get('/:id', couponController.getCoupon);

// Vendor and Admin can create/update/delete
router.post('/', (req, res, next) => {
  if (req.user.role === 'vendor' || req.user.role === 'admin') {
    return couponController.createCoupon(req, res, next);
  }
  next(new AppError('Access denied', 403));
});
router.patch('/:id', (req, res, next) => {
  if (req.user.role === 'vendor' || req.user.role === 'admin') {
    return couponController.updateCoupon(req, res, next);
  }
  next(new AppError('Access denied', 403));
});
router.delete('/:id', (req, res, next) => {
  if (req.user.role === 'vendor' || req.user.role === 'admin') {
    return couponController.deleteCoupon(req, res, next);
  }
  next(new AppError('Access denied', 403));
});

module.exports = router;
