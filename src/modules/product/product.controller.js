const catchAsync = require('../../utils/catchAsync.js');
const Product = require('./product.model.js');
const ProductVariant = require('./productVariant.model.js');
const Vendor = require('../vendor/vendor.model.js');
const AppError = require('../../utils/AppError.js');
const cloudinary = require('../../config/cloudinary.js');

// Get all products (public with filters)
const getAllProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    category,
    vendor,
    minPrice,
    maxPrice,
    rating,
    productType,
    status = 'active',
    search
  } = req.query;
  
  let filter = { status, isApproved: 'approved' };
  
  if (category) filter.categoryId = category;
  if (vendor) filter.vendorId = vendor;
  if (productType) filter.productType = productType;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (rating) filter.rating = { $gte: parseFloat(rating) };
  if (search) {
    filter.$text = { $search: search };
  }
  
  const products = await Product.find(filter)
    .populate('vendorId', 'storeName storeLogo rating')
    .populate('categoryId', 'name slug')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Product.countDocuments(filter);
  
  // Transform products to include full image URLs
  const transformedProducts = products.map(product => ({
    ...product.toObject(),
    images: product.images || [],
    price: product.price
  }));
  
  res.status(200).json({
    status: 'success',
    results: transformedProducts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: { products: transformedProducts }
  });
});

// Get single product
const getProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('vendorId', 'storeName storeLogo storeDescription rating totalSales')
    .populate('categoryId', 'name slug')
    .populate('variants');
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: { 
      product: {
        ...product.toObject(),
        images: product.images || []
      }
    }
  });
});

// Create product (vendor only)
const createProduct = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }
  
  if (vendor.isApproved !== 'approved') {
    throw new AppError('Your vendor account must be approved first', 403);
  }
  
  const productData = {
    ...req.body,
    vendorId: vendor._id,
    price: parseFloat(req.body.price),
    stock: parseInt(req.body.stock),
    images: req.body.images || []
  };
  
  const product = await Product.create(productData);
  
  res.status(201).json({
    status: 'success',
    data: { product }
  });
});

// Upload product images
const uploadProductImages = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (product.vendorId.toString() !== vendor._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You can only upload images for your own products', 403);
  }
  
  const images = [];
  for (const file of req.files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `products/${product._id}`,
      width: 800,
      height: 800,
      crop: 'limit'
    });
    
    images.push({
      url: result.secure_url,
      publicId: result.public_id,
      isMain: images.length === 0
    });
  }
  
  product.images.push(...images);
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: { images: product.images }
  });
});

module.exports = {
  getAllProducts,
  getVendorProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage
};
