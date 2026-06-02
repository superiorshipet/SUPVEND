const catchAsync = require('../../utils/catchAsync.js');
const Product = require('./product.model.js');
const Vendor = require('../vendor/vendor.model.js');
const AppError = require('../../utils/AppError.js');

// Get all products (public with filters)
const getAllProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    search
  } = req.query;
  
  let filter = { status: 'active', isApproved: 'approved' };
  
  if (category) filter.categoryId = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  
  const products = await Product.find(filter)
    .populate('vendorId', 'storeName storeLogo rating')
    .populate('categoryId', 'name slug')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Product.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: { products }
  });
});

// Get single product
const getProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('vendorId', 'storeName storeLogo storeDescription rating totalSales')
    .populate('categoryId', 'name slug');
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

// Get vendor's products (for vendor dashboard)
const getVendorProducts = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }
  
  const products = await Product.find({ vendorId: vendor._id })
    .populate('categoryId', 'name')
    .sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

// Create product (vendor only)
const createProduct = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }
  
  const product = await Product.create({
    ...req.body,
    vendorId: vendor._id,
    price: parseFloat(req.body.price),
    stock: parseInt(req.body.stock)
  });
  
  res.status(201).json({
    status: 'success',
    data: { product }
  });
});

// Update product
const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: { product: updatedProduct }
  });
});

// Delete product
const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  await product.deleteOne();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  getAllProducts,
  getVendorProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
