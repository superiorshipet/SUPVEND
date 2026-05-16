const express = require('express');
const router = express.Router();
const productController = require('./product.controller.js');
const { protect } = require('../../middleware/auth.js');
const { isVendor, isAdmin } = require('../../middleware/role.js');
const { uploadMultiple } = require('../../middleware/upload.js');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Vendor routes
router.use(protect);
router.get('/vendor/products', isVendor, productController.getVendorProducts);
router.post('/', isVendor, productController.createProduct);
router.patch('/:id', isVendor, productController.updateProduct);
router.delete('/:id', isVendor, productController.deleteProduct);
router.post('/:id/images', isVendor, uploadMultiple('images', 5), productController.uploadProductImages);
router.delete('/:id/images/:imageId', isVendor, productController.deleteProductImage);

// Admin can also manage all products
router.get('/admin/all', isAdmin, (req, res) => {
  req.query.status = undefined; // Admin sees all products
  productController.getAllProducts(req, res);
});

module.exports = router;
