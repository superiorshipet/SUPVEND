const catchAsync = require('../../utils/catchAsync.js');
const Category = require('./category.model.js');
const AppError = require('../../utils/AppError.js');
const cloudinary = require('../../config/cloudinary.js');

// Create category (Admin only)
const createCategory = catchAsync(async (req, res) => {
  const { name, description, parentCategory } = req.body;
  
  // Upload icon to Cloudinary
  let iconUrl = null;
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'categories',
      width: 200,
      height: 200,
      crop: 'fill'
    });
    iconUrl = result.secure_url;
  }
  
  const category = await Category.create({
    name,
    description,
    icon: iconUrl,
    parentCategory: parentCategory || null,
    level: parentCategory ? 1 : 0
  });
  
  res.status(201).json({
    status: 'success',
    data: { category }
  });
});

// Get all categories
const getAllCategories = catchAsync(async (req, res) => {
  const { parentId, isActive } = req.query;
  
  let filter = {};
  if (parentId === 'null') filter.parentCategory = null;
  else if (parentId) filter.parentCategory = parentId;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  const categories = await Category.find(filter)
    .sort('order')
    .populate('parentCategory', 'name');
  
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories }
  });
});

// Get single category
const getCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parentCategory');
  
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

// Update category
const updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  
  // Upload new icon if provided
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'categories',
      width: 200,
      height: 200,
      crop: 'fill'
    });
    req.body.icon = result.secure_url;
  }
  
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: { category: updatedCategory }
  });
});

// Delete category
const deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  
  // Check if category has products
  const Product = require('../product/product.model.js');
  const productCount = await Product.countDocuments({ categoryId: category._id });
  
  if (productCount > 0) {
    throw new AppError(`Cannot delete category with ${productCount} products. Reassign or delete products first.`, 400);
  }
  
  await category.remove();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory
};
