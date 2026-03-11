/**
 * Goal Routes
 * 
 * CRUD for savings goals. Supports paginated contribution history,
 * contributions, and withdrawals via the separate Contribution collection.
 */

import express from 'express';
import mongoose from 'mongoose';
import Goal, { Contribution } from '../models/Goal.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import { body, param, query as queryValidator } from 'express-validator';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/goals
 * @desc    Get all goals with summary
 * @access  Private
 */
router.get('/', [
  queryValidator('status').optional().isIn(['active', 'completed', 'paused', 'cancelled']),
  queryValidator('priority').optional().isIn(['high', 'medium', 'low']),
  queryValidator('sortBy').optional().isIn(['createdAt', 'targetDate', 'priority', 'progressPercentage']),
  validate
], asyncHandler(async (req, res) => {
  const { status, priority, sortBy = 'createdAt' } = req.query;

  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const sort = {};
  sort[sortBy] = sortBy === 'targetDate' ? 1 : -1;

  const goals = await Goal.find(filter).sort(sort).lean();

  // Compute totals
  const totalSavings = goals
    .filter(g => g.status === 'active')
    .reduce((sum, g) => sum + (g.currentAmount || 0), 0);

  const totalTarget = goals
    .filter(g => g.status === 'active')
    .reduce((sum, g) => sum + g.targetAmount, 0);

  res.json({
    success: true,
    data: {
      goals: goals.map(g => ({
        ...g,
        progressPercentage: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
        remainingAmount: Math.max(0, g.targetAmount - g.currentAmount)
      })),
      summary: {
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        totalSavings: Math.round(totalSavings * 100) / 100,
        totalTarget: Math.round(totalTarget * 100) / 100,
        overallProgress: totalTarget > 0 ? Math.round((totalSavings / totalTarget) * 100) : 0
      }
    }
  });
}));

/**
 * @route   GET /api/goals/:id
 * @desc    Get single goal with recent contributions
 * @access  Private
 */
router.get('/:id', [
  param('id').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  // Get recent contributions (last 10)
  const recentContributions = await Contribution.find({ goal: goal._id })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  res.json({
    success: true,
    data: {
      ...goal.toJSON(),
      recentContributions
    }
  });
}));

/**
 * @route   GET /api/goals/:id/contributions
 * @desc    Get paginated contribution history
 * @access  Private
 */
router.get('/:id/contributions', [
  param('id').isMongoId(),
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('type').optional().isIn(['deposit', 'withdrawal']),
  validate
], asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;

  // Verify goal ownership
  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  const filter = { goal: goal._id };
  if (type) filter.type = type;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [contributions, total] = await Promise.all([
    Contribution.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Contribution.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      contributions,
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
 * @route   POST /api/goals
 * @desc    Create new goal
 * @access  Private
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Goal name is required').isLength({ max: 100 }).withMessage('Name max 100 characters'),
  body('targetAmount').isFloat({ min: 1, max: 999999999 }).withMessage('Target amount must be between 1 and 999,999,999'),
  body('category').optional().isIn([
    'emergency', 'vacation', 'purchase', 'investment', 'education',
    'home', 'car', 'wedding', 'retirement', 'other'
  ]),
  body('targetDate').optional().isISO8601(),
  body('priority').optional().isIn(['high', 'medium', 'low']),
  body('description').optional().trim().isLength({ max: 500 }),
  validate
], asyncHandler(async (req, res) => {
  // SECURITY: Whitelist fields — do NOT spread req.body
  const goal = await Goal.create({
    user: req.user._id,
    name: req.body.name,
    description: req.body.description || '',
    targetAmount: parseFloat(req.body.targetAmount),
    targetDate: req.body.targetDate || undefined,
    category: req.body.category || undefined,
    priority: req.body.priority || 'medium',
    color: req.body.color || undefined,
    icon: req.body.icon || undefined,
  });

  res.status(201).json({
    success: true,
    data: goal
  });
}));

/**
 * @route   PUT /api/goals/:id
 * @desc    Update goal
 * @access  Private
 */
router.put('/:id', [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('targetAmount').optional().isFloat({ min: 1 }),
  body('priority').optional().isIn(['high', 'medium', 'low']),
  body('status').optional().isIn(['active', 'completed', 'paused', 'cancelled']),
  validate
], asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  const allowedUpdates = [
    'name', 'description', 'targetAmount', 'targetDate', 'category',
    'priority', 'status', 'color', 'icon', 'monthlyContribution',
    'autoContributeEnabled', 'isFeatured'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      goal[field] = req.body[field];
    }
  });

  // Update milestones if provided — validate each item
  if (req.body.milestones && Array.isArray(req.body.milestones)) {
    const safeMilestones = req.body.milestones.slice(0, 20).map(m => ({
      name: typeof m.name === 'string' ? m.name.slice(0, 100) : '',
      amount: typeof m.amount === 'number' && m.amount >= 0 ? m.amount : 0,
      reached: typeof m.reached === 'boolean' ? m.reached : false,
    }));
    goal.milestones = safeMilestones;
  }

  await goal.save();

  res.json({
    success: true,
    data: goal
  });
}));

/**
 * @route   POST /api/goals/:id/contribute
 * @desc    Add contribution (deposit) to goal
 * @access  Private
 */
router.post('/:id/contribute', [
  param('id').isMongoId(),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('note').optional().trim().isLength({ max: 200 }),
  validate
], asyncHandler(async (req, res) => {
  const { amount, note } = req.body;

  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  if (goal.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Cannot contribute to a non-active goal'
    });
  }

  const updatedGoal = await goal.addContribution(parseFloat(amount), 'deposit', note);

  res.json({
    success: true,
    data: updatedGoal,
    message: goal.isCompleted ? 'Goal completed! 🎉' : 'Contribution added'
  });
}));

/**
 * @route   POST /api/goals/:id/withdraw
 * @desc    Withdraw from goal
 * @access  Private
 */
router.post('/:id/withdraw', [
  param('id').isMongoId(),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('note').optional().trim().isLength({ max: 200 }),
  validate
], asyncHandler(async (req, res) => {
  const { amount, note } = req.body;

  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  if (amount > goal.currentAmount) {
    return res.status(400).json({
      success: false,
      message: 'Withdrawal amount exceeds current savings'
    });
  }

  const updatedGoal = await goal.addContribution(parseFloat(amount), 'withdrawal', note);

  res.json({
    success: true,
    data: updatedGoal,
    message: 'Withdrawal processed'
  });
}));

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete goal and associated contributions
 * @access  Private
 */
router.delete('/:id', [
  param('id').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  // Clean up contributions
  await Contribution.deleteMany({ goal: goal._id });

  res.json({
    success: true,
    message: 'Goal and contributions deleted'
  });
}));

/**
 * @route   DELETE /api/goals/:id/contributions/:contributionId
 * @desc    Delete a specific contribution
 * @access  Private
 */
router.delete('/:id/contributions/:contributionId', [
  param('id').isMongoId(),
  param('contributionId').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: 'Goal not found'
    });
  }

  const contribution = await Contribution.findOneAndDelete({
    _id: req.params.contributionId,
    goal: goal._id
  });

  if (!contribution) {
    return res.status(404).json({
      success: false,
      message: 'Contribution not found'
    });
  }

  // Recalculate totals
  await goal.recalculateAmount();

  res.json({
    success: true,
    data: goal,
    message: 'Contribution removed'
  });
}));

export default router;
