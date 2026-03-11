/**
 * User Model
 * 
 * Defines the user schema with authentication fields, profile information,
 * notification preferences, and brute-force protection.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const notificationPreferencesSchema = new mongoose.Schema({
  emailAlerts: { type: Boolean, default: true },
  budgetWarnings: { type: Boolean, default: true },
  goalReminders: { type: Boolean, default: true },
  weeklyReport: { type: Boolean, default: false },
  monthlyReport: { type: Boolean, default: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [128, 'Password cannot exceed 128 characters'],
    select: false
  },

  // Profile information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },

  // Preferences
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    trim: true
  },
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  dateFormat: {
    type: String,
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
    default: 'MM/DD/YYYY'
  },
  fiscalYearStart: {
    type: Number,
    min: 1,
    max: 12,
    default: 1
  },
  notificationPreferences: {
    type: notificationPreferencesSchema,
    default: () => ({})
  },

  // Account settings
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // Security — brute-force protection
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },

  // Token management
  refreshToken: {
    type: String,
    select: false
  },

  // Password reset tokens
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Verification token
  verificationToken: String,

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },

  // Soft delete
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========================================================================
// INDEXES
// ========================================================================

userSchema.index({ createdAt: -1 });
userSchema.index({ deletedAt: 1 });

// ========================================================================
// VIRTUALS
// ========================================================================

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ========================================================================
// MIDDLEWARE
// ========================================================================

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(14);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ========================================================================
// INSTANCE METHODS
// ========================================================================

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '1d',
      audience: 'expense-tracker',
      issuer: 'expense-tracker-api',
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
  this.refreshToken = refreshToken;
  return refreshToken;
};

/**
 * Increment login attempts. Lock account after 5 failed attempts.
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock after 5 attempts for 15 minutes
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

/**
 * Reset login attempts on successful login
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 }
  });
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    phone: this.phone,
    currency: this.currency,
    language: this.language,
    timezone: this.timezone,
    theme: this.theme,
    dateFormat: this.dateFormat,
    fiscalYearStart: this.fiscalYearStart,
    role: this.role,
    isVerified: this.isVerified,
    notificationPreferences: this.notificationPreferences,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
};

/**
 * Lightweight summary for list views
 */
userSchema.methods.toSummaryJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt
  };
};

// ========================================================================
// STATIC METHODS
// ========================================================================

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email, deletedAt: null }).select('+password');

  if (!user) {
    throw new Error('Invalid login credentials');
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new Error('Account is temporarily locked. Please try again later.');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new Error('Invalid login credentials');
  }

  // Reset attempts on successful login
  await user.resetLoginAttempts();
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
