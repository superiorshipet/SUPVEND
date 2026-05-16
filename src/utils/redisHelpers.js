const redisClient = require('../config/redis.js');

class RedisHelpers {
  // Atomic decrement for flash sale stock
  async decrementFlashSaleStock(saleId, quantity = 1) {
    const key = `flash_sale:${saleId}:stock`;
    const newStock = await redisClient.decrby(key, quantity);
    
    if (newStock < 0) {
      // Rollback if negative
      await redisClient.incrby(key, quantity);
      return null;
    }
    
    return newStock;
  }
  
  // Get remaining stock
  async getFlashSaleStock(saleId) {
    const key = `flash_sale:${saleId}:stock`;
    const stock = await redisClient.get(key);
    return stock ? parseInt(stock) : 0;
  }
  
  // Set flash sale data in Redis
  async setFlashSale(saleId, data) {
    const key = `flash_sale:${saleId}:data`;
    await redisClient.hset(key, data);
    await redisClient.expire(key, 3600); // 1 hour expiry after sale ends
  }
  
  // Get flash sale data
  async getFlashSale(saleId) {
    const key = `flash_sale:${saleId}:data`;
    return await redisClient.hgetall(key);
  }
  
  // Set countdown timer
  async setCountdown(saleId, endTime) {
    const key = `flash_sale:${saleId}:countdown`;
    const ttl = Math.max(0, Math.floor((new Date(endTime) - Date.now()) / 1000));
    await redisClient.setex(key, ttl, endTime);
    return ttl;
  }
  
  // Get remaining time
  async getRemainingTime(saleId) {
    const key = `flash_sale:${saleId}:countdown`;
    const ttl = await redisClient.ttl(key);
    return ttl > 0 ? ttl : 0;
  }
  
  // Lock for race condition prevention
  async acquireLock(resource, ttl = 5) {
    const lockKey = `lock:${resource}`;
    const acquired = await redisClient.setnx(lockKey, Date.now() + ttl * 1000);
    
    if (acquired) {
      await redisClient.expire(lockKey, ttl);
      return true;
    }
    
    return false;
  }
  
  async releaseLock(resource) {
    const lockKey = `lock:${resource}`;
    await redisClient.del(lockKey);
  }
  
  // Rate limiting for bids
  async checkRateLimit(userId, action, limit = 10, window = 60) {
    const key = `rate_limit:${action}:${userId}`;
    const current = await redisClient.incr(key);
    
    if (current === 1) {
      await redisClient.expire(key, window);
    }
    
    return current <= limit;
  }
  
  // Cache product data
  async cacheProduct(productId, data, ttl = 300) {
    const key = `product:${productId}`;
    await redisClient.setex(key, ttl, JSON.stringify(data));
  }
  
  async getCachedProduct(productId) {
    const key = `product:${productId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  // Invalidate cache
  async invalidateProduct(productId) {
    const key = `product:${productId}`;
    await redisClient.del(key);
  }
}

module.exports = new RedisHelpers();

// Cache methods
async setCache(key, data, ttl = 300) {
  await redisClient.setex(key, ttl, JSON.stringify(data));
}

async getCache(key) {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

async deleteCache(key) {
  await redisClient.del(key);
}

module.exports = {
  // ... existing exports
  setCache,
  getCache,
  deleteCache
};
