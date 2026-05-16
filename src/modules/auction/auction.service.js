const { Auction, AuctionBid } = require('./auction.model.js');
const Product = require('../product/product.model.js');
const Vendor = require('../vendor/vendor.model.js');
const { Wallet, WalletTransaction } = require('../wallet/wallet.model.js');
const Notification = require('../notification/notification.model.js');
const redisHelpers = require('../../utils/redisHelpers.js');
const { auctionQueue } = require('../../config/bull.js');
const { getIO } = require('../../config/socket.js');
const AppError = require('../../utils/AppError.js');
const mongoose = require('mongoose');

class AuctionService {
  async createAuction(data, userId) {
    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }
    
    const product = await Product.findById(data.productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    if (product.vendorId.toString() !== vendor._id.toString()) {
      throw new AppError('Product does not belong to you', 403);
    }
    
    // Update product type
    product.productType = 'auction';
    await product.save();
    
    const auction = await Auction.create({
      ...data,
      vendorId: vendor._id,
      currentPrice: data.startingPrice
    });
    
    // Schedule end job
    const endDelay = new Date(auction.endTime) - Date.now();
    await auctionQueue.add(
      'end-auction',
      { auctionId: auction._id },
      { delay: Math.max(0, endDelay) }
    );
    
    // Store in Redis
    await this.cacheAuction(auction);
    
    return auction;
  }
  
  async cacheAuction(auction) {
    await redisHelpers.setCache(`auction:${auction._id}`, {
      currentPrice: auction.currentPrice,
      endTime: auction.endTime.toISOString(),
      totalBids: auction.totalBids,
      status: auction.status
    }, 3600);
  }
  
