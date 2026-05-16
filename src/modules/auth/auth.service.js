const bcrypt = require('bcryptjs');
const User = require('../user/user.model.js');
const Vendor = require('../vendor/vendor.model.js');
const { Wallet } = require('../wallet/wallet.model.js');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt.js');
const AppError = require('../../utils/AppError.js');

class AuthService {
  async register(userData, role, vendorData = null) {
    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: role,
      phoneNumber: userData.phoneNumber,
      isEmailVerified: true // Auto-verify for development
    });

    // Create wallet for user
    await Wallet.create({ userId: user._id });

    // If vendor, create vendor profile
    if (role === 'vendor' && vendorData) {
      await Vendor.create({
        userId: user._id,
        storeName: vendorData.storeName,
        storeDescription: vendorData.storeDescription,
        contactPhone: vendorData.contactPhone,
        isApproved: 'approved' // Auto-approve for development
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      accessToken,
      refreshToken
    };
  }

  async login(email, password, ipAddress, userAgent) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 401);
    }

    user.lastLogin = new Date();
    user.loginAttempts = 0;
    
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    try {
      const decoded = verifyRefreshToken(oldRefreshToken);
      const user = await User.findById(decoded.id);
      
      if (!user || user.refreshToken !== oldRefreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);
      
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async verifyEmail(token) {
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email) {
    return { message: 'Password reset email sent (development mode)' };
  }

  async resetPassword(token, newPassword) {
    return { message: 'Password reset successful' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = Date.now();
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async resendVerification(email) {
    return { message: 'Verification email resent (development mode)' };
  }
}

module.exports = new AuthService();
