/**
 * Reports Routes
 * 
 * Dashboard, monthly, yearly, trends, and CSV export.
 * Uses MongoDB aggregation pipelines instead of loading all docs into memory.
 */

import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import Account from '../models/Account.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import { query as queryValidator } from 'express-validator';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/reports/insights
 * @desc    Heuristic insights (AI-style) for spending
 * @access  Private
 */
router.get('/insights', asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    categoryBreakdown,
    currentStats,
    lastStats,
    topExpense,
    topMerchant,
    monthlyBudget
  ] = await Promise.all([
    Transaction.getCategoryTotals(userId, startOfMonth, endOfMonth),
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth }, type: 'expense', isTemplate: { $ne: true }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$amountInBaseCurrency' }, count: { $sum: 1 } } }
    ]),
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth }, type: 'expense', isTemplate: { $ne: true }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$amountInBaseCurrency' }, count: { $sum: 1 } } }
    ]),
    Transaction.find({ user: userId, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth }, status: { $ne: 'cancelled' }, isTemplate: { $ne: true } })
      .sort({ amountInBaseCurrency: -1 })
      .limit(1)
      .lean(),
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth }, type: 'expense', merchant: { $ne: '' }, isTemplate: { $ne: true }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$merchant', total: { $sum: '$amountInBaseCurrency' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]),
    Budget.getCurrentMonthlyBudget(userId)
  ]);

  const currentExpense = currentStats[0]?.total || 0;
  const lastExpense = lastStats[0]?.total || 0;
  const changePct = lastExpense > 0 ? Math.round(((currentExpense - lastExpense) / lastExpense) * 100) : 0;

  const insights = [];

  const topCategory = categoryBreakdown?.[0];
  if (topCategory) {
    insights.push({
      id: 'top-category',
      type: 'category',
      title: `Top category: ${topCategory.categoryName}`,
      description: `This category accounts for ${Math.round((topCategory.total / (currentExpense || 1)) * 100)}% of your monthly spend.`,
      severity: 'info',
      data: topCategory
    });
  }

  if (currentExpense > 0) {
    const direction = changePct >= 0 ? 'up' : 'down';
    const absChange = Math.abs(changePct);
    const severity = absChange >= 25 ? 'warning' : 'info';
    insights.push({
      id: 'month-change',
      type: 'trend',
      title: `Spending is ${direction} ${absChange}%`,
      description: `Compared to last month, your expenses are ${direction} ${absChange}%.`,
      severity,
      data: { changePct }
    });
  }

  if (topExpense?.[0]) {
    insights.push({
      id: 'largest-expense',
      type: 'transaction',
      title: 'Largest expense this month',
      description: `${topExpense[0].description || 'Expense'}: ${topExpense[0].amountInBaseCurrency}`,
      severity: 'info',
      data: topExpense[0]
    });
  }

  if (topMerchant?.[0]) {
    insights.push({
      id: 'top-merchant',
      type: 'merchant',
      title: `Top merchant: ${topMerchant[0]._id}`,
      description: `You spent ${topMerchant[0].total} across ${topMerchant[0].count} transactions.`,
      severity: 'info',
      data: topMerchant[0]
    });
  }

  if (monthlyBudget) {
    const spent = await monthlyBudget.calculateSpent();
    const usage = monthlyBudget.amount > 0 ? Math.round((spent / monthlyBudget.amount) * 100) : 0;
    if (usage >= 80) {
      insights.push({
        id: 'budget-risk',
        type: 'budget',
        title: 'Budget nearing limit',
        description: `You have used ${usage}% of your monthly budget.`,
        severity: usage >= 100 ? 'critical' : 'warning',
        data: { usage }
      });
    }
  }

  res.json({ success: true, data: { insights } });
}));

