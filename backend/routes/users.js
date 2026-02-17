/**
 * User Routes
 * 
 * Profile management, account deletion, data export,
 * and admin endpoints.
 */

import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import Budget from '../models/Budget.js';
import Goal, { Contribution } from '../models/Goal.js';
import Account from '../models/Account.js';
import { protect, authorize } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import { param } from 'express-validator';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/users/profile
 * @desc    Get full user profile with account summary
 * @access  Private
 */
router.get('/profile', asyncHandler(async (req, res) => {
  const [user, accounts, totalBalance] = await Promise.all([
    User.findById(req.user._id),
    Account.getActiveAccounts(req.user._id),
    Account.getTotalBalance(req.user._id)
  ]);

  res.json({
    success: true,
    data: {
      user: user.toPublicJSON(),
      accounts,
      totalBalance
    }
  });
}));

/**
 * @route   DELETE /api/users/account
 * @desc    Soft delete user account
 * @access  Private
 */
router.delete('/account', asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    deletedAt: new Date(),
    isActive: false,
    $unset: { refreshToken: 1 }
  });

  res.json({
    success: true,
    message: 'Account has been deactivated. Your data will be permanently deleted after 30 days.'
  });
}));

/**
 * @route   GET /api/users/export
 * @desc    Export all user data as JSON
 * @access  Private
 */
router.get('/export', asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [user, transactions, categories, budgets, goals, contributions, accounts] = await Promise.all([
    User.findById(userId),
    Transaction.find({ user: userId }).populate('category', 'name').lean(),
    Category.find({ user: userId }).lean(),
    Budget.find({ user: userId }).lean(),
    Goal.find({ user: userId }).lean(),
    Contribution.find({ user: userId }).lean(),
    Account.find({ user: userId }).lean()
  ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    user: user.toPublicJSON(),
    accounts,
    categories,
    transactions,
    budgets,
    goals,
    contributions
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=expense_data_${Date.now()}.json`);
  res.json(exportData);
}));

// ========================================================================
// ADMIN ROUTES
// ========================================================================

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments({ deletedAt: null })
  ]);

  res.json({
    success: true,
    data: {
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

/**
 * @route   GET /api/users/stats
 * @desc    Platform stats (admin only) — using aggregation
 * @access  Private/Admin
 */
router.get('/stats', authorize('admin'), asyncHandler(async (req, res) => {
  const [userStats, transactionStats] = await Promise.all([
    User.aggregate([
      { $match: { deletedAt: null } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [
            { $match: { isActive: true } },
            { $count: 'count' }
          ],
          newThisMonth: [
            {
              $match: {
                createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]),
    Transaction.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          typeBreakdown: [
            { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
          ]
        }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      users: {
        total: userStats[0]?.total[0]?.count || 0,
        active: userStats[0]?.active[0]?.count || 0,
        newThisMonth: userStats[0]?.newThisMonth[0]?.count || 0
      },
      transactions: {
        total: transactionStats[0]?.total[0]?.count || 0,
        typeBreakdown: transactionStats[0]?.typeBreakdown || []
      }
    }
  });
}));

/**
 * @route   DELETE /api/users/:id
 * @desc    Admin delete user
 * @access  Private/Admin
 */
router.delete('/:id', authorize('admin'), [
  param('id').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account via admin endpoint'
    });
  }

  const user = await User.findByIdAndUpdate(req.params.id, {
    deletedAt: new Date(),
    isActive: false
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User account deactivated'
  });
}));

export default router;
