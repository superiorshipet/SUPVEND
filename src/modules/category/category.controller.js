const catchAsync = require('../../utils/catchAsync.js');
const Category = require('./category.model.js');
const AppError = require('../../utils/AppError.js');

// Helper function to generate slug
const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Create category (Admin only)
const createCategory = catchAsync(async (req, res) => {
  const { name, description, parentCategory } = req.body;
  
  // Auto-generate slug
  const slug = generateSlug(name);
  
  // Use default icon if none provided
  const icon = req.body.icon || 'https://cdn-icons-png.flaticon.com/512/1042/1042392.png';
  
  const category = await Category.create({
    name,
    slug,
    description: description || '',
    icon,
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
  
  // Update slug if name changes
  if (req.body.name) {
    req.body.slug = generateSlug(req.body.name);
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
  
  await category.deleteOne();
  
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
