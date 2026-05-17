const express = require('express');
const router = express.Router();
const authController = require('./auth.controller.js');
const { protect } = require('../../middleware/auth.js');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(protect);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
