const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });
  
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    socket.on('join-auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      console.log(`User ${socket.userId} joined auction ${auctionId}`);
    });
    
    socket.on('leave-auction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
      console.log(`User ${socket.userId} left auction ${auctionId}`);
    });
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
  
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
