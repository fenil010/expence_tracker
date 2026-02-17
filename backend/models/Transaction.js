/**
 * Transaction Model
 * 
 * Defines the transaction schema for income, expense, and transfer entries.
 * Uses ObjectId refs for category and account for referential integrity.
 */

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Transaction type
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'],
    required: [true, 'Transaction type is required']
  },

  // Amount (always positive, type determines sign)
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    get: v => Math.round(v * 100) / 100,
    set: v => Math.round(v * 100) / 100
  },

  // Currency
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },

  // Exchange rate to base currency (for multi-currency support)
  exchangeRate: {
    type: Number,
    default: 1.0
  },

  // Amount in base currency (for reporting)
  amountInBaseCurrency: {
    type: Number,
    default: 0
  },

  // Category — ObjectId reference for referential integrity
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },

  // Account — which wallet/account this transaction belongs to
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null
  },

  // For transfers — the destination account
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null
  },

  // Description
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },

  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: ''
  },

  // Tags
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],

  // Date
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },

  // Recurring rule reference (replaces inline recurring fields)
  recurringRule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringRule',
    default: null
  },

  // Payment method
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other', null],
    default: null
  },

  // Merchant/Payee
  merchant: {
    type: String,
    trim: true,
    default: ''
  },

  // Location
  location: {
    type: String,
    trim: true,
    default: ''
  },

  // Receipt/Attachment
  receipt: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    url: String
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'reconciled'],
    default: 'completed'
  },

  // Template flag — for quick-add templates
  isTemplate: {
    type: Boolean,
    default: false
  },

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
});

// ========================================================================
// INDEXES
// ========================================================================

// Compound indexes for common queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, account: 1 });
transactionSchema.index({ user: 1, date: -1, type: 1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, status: 1 });

// Text index for search
transactionSchema.index({
  description: 'text',
  notes: 'text',
  tags: 'text',
  merchant: 'text'
});

// ========================================================================
// VIRTUALS
// ========================================================================

transactionSchema.virtual('signedAmount').get(function () {
  return this.type === 'income' ? this.amount : -this.amount;
});

// ========================================================================
// PRE-SAVE MIDDLEWARE
// ========================================================================

transactionSchema.pre('save', function (next) {
  if (this.isModified('amount') || this.isModified('exchangeRate')) {
    this.amountInBaseCurrency = Math.round(this.amount * this.exchangeRate * 100) / 100;
  }
  next();
});

// ========================================================================
// STATIC METHODS
// ========================================================================

transactionSchema.statics.getByDateRange = async function (userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
    isTemplate: { $ne: true }
  })
    .populate('category', 'name icon color type')
    .populate('account', 'name icon')
    .sort({ date: -1 });
};

transactionSchema.statics.getByCategory = async function (userId, categoryId, startDate, endDate) {
  const query = {
    user: userId,
    category: categoryId,
    isTemplate: { $ne: true }
  };

  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }

  return this.find(query)
    .populate('category', 'name icon color type')
    .sort({ date: -1 });
};

/**
 * Get category totals using aggregation pipeline
 */
transactionSchema.statics.getCategoryTotals = async function (userId, startDate, endDate, type = 'expense') {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type,
        date: { $gte: startDate, $lte: endDate },
        isTemplate: { $ne: true },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$category',
        categoryName: { $first: '$categoryInfo.name' },
        categoryIcon: { $first: '$categoryInfo.icon' },
        categoryColor: { $first: '$categoryInfo.color' },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);
};

/**
 * Get monthly spending trend using aggregation
 */
transactionSchema.statics.getMonthlyTrend = async function (userId, months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate },
        isTemplate: { $ne: true },
        status: { $ne: 'cancelled' }
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
};

/**
 * Get quick stats without loading all docs
 */
transactionSchema.statics.getQuickStats = async function (userId, startDate, endDate) {
  const match = {
    user: new mongoose.Types.ObjectId(userId),
    isTemplate: { $ne: true },
    status: { $ne: 'cancelled' }
  };
  if (startDate && endDate) {
    match.date = { $gte: startDate, $lte: endDate };
  }

  const result = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avg: { $avg: '$amount' },
        max: { $max: '$amount' },
        min: { $min: '$amount' }
      }
    }
  ]);

  const stats = { income: {}, expense: {} };
  result.forEach(r => {
    stats[r._id] = {
      total: Math.round(r.total * 100) / 100,
      count: r.count,
      avg: Math.round(r.avg * 100) / 100,
      max: r.max,
      min: r.min
    };
  });

  return stats;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
