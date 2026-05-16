const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');

// Load environment variables
dotenv.config({ path: './.env' });

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const app = require('./src/app');
const { initializeSocket } = require('./src/config/socket.js');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Database connection
const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/supvend';

mongoose.connect(DB)
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection error:', err));

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Socket.io ready for real-time connections`);
});

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
