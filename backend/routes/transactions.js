/**
 * Transaction Routes
 * 
 * CRUD operations for transactions with filtering, search,
 * category ObjectId validation, and atomic account balance updates.
 */

import express from 'express';
import mongoose from 'mongoose';
import withTransaction from '../utils/withTransaction.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import Account from '../models/Account.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import { body, query as queryValidator, param } from 'express-validator';

import { escapeRegex } from '../utils/sanitize.js';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with filtering and pagination
 * @access  Private
 */
router.get('/', [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('type').optional().isIn(['income', 'expense', 'transfer']),
  queryValidator('startDate').optional().isISO8601(),
  queryValidator('endDate').optional().isISO8601(),
  queryValidator('category').optional().isString(),
  queryValidator('account').optional().isMongoId(),
  queryValidator('sortBy').optional().isIn(['date', 'amount', 'createdAt']),
  queryValidator('sortOrder').optional().isIn(['asc', 'desc']),
  queryValidator('search').optional().isString().trim().isLength({ max: 200 }),
  validate
], asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    type,
    startDate,
    endDate,
    category,
    account,
    minAmount,
    maxAmount,
    sortBy = 'date',
    sortOrder = 'desc',
    search,
    status
  } = req.query;

  // Build query
  const filter = { user: req.user._id, isTemplate: { $ne: true } };

  if (type) filter.type = type;
  if (category) {
    // Support both ObjectId and category name
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = new mongoose.Types.ObjectId(category);
    } else {
      // SECURITY: Escape regex special chars to prevent ReDoS injection
      const categoryDoc = await Category.findOne({
        user: req.user._id,
        name: new RegExp(`^${escapeRegex(category)}$`, 'i'),
        isActive: true
      });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        // No matching category, return empty results
        return res.json({
          success: true,
          data: {
            transactions: [],
            pagination: { page: 1, limit: parseInt(limit), total: 0, pages: 0 }
          }
        });
      }
    }
  }
  if (account) filter.account = new mongoose.Types.ObjectId(account);
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = parseFloat(minAmount);
    if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('category', 'name icon color type')
      .populate('account', 'name icon color type')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Transaction.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      transactions,
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
 * @route   GET /api/transactions/summary
 * @desc    Get transaction summary for a period (using aggregation)
 * @access  Private
 */
router.get('/summary', [
  queryValidator('startDate').optional().isISO8601(),
  queryValidator('endDate').optional().isISO8601(),
  validate
], asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [totals, categoryBreakdown] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: start, $lte: end },
          isTemplate: { $ne: true },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]),
    Transaction.getCategoryTotals(req.user._id, start, end)
  ]);

  const summary = { income: 0, expenses: 0, net: 0, transactionCount: 0 };
  totals.forEach(t => {
    if (t._id === 'income') summary.income = t.total;
    else if (t._id === 'expense') summary.expenses = t.total;
    summary.transactionCount += t.count;
  });
  summary.net = summary.income - summary.expenses;

  res.json({
    success: true,
    data: {
      summary,
      categoryBreakdown,
      period: { start, end }
    }
  });
}));

/**
 * @route   GET /api/transactions/stats
 * @desc    Quick stats without loading all docs
 * @access  Private
 */
router.get('/stats', [
  queryValidator('startDate').optional().isISO8601(),
  queryValidator('endDate').optional().isISO8601(),
  validate
], asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const stats = await Transaction.getQuickStats(req.user._id, start, end);

  res.json({
    success: true,
    data: stats
  });
}));

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction
 * @access  Private
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  validate
], asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id
  })
    .populate('category', 'name icon color type')
    .populate('account', 'name icon color type');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.json({ success: true, data: transaction });
}));

/**
 * @route   POST /api/transactions
 * @desc    Create new transaction with atomic account balance update
 * @access  Private
 */
router.post('/', [
  body('type').isIn(['income', 'expense', 'transfer']).withMessage('Invalid transaction type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('account').optional().isMongoId().withMessage('Valid account ID is required'),
  body('toAccount').optional().isMongoId().withMessage('Valid destination account ID is required'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('date').optional().isISO8601(),
  validate
], asyncHandler(async (req, res) => {
  // Verify category belongs to user
  const category = await Category.findOne({
    _id: req.body.category,
    user: req.user._id,
    isActive: true
  });
  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category'
    });
  }

  // Verify account if provided
  if (req.body.account) {
    const account = await Account.findOne({
      _id: req.body.account,
      user: req.user._id,
      isActive: true
    });
    if (!account) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account'
      });
    }
  }

  // Use DB session for atomicity (graceful fallback on standalone MongoDB)
  const transaction = await withTransaction(async (session) => {
    const opts = session ? { session } : {};
    // SECURITY: Whitelist fields — do NOT spread req.body to prevent mass assignment
    const txData = {
      type: req.body.type,
      amount: parseFloat(req.body.amount),
      category: req.body.category,
      account: req.body.account || undefined,
      toAccount: req.body.toAccount || undefined,
      description: req.body.description || '',
      date: req.body.date || new Date(),
      paymentMethod: req.body.paymentMethod || undefined,
      merchant: req.body.merchant || undefined,
      notes: req.body.notes || undefined,
      tags: Array.isArray(req.body.tags) ? req.body.tags.slice(0, 10) : undefined,
      user: req.user._id,
    };
    const [tx] = await Transaction.create([txData], opts);

    // Update account balance
    if (req.body.account) {
      const balanceChange = req.body.type === 'income'
        ? parseFloat(req.body.amount)
        : -parseFloat(req.body.amount);

      await Account.findByIdAndUpdate(
        req.body.account,
        { $inc: { balance: balanceChange } },
        opts
      );

      // For transfers, update destination account
      if (req.body.type === 'transfer' && req.body.toAccount) {
        await Account.findByIdAndUpdate(
          req.body.toAccount,
          { $inc: { balance: parseFloat(req.body.amount) } },
          opts
        );
      }
    }

    // Increment category transaction count
    await Category.incrementTransactionCount(req.body.category);

    return tx;
  });

  // Populate for response
  const populated = await Transaction.findById(transaction._id)
    .populate('category', 'name icon color type')
    .populate('account', 'name icon color type');

  res.status(201).json({
    success: true,
    data: populated
  });
}));

