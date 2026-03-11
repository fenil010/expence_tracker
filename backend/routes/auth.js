/**
 * Authentication Routes
 * 
 * Handles user registration, login, logout, password management,
 * and refresh token rotation.
 */

import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import Account from '../models/Account.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import withTransaction from '../utils/withTransaction.js';
import { body } from 'express-validator';
import verifyGoogleToken from '../utils/google.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (atomic when transactions supported)
 * @access  Public
 */
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name max 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain a special character'),
  validate
], asyncHandler(async (req, res) => {
  const { name, email, password, currency } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  const result = await withTransaction(async (session) => {
    // Create user
    const opts = session ? { session } : {};
    const users = await User.create([{
      name,
      email,
      password,
      currency: currency || 'USD'
    }], opts);
    const user = users[0];

    // Create all defaults (pass session for atomicity)
    await Promise.all([
      Category.createDefaultsForUser(user._id, session),
      Budget.createDefaultMonthlyBudget(user._id, undefined, session),
      Goal.createEmergencyFundGoal(user._id, session),
      Account.createDefaultsForUser(user._id, session)
    ]);

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    await user.save(opts);

    return {
      user: user.toPublicJSON(),
      token,
      refreshToken
    };
  });

  res.status(201).json({
    success: true,
    data: result
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user with brute-force protection
 * @access  Public
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, deletedAt: null }).select('+password +refreshToken');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is locked
  if (user.isLocked) {
    return res.status(423).json({
      success: false,
      message: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated'
    });
  }

  // Reset login attempts and update last login
  await user.resetLoginAttempts();

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  await user.save();

  res.json({
    success: true,
    data: {
      user: user.toPublicJSON(),
      token,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/auth/google
 * @desc    Sign in or register with Google OAuth
 * @access  Public
 */
router.post('/google', [
  body('idToken').notEmpty().withMessage('Google ID token is required'),
  validate
], asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  // Verify the Google ID token
  const googleUser = await verifyGoogleToken(idToken);

  // Check if user exists by googleId OR matching email
  let user = await User.findOne({
    $or: [
      { googleId: googleUser.googleId },
      { email: googleUser.email }
    ],
    deletedAt: null
  }).select('+refreshToken');

  if (user) {
    // Existing user — link Google account if not already linked
    if (!user.googleId) {
      user.googleId = googleUser.googleId;
      user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
      if (googleUser.picture && !user.avatar) {
        user.avatar = googleUser.picture;
      }
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  } else {
    // New user — create account with defaults
    const result = await withTransaction(async (session) => {
      const opts = session ? { session } : {};
      const users = await User.create([{
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        authProvider: 'google',
        avatar: googleUser.picture,
        isVerified: true,
        lastLogin: new Date(),
      }], opts);
      const newUser = users[0];

      // Create all defaults
      await Promise.all([
        Category.createDefaultsForUser(newUser._id, session),
        Budget.createDefaultMonthlyBudget(newUser._id, undefined, session),
        Goal.createEmergencyFundGoal(newUser._id, session),
        Account.createDefaultsForUser(newUser._id, session)
      ]);

      return newUser;
    });

    user = result;
  }

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  await user.save();

  res.json({
    success: true,
    data: {
      user: user.toPublicJSON(),
      token,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate
], asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const jwt = await import('jsonwebtoken');

  try {
    const decoded = jwt.default.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Rotate tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();
    await user.save();

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user — invalidate refresh token
 * @access  Private
 */
router.post('/logout', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 }
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    data: user.toPublicJSON()
  });
}));

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  validate
], asyncHandler(async (req, res) => {
  const allowedUpdates = ['name', 'email', 'currency', 'language', 'timezone', 'avatar', 'phone', 'notificationPreferences'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: user.toPublicJSON()
  });
}));

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
router.put('/password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 128 }).withMessage('New password must be 8-128 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/\d/).withMessage('New password must contain a number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain a special character'),
  validate
], asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // OAuth users without a password can set one for the first time
  if (!user.password) {
    if (currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'You signed in with Google. Leave current password blank to set a new one.'
      });
    }
    user.password = newPassword;
    await user.save();
    const token = user.generateAuthToken();
    return res.json({
      success: true,
      message: 'Password set successfully. You can now login with email and password too.',
      data: { token }
    });
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  const token = user.generateAuthToken();

  res.json({
    success: true,
    message: 'Password updated successfully',
    data: { token }
  });
}));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  validate
], asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists
    return res.json({
      success: true,
      message: 'If an account exists, a password reset email will be sent'
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  if (process.env.NODE_ENV === 'development') {
    console.log(`Reset token for ${email}: ${resetToken}`);
  }

  res.json({
    success: true,
    message: 'If an account exists, a password reset email will be sent',
    ...(process.env.NODE_ENV === 'development' && { resetToken })
  });
}));

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number'),
  validate
], asyncHandler(async (req, res) => {
  const { password } = req.body;

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  // Reset login attempts on password reset
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  const token = user.generateAuthToken();

  res.json({
    success: true,
    message: 'Password reset successful',
    data: { token }
  });
}));

export default router;
