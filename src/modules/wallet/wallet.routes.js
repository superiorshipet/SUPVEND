const express = require('express');
const router = express.Router();
const walletController = require('./wallet.controller.js');
const { protect } = require('../../middleware/auth.js');

// All routes require authentication
router.use(protect);

router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);
router.post('/create-deposit-intent', walletController.createDepositIntent);
router.post('/confirm-deposit', walletController.confirmDeposit);

// Webhook endpoint (no auth, raw body)
const webhookRouter = express.Router();
webhookRouter.post('/stripe-webhook', express.raw({ type: 'application/json' }), walletController.handleWebhook);

module.exports = { router, webhookRouter };
