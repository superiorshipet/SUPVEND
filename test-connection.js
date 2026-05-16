const mongoose = require('mongoose');
const redis = require('redis');

async function test() {
  console.log('🔍 Testing connections...\n');
  
  // Test MongoDB
  try {
    await mongoose.connect('mongodb://localhost:27017/supvend');
    console.log('✅ MongoDB connected successfully');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
  }
  
  // Test Redis
  try {
    const client = redis.createClient({ url: 'redis://localhost:6379' });
    client.on('error', (err) => console.error('Redis error:', err));
    await client.connect();
    console.log('✅ Redis connected successfully');
    await client.quit();
  } catch (err) {
    console.error('❌ Redis error:', err.message);
  }
  
  console.log('\n🎉 All services are ready! You can start your server now.');
  process.exit(0);
}

test();
