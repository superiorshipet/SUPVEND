const catchAsync = require('../../utils/catchAsync.js');
const { Wallet, WalletTransaction } = require('./wallet.model.js');
const stripe = require('../../config/stripe.js');
const AppError = require('../../utils/AppError.js');

const getWallet = catchAsync(async (req, res) => {
  let wallet = await Wallet.findOne({ userId: req.user.id });
  if (!wallet) {
    wallet = await Wallet.create({ userId: req.user.id });
  }
  res.status(200).json({ status: 'success', data: { wallet } });
});

const getTransactions = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const transactions = await WalletTransaction.find({ userId: req.user.id })
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
  const total = await WalletTransaction.countDocuments({ userId: req.user.id });
  res.status(200).json({
    status: 'success',
    results: transactions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: { transactions }
  });
});

// Create Stripe Payment Intent for wallet deposit
const createDepositIntent = catchAsync(async (req, res) => {
  const { amount } = req.body;
  
  if (amount < 1) {
    throw new AppError('Minimum deposit is $1', 400);
  }
  
  // Create a PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
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
      paymentIntentId: paymentIntent.id,
      amount: amount
    }
  });
});

// Confirm payment and add to wallet (webhook or direct confirmation)
const confirmDeposit = catchAsync(async (req, res) => {
  const { paymentIntentId, amount } = req.body;
  
  // Verify payment intent status with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status !== 'succeeded') {
    throw new AppError('Payment not successful', 400);
  }
  
  // Add to wallet
  const wallet = await Wallet.findOne({ userId: req.user.id });
  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }
  
  const balanceBefore = wallet.balance;
  wallet.balance += amount;
  wallet.totalDeposited += amount;
  await wallet.save();
  
  // Create transaction record
  await WalletTransaction.create({
    walletId: wallet._id,
    userId: req.user.id,
    type: 'deposit',
    amount: amount,
    balanceBefore,
    balanceAfter: wallet.balance,
    description: `Wallet deposit via Stripe - ${paymentIntentId}`,
    paymentIntentId: paymentIntentId,
    status: 'completed'
  });
  
  res.status(200).json({
    status: 'success',
    message: `$${amount} added to wallet`,
    data: { balance: wallet.balance }
  });
});

// Stripe Webhook Handler
const handleWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100;
    
    // Add to wallet
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
  confirmDeposit,
  handleWebhook
};
