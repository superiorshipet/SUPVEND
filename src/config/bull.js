const Queue = require('bull');
const redisClient = require('./redis.js');

const createQueue = (name, options = {}) => {
  return new Queue(name, {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: 100,
      removeOnFail: 500
    },
    ...options
  });
};

// Queues
const flashSaleQueue = createQueue('flash-sale');
const auctionQueue = createQueue('auction');
const emailQueue = createQueue('email');

module.exports = {
  flashSaleQueue,
  auctionQueue,
  emailQueue
};
