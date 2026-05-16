const catchAsync = require('../../utils/catchAsync.js');
const auctionService = require('./auction.service.js');
const Vendor = require('../vendor/vendor.model.js');
const AppError = require('../../utils/AppError.js');

// Get all active auctions
const getActiveAuctions = catchAsync(async (req, res) => {
  const auctions = await auctionService.getActiveAuctions();
  
  res.status(200).json({
    status: 'success',
    results: auctions.length,
    data: { auctions }
  });
});

// Get auction details
const getAuction = catchAsync(async (req, res) => {
  const { auction, bids, timeLeft } = await auctionService.getAuctionDetails(req.params.id);
  
  res.status(200).json({
    status: 'success',
    data: { auction, bids, timeLeft }
  });
});

// Create auction (vendor only)
const createAuction = catchAsync(async (req, res) => {
  const auction = await auctionService.createAuction(req.body, req.user.id);
  
  res.status(201).json({
    status: 'success',
    message: 'Auction created successfully',
    data: { auction }
  });
});

// Place bid
const placeBid = catchAsync(async (req, res) => {
  const { bidAmount, isAutoBid, maxAutoBid } = req.body;
  
  const result = await auctionService.placeBid(
    req.params.id,
    req.user.id,
    bidAmount,
    isAutoBid,
    maxAutoBid
  );
  
  res.status(200).json({
    status: 'success',
    message: 'Bid placed successfully',
    data: result
  });
});

// Get vendor auctions
const getVendorAuctions = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    throw new AppError('Vendor not found', 404);
  }
  
  const auctions = await auctionService.getVendorAuctions(vendor._id);
  
  res.status(200).json({
    status: 'success',
    results: auctions.length,
    data: { auctions }
  });
});

// Cancel auction (vendor only, before start)
const cancelAuction = catchAsync(async (req, res) => {
  const auction = await Auction.findById(req.params.id);
  
  if (!auction) {
    throw new AppError('Auction not found', 404);
  }
  
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (auction.vendorId.toString() !== vendor?._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  
  if (auction.status !== 'upcoming') {
    throw new AppError('Can only cancel upcoming auctions', 400);
  }
  
  auction.status = 'cancelled';
  await auction.save();
  
  // Revert product
  const product = await Product.findById(auction.productId);
  product.productType = 'normal';
  product.auctionId = null;
  await product.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Auction cancelled'
  });
});

module.exports = {
  getActiveAuctions,
  getAuction,
  createAuction,
  placeBid,
  getVendorAuctions,
  cancelAuction
};
