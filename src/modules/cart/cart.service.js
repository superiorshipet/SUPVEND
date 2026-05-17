const Cart = require('./cart.model.js');
const Product = require('../product/product.model.js');
const Coupon = require('../coupon/coupon.model.js');
const AppError = require('../../utils/AppError.js');

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price images stock');
    
    if (!cart) {
      cart = await Cart.create({ 
        userId, 
        items: [], 
        subtotal: 0, 
        total: 0,
        discountAmount: 0
      });
    }
    
    return cart;
  }
  
  async addItem(userId, productId, quantity, variantId = null) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items available`, 400);
    }
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [], subtotal: 0, total: 0 });
    }
    
    const price = product.price;
    const total = price * quantity;
    
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total = cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
    } else {
      cart.items.push({
        productId,
        variantId,
        quantity,
        price,
        total
      });
    }
    
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.total = cart.subtotal - (cart.discountAmount || 0);
    
    await cart.save();
    await cart.populate('items.productId', 'name price images');
    
    return cart;
  }
  
  async applyCoupon(userId, couponCode) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }
    
    // Fix: Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      throw new AppError('Cart is empty. Please add items first.', 400);
    }
    
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    if (!coupon) {
      throw new AppError('Invalid or expired coupon', 400);
    }
    
    if (coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit exceeded', 400);
    }
    
    if (cart.subtotal < coupon.minOrderValue) {
      throw new AppError(`Minimum order value of $${coupon.minOrderValue} required. Current subtotal: $${cart.subtotal}`, 400);
    }
    
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (cart.subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.value;
      if (discountAmount > cart.subtotal) {
        discountAmount = cart.subtotal;
      }
    }
    
    cart.couponCode = coupon.code;
    cart.discountAmount = discountAmount;
    cart.total = cart.subtotal - discountAmount;
    
    await cart.save();
    
    return { cart, discountAmount, coupon };
  }
  
  async removeCoupon(userId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }
    
    cart.couponCode = null;
    cart.discountAmount = 0;
    cart.total = cart.subtotal;
    
    await cart.save();
    
    return cart;
  }
  
  async updateQuantity(userId, itemId, quantity) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }
    
    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }
    
    item.quantity = quantity;
    item.total = item.price * quantity;
    
    cart.subtotal = cart.items.reduce((sum, i) => sum + i.total, 0);
    cart.total = cart.subtotal - (cart.discountAmount || 0);
    
    await cart.save();
    
    return cart;
  }
  
  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.total = cart.subtotal - (cart.discountAmount || 0);
    
    await cart.save();
    
    return cart;
  }
  
  async clearCart(userId) {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      cart.couponCode = null;
      cart.discountAmount = 0;
      cart.subtotal = 0;
      cart.total = 0;
      await cart.save();
    }
    return cart;
  }
}

module.exports = new CartService();
