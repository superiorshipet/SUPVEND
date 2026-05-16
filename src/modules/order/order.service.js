const Order = require('./order.model.js');
const Cart = require('../cart/cart.model.js');
const Product = require('../product/product.model.js');
const { Wallet, WalletTransaction } = require('../wallet/wallet.model.js');
const AppError = require('../../utils/AppError.js');

// Generate unique order number
const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const count = await Order.countDocuments() + 1;
  return `ORD-${year}${month}${day}-${String(count).padStart(6, '0')}`;
};

class OrderService {
  async createOrderFromCart(userId, paymentMethod, shippingAddress, billingAddress = null) {
    // Get cart
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }
    
    // Create order items
    const orderItems = [];
    for (const item of cart.items) {
      orderItems.push({
        productId: item.productId._id,
        variantId: item.variantId,
        vendorId: item.productId.vendorId,
        productName: item.productId.name,
        productImage: item.productId.images[0]?.url,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        status: 'pending',
        statusHistory: [{ status: 'pending', changedAt: new Date() }]
      });
    }
    
    // Calculate totals
    const subtotal = cart.subtotal;
    const shippingCost = 0;
    const discountAmount = cart.discountAmount || 0;
    const total = subtotal - discountAmount + shippingCost;
    
    // Process payment
    let paymentDetails = {};
    let paymentStatus = 'pending';
    
    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || wallet.balance < total) {
        throw new AppError(`Insufficient wallet balance. Your balance: $${wallet?.balance || 0}, Required: $${total}`, 400);
      }
      
      wallet.balance -= total;
      wallet.totalSpent += total;
      await wallet.save();
      
      await WalletTransaction.create({
        walletId: wallet._id,
        userId,
        type: 'payment',
        amount: total,
        balanceBefore: wallet.balance + total,
        balanceAfter: wallet.balance,
        description: `Order payment`,
        referenceModel: 'Order'
      });
      
      paymentStatus = 'paid';
      paymentDetails = { walletAmount: total };
    }
    
    // Generate order number
    const orderNumber = await generateOrderNumber();
    
    // Create order
    const order = await Order.create({
      orderNumber,
      userId,
      items: orderItems,
      subtotal,
      shippingCost,
      discountAmount,
      couponCode: cart.couponCode,
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
    cart.couponCode = null;
    cart.discountAmount = 0;
    cart.subtotal = 0;
    cart.total = 0;
    await cart.save();
    
    return order;
  }
  
  async getUserOrders(userId, status = null, page = 1, limit = 20) {
    let filter = { userId };
    if (status) filter['items.status'] = status;
    
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(filter);
    
    return { orders, total, page, pages: Math.ceil(total / limit) };
  }
  
  async getOrder(orderId, userId, isAdmin = false) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    if (order.userId.toString() !== userId && !isAdmin) {
      throw new AppError('Access denied', 403);
    }
    
    return order;
  }
  
  async cancelOrder(orderId, userId, reason = null) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    if (order.userId.toString() !== userId) {
      throw new AppError('Access denied', 403);
    }
    
    const canCancel = order.items.every(item => item.status === 'pending');
    if (!canCancel) {
      throw new AppError('Order cannot be cancelled. Some items are already processing.', 400);
    }
    
    order.items.forEach(item => {
      item.status = 'cancelled';
      if (!item.statusHistory) item.statusHistory = [];
      item.statusHistory.push({
        status: 'cancelled',
        changedAt: new Date(),
        note: reason || 'Cancelled by customer'
      });
    });
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    
    if (order.paymentStatus === 'paid') {
      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        wallet.balance += order.total;
        await wallet.save();
        
        await WalletTransaction.create({
          walletId: wallet._id,
          userId,
          type: 'refund',
          amount: order.total,
          balanceBefore: wallet.balance - order.total,
          balanceAfter: wallet.balance,
          description: `Refund for cancelled order ${order.orderNumber}`,
          reference: orderId,
          referenceModel: 'Order'
        });
      }
      
      order.paymentStatus = 'refunded';
    }
    
    await order.save();
    
    return order;
  }
  
  async updateOrderItemStatus(orderId, productId, status, vendorId, note = null) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    const item = order.items.find(
      i => i.productId.toString() === productId && i.vendorId.toString() === vendorId
    );
    
    if (!item) {
      throw new AppError('Item not found in order', 404);
    }
    
    item.status = status;
    if (!item.statusHistory) item.statusHistory = [];
    item.statusHistory.push({
      status,
      changedAt: new Date(),
      note
    });
    
    await order.save();
    
    return order;
  }
  
  async getVendorOrders(vendorId, status = null, page = 1, limit = 20) {
    let filter = { 'items.vendorId': vendorId };
    if (status) filter['items.status'] = status;
    
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);
    
    orders.forEach(order => {
      order.items = order.items.filter(item => item.vendorId.toString() === vendorId);
    });
    
    const total = await Order.countDocuments(filter);
    
    return { orders, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = new OrderService();
