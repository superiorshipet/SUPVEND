const express = require('express');
const router = express.Router();
const authController = require('./auth.controller.js');
const { protect } = require('../../middleware/auth.js');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/resend-verification', authController.resendVerification);

// Protected routes
router.use(protect);
router.get('/me', authController.getMe);
router.patch('/change-password', authController.changePassword);

module.exports = router;
