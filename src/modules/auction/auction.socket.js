const { getIO } = require('../../config/socket.js');
const auctionService = require('./auction.service.js');

const setupAuctionSockets = () => {
  const io = getIO();
  
  io.on('connection', (socket) => {
    // Join auction room
    socket.on('join-auction-room', async (auctionId) => {
      socket.join(`auction:${auctionId}`);
      
      // Send current auction state
      try {
        const { auction, bids, timeLeft } = await auctionService.getAuctionDetails(auctionId);
        socket.emit('auction-state', { auction, bids, timeLeft });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Leave auction room
    socket.on('leave-auction-room', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
    });
    
    // Real-time bid
    socket.on('place-bid', async (data) => {
      const { auctionId, bidAmount } = data;
      
      try {
        const result = await auctionService.placeBid(
          auctionId,
          socket.userId,
          bidAmount
        );
        
        // Broadcast to all in room
        io.to(`auction:${auctionId}`).emit('bid-update', {
          userId: socket.userId,
          amount: bidAmount,
          currentPrice: result.auction.currentPrice,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('bid-error', { message: error.message });
      }
    });
  });
};

module.exports = { setupAuctionSockets };
