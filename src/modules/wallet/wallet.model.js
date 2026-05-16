const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  reservedBalance: {
    type: Number,
    default: 0
  },
  totalDeposited: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const walletTransactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'payment', 'refund', 'bid_reserve', 'bid_release', 'payout', 'adjustment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: Number,
  balanceAfter: Number,
  reference: String,
  referenceModel: {
    type: String,
    enum: ['Order', 'Auction', 'Payout', null]
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  paymentIntentId: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

walletSchema.index({ userId: 1 });
walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ userId: 1 });
walletTransactionSchema.index({ reference: 1 });
walletTransactionSchema.index({ type: 1 });

module.exports = {
  Wallet: mongoose.model('Wallet', walletSchema),
  WalletTransaction: mongoose.model('WalletTransaction', walletTransactionSchema)
};
