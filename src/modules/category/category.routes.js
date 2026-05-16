const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller.js');
const { protect } = require('../../middleware/auth.js');
const { isAdmin } = require('../../middleware/role.js');
const { uploadSingle } = require('../../middleware/upload.js');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);

// Admin only routes
router.use(protect, isAdmin);
router.post('/', uploadSingle('icon'), categoryController.createCategory);
router.patch('/:id', uploadSingle('icon'), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
