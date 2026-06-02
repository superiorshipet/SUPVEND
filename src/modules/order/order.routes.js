const express = require('express');
const router = express.Router();
const orderController = require('./order.controller.js');
const { protect } = require('../../middleware/auth.js');
const { isVendor, isAdmin } = require('../../middleware/role.js');

// All order routes are protected
router.use(protect);

// Admin routes
router.get('/admin/all', isAdmin, orderController.getAllOrders);
router.patch('/admin/orders/:orderId/status', isAdmin, orderController.updateOrderItemStatus);

// Vendor routes
router.get('/vendor/orders', isVendor, orderController.getVendorOrders);
router.patch('/vendor/orders/:orderId/status', isVendor, orderController.updateOrderItemStatus);

// Customer routes
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
