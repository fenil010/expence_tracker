/**
 * AI Routes
 *
 * Lightweight AI-style endpoints for insights, predictions,
 * natural language spend queries, and receipt text parsing.
 */

import express from 'express';
import mongoose from 'mongoose';
import { body, query as queryValidator } from 'express-validator';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';

const router = express.Router();

router.use(protect);

function parsePeriod(period = 'last_month') {
  const now = new Date();
  let start;
  let end;

  switch (period) {
    case 'this_week': {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      break;
    }
    case 'this_month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date();
      break;
    }
    case 'last_30_days': {
      start = new Date(now);
      start.setDate(now.getDate() - 30);
      end = new Date();
      break;
    }
    case 'last_month':
    default: {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    }
  }

  return { start, end };
}

function detectPeriodFromPrompt(prompt = '') {
  const text = prompt.toLowerCase();
  if (text.includes('this week')) return 'this_week';
  if (text.includes('this month')) return 'this_month';
  if (text.includes('last 30')) return 'last_30_days';
  return 'last_month';
}

function detectMerchantFromPrompt(prompt = '') {
  const text = prompt.toLowerCase();
  const tokens = ['swiggy', 'zomato', 'uber', 'ola', 'netflix', 'spotify', 'amazon'];
  return tokens.find((token) => text.includes(token)) || null;
}

/**
 * @route   POST /api/ai/chat
 * @desc    Ask natural-language spend questions
 * @access  Private
 */
router.post('/chat', [
  body('prompt').isString().trim().isLength({ min: 3, max: 1000 }),
  validate
], asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  const period = detectPeriodFromPrompt(prompt);
  const merchant = detectMerchantFromPrompt(prompt);
  const { start, end } = parsePeriod(period);

  const filter = {
    user: req.user._id,
    type: 'expense',
    date: { $gte: start, $lte: end },
    isTemplate: { $ne: true },
    status: { $ne: 'cancelled' },
  };

  if (merchant) {
    filter.$or = [
      { merchant: new RegExp(merchant, 'i') },
      { description: new RegExp(merchant, 'i') },
      { notes: new RegExp(merchant, 'i') },
    ];
  }

  const stats = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: '$amountInBaseCurrency' },
        count: { $sum: 1 },
        avg: { $avg: '$amountInBaseCurrency' }
      }
    }
  ]);

  const total = stats[0]?.total || 0;
  const count = stats[0]?.count || 0;
  const avg = stats[0]?.avg || 0;

  const answer = merchant
    ? `You spent ${total.toFixed(2)} on ${merchant} in ${period.replaceAll('_', ' ')} across ${count} transactions (avg ${avg.toFixed(2)}).`
    : `Your total spending in ${period.replaceAll('_', ' ')} is ${total.toFixed(2)} across ${count} transactions (avg ${avg.toFixed(2)}).`;

  res.json({
    success: true,
    data: {
      prompt,
      answer,
      period,
      merchant,
      metrics: { total, count, avg }
    }
  });
}));

/**
 * @route   GET /api/ai/predictions
 * @desc    Predict next-month expenses using weighted average trend
 * @access  Private
 */
router.get('/predictions', [
  queryValidator('months').optional().isInt({ min: 3, max: 18 }),
  validate
], asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months || '6', 10);
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const start = new Date();
  start.setMonth(start.getMonth() - months);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const monthly = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: 'expense',
        date: { $gte: start },
        isTemplate: { $ne: true },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amountInBaseCurrency' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const values = monthly.map((m) => m.total);
  let predicted = 0;

  if (values.length === 0) {
    predicted = 0;
  } else if (values.length === 1) {
    predicted = values[0];
  } else {
    // Weighted average with recency bias.
    const weightSum = values.reduce((sum, _, idx) => sum + (idx + 1), 0);
    const weighted = values.reduce((sum, value, idx) => sum + value * (idx + 1), 0);
    predicted = weighted / weightSum;
  }

  const latest = values[values.length - 1] || 0;
  const deltaPct = latest > 0 ? ((predicted - latest) / latest) * 100 : 0;

  res.json({
    success: true,
    data: {
      monthsAnalyzed: values.length,
      history: monthly,
      predictedNextMonthExpense: Math.round(predicted * 100) / 100,
      changeVsLatestPercent: Math.round(deltaPct)
    }
  });
}));

