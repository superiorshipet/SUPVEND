const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller.js');
const { protect } = require('../../middleware/auth.js');

// All cart routes are protected
router.use(protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/items/:itemId', cartController.updateCartItem);
router.delete('/items/:itemId', cartController.removeCartItem);
router.post('/coupon', cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);
router.delete('/clear', cartController.clearCart);

module.exports = router;
