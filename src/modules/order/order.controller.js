const catchAsync = require('../../utils/catchAsync.js');
const orderService = require('./order.service.js');
const Vendor = require('../vendor/vendor.model.js');
const AppError = require('../../utils/AppError.js');
const Order = require('./order.model.js');

const createOrder = catchAsync(async (req, res) => {
  const { paymentMethod, shippingAddress, billingAddress } = req.body;
  const order = await orderService.createOrderFromCart(req.user.id, paymentMethod, shippingAddress, billingAddress);
  res.status(201).json({ status: 'success', message: 'Order created successfully', data: { order } });
});

const getUserOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const result = await orderService.getUserOrders(req.user.id, status, parseInt(page), parseInt(limit));
  res.status(200).json({ status: 'success', orders: result.orders, total: result.total, page: result.page, pages: result.pages });
});

const getOrder = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const order = await orderService.getOrder(req.params.id, req.user.id, isAdmin);
  res.status(200).json({ status: 'success', data: { order } });
});

const cancelOrder = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.cancelOrder(req.params.id, req.user.id, reason);
  res.status(200).json({ status: 'success', message: 'Order cancelled successfully', data: { order } });
});

const getVendorOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) throw new AppError('Vendor profile not found', 404);
  const result = await orderService.getVendorOrders(vendor._id, status, parseInt(page), parseInt(limit));
  res.status(200).json({ status: 'success', ...result });
});

const updateOrderItemStatus = catchAsync(async (req, res) => {
  const { productId, status, note } = req.body;
  const { orderId } = req.params;
  
  let vendorId;
  if (req.user.role === 'admin') {
    const Product = require('../product/product.model.js');
    const product = await Product.findById(productId);
    if (product) vendorId = product.vendorId;
  } else {
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) throw new AppError('Vendor not found', 404);
    vendorId = vendor._id;
  }
  
  const order = await orderService.updateOrderItemStatus(orderId, productId, status, vendorId, note);
  res.status(200).json({ status: 'success', message: 'Order item status updated', data: { order } });
});

const getAllOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 50, vendorId } = req.query;
  let filter = {};
  if (status) filter['items.status'] = status;
  if (vendorId) filter['items.vendorId'] = vendorId;
  const orders = await Order.find(filter).sort('-createdAt').limit(parseInt(limit)).skip((parseInt(page) - 1) * parseInt(limit)).populate('userId', 'name email');
  const total = await Order.countDocuments(filter);
  res.status(200).json({ status: 'success', results: orders.length, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), data: { orders } });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  getVendorOrders,
  updateOrderItemStatus,
  getAllOrders
};
