const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Store name must be at least 3 characters'],
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  storeDescription: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  storeLogo: String,
  storeBanner: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contactPhone: {
    type: String,
    required: true
  },
  isApproved: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
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
  totalSales: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date
  }],
  bankAccount: {
    bankName: String,
    accountHolder: String,
    accountNumber: String,
    routingNumber: String,
    isVerified: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

vendorSchema.index({ storeName: 1 });
vendorSchema.index({ userId: 1 });
vendorSchema.index({ isApproved: 1 });
vendorSchema.index({ rating: -1 });
vendorSchema.index({ totalSales: -1 });

module.exports = mongoose.model('Vendor', vendorSchema);
