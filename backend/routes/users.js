/**
 * User Routes
 * 
 * User management endpoints.
 */

import express from 'express';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get user statistics
    const [transactionCount, totalIncome, totalExpenses] = await Promise.all([
      Transaction.countDocuments({ user: req.user._id }),
      Transaction.aggregate([
        { $match: { user: req.user._id, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        user: user.toPublicJSON(),
        stats: {
          totalTransactions: transactionCount,
          totalIncome: totalIncome[0]?.total || 0,
          totalExpenses: totalExpenses[0]?.total || 0,
          memberSince: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', async (req, res) => {
  try {
    const allowedUpdates = ['name', 'currency', 'language', 'timezone'];
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/account', async (req, res) => {
  try {
    // Soft delete - mark as deleted
    await User.findByIdAndUpdate(req.user._id, {
      deletedAt: new Date(),
      isActive: false,
      email: `deleted_${Date.now()}@deleted.com` // Prevent email reuse
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
});

/**
 * @route   GET /api/users/export-data
 * @desc    Export all user data
 * @access  Private
 */
router.get('/export-data', async (req, res) => {
  try {
    const [user, transactions, budgets, goals] = await Promise.all([
      User.findById(req.user._id),
      Transaction.find({ user: req.user._id }).lean(),
      Budget.find({ user: req.user._id }).lean(),
      Goal.find({ user: req.user._id }).lean()
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        currency: user.currency,
        language: user.language,
        timezone: user.timezone,
        createdAt: user.createdAt
      },
      transactions,
      budgets,
      goals
    };

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
});

// Admin-only routes

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { deletedAt: null };
    if (active !== undefined) query.isActive = active === 'true';

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

/**
 * @route   GET /api/users/stats
 * @desc    Get system statistics (Admin only)
 * @access  Private/Admin
 */
router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      todayTransactions
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ isActive: true, deletedAt: null }),
      Transaction.countDocuments(),
      Transaction.countDocuments({
        date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        transactions: {
          total: totalTransactions,
          today: todayTransactions
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

export default router;

