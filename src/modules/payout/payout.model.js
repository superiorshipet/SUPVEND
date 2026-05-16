const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe'],
    required: true
  },
  paymentDetails: {
    accountName: String,
    accountNumber: String,
    routingNumber: String,
    paypalEmail: String,
    stripeAccountId: String
  },
  transactionId: String,
  processedAt: Date,
  completedAt: Date,
  rejectionReason: String,
  notes: String,
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

payoutSchema.index({ vendorId: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });
payoutSchema.index({ status: 1 });

module.exports = mongoose.model('Payout', payoutSchema);
