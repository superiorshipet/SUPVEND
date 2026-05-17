const catchAsync = require('../../utils/catchAsync.js');
const authService = require('./auth.service.js');

const register = catchAsync(async (req, res) => {
  const { userData, role, vendorData } = req.body;
  const result = await authService.register(userData, role, vendorData);
  
  res.status(201).json({
    status: 'success',
    message: 'Registration successful',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  res.status(200).json({
    status: 'success',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id);
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  logout
};
