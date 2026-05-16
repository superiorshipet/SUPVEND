const express = require('express');
const router = express.Router();
const auctionController = require('./auction.controller.js');
const { protect } = require('../../middleware/auth.js');
const { isVendor } = require('../../middleware/role.js');

// Public routes
router.get('/active', auctionController.getActiveAuctions);
router.get('/:id', auctionController.getAuction);

// Protected routes
router.use(protect);
router.post('/:id/bid', auctionController.placeBid);
router.post('/', isVendor, auctionController.createAuction);
router.get('/vendor/my-auctions', isVendor, auctionController.getVendorAuctions);
router.delete('/:id/cancel', isVendor, auctionController.cancelAuction);

module.exports = router;
