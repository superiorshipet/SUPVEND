const AppError = require('../../utils/AppError.js');

const validateProductData = (req, res, next) => {
  const { name, price, stock, categoryId } = req.body;
  
  if (!name || name.length < 3) {
    return next(new AppError('Product name must be at least 3 characters', 400));
  }
  
  if (!price || price <= 0) {
    return next(new AppError('Price must be greater than 0', 400));
  }
  
  if (stock === undefined || stock < 0) {
    return next(new AppError('Stock cannot be negative', 400));
  }
  
  if (!categoryId) {
    return next(new AppError('Category is required', 400));
  }
  
  next();
};

const checkProductOwnership = async (req, res, next) => {
  const Product = require('./product.model.js');
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  if (req.user.role !== 'admin' && product.vendorId.toString() !== req.vendorId) {
    return next(new AppError('You do not own this product', 403));
  }
  
  req.product = product;
  next();
};

module.exports = {
  validateProductData,
  checkProductOwnership
};
