const catchAsync = require('../../utils/catchAsync.js');
const Notification = require('./notification.model.js');
const { getIO } = require('../../config/socket.js');

// Get user notifications
const getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  
  let filter = { userId: req.user.id };
  if (unreadOnly === 'true') filter.isRead = false;
  
  const notifications = await Notification.find(filter)
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  
  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
  
  res.status(200).json({
    status: 'success',
    results: notifications.length,
    total,
    unreadCount,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { notifications }
  });
});

// Mark notification as read
const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  res.status(200).json({
    status: 'success',
    data: { notification }
  });
});

// Mark all as read
const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  
  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

// Delete notification
const deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });
  
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Send notification (internal use)
const sendNotification = async (userId, type, title, message, data = {}) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
    isSent: true,
    sentAt: new Date()
  });
  
  // Emit real-time via Socket.io
  const io = getIO();
  io.to(`user:${userId}`).emit('new-notification', notification);
  
  return notification;
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification
};
