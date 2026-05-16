const FlashSale = require('./flashSale.model.js');
const Product = require('../product/product.model.js');
const Vendor = require('../vendor/vendor.model.js');
const redisHelpers = require('../../utils/redisHelpers.js');
const { flashSaleQueue } = require('../../config/bull.js');
const AppError = require('../../utils/AppError.js');

class FlashSaleService {
  async createFlashSale(data, userId) {
    const vendor = await Vendor.findOne({ userId });
    if (!vendor && data.vendorId) {
      throw new AppError('Vendor not found', 404);
    }
    
    const product = await Product.findById(data.productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    // Check if product belongs to vendor
    if (product.vendorId.toString() !== (data.vendorId || vendor._id).toString()) {
      throw new AppError('Product does not belong to you', 403);
    }
    
    // Calculate discount percentage
    const discountPercentage = ((product.price - data.discountedPrice) / product.price) * 100;
    
    const flashSale = await FlashSale.create({
      ...data,
      vendorId: data.vendorId || vendor._id,
      originalPrice: product.price,
      discountPercentage: Math.round(discountPercentage)
    });
    
    // Schedule start and end jobs
    const startDelay = new Date(flashSale.startTime) - Date.now();
    const endDelay = new Date(flashSale.endTime) - Date.now();
    
    if (startDelay > 0) {
      await flashSaleQueue.add(
        'start-flash-sale',
        { saleId: flashSale._id },
        { delay: startDelay }
      );
    } else {
      await this.activateFlashSale(flashSale._id);
    }
    
    await flashSaleQueue.add(
      'end-flash-sale',
      { saleId: flashSale._id },
      { delay: Math.max(0, endDelay) }
    );
    
    return flashSale;
  }
  
  async activateFlashSale(saleId) {
    const flashSale = await FlashSale.findById(saleId);
    if (!flashSale || flashSale.status !== 'upcoming') {
      return;
    }
    
    // Update status
    flashSale.status = 'active';
    await flashSale.save();
    
    // Update product
    const product = await Product.findById(flashSale.productId);
    product.productType = 'flash_sale';
    product.flashSaleId = flashSale._id;
    product.price = flashSale.discountedPrice;
    await product.save();
    
    // Store in Redis for fast access
    await redisHelpers.setFlashSale(saleId, {
      productId: flashSale.productId.toString(),
      discountedPrice: flashSale.discountedPrice,
      availableQuantity: flashSale.availableQuantity,
      endTime: flashSale.endTime.toISOString()
    });
    
    // Set stock in Redis
    const stockKey = `flash_sale:${saleId}:stock`;
    await redisHelpers.acquireLock(`stock:${saleId}`);
    await redisClient.set(stockKey, flashSale.availableQuantity);
    await redisHelpers.releaseLock(`stock:${saleId}`);
    
    // Set countdown
    await redisHelpers.setCountdown(saleId, flashSale.endTime);
    
    // Notify users (optional)
    // await this.notifyUsers(flashSale);
    
    return flashSale;
  }
  
  async endFlashSale(saleId) {
    const flashSale = await FlashSale.findById(saleId);
    if (!flashSale || flashSale.status !== 'active') {
      return;
    }
    
    // Update status
    flashSale.status = 'ended';
    await flashSale.save();
    
    // Revert product
    const product = await Product.findById(flashSale.productId);
    if (product.flashSaleId?.toString() === saleId) {
      product.productType = 'normal';
      product.flashSaleId = null;
      product.price = flashSale.originalPrice;
      await product.save();
    }
    
    // Clean up Redis
    const stockKey = `flash_sale:${saleId}:stock`;
    const dataKey = `flash_sale:${saleId}:data`;
    const countdownKey = `flash_sale:${saleId}:countdown`;
    
    await redisClient.del(stockKey, dataKey, countdownKey);
    
    return flashSale;
  }
  
  async purchaseFlashSale(saleId, userId, quantity = 1) {
    const lock = await redisHelpers.acquireLock(`purchase:${saleId}:${userId}`);
    if (!lock) {
      throw new AppError('Please try again', 429);
    }
    
    try {
      // Check if sale is active
      const flashSale = await FlashSale.findOne({
        _id: saleId,
        status: 'active',
        endTime: { $gt: new Date() }
      });
      
      if (!flashSale) {
        throw new AppError('Flash sale is not active', 400);
      }
      
      // Atomic stock check in Redis
      const remainingStock = await redisHelpers.decrementFlashSaleStock(saleId, quantity);
      
      if (remainingStock === null || remainingStock < 0) {
        throw new AppError('Out of stock', 400);
      }
      
      // Check per-customer limit
      // This would require tracking purchases in DB
      
      // Update MongoDB stock
      flashSale.availableQuantity -= quantity;
      flashSale.soldQuantity += quantity;
      
      if (flashSale.availableQuantity === 0) {
        await this.endFlashSale(saleId);
      } else {
        await flashSale.save();
      }
      
      return {
        success: true,
        remainingStock: remainingStock,
        sale: flashSale
      };
    } finally {
      await redisHelpers.releaseLock(`purchase:${saleId}:${userId}`);
    }
  }
  
  async getActiveFlashSales() {
    const activeSales = await FlashSale.find({
      status: 'active',
      endTime: { $gt: new Date() }
    }).populate('productId', 'name images description');
    
    // Add remaining time from Redis
    const salesWithTime = await Promise.all(activeSales.map(async (sale) => {
      const remainingTime = await redisHelpers.getRemainingTime(sale._id);
      const stock = await redisHelpers.getFlashSaleStock(sale._id);
      
      return {
        ...sale.toObject(),
        remainingSeconds: remainingTime,
        availableStock: stock
      };
    }));
    
    return salesWithTime;
  }
  
  async getVendorFlashSales(vendorId) {
    const sales = await FlashSale.find({ vendorId })
      .populate('productId', 'name images price')
      .sort('-createdAt');
    
    return sales;
  }
}

module.exports = new FlashSaleService();
