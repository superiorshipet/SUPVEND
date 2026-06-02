const express = require('express');
const router = express.Router();
const productController = require('./product.controller.js');
const { protect } = require('../../middleware/auth.js');
const { isVendor } = require('../../middleware/role.js');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes
router.use(protect);
router.get('/vendor/products', isVendor, productController.getVendorProducts);
router.post('/', isVendor, productController.createProduct);
router.patch('/:id', isVendor, productController.updateProduct);
router.delete('/:id', isVendor, productController.deleteProduct);

module.exports = router;
