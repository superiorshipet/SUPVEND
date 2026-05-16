const express = require('express');
const router = express.Router();
const couponController = require('./coupon.controller.js');
const { protect } = require('../../middleware/auth.js');
const { isVendor, isAdmin } = require('../../middleware/role.js');

// Public validation
router.post('/validate', couponController.validateCoupon);

// Protected routes
router.use(protect);

// Customer can view coupons
router.get('/', couponController.getCoupons);
router.get('/:id', couponController.getCoupon);

// Vendor and Admin can create/update/delete
router.post('/', (req, res, next) => {
  if (req.user.role === 'vendor') return isVendor(req, res, next);
  if (req.user.role === 'admin') return isAdmin(req, res, next);
  next(new AppError('Access denied', 403));
}, couponController.createCoupon);

router.patch('/:id', (req, res, next) => {
  if (req.user.role === 'vendor') return isVendor(req, res, next);
  if (req.user.role === 'admin') return isAdmin(req, res, next);
  next(new AppError('Access denied', 403));
}, couponController.updateCoupon);

router.delete('/:id', (req, res, next) => {
  if (req.user.role === 'vendor') return isVendor(req, res, next);
  if (req.user.role === 'admin') return isAdmin(req, res, next);
  next(new AppError('Access denied', 403));
}, couponController.deleteCoupon);

module.exports = router;
