const AppError = require('../utils/AppError.js');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

const isVendor = restrictTo('vendor', 'admin');
const isCustomer = restrictTo('customer', 'admin');
const isAdmin = restrictTo('admin');

module.exports = { restrictTo, isVendor, isCustomer, isAdmin };
