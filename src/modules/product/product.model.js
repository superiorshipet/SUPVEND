const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  images: [{
    url: String,
    publicId: String,
    isMain: { type: Boolean, default: false }
  }],
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  costPerItem: Number,
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  soldCount: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  productType: {
    type: String,
    enum: ['normal', 'flash_sale', 'auction'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock'],
    default: 'draft'
  },
  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  tags: [String],
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  flashSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlashSale'
  },
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ vendorId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ productType: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isApproved: 1 });

productSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'productId'
});

module.exports = mongoose.model('Product', productSchema);
