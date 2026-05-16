const express = require('express');
const router = express.Router();
const walletController = require('./wallet.controller.js');
const { protect } = require('../../middleware/auth.js');

router.use(protect);
router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);
router.post('/deposit', walletController.createDepositIntent);

// Webhook is public (no auth)
const webhookRouter = express.Router();
webhookRouter.post('/stripe-webhook', express.raw({ type: 'application/json' }), walletController.handleStripeWebhook);

module.exports = { router, webhookRouter };
