const cartService = require('./cart.service.js');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log('Get cart - userId:', userId);
    
    const cart = await cartService.getCart(userId);
    
    // Only send ONE response
    return res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId, quantity, variantId } = req.body;
    
    console.log('Add to cart:', { userId, productId, quantity });
    
    const cart = await cartService.addItem(userId, productId, quantity, variantId);
    
    return res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: { cart }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return next(error);
  }
};

const applyCoupon = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { couponCode } = req.body;
    
    console.log('Apply coupon:', { userId, couponCode });
    
    const result = await cartService.applyCoupon(userId, couponCode);
    
    return res.status(200).json({
      status: 'success',
      message: 'Coupon applied successfully',
      data: result
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    return next(error);
  }
};

const removeCoupon = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const cart = await cartService.removeCoupon(userId);
    
    return res.status(200).json({
      status: 'success',
      message: 'Coupon removed',
      data: { cart }
    });
  } catch (error) {
    return next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { quantity } = req.body;
    const { itemId } = req.params;
    
    const cart = await cartService.updateQuantity(userId, itemId, quantity);
    
    return res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    return next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { itemId } = req.params;
    
    const cart = await cartService.removeItem(userId, itemId);
    
    return res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    return next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const cart = await cartService.clearCart(userId);
    
    return res.status(200).json({
      status: 'success',
      message: 'Cart cleared',
      data: { cart }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart
};
