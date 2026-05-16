const express = require('express');
const router = express.Router();
const adminDashboardController = require('./adminDashboard.controller.js');
const { protect } = require('../../../middleware/auth.js');
const { isAdmin } = require('../../../middleware/role.js');

router.use(protect, isAdmin);
router.get('/overview', adminDashboardController.getOverview);
router.get('/users', adminDashboardController.getUsers);
router.patch('/users/:id/ban', adminDashboardController.toggleUserBan);
router.get('/vendors', adminDashboardController.getVendors);
router.patch('/vendors/:id/approval', adminDashboardController.updateVendorApproval);
router.get('/products', adminDashboardController.getAllProducts);
router.delete('/products/:id', adminDashboardController.deleteProduct);
router.get('/payouts/pending', adminDashboardController.getPendingPayouts);
router.post('/payouts/:id/approve', adminDashboardController.approvePayout);
router.get('/reports/sales', adminDashboardController.getSalesReport);

module.exports = router;
