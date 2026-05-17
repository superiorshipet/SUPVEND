const bcrypt = require('bcryptjs');
const User = require('../user/user.model.js');
const Vendor = require('../vendor/vendor.model.js');
const { Wallet } = require('../wallet/wallet.model.js');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt.js');
const AppError = require('../../utils/AppError.js');

class AuthService {
  async register(userData, role, vendorData = null) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: role,
      phoneNumber: userData.phoneNumber,
      isEmailVerified: true
    });

    await Wallet.create({ userId: user._id });

    if (role === 'vendor' && vendorData) {
      await Vendor.create({
        userId: user._id,
        storeName: vendorData.storeName,
        storeDescription: vendorData.storeDescription,
        contactPhone: vendorData.contactPhone,
        isApproved: 'approved'
      });
    }

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

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 401);
    }

    user.lastLogin = new Date();
    
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

  async getMe(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }
}

module.exports = new AuthService();
