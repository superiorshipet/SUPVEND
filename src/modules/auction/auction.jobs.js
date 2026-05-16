const { auctionQueue } = require('../../config/bull.js');
const auctionService = require('./auction.service.js');

// End auction job
auctionQueue.process('end-auction', async (job) => {
  const { auctionId } = job.data;
  console.log(`Processing auction end: ${auctionId}`);
  
  try {
    await auctionService.finalizeAuction(auctionId);
    console.log(`Auction ${auctionId} finalized successfully`);
  } catch (error) {
    console.error(`Error finalizing auction ${auctionId}:`, error);
    throw error;
  }
});

// Handle job failures
auctionQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed for auction ${job.data.auctionId}:`, err);
});

auctionQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed for auction ${job.data.auctionId}`);
});

module.exports = { auctionQueue };
