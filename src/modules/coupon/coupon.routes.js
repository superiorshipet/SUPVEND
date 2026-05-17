const express = require('express');
const router = express.Router();
const couponController = require('./coupon.controller.js');
const { protect } = require('../../middleware/auth.js');

// Public validation (no auth needed)
router.post('/validate', couponController.validateCoupon);

// Protected routes
router.use(protect);
// ... other routes

module.exports = router;
