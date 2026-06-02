const Order = require('./order.model.js');
const Cart = require('../cart/cart.model.js');
const Product = require('../product/product.model.js');
const { Wallet, WalletTransaction } = require('../wallet/wallet.model.js');
const AppError = require('../../utils/AppError.js');

class OrderService {
  async getUserOrders(userId, status = null, page = 1, limit = 20) {
    let filter = { userId };
    
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');
    
    const total = await Order.countDocuments(filter);
    
    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  async getOrder(orderId, userId, isAdmin = false) {
    const order = await Order.findById(orderId).populate('userId', 'name email');
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    if (order.userId.toString() !== userId && !isAdmin) {
      throw new AppError('Access denied', 403);
    }
    
    return order;
  }

  async createOrderFromCart(userId, paymentMethod, shippingAddress, billingAddress = null) {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }
    
    const orderItems = [];
    for (const item of cart.items) {
      orderItems.push({
        productId: item.productId._id,
        variantId: item.variantId,
        vendorId: item.productId.vendorId,
        productName: item.productId.name,
        productImage: item.productId.images?.[0]?.url,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        status: 'pending',
        statusHistory: [{ status: 'pending', changedAt: new Date() }]
      });
    }
    
    const subtotal = cart.subtotal;
    const total = subtotal - (cart.discountAmount || 0);
    
    let paymentStatus = 'pending';
    let paymentDetails = {};
    
    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || wallet.balance < total) {
        throw new AppError(`Insufficient wallet balance`, 400);
      }
      
      wallet.balance -= total;
      wallet.totalSpent += total;
      await wallet.save();
      
      paymentStatus = 'paid';
      paymentDetails = { walletAmount: total };
    }
    
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const order = await Order.create({
      orderNumber,
      userId,
      items: orderItems,
      subtotal,
      total,
      paymentMethod,
      paymentDetails,
      paymentStatus,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress
    });
    
    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity, soldCount: item.quantity } }
      );
    }
    
    // Clear cart
    cart.items = [];
    cart.subtotal = 0;
    cart.total = 0;
    await cart.save();
    
    return order;
  }

  async cancelOrder(orderId, userId, reason = null) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId.toString() !== userId) throw new AppError('Access denied', 403);
    
    const canCancel = order.items.every(item => item.status === 'pending');
    if (!canCancel) throw new AppError('Order cannot be cancelled', 400);
    
    order.items.forEach(item => {
      item.status = 'cancelled';
      item.statusHistory.push({ status: 'cancelled', changedAt: new Date(), note: reason });
    });
    order.cancelledAt = new Date();
    
    if (order.paymentStatus === 'paid') {
      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        wallet.balance += order.total;
        await wallet.save();
      }
      order.paymentStatus = 'refunded';
    }
    
    await order.save();
    return order;
  }

  async updateOrderItemStatus(orderId, productId, status, vendorId, note = null) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    
    const item = order.items.find(i => i.productId.toString() === productId);
    if (!item) throw new AppError('Item not found', 404);
    
    item.status = status;
    item.statusHistory.push({ status, changedAt: new Date(), note });
    await order.save();
    
    return order;
  }
}

module.exports = new OrderService();
