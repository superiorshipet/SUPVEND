const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth.js');
const User = require('./user.model.js');
const catchAsync = require('../../utils/catchAsync.js');

// Update user profile
router.patch('/profile', protect, catchAsync(async (req, res) => {
  const { name, phone } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 
      name: name || req.user.name,
      phoneNumber: phone 
    },
    { new: true, runValidators: true }
  ).select('-password');
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
}));

module.exports = router;
