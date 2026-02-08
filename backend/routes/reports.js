/**
 * Reports Routes
 * 
 * Financial reports and export functionality.
 */

import express from 'express';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Get dashboard summary data
 * @access  Private
 */
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      currentMonthTransactions,
      lastMonthTransactions,
      monthlyBudget,
      activeGoals
    ] = await Promise.all([
      Transaction.find({
        user: req.user._id,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      }).lean(),
      Transaction.find({
        user: req.user._id,
        date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }).lean(),
      Budget.getCurrentMonthlyBudget(req.user._id),
      Goal.getActiveGoals(req.user._id)
    ]);

    // Calculate current month totals
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate last month totals
    const lastIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const lastExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    // Recent transactions
    const recentTransactions = currentMonthTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        summary: {
          balance: req.user.balance || 0,
          currentMonth: {
            income: currentIncome,
            expenses: currentExpenses,
            savings: currentIncome - currentExpenses,
            transactionCount: currentMonthTransactions.length
          },
          lastMonth: {
            income: lastIncome,
            expenses: lastExpenses,
            savings: lastIncome - lastExpenses
          }
        },
        budget: monthlyBudget ? {
          allocated: monthlyBudget.amount,
          spent: currentExpenses,
          remaining: monthlyBudget.amount - currentExpenses,
          usagePercentage: Math.round((currentExpenses / monthlyBudget.amount) * 100)
        } : null,
        goals: {
          active: activeGoals.length,
          totalSaved: activeGoals.reduce((sum, g) => sum + g.currentAmount, 0),
          totalTarget: activeGoals.reduce((sum, g) => sum + g.targetAmount, 0)
        },
        categoryBreakdown,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

/**
 * @route   GET /api/reports/monthly
 * @desc    Get monthly report
 * @access  Private
 */
router.get('/monthly', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 }).lean();

    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { total: 0, count: 0, transactions: [] };
        }
        acc[t.category].total += t.amount;
        acc[t.category].count += 1;
        return acc;
      }, {});

    // Daily spending trend
    const dailyTrend = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const day = new Date(t.date).getDate();
        acc[day] = (acc[day] || 0) + t.amount;
        return acc;
      }, {});

    res.json({
      success: true,
      data: {
        period: {
          year: parseInt(year),
          month: parseInt(month),
          startDate,
          endDate
        },
        summary: {
          income,
          expenses,
          net: income - expenses,
          transactionCount: transactions.length,
          averageDaily: expenses / endDate.getDate()
        },
        expensesByCategory: Object.entries(expensesByCategory).map(([category, data]) => ({
          category,
          total: data.total,
          count: data.count,
          percentage: expenses > 0 ? Math.round((data.total / expenses) * 100) : 0
        })).sort((a, b) => b.total - a.total),
        dailyTrend,
        topTransactions: transactions
          .filter(t => t.type === 'expense')
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly report'
    });
  }
});

/**
 * @route   GET /api/reports/yearly
 * @desc    Get yearly report
 * @access  Private
 */
router.get('/yearly', async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(parseInt(year), 0, 1);
    const endDate = new Date(parseInt(year), 11, 31);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    // Monthly breakdown
    const monthlyData = {};
    for (let i = 0; i < 12; i++) {
      monthlyData[i + 1] = { income: 0, expenses: 0, net: 0 };
    }

    transactions.forEach(t => {
      const month = new Date(t.date).getMonth() + 1;
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expenses += t.amount;
      }
      monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
    });

    // Annual totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown for year
    const categoryBreakdown = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        summary: {
          income,
          expenses,
          net: income - expenses,
          transactionCount: transactions.length,
          averageMonthly: expenses / 12
        },
        monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
          month: parseInt(month),
          ...data
        })),
        categoryBreakdown: Object.entries(categoryBreakdown)
          .map(([category, total]) => ({ category, total }))
          .sort((a, b) => b.total - a.total)
      }
    });
  } catch (error) {
    console.error('Get yearly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching yearly report'
    });
  }
});

/**
 * @route   GET /api/reports/trends
 * @desc    Get spending trends
 * @access  Private
 */
router.get('/trends', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const monthCount = parseInt(months);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthCount + 1, 1);

    const trendData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format for chart
    const formatted = {};
    let current = new Date(startDate);
    while (current <= now) {
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      formatted[key] = { month: key, income: 0, expenses: 0, net: 0 };
      current.setMonth(current.getMonth() + 1);
    }

    trendData.forEach(d => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, '0')}`;
      if (formatted[key]) {
        if (d._id.type === 'income') {
          formatted[key].income = d.total;
        } else {
          formatted[key].expenses = d.total;
        }
        formatted[key].net = formatted[key].income - formatted[key].expenses;
      }
    });

    res.json({
      success: true,
      data: {
        trends: Object.values(formatted),
        period: { start: startDate, end: now }
      }
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trends'
    });
  }
});

/**
 * @route   GET /api/reports/export/csv
 * @desc    Export transactions as CSV
 * @access  Private
 */
router.get('/export/csv', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const query = { user: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;

    const transactions = await Transaction.find(query).sort({ date: -1 }).lean();

    // Build CSV
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Merchant', 'Tags'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.amount,
      `"${t.description || ''}"`,
      `"${t.merchant || ''}"`,
      `"${(t.tags || []).join(', ')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
});

export default router;