/**
 * @route   POST /api/ai/categorize
 * @desc    Auto-categorize by matching user history + keyword fallback
 * @access  Private
 */
router.post('/categorize', [
  body('description').optional().isString().isLength({ max: 500 }),
  body('merchant').optional().isString().isLength({ max: 200 }),
  validate
], asyncHandler(async (req, res) => {
  const description = (req.body.description || '').toLowerCase();
  const merchant = (req.body.merchant || '').toLowerCase();
  const signal = `${description} ${merchant}`.trim();

  if (!signal) {
    return res.status(400).json({ success: false, message: 'description or merchant is required' });
  }

  // 1) Exact merchant match from user history.
  const historyMatch = await Transaction.findOne({
    user: req.user._id,
    type: 'expense',
    merchant: new RegExp(`^${merchant}$`, 'i'),
    category: { $ne: null }
  }).sort({ createdAt: -1 }).populate('category', 'name _id');

  if (historyMatch?.category) {
    return res.json({
      success: true,
      data: {
        categoryId: historyMatch.category._id,
        categoryName: historyMatch.category.name,
        confidence: 0.95,
        source: 'history'
      }
    });
  }

  // 2) Keyword fallback.
  const keywordMap = [
    { words: ['swiggy', 'zomato', 'restaurant', 'food', 'dining'], category: 'Food' },
    { words: ['uber', 'ola', 'fuel', 'petrol', 'metro', 'taxi'], category: 'Transport' },
    { words: ['netflix', 'spotify', 'prime', 'subscription'], category: 'Entertainment' },
    { words: ['rent', 'landlord'], category: 'Rent' },
    { words: ['electricity', 'water', 'internet', 'wifi', 'bill'], category: 'Utilities' },
    { words: ['amazon', 'flipkart', 'shopping'], category: 'Shopping' },
  ];

  const categoryName = keywordMap.find((item) => item.words.some((w) => signal.includes(w)))?.category || 'Other';
  const categoryDoc = await Category.findOne({ user: req.user._id, name: new RegExp(`^${categoryName}$`, 'i'), isActive: true });

  res.json({
    success: true,
    data: {
      categoryId: categoryDoc?._id || null,
      categoryName,
      confidence: categoryDoc ? 0.78 : 0.55,
      source: categoryDoc ? 'keyword+user-category' : 'keyword'
    }
  });
}));

/**
 * @route   POST /api/ai/receipt/parse
 * @desc    Parse OCR text into merchant/date/amount fields
 * @access  Private
 */
router.post('/receipt/parse', [
  body('rawText').isString().isLength({ min: 5, max: 20000 }),
  validate
], asyncHandler(async (req, res) => {
  const text = req.body.rawText;

  // Amount candidates: 1,234.56 / 1234.56 / 1234
  const amountMatches = [...text.matchAll(/(?:rs\.?|inr\.?|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})|[0-9]+(?:\.[0-9]{1,2})?)/gi)]
    .map((m) => parseFloat(String(m[1]).replace(/,/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);

  const amount = amountMatches.length ? Math.max(...amountMatches) : null;

  // Date candidates: dd/mm/yyyy, yyyy-mm-dd, dd-mm-yy
  const dateMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/);
  const parsedDate = dateMatch ? new Date(dateMatch[1]) : null;

  // Merchant heuristic: first non-empty line with letters.
  const merchant = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^[a-z0-9 .,&'\-]{3,}$/i.test(line)) || null;

  res.json({
    success: true,
    data: {
      merchant,
      amount,
      date: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null,
      rawTextPreview: text.slice(0, 500)
    }
  });
}));

export default router;
