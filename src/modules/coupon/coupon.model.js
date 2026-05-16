const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: String,
  description: String,
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscount: Number,
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  usageLimit: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  applicableVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdBy: {
    type: String,
    enum: ['admin', 'vendor'],
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

couponSchema.index({ code: 1 });
couponSchema.index({ endDate: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ vendorId: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
