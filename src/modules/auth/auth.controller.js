const catchAsync = require('../../utils/catchAsync.js');
const authService = require('./auth.service.js');
const AppError = require('../../utils/AppError.js');

const register = catchAsync(async (req, res) => {
  const { userData, role, vendorData } = req.body;
  
  const result = await authService.register(userData, role, vendorData);
  
  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(201).json({
    status: 'success',
    message: 'Registration successful. Please verify your email.',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent');
  
  const result = await authService.login(email, password, ipAddress, userAgent);
  
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  const result = await authService.refreshToken(refreshToken);
  
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    status: 'success',
    data: {
      accessToken: result.accessToken
    }
  });
});

const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const { verifyRefreshToken } = require('../../utils/jwt.js');
      const decoded = verifyRefreshToken(refreshToken);
      await authService.logout(decoded.id);
    } catch (e) {
      // Token invalid/expired — just clear cookies
    }
  }

  res.clearCookie('refreshToken');
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  const result = await authService.verifyEmail(token);
  
  res.status(200).json(result);
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  
  res.status(200).json(result);
});

const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const result = await authService.resetPassword(token, password);
  
  res.status(200).json(result);
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
  
  res.status(200).json(result);
});

const resendVerification = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendVerification(email);
  
  res.status(200).json(result);
});

const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerification,
  getMe
};
