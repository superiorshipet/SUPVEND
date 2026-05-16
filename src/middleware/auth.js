const { verifyAccessToken } = require('../utils/jwt.js');
const User = require('../modules/user/user.model.js');
const AppError = require('../utils/AppError.js');
const catchAsync = require('../utils/catchAsync.js');

const protect = catchAsync(async (req, res, next) => {
  let token;
  
  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }
  
  // Verify token
  const decoded = verifyAccessToken(token);
  
  // Check if user still exists
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }
  
  // Check if user changed password after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password. Please log in again.', 401));
  }
  
  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }
  
  req.user = user;
  next();
});

const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Invalid token, but that's fine for optional auth
    }
  }
  
  next();
});

module.exports = { protect, optionalAuth };
