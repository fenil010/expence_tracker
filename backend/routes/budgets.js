/**
 * Budget Routes
 * 
 * CRUD operations for budgets with duplicate prevention,
 * aggregation-based spending calculation, and budget progress.
 */

import express from 'express';
import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Category from '../models/Category.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import { body, param, query as queryValidator } from 'express-validator';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets with computed spending
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  const budgets = await Budget.getAllWithSpending(req.user._id);

  res.json({
    success: true,
    data: budgets
  });
}));

/**
 * @route   GET /api/budgets/current
 * @desc    Get current monthly budget with spending
 * @access  Private
 */
router.get('/current', asyncHandler(async (req, res) => {
  const budget = await Budget.getCurrentMonthlyBudget(req.user._id);

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'No active monthly budget found'
    });
  }

  const spent = await budget.calculateSpent();
  const budgetData = budget.toJSON();
  budgetData._spent = spent;

  res.json({
    success: true,
    data: {
      ...budgetData,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round((budget.amount + budget.carryOverAmount - spent) * 100) / 100,
      usagePercentage: budget.amount > 0 ? Math.round((spent / (budget.amount + budget.carryOverAmount)) * 100) : 0
    }
  });
}));

/**
 * @route   GET /api/budgets/:id
 * @desc    Get single budget with spending
 * @access  Private
 */
router.get('/:id', [
  param('id').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('category', 'name icon color');

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  const spent = await budget.calculateSpent();

  res.json({
    success: true,
    data: {
      ...budget.toJSON(),
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round((budget.amount + budget.carryOverAmount - spent) * 100) / 100,
      usagePercentage: budget.amount > 0 ? Math.round((spent / (budget.amount + budget.carryOverAmount)) * 100) : 0
    }
  });
}));

/**
 * @route   POST /api/budgets
 * @desc    Create budget (with duplicate check)
 * @access  Private
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Budget name is required'),
  body('type').isIn(['monthly', 'category', 'yearly', 'custom']).withMessage('Invalid budget type'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  validate
], asyncHandler(async (req, res) => {
  const { name, type, amount, startDate, endDate, category, alertThreshold, color, notes } = req.body;

  // Validate date range
  if (new Date(endDate) <= new Date(startDate)) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  // Validate category if provided
  if (category) {
    const cat = await Category.findOne({
      _id: category,
      user: req.user._id,
      isActive: true
    });
    if (!cat) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
  }

  // Check for duplicate budgets
  const existingBudget = await Budget.findOne({
    user: req.user._id,
    type,
    category: category || null,
    status: { $in: ['active', 'paused'] },
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ]
  });

  if (existingBudget) {
    return res.status(409).json({
      success: false,
      message: 'A budget already exists for this period and category'
    });
  }

  const budget = await Budget.create({
    user: req.user._id,
    name,
    type,
    amount,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    category: category || null,
    alertThreshold: alertThreshold || 80,
    color: color || '#5c7cfa',
    notes
  });

  res.status(201).json({
    success: true,
    data: budget
  });
}));

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update budget
 * @access  Private
 */
router.put('/:id', [
  param('id').isMongoId(),
  body('amount').optional().isFloat({ min: 0 }),
  body('category').optional().isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  const allowedUpdates = [
    'name', 'amount', 'category', 'startDate', 'endDate',
    'alertThreshold', 'alertEnabled', 'rolloverEnabled',
    'rolloverType', 'rolloverValue', 'status', 'color', 'notes'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      budget[field] = req.body[field];
    }
  });

  await budget.save();

  res.json({
    success: true,
    data: budget
  });
}));

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete budget
 * @access  Private
 */
router.delete('/:id', [
  param('id').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!budget) {
    return res.status(404).json({
      success: false,
      message: 'Budget not found'
    });
  }

  res.json({
    success: true,
    message: 'Budget deleted successfully'
  });
}));

export default router;
