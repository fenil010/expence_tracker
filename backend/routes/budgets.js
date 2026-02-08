/**
 * Budget Routes
 * 
 * CRUD operations for budgets with spending tracking.
 */

import express from 'express';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id })
      .sort({ startDate: -1 })
      .lean();

    // Get spending data for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              type: 'expense',
              date: { $gte: budget.startDate, $lte: budget.endDate },
              ...(budget.category && { category: budget.category })
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const spending = spent[0]?.total || 0;
        return {
          ...budget,
          spent: spending,
          remaining: budget.amount - spending,
          usagePercentage: budget.amount > 0 ? Math.round((spending / budget.amount) * 100) : 0
        };
      })
    );

    res.json({
      success: true,
      data: budgetsWithSpending
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets'
    });
  }
});

/**
 * @route   GET /api/budgets/current
 * @desc    Get current month budget
 * @access  Private
 */
router.get('/current', async (req, res) => {
  try {
    const budget = await Budget.getCurrentMonthlyBudget(req.user._id);
    
    if (!budget) {
      return res.json({
        success: true,
        data: null,
        message: 'No monthly budget set'
      });
    }

    const spent = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: budget.startDate, $lte: budget.endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const spending = spent[0]?.total || 0;
    const remaining = budget.amount - spending;
    const usagePercentage = budget.amount > 0 ? Math.round((spending / budget.amount) * 100) : 0;
    const isOverBudget = spending > budget.amount;

    res.json({
      success: true,
      data: {
        ...budget.toObject(),
        spent: spending,
        remaining,
        usagePercentage,
        isOverBudget,
        alerts: {
          nearLimit: usagePercentage >= budget.alertThreshold && !isOverBudget,
          exceeded: isOverBudget
        }
      }
    });
  } catch (error) {
    console.error('Get current budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget'
    });
  }
});

/**
 * @route   POST /api/budgets
 * @desc    Create budget
 * @access  Private
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').isIn(['monthly', 'category', 'yearly', 'custom']).withMessage('Invalid budget type'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, type, amount, currency, category, startDate, endDate, alertThreshold, color } = req.body;

    const budget = await Budget.create({
      user: req.user._id,
      name,
      type,
      amount,
      currency: currency || 'USD',
      category,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      alertThreshold: alertThreshold || 80,
      color: color || '#5c7cfa'
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating budget'
    });
  }
});

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update budget
 * @access  Private
 */
router.put('/:id', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be positive'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

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
      'name', 'amount', 'currency', 'category', 'startDate',
      'endDate', 'alertThreshold', 'alertEnabled', 'rolloverEnabled',
      'rolloverType', 'rolloverValue', 'status', 'color', 'notes'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          budget[field] = new Date(req.body[field]);
        } else {
          budget[field] = req.body[field];
        }
      }
    });

    await budget.save();

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating budget'
    });
  }
});

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete budget
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting budget'
    });
  }
});

export default router;

