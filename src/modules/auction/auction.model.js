const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
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
  startingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  minBidIncrement: {
    type: Number,
    required: true,
    min: 1
  },
  reservePrice: Number,
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  extendedBy: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'ended', 'cancelled'],
    default: 'upcoming'
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winningBid: Number,
  totalBids: {
    type: Number,
    default: 0
  },
  antiSnipeEnabled: {
    type: Boolean,
    default: true
  },
  antiSnipeExtension: {
    type: Number,
    default: 30
  }
}, {
  timestamps: true
});

const auctionBidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  isAutoBid: {
    type: Boolean,
    default: false
  },
  maxAutoBid: Number,
  isWinner: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'outbid', 'winning', 'lost'],
    default: 'active'
  }
}, {
  timestamps: true
});

auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ vendorId: 1 });
auctionSchema.index({ productId: 1 });
auctionBidSchema.index({ auctionId: 1, amount: -1 });
auctionBidSchema.index({ auctionId: 1, userId: 1 });
auctionBidSchema.index({ createdAt: 1 });

module.exports = {
  Auction: mongoose.model('Auction', auctionSchema),
  AuctionBid: mongoose.model('AuctionBid', auctionBidSchema)
};
