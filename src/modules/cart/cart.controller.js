const catchAsync = require('../../utils/catchAsync.js');
const cartService = require('./cart.service.js');

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

const addToCart = catchAsync(async (req, res) => {
  const { productId, quantity, variantId } = req.body;
  
  const cart = await cartService.addItem(
    req.user.id,
    productId,
    quantity,
    variantId
  );
  
  res.status(200).json({
    status: 'success',
    message: 'Item added to cart',
    data: { cart }
  });
});

const updateCartItem = catchAsync(async (req, res) => {
  const { quantity } = req.body;
  const { itemId } = req.params;
  
  const cart = await cartService.updateQuantity(
    req.user.id,
    itemId,
    quantity
  );
  
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

const removeCartItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  
  const cart = await cartService.removeItem(req.user.id, itemId);
  
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

const applyCoupon = catchAsync(async (req, res) => {
  const { couponCode } = req.body;
  
  const result = await cartService.applyCoupon(req.user.id, couponCode);
  
  res.status(200).json({
    status: 'success',
    message: 'Coupon applied successfully',
    data: result
  });
});

const removeCoupon = catchAsync(async (req, res) => {
  const cart = await cartService.removeCoupon(req.user.id);
  
  res.status(200).json({
    status: 'success',
    message: 'Coupon removed',
    data: { cart }
  });
});

const clearCart = catchAsync(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  
  res.status(200).json({
    status: 'success',
    message: 'Cart cleared',
    data: { cart }
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart
};
