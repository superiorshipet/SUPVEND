const { flashSaleQueue } = require('../../config/bull.js');
const flashSaleService = require('./flashSale.service.js');

// Start flash sale job
flashSaleQueue.process('start-flash-sale', async (job) => {
  const { saleId } = job.data;
  console.log(`Starting flash sale: ${saleId}`);
  
  try {
    await flashSaleService.activateFlashSale(saleId);
    console.log(`Flash sale ${saleId} started successfully`);
  } catch (error) {
    console.error(`Error starting flash sale ${saleId}:`, error);
    throw error;
  }
});

// End flash sale job
flashSaleQueue.process('end-flash-sale', async (job) => {
  const { saleId } = job.data;
  console.log(`Ending flash sale: ${saleId}`);
  
  try {
    await flashSaleService.endFlashSale(saleId);
    console.log(`Flash sale ${saleId} ended successfully`);
  } catch (error) {
    console.error(`Error ending flash sale ${saleId}:`, error);
    throw error;
  }
});

// Handle job failures
flashSaleQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed for flash sale ${job.data.saleId}:`, err);
});

flashSaleQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed for flash sale ${job.data.saleId}`);
});

module.exports = { flashSaleQueue };
