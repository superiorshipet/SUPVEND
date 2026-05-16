const catchAsync = require('../../utils/catchAsync.js');
const { Wallet, WalletTransaction } = require('./wallet.model.js');
const AppError = require('../../utils/AppError.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get wallet balance
const getWallet = catchAsync(async (req, res) => {
  let wallet = await Wallet.findOne({ userId: req.user.id });
  
  if (!wallet) {
    wallet = await Wallet.create({ userId: req.user.id });
  }
  
  res.status(200).json({
    status: 'success',
    data: { wallet }
  });
});

// Get transaction history
const getTransactions = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  
  let filter = { userId: req.user.id };
  if (type) filter.type = type;
  
  const transactions = await WalletTransaction.find(filter)
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  
  const total = await WalletTransaction.countDocuments(filter);
  
  res.status(200).json({
    status: 'success',
    results: transactions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { transactions }
  });
});

// Create Stripe payment intent for wallet deposit
const createDepositIntent = catchAsync(async (req, res) => {
  const { amount } = req.body;
  
  if (amount < 1) {
    throw new AppError('Minimum deposit is $1', 400);
  }
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    metadata: {
      userId: req.user.id,
      type: 'wallet_deposit'
    }
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }
  });
});

// Webhook handler for Stripe (called from Stripe webhook)
const handleStripeWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new AppError(`Webhook Error: ${err.message}`, 400);
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { userId } = paymentIntent.metadata;
    const amount = paymentIntent.amount / 100;
    
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
      const balanceBefore = wallet.balance;
      wallet.balance += amount;
      wallet.totalDeposited += amount;
      await wallet.save();
      
      await WalletTransaction.create({
        walletId: wallet._id,
        userId,
        type: 'deposit',
        amount,
        balanceBefore,
        balanceAfter: wallet.balance,
        description: `Wallet deposit via Stripe`,
        paymentIntentId: paymentIntent.id,
        status: 'completed'
      });
    }
  }
  
  res.json({ received: true });
});

module.exports = {
  getWallet,
  getTransactions,
  createDepositIntent,
  handleStripeWebhook
};
