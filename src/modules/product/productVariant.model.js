const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  attributes: {
    size: String,
    color: String,
    material: String,
    style: String
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [String]
}, {
  timestamps: true
});

productVariantSchema.index({ productId: 1, sku: 1 });
productVariantSchema.index({ 'attributes.size': 1, 'attributes.color': 1 });

module.exports = mongoose.model('ProductVariant', productVariantSchema);
