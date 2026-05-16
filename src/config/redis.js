// const Redis = require('ioredis');

// const redisClient = new Redis({
//   host: process.env.REDIS_HOST || 'localhost',
//   port: process.env.REDIS_PORT || 6379,
//   password: process.env.REDIS_PASSWORD,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   }
// });

// redisClient.on('connect', () => {
//   console.log('✅ Redis connected successfully');
// });

// redisClient.on('error', (err) => {
//   console.error('❌ Redis connection error:', err);
// });

// module.exports = redisClient;


const Redis = require('ioredis');

const redisEnabled = process.env.ENABLE_REDIS === 'true';

let redisClient = null;

if (redisEnabled) {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,

    retryStrategy: (times) => {
      if (times > 5) {
        console.error('❌ Redis retry limit reached');
        return null; // stop retrying
      }

      return Math.min(times * 500, 3000);
    }
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
  });
} else {
  console.log('⚠️ Redis is disabled');
}

module.exports = redisClient;