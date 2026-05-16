const Order = require('./order.model.js');
const Cart = require('../cart/cart.model.js');
const Product = require('../product/product.model.js');
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
      const cart = await Cart.findOne({ userId }).populate('items.productId').session(session);
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
          status: 'pending'
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
        const wallet = await Wallet.findOne({ userId }).session(session);
        if (!wallet || wallet.balance < total) {
          throw new AppError(`Insufficient wallet balance. Your balance: $${wallet?.balance || 0}, Required: $${total}`, 400);
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
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity, soldCount: item.quantity } },
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
      
      await session.commitTransaction();
      
      // Create notifications (outside transaction)
      for (const vendorId of [...new Set(orderItems.map(item => item.vendorId))]) {
        const Vendor = require('../vendor/vendor.model.js');
        const vendor = await Vendor.findById(vendorId);
        if (vendor) {
          await Notification.create({
            userId: vendor.userId,
            type: 'new_order',
            title: 'New Order Received!',
            message: `You have received a new order #${order[0].orderNumber}`,
            data: { orderId: order[0]._id, orderNumber: order[0].orderNumber }
          });
        }
      }
      
      return order[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  // ... rest of the methods remain the same
}

module.exports = new OrderService();
