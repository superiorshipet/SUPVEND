const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: Number,
  discountPercentage: Number,
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  soldQuantity: {
    type: Number,
    default: 0
  },
  maxPerCustomer: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'ended', 'cancelled'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

flashSaleSchema.index({ productId: 1 });
flashSaleSchema.index({ vendorId: 1 });
flashSaleSchema.index({ status: 1, startTime: 1, endTime: 1 });
flashSaleSchema.index({ endTime: 1 });

module.exports = mongoose.model('FlashSale', flashSaleSchema);
