const catchAsync = require('../../utils/catchAsync.js');
const flashSaleService = require('./flashSale.service.js');
const Vendor = require('../vendor/vendor.model.js');
const AppError = require('../../utils/AppError.js');

// Get all active flash sales
const getActiveFlashSales = catchAsync(async (req, res) => {
  const sales = await flashSaleService.getActiveFlashSales();
  
  res.status(200).json({
    status: 'success',
    results: sales.length,
    data: { flashSales: sales }
  });
});

// Get single flash sale
const getFlashSale = catchAsync(async (req, res) => {
  const flashSale = await FlashSale.findById(req.params.id)
    .populate('productId', 'name description images price');
  
  if (!flashSale) {
    throw new AppError('Flash sale not found', 404);
  }
  
  const remainingTime = await redisHelpers.getRemainingTime(flashSale._id);
  const stock = await redisHelpers.getFlashSaleStock(flashSale._id);
  
  res.status(200).json({
    status: 'success',
    data: {
      flashSale: {
        ...flashSale.toObject(),
        remainingSeconds: remainingTime,
        availableStock: stock
      }
    }
  });
});

// Create flash sale (vendor/admin)
const createFlashSale = catchAsync(async (req, res) => {
  const flashSale = await flashSaleService.createFlashSale(req.body, req.user.id);
  
  res.status(201).json({
    status: 'success',
    message: 'Flash sale created successfully',
    data: { flashSale }
  });
});

// Get vendor flash sales
const getVendorFlashSales = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    throw new AppError('Vendor not found', 404);
  }
  
  const sales = await flashSaleService.getVendorFlashSales(vendor._id);
  
  res.status(200).json({
    status: 'success',
    results: sales.length,
    data: { flashSales: sales }
  });
});

// Purchase from flash sale
const purchaseFlashSale = catchAsync(async (req, res) => {
  const { quantity = 1 } = req.body;
  
  const result = await flashSaleService.purchaseFlashSale(
    req.params.id,
    req.user.id,
    quantity
  );
  
  res.status(200).json({
    status: 'success',
    message: 'Purchase successful',
    data: result
  });
});

// Cancel flash sale (vendor/admin)
const cancelFlashSale = catchAsync(async (req, res) => {
  const flashSale = await FlashSale.findById(req.params.id);
  
  if (!flashSale) {
    throw new AppError('Flash sale not found', 404);
  }
  
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (flashSale.vendorId.toString() !== vendor?._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  
  if (flashSale.status === 'ended') {
    throw new AppError('Flash sale already ended', 400);
  }
  
  if (flashSale.status === 'active') {
    await flashSaleService.endFlashSale(flashSale._id);
  }
  
  flashSale.status = 'cancelled';
  await flashSale.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Flash sale cancelled'
  });
});

module.exports = {
  getActiveFlashSales,
  getFlashSale,
  createFlashSale,
  getVendorFlashSales,
  purchaseFlashSale,
  cancelFlashSale
};
