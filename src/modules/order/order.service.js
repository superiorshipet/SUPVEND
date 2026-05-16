const Order = require('./order.model.js');
const Cart = require('../cart/cart.model.js');
const Product = require('../product/product.model.js');
const ProductVariant = require('../product/productVariant.model.js');
const Vendor = require('../vendor/vendor.model.js');
const { Wallet, WalletTransaction } = require('../wallet/wallet.model.js');
const Notification = require('../notification/notification.model.js');
const AppError = require('../../utils/AppError.js');
const mongoose = require('mongoose');

class OrderService {
  async createOrderFromCart(userId, paymentMethod, shippingAddress, billingAddress = null) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Get cart
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }
      
      // Group items by vendor
      const vendorGroups = {};
      for (const item of cart.items) {
        const product = await Product.findById(item.productId._id);
        const vendorId = product.vendorId.toString();
        
        if (!vendorGroups[vendorId]) {
          vendorGroups[vendorId] = {
            vendorId,
            items: [],
            subtotal: 0
          };
        }
        
        vendorGroups[vendorId].items.push({
          productId: item.productId._id,
          variantId: item.variantId,
          productName: item.productId.name,
          productImage: item.productId.images[0]?.url,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        });
        vendorGroups[vendorId].subtotal += item.total;
      }
      
      // Create order items array
      const orderItems = [];
      for (const vendorId in vendorGroups) {
        const group = vendorGroups[vendorId];
        for (const item of group.items) {
          orderItems.push(item);
        }
      }
      
      // Calculate totals
      const subtotal = cart.subtotal;
      const shippingCost = 0; // Calculate based on items
      const discountAmount = cart.discountAmount || 0;
      const total = subtotal - discountAmount + shippingCost;
      
      // Process payment
      let paymentDetails = {};
      let paymentStatus = 'pending';
      
      if (paymentMethod === 'wallet') {
        const wallet = await Wallet.findOne({ userId }).session(session);
        if (!wallet || wallet.balance < total) {
          throw new AppError('Insufficient wallet balance', 400);
        }
        
        wallet.balance -= total;
        wallet.totalSpent += total;
        await wallet.save({ session });
        
        await WalletTransaction.create([{
          walletId: wallet._id,
          userId,
          type: 'payment',
          amount: total,
          balanceBefore: wallet.balance + total,
          balanceAfter: wallet.balance,
          description: `Order payment`,
          referenceModel: 'Order'
        }], { session });
        
        paymentStatus = 'paid';
        paymentDetails = { walletAmount: total };
      } else if (paymentMethod === 'stripe') {
        paymentStatus = 'pending'; // Will be updated via webhook
        paymentDetails = { stripeAmount: total };
      }
      
      // Create order
      const order = await Order.create([{
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
      }], { session });
      
      // Update product stock
      for (const item of orderItems) {
        if (item.variantId) {
          await ProductVariant.findByIdAndUpdate(
            item.variantId,
            { $inc: { stock: -item.quantity } },
            { session }
          );
        } else {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity, soldCount: item.quantity } },
            { session }
          );
        }
      }
      
      // Update coupon usage
      if (cart.couponCode) {
        const Coupon = require('../coupon/coupon.model.js');
        await Coupon.findOneAndUpdate(
          { code: cart.couponCode },
          { $inc: { usedCount: 1 } },
          { session }
        );
      }
      
      // Clear cart
      cart.items = [];
      cart.couponCode = null;
      cart.discountAmount = 0;
      cart.subtotal = 0;
      cart.total = 0;
      await cart.save({ session });
      
      // Create notifications for vendors
      const vendorIds = [...new Set(orderItems.map(item => item.vendorId))];
      for (const vendorId of vendorIds) {
        await Notification.create([{
          userId: (await Vendor.findById(vendorId)).userId,
          type: 'new_order',
          title: 'New Order Received!',
          message: `You have received a new order #${order[0].orderNumber}`,
          data: { orderId: order[0]._id, orderNumber: order[0].orderNumber }
        }], { session });
      }
      
      await session.commitTransaction();
      
      return order[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
    
    // Check if order can be cancelled
    const canCancel = order.items.every(item => item.status === 'pending');
    if (!canCancel) {
      throw new AppError('Order cannot be cancelled. Some items are already processing.', 400);
    }
    
    order.items.forEach(item => {
      item.status = 'cancelled';
      item.statusHistory.push({
        status: 'cancelled',
        changedAt: new Date(),
        note: reason || 'Cancelled by customer'
      });
    });
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    
    // Refund if paid
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
    
    const oldStatus = item.status;
    item.status = status;
    item.statusHistory.push({
      status,
      changedAt: new Date(),
      note
    });
    
    if (status === 'delivered' && oldStatus !== 'delivered') {
      item.deliveredAt = new Date();
    }
    
    await order.save();
    
    // Notify customer
    await Notification.create({
      userId: order.userId,
      type: 'order_status_changed',
      title: 'Order Status Updated',
      message: `Your item "${item.productName}" status changed to ${status}`,
      data: { orderId, productId, status }
    });
    
    return order;
  }
  
  async getVendorOrders(vendorId, status = null, page = 1, limit = 20) {
    let filter = { 'items.vendorId': vendorId };
    if (status) filter['items.status'] = status;
    
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);
    
    // Filter items to only show vendor's items
    orders.forEach(order => {
      order.items = order.items.filter(item => item.vendorId.toString() === vendorId);
    });
    
    const total = await Order.countDocuments(filter);
    
    return { orders, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = new OrderService();