  async placeBid(auctionId, userId, bidAmount, isAutoBid = false, maxAutoBid = null) {
    const lock = await redisHelpers.acquireLock(`bid:${auctionId}`, 5);
    if (!lock) {
      throw new AppError('Please try again', 429);
    }
    
    try {
      const auction = await Auction.findById(auctionId);
      if (!auction || auction.status !== 'active') {
        throw new AppError('Auction is not active', 400);
      }
      
      if (new Date(auction.endTime) <= new Date()) {
        throw new AppError('Auction has ended', 400);
      }
      
      // Check minimum bid
      const minBid = auction.currentPrice + auction.minBidIncrement;
      if (bidAmount < minBid) {
        throw new AppError(`Minimum bid is ${minBid}`, 400);
      }
      
      // Check wallet balance
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || wallet.balance < bidAmount) {
        throw new AppError('Insufficient wallet balance', 400);
      }
      
      // Reserve bid amount
      wallet.reservedBalance += bidAmount;
      wallet.balance -= bidAmount;
      await wallet.save();
      
      // Create bid record
      const bid = await AuctionBid.create({
        auctionId,
        userId,
        amount: bidAmount,
        isAutoBid,
        maxAutoBid: maxAutoBid || bidAmount
      });
      
      // Update previous winner's reserved amount
      if (auction.winnerId) {
        const previousWinnerWallet = await Wallet.findOne({ userId: auction.winnerId });
        if (previousWinnerWallet) {
          previousWinnerWallet.reservedBalance -= auction.winningBid;
          previousWinnerWallet.balance += auction.winningBid;
          await previousWinnerWallet.save();
          
          // Update outbid bid status
          await AuctionBid.findOneAndUpdate(
            { auctionId, userId: auction.winnerId, isWinner: true },
            { status: 'outbid', isWinner: false }
          );
          
          // Send outbid notification
          await Notification.create({
            userId: auction.winnerId,
            type: 'auction_outbid',
            title: 'You\'ve been outbid!',
            message: `Someone placed a higher bid of $${bidAmount} on your auction item`,
            data: { auctionId, newBid: bidAmount }
          });
          
          // Emit socket event
          const io = getIO();
          io.to(`auction:${auctionId}`).emit('outbid', {
            userId: auction.winnerId,
            previousBid: auction.winningBid,
            newBid: bidAmount
          });
        }
      }
      
      // Update auction
      const oldPrice = auction.currentPrice;
      auction.currentPrice = bidAmount;
      auction.winnerId = userId;
      auction.winningBid = bidAmount;
      auction.totalBids += 1;
      
      // Anti-snipe: extend auction if bid in last 30 seconds
      const timeLeft = new Date(auction.endTime) - new Date();
      if (auction.antiSnipeEnabled && timeLeft <= auction.antiSnipeExtension * 1000) {
        const newEndTime = new Date(auction.endTime.getTime() + auction.antiSnipeExtension * 1000);
        auction.endTime = newEndTime;
        auction.extendedBy += auction.antiSnipeExtension;
        
        // Reschedule end job
        await auctionQueue.add(
          'end-auction',
          { auctionId: auction._id },
          { delay: auction.antiSnipeExtension * 1000 }
        );
        
        // Emit extension event
        const io = getIO();
        io.to(`auction:${auctionId}`).emit('auction-extended', {
          newEndTime: newEndTime,
          extendedBy: auction.antiSnipeExtension
        });
      }
      
      await auction.save();
      
      // Cache updated auction
      await this.cacheAuction(auction);
      
      // Emit new bid event
      const io = getIO();
      io.to(`auction:${auctionId}`).emit('new-bid', {
        userId,
        amount: bidAmount,
        totalBids: auction.totalBids,
        currentPrice: auction.currentPrice,
        timestamp: new Date()
      });
      
      return { auction, bid };
    } finally {
      await redisHelpers.releaseLock(`bid:${auctionId}`);
    }
  }
  
  async finalizeAuction(auctionId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const auction = await Auction.findById(auctionId);
      if (!auction || auction.status !== 'active') {
        return;
      }
      
      // Check if auction ended naturally
      if (new Date(auction.endTime) > new Date()) {
        return;
      }
      
      auction.status = 'ended';
      await auction.save({ session });
      
      // Update product
      const product = await Product.findById(auction.productId);
      product.productType = 'normal';
      product.auctionId = null;
      
      if (auction.winnerId) {
        // Deduct final amount from winner's wallet
        const winnerWallet = await Wallet.findOne({ userId: auction.winnerId }).session(session);
        if (winnerWallet && winnerWallet.reservedBalance >= auction.winningBid) {
          winnerWallet.reservedBalance -= auction.winningBid;
          await winnerWallet.save({ session });
          
          // Create transaction record
          await WalletTransaction.create([{
            walletId: winnerWallet._id,
            userId: auction.winnerId,
            type: 'payment',
            amount: auction.winningBid,
            balanceBefore: winnerWallet.balance + auction.winningBid,
            balanceAfter: winnerWallet.balance,
            description: `Winning bid for auction ${auctionId}`,
            reference: auctionId,
            referenceModel: 'Auction'
          }], { session });
          
          // Create order for winner
          const Order = require('../order/order.model.js');
          const order = await Order.create([{
            userId: auction.winnerId,
            items: [{
              productId: auction.productId,
              vendorId: auction.vendorId,
              productName: product.name,
              productImage: product.images[0]?.url,
              quantity: 1,
              price: auction.winningBid,
              total: auction.winningBid,
              status: 'pending'
            }],
            subtotal: auction.winningBid,
            total: auction.winningBid,
            paymentMethod: 'wallet',
            paymentStatus: 'paid',
            shippingAddress: {} // Will be filled by winner
          }], { session });
          
          // Notify winner
          await Notification.create([{
            userId: auction.winnerId,
            type: 'auction_won',
            title: 'Congratulations! You won the auction! 🎉',
            message: `You won "${product.name}" with a bid of $${auction.winningBid}`,
            data: { auctionId, productId: auction.productId, orderId: order[0]._id }
          }], { session });
          
          product.soldCount += 1;
        }
      } else {
        // No bids, auction ended without winner
        await Notification.create([{
          userId: (await Vendor.findById(auction.vendorId)).userId,
          type: 'auction_lost',
          title: 'Auction ended without bids',
          message: `Your auction for "${product.name}" ended with no bids`,
          data: { auctionId, productId: auction.productId }
        }], { session });
      }
      
      await product.save({ session });
      
      // Update bid statuses
      await AuctionBid.updateMany(
        { auctionId, isWinner: true },
        { isWinner: false, status: 'lost' },
        { session }
      );
      
      if (auction.winnerId) {
        await AuctionBid.findOneAndUpdate(
          { auctionId, userId: auction.winnerId },
          { isWinner: true, status: 'winning' },
          { session }
        );
      }
      
      await session.commitTransaction();
      
      // Emit end event
      const io = getIO();
      io.to(`auction:${auctionId}`).emit('auction-ended', {
        winnerId: auction.winnerId,
        winningBid: auction.winningBid,
        message: auction.winnerId ? 'Auction ended with a winner!' : 'Auction ended with no bids'
      });
      
      // Clean up Redis
      await redisClient.del(`auction:${auctionId}`);
      
      return auction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  async getActiveAuctions() {
    const auctions = await Auction.find({
      status: 'active',
      endTime: { $gt: new Date() }
    }).populate('productId', 'name images description')
      .populate('vendorId', 'storeName')
      .sort('endTime');
    
    // Add time remaining from Redis
    const auctionsWithTime = await Promise.all(auctions.map(async (auction) => {
      const cached = await redisHelpers.getCache(`auction:${auction._id}`);
      const timeLeft = Math.max(0, Math.floor((new Date(auction.endTime) - Date.now()) / 1000));
      
      return {
        ...auction.toObject(),
        remainingSeconds: timeLeft,
        ...cached
      };
    }));
    
    return auctionsWithTime;
  }
  
  async getAuctionDetails(auctionId) {
    const auction = await Auction.findById(auctionId)
      .populate('productId', 'name description images')
      .populate('vendorId', 'storeName storeLogo');
    
    if (!auction) {
      throw new AppError('Auction not found', 404);
    }
    
    const bids = await AuctionBid.find({ auctionId })
      .sort('-amount')
      .limit(50)
      .populate('userId', 'name');
    
    const timeLeft = Math.max(0, Math.floor((new Date(auction.endTime) - Date.now()) / 1000));
    
    return { auction, bids, timeLeft };
  }
  
  async getVendorAuctions(vendorId) {
    const auctions = await Auction.find({ vendorId })
      .populate('productId', 'name images')
      .sort('-createdAt');
    
    return auctions;
  }
}

module.exports = new AuctionService();