/**
 * @route   GET /api/reports/dashboard
 * @desc    Dashboard summary using aggregation — NOT loading all transactions
 * @access  Private
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    currentMonthStats,
    lastMonthStats,
    categoryBreakdown,
    monthlyBudget,
    activeGoals,
    totalBalance,
    recentTransactions
  ] = await Promise.all([
    // Current month — aggregation instead of fetching all docs
    Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          isTemplate: { $ne: true },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amountInBaseCurrency' },
          count: { $sum: 1 }
        }
      }
    ]),

    // Last month stats
    Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          isTemplate: { $ne: true },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amountInBaseCurrency' },
          count: { $sum: 1 }
        }
      }
    ]),

    // Category breakdown (current month)
    Transaction.getCategoryTotals(userId, startOfMonth, endOfMonth),

    // Budget
    Budget.getCurrentMonthlyBudget(userId),

    // Goals
    Goal.getActiveGoals(userId),

    // Total balance across accounts
    Account.getTotalBalance(userId),

    // 5 most recent transactions
    Transaction.find({ user: userId, isTemplate: { $ne: true } })
      .populate('category', 'name icon color')
      .populate('account', 'name icon')
      .sort({ date: -1 })
      .limit(5)
      .lean()
  ]);

  // Parse aggregation results
  const parseStats = (stats) => {
    const result = { income: 0, expenses: 0, count: 0 };
    stats.forEach(s => {
      if (s._id === 'income') result.income = s.total;
      else if (s._id === 'expense') result.expenses = s.total;
      result.count += s.count;
    });
    result.net = result.income - result.expenses;
    return result;
  };

  const current = parseStats(currentMonthStats);
  const last = parseStats(lastMonthStats);

  // Compute month-over-month change
  const expenseChange = last.expenses > 0
    ? Math.round(((current.expenses - last.expenses) / last.expenses) * 100)
    : 0;

  const incomeChange = last.income > 0
    ? Math.round(((current.income - last.income) / last.income) * 100)
    : 0;

  // Budget info
  let budgetInfo = null;
  if (monthlyBudget) {
    const spent = await monthlyBudget.calculateSpent();
    budgetInfo = {
      amount: monthlyBudget.amount,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round((monthlyBudget.amount - spent) * 100) / 100,
      usagePercentage: monthlyBudget.amount > 0 ? Math.round((spent / monthlyBudget.amount) * 100) : 0
    };
  }

  res.json({
    success: true,
    data: {
      currentMonth: {
        income: Math.round(current.income * 100) / 100,
        expenses: Math.round(current.expenses * 100) / 100,
        net: Math.round(current.net * 100) / 100,
        transactionCount: current.count
      },
      comparison: {
        expenseChange,
        incomeChange,
        lastMonth: {
          income: Math.round(last.income * 100) / 100,
          expenses: Math.round(last.expenses * 100) / 100
        }
      },
      categoryBreakdown: categoryBreakdown.slice(0, 6),
      budget: budgetInfo,
      goals: {
        active: activeGoals.length,
        totalSaved: activeGoals.reduce((s, g) => s + g.currentAmount, 0),
        totalTarget: activeGoals.reduce((s, g) => s + g.targetAmount, 0)
      },
      totalBalance: Math.round(totalBalance * 100) / 100,
      recentTransactions
    }
  });
}));

/**
 * @route   GET /api/reports/monthly
 * @desc    Monthly report with aggregation pipeline
 * @access  Private
 */
router.get('/monthly', [
  queryValidator('month').optional().isInt({ min: 1, max: 12 }),
  queryValidator('year').optional().isInt({ min: 2020 }),
  validate
], asyncHandler(async (req, res) => {
  const now = new Date();
  const month = parseInt(req.query.month) || (now.getMonth() + 1);
  const year = parseInt(req.query.year) || now.getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const userId = new mongoose.Types.ObjectId(req.user._id);

  // Use $facet to run parallel aggregations in one pipeline
  const [report] = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate },
        isTemplate: { $ne: true },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $facet: {
        // Income vs Expense totals
        totals: [
          { $group: { _id: '$type', total: { $sum: '$amountInBaseCurrency' }, count: { $sum: 1 } } }
        ],
        // Category breakdown
        byCategory: [
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'cat'
            }
          },
          { $unwind: '$cat' },
          {
            $group: {
              _id: { category: '$category', type: '$type' },
              name: { $first: '$cat.name' },
              icon: { $first: '$cat.icon' },
              color: { $first: '$cat.color' },
              total: { $sum: '$amountInBaseCurrency' },
              count: { $sum: 1 }
            }
          },
          { $sort: { total: -1 } }
        ],
        // Daily trend
        dailyTrend: [
          {
            $group: {
              _id: { day: { $dayOfMonth: '$date' }, type: '$type' },
              total: { $sum: '$amountInBaseCurrency' }
            }
          },
          { $sort: { '_id.day': 1 } }
        ],
        // Top merchants
        topMerchants: [
          { $match: { merchant: { $ne: '' } } },
          {
            $group: {
              _id: '$merchant',
              total: { $sum: '$amountInBaseCurrency' },
              count: { $sum: 1 }
            }
          },
          { $sort: { total: -1 } },
          { $limit: 10 }
        ]
      }
    }
  ]);

  // Parse totals
  const summary = { income: 0, expenses: 0 };
  (report?.totals || []).forEach(t => {
    if (t._id === 'income') summary.income = t.total;
    else if (t._id === 'expense') summary.expenses = t.total;
  });
  summary.net = summary.income - summary.expenses;
  summary.savingsRate = summary.income > 0
    ? Math.round(((summary.income - summary.expenses) / summary.income) * 100)
    : 0;

  // Build daily trend array
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyTrend = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayData = { day: d, income: 0, expense: 0 };
    (report?.dailyTrend || []).forEach(dt => {
      if (dt._id.day === d) {
        dayData[dt._id.type] = dt.total;
      }
    });
    dailyTrend.push(dayData);
  }

  res.json({
    success: true,
    data: {
      period: { month, year, startDate, endDate },
      summary,
      categoryBreakdown: report?.byCategory || [],
      dailyTrend,
      topMerchants: report?.topMerchants || []
    }
  });
}));

