/**
 * Goals Routes
 * 
 * CRUD operations for savings goals.
 */

import express from 'express';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/goals
 * @desc    Get all goals
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { status, featured } = req.query;
    
    let query = { user: req.user._id };
    if (status) query.status = status;
    if (featured === 'true') query.isFeatured = true;

    const goals = await Goal.find(query).sort({ priority: 1, createdAt: -1 }).lean();

    // Calculate totals
    const totals = await Goal.aggregate([
      { $match: { user: req.user._id, status: 'active' } },
      {
        $group: {
          _id: null,
          totalTarget: { $sum: '$targetAmount' },
          totalCurrent: { $sum: '$currentAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        goals,
        summary: {
          totalGoals: goals.length,
          activeGoals: goals.filter(g => g.status === 'active').length,
          completedGoals: goals.filter(g => g.status === 'completed').length,
          totalTarget: totals[0]?.totalTarget || 0,
          totalSaved: totals[0]?.totalCurrent || 0
        }
      }
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching goals'
    });
  }
});

/**
 * @route   GET /api/goals/:id
 * @desc    Get single goal with progress
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
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

    // Calculate contribution summary
    const contributionSummary = goal.contributions.reduce((acc, c) => {
      const month = c.date.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + c.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        ...goal.toObject(),
        contributionSummary
      }
    });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching goal'
    });
  }
});

/**
 * @route   POST /api/goals
 * @desc    Create new goal
 * @access  Private
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target must be at least 1'),
  body('category').optional().isIn(['emergency', 'vacation', 'purchase', 'investment', 'education', 'home', 'car', 'wedding', 'retirement', 'other']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name, description, targetAmount, currency, targetDate,
      category, priority, color, icon, monthlyContribution, milestones, isFeatured
    } = req.body;

    const goal = await Goal.create({
      user: req.user._id,
      name,
      description,
      targetAmount,
      currency: currency || 'USD',
      targetDate,
      category: category || 'other',
      priority: priority || 'medium',
      color: color || '#34C759',
      icon: icon || '🎯',
      monthlyContribution,
      milestones,
      isFeatured
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating goal'
    });
  }
});

/**
 * @route   PUT /api/goals/:id
 * @desc    Update goal
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
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
      'name', 'description', 'targetAmount', 'targetDate',
      'category', 'priority', 'color', 'icon', 'monthlyContribution',
      'status', 'isFeatured'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    await goal.save();

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating goal'
    });
  }
});

/**
 * @route   POST /api/goals/:id/contribute
 * @desc    Add contribution to goal
 * @access  Private
 */
router.post('/:id/contribute', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

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

    const { amount, note } = req.body;

    goal.contributions.push({
      amount,
      date: new Date(),
      note
    });

    await goal.save();

    res.json({
      success: true,
      data: {
        ...goal.toObject(),
        contributionAmount: amount,
        isCompleted: goal.currentAmount >= goal.targetAmount
      }
    });
  } catch (error) {
    console.error('Add contribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding contribution'
    });
  }
});

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete goal
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
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

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting goal'
    });
  }
});

export default router;

