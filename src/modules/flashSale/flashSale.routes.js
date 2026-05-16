const express = require('express');
const router = express.Router();
const flashSaleController = require('./flashSale.controller.js');
const { protect } = require('../../middleware/auth.js');
const { isVendor, isAdmin } = require('../../middleware/role.js');

// Public routes
router.get('/active', flashSaleController.getActiveFlashSales);
router.get('/:id', flashSaleController.getFlashSale);

// Protected routes
router.use(protect);

// Vendor routes
router.get('/vendor/my-sales', isVendor, flashSaleController.getVendorFlashSales);
router.post('/', isVendor, flashSaleController.createFlashSale);
router.post('/:id/purchase', flashSaleController.purchaseFlashSale);
router.delete('/:id/cancel', isVendor, flashSaleController.cancelFlashSale);

// Admin routes
router.post('/admin', isAdmin, flashSaleController.createFlashSale);

module.exports = router;
