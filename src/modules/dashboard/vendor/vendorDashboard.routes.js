const express = require('express');
const router = express.Router();
const vendorDashboardController = require('./vendorDashboard.controller.js');
const { protect } = require('../../../middleware/auth.js');
const { isVendor } = require('../../../middleware/role.js');

router.use(protect, isVendor);
router.get('/overview', vendorDashboardController.getOverview);
router.get('/products', vendorDashboardController.getProducts);
router.get('/orders', vendorDashboardController.getOrders);
router.post('/payouts/request', vendorDashboardController.requestPayout);
router.get('/payouts', vendorDashboardController.getPayouts);

module.exports = router;
