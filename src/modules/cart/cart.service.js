const Cart = require('./cart.model.js');
const Product = require('../product/product.model.js');
const ProductVariant = require('../product/productVariant.model.js');
const Coupon = require('../coupon/coupon.model.js');
const AppError = require('../../utils/AppError.js');

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ userId })
      .populate('items.productId', 'name price images stock productType')
      .populate('items.variantId', 'attributes price stock');
    
    if (!cart) {
      cart = await Cart.create({ userId, items: [], subtotal: 0, total: 0 });
    }
    
    return cart;
  }
  
  async addItem(userId, productId, quantity, variantId = null) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    // Check stock
    let price = product.price;
    let availableStock = product.stock;
    
    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (!variant) {
        throw new AppError('Variant not found', 404);
      }
      price = variant.price;
      availableStock = variant.stock;
    }
    
    if (availableStock < quantity) {
      throw new AppError(`Only ${availableStock} items available`, 400);
    }
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [], subtotal: 0, total: 0 });
    }
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && 
              (item.variantId?.toString() === variantId?.toString())
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (availableStock < newQuantity) {
        throw new AppError(`Only ${availableStock} items available`, 400);
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].total = price * newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        variantId,
        quantity,
        price,
        total: price * quantity
      });
    }
    
    await this.updateCartTotals(cart);
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
      throw new AppError('Item not found in cart', 404);
    }
    
    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }
    
    // Check stock
    const product = await Product.findById(item.productId);
    let availableStock = product.stock;
    
    if (item.variantId) {
      const variant = await ProductVariant.findById(item.variantId);
      availableStock = variant.stock;
    }
    
    if (availableStock < quantity) {
      throw new AppError(`Only ${availableStock} items available`, 400);
    }
    
    item.quantity = quantity;
    item.total = item.price * quantity;
    
    await this.updateCartTotals(cart);
    await cart.save();
    
    return cart;
  }
  
  async removeItem(userId, itemId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    await this.updateCartTotals(cart);
    await cart.save();
    
    return cart;
  }
  
  async applyCoupon(userId, couponCode) {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
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
    
    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit exceeded', 400);
    }
    
    // Check min order value
    if (cart.subtotal < coupon.minOrderValue) {
      throw new AppError(`Minimum order value of $${coupon.minOrderValue} required`, 400);
    }
    
    // Calculate discount
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
    cart.total = cart.subtotal - discountAmount + (cart.shippingCost || 0);
    
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
    cart.total = cart.subtotal + (cart.shippingCost || 0);
    
    await cart.save();
    
    return cart;
  }
  
  async updateCartTotals(cart) {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.total = cart.subtotal - (cart.discountAmount || 0) + (cart.shippingCost || 0);
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
