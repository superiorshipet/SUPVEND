const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller.js');
const { protect } = require('../../middleware/auth.js');

router.use(protect);
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
