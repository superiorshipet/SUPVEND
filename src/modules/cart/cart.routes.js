const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller.js');
const { protect } = require('../../middleware/auth.js');
const catchAsync = require('../../utils/catchAsync.js');

// All cart routes are protected
router.use(protect);

router.get('/', catchAsync(cartController.getCart));
router.post('/add', catchAsync(cartController.addToCart));
router.patch('/items/:itemId', catchAsync(cartController.updateCartItem));
router.delete('/items/:itemId', catchAsync(cartController.removeCartItem));
router.post('/coupon', catchAsync(cartController.applyCoupon));
router.delete('/coupon', catchAsync(cartController.removeCoupon));
router.delete('/clear', catchAsync(cartController.clearCart));

module.exports = router;