/**
 * @route   POST /api/transactions/bulk
 * @desc    Bulk create transactions (for import)
 * @access  Private
 */
router.post('/bulk', [
  body('transactions').isArray({ min: 1, max: 100 }).withMessage('Provide 1-100 transactions'),
  body('transactions.*.type').isIn(['income', 'expense']),
  body('transactions.*.amount').isFloat({ min: 0.01 }),
  body('transactions.*.category').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const { transactions: txList } = req.body;

  // SECURITY: Whitelist fields per transaction — do NOT spread tx
  const allowedBulkFields = ['type', 'amount', 'category', 'account', 'description', 'date', 'merchant', 'paymentMethod'];
  const docs = txList.map(tx => {
    const clean = { user: req.user._id };
    allowedBulkFields.forEach(f => { if (tx[f] !== undefined) clean[f] = tx[f]; });
    return clean;
  });

  const created = await Transaction.insertMany(docs);

  res.status(201).json({
    success: true,
    data: {
      count: created.length,
      transactions: created
    }
  });
}));

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Private
 */
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  body('type').optional().isIn(['income', 'expense', 'transfer']),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('category').optional().isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Validate category if being updated
  if (req.body.category) {
    const category = await Category.findOne({
      _id: req.body.category,
      user: req.user._id,
      isActive: true
    });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
  }

  await withTransaction(async (session) => {
    const opts = session ? { session } : {};

    // Reverse old account balance if amount/type changed and account exists
    if (transaction.account && (req.body.amount || req.body.type)) {
      const oldBalanceChange = transaction.type === 'income'
        ? -transaction.amount
        : transaction.amount;
      await Account.findByIdAndUpdate(
        transaction.account,
        { $inc: { balance: oldBalanceChange } },
        opts
      );
    }

    // Apply updates
    const allowedUpdates = [
      'type', 'amount', 'category', 'account', 'toAccount', 'description',
      'notes', 'tags', 'date', 'paymentMethod', 'merchant',
      'location', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        transaction[field] = req.body[field];
      }
    });

    await transaction.save(opts);

    // Apply new account balance
    if (transaction.account && (req.body.amount || req.body.type)) {
      const newBalanceChange = transaction.type === 'income'
        ? transaction.amount
        : -transaction.amount;
      await Account.findByIdAndUpdate(
        transaction.account,
        { $inc: { balance: newBalanceChange } },
        opts
      );
    }
  });

  const populated = await Transaction.findById(transaction._id)
    .populate('category', 'name icon color type')
    .populate('account', 'name icon color type');

  res.json({ success: true, data: populated });
}));

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction with account balance reversal
 * @access  Private
 */
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  validate
], asyncHandler(async (req, res) => {
  const result = await withTransaction(async (session) => {
    const opts = session ? { session } : {};
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    }, opts);

    if (!transaction) {
      return null;
    }

    // Reverse account balance
    if (transaction.account) {
      const reversal = transaction.type === 'income'
        ? -transaction.amount
        : transaction.amount;
      await Account.findByIdAndUpdate(
        transaction.account,
        { $inc: { balance: reversal } },
        opts
      );
    }

    // Decrement category count
    if (transaction.category) {
      await Category.incrementTransactionCount(transaction.category, -1);
    }

    return transaction;
  });

  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.json({
    success: true,
    message: 'Transaction deleted successfully'
  });
}));

/**
 * @route   POST /api/transactions/bulk-delete
 * @desc    Delete multiple transactions (POST for reliable body support)
 * @access  Private
 */
router.post('/bulk-delete', [
  body('ids').isArray({ min: 1 }).withMessage('IDs array is required'),
  body('ids.*').isMongoId().withMessage('Each ID must be valid'),
  validate
], asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const result = await Transaction.deleteMany({
    _id: { $in: ids },
    user: req.user._id
  });

  res.json({
    success: true,
    message: `${result.deletedCount} transactions deleted`
  });
}));

/**
 * @route   DELETE /api/transactions
 * @desc    Delete multiple transactions (legacy - kept for backward compat)
 * @access  Private
 */
router.delete('/', [
  body('ids').isArray({ min: 1 }).withMessage('IDs array is required'),
  body('ids.*').isMongoId().withMessage('Each ID must be valid'),
  validate
], asyncHandler(async (req, res) => {
  const { ids } = req.body;

  const result = await Transaction.deleteMany({
    _id: { $in: ids },
    user: req.user._id
  });

  res.json({
    success: true,
    message: `${result.deletedCount} transactions deleted`
  });
}));

export default router;