/**
 * @route   GET /api/reports/yearly
 * @desc    Yearly report with monthly breakdown
 * @access  Private
 */
router.get('/yearly', [
  queryValidator('year').optional().isInt({ min: 2020 }),
  validate
], asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const userId = new mongoose.Types.ObjectId(req.user._id);

  const [report] = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startDate, $lte: endDate },
        isTemplate: { $ne: true },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $facet: {
        totals: [
          { $group: { _id: '$type', total: { $sum: '$amountInBaseCurrency' }, count: { $sum: 1 } } }
        ],
        monthly: [
          {
            $group: {
              _id: { month: { $month: '$date' }, type: '$type' },
              total: { $sum: '$amountInBaseCurrency' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.month': 1 } }
        ],
        byCategory: [
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'cat'
            }
          },
          { $unwind: '$cat' },
          {
            $group: {
              _id: '$category',
              name: { $first: '$cat.name' },
              icon: { $first: '$cat.icon' },
              color: { $first: '$cat.color' },
              total: { $sum: '$amountInBaseCurrency' },
              count: { $sum: 1 }
            }
          },
          { $sort: { total: -1 } }
        ]
      }
    }
  ]);

  // Parse totals
  const summary = { income: 0, expenses: 0 };
  (report?.totals || []).forEach(t => {
    if (t._id === 'income') summary.income = t.total;
    else if (t._id === 'expense') summary.expenses = t.total;
  });
  summary.net = summary.income - summary.expenses;

  // Build monthly breakdown
  const monthlyBreakdown = [];
  for (let m = 1; m <= 12; m++) {
    const monthData = { month: m, income: 0, expense: 0, net: 0 };
    (report?.monthly || []).forEach(md => {
      if (md._id.month === m) {
        monthData[md._id.type] = md.total;
      }
    });
    monthData.net = monthData.income - monthData.expense;
    monthlyBreakdown.push(monthData);
  }

  res.json({
    success: true,
    data: {
      year,
      summary,
      monthlyBreakdown,
      categoryBreakdown: report?.byCategory || []
    }
  });
}));

/**
 * @route   GET /api/reports/trends
 * @desc    Spending trends over N months
 * @access  Private
 */
router.get('/trends', [
  queryValidator('months').optional().isInt({ min: 1, max: 24 }),
  validate
], asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 6;
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const trend = await Transaction.getMonthlyTrend(userId, months);

  // Organize by month
  const monthMap = {};
  trend.forEach(t => {
    const key = `${t._id.year}-${t._id.month}`;
    if (!monthMap[key]) {
      monthMap[key] = { year: t._id.year, month: t._id.month, income: 0, expense: 0 };
    }
    monthMap[key][t._id.type] = t.total;
  });

  const trendData = Object.values(monthMap)
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map(m => ({
      ...m,
      net: m.income - m.expense,
      savingsRate: m.income > 0 ? Math.round(((m.income - m.expense) / m.income) * 100) : 0
    }));

  res.json({
    success: true,
    data: {
      months,
      trends: trendData
    }
  });
}));

/**
 * @route   GET /api/reports/export/csv
 * @desc    Export transactions as CSV
 * @access  Private
 */
router.get('/export/csv', [
  queryValidator('startDate').optional().isISO8601(),
  queryValidator('endDate').optional().isISO8601(),
  queryValidator('type').optional().isIn(['income', 'expense']),
  validate
], asyncHandler(async (req, res) => {
  const { startDate, endDate, type } = req.query;

  const filter = { user: req.user._id, isTemplate: { $ne: true } };
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter)
    .populate('category', 'name')
    .populate('account', 'name')
    .sort({ date: -1 })
    .lean();

  // Build CSV
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Merchant', 'Account', 'Status'];
  const rows = transactions.map(t => [
    new Date(t.date).toISOString().split('T')[0],
    t.type,
    t.category?.name || 'Uncategorized',
    t.amount.toFixed(2),
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.merchant || '').replace(/"/g, '""')}"`,
    t.account?.name || '',
    t.status
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
  res.send(csv);
}));

export default router;
