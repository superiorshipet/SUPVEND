const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: mongoose.Schema.Types.ObjectId,
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  productName: String,
  productImage: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: Number,
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedAt: Date,
    note: String
  }],
  deliveredAt: Date
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  couponCode: String,
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'wallet', 'mixed'],
    required: true
  },
  paymentDetails: {
    stripePaymentIntentId: String,
    walletAmount: Number,
    stripeAmount: Number
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String
  },
  billingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  notes: String,
  trackingNumber: String,
  trackingUrl: String,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Simple indexes (no problematic middleware)
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'items.vendorId': 1 });

module.exports = mongoose.model('Order', orderSchema);
