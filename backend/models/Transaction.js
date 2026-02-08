/**
 * Transaction Model
 * 
 * Defines the transaction schema for income and expense entries.
 * Supports categorization, tags, notes, and attachments.
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
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required']
  },
  
  // Amount (always positive, type determines sign)
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    get: v => Math.round(v * 100) / 100, // Round to 2 decimal places
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
  
  // Category
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  
  // Subcategory (optional)
  subcategory: {
    type: String,
    trim: true,
    default: ''
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
  
  // Due date (for recurring transactions)
  dueDate: {
    type: Date,
    default: null
  },
  
  // Recurring settings
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', null],
    default: null
  },
  recurringEndDate: {
    type: Date,
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
  
  // Parent transaction (for recurring generation)
  parentTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========================================================================
// INDEXES
// ========================================================================

// Compound indexes for common queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, date: -1, type: 1 });
transactionSchema.index({ user: 1, createdAt: -1 });

// Text index for search
transactionSchema.index({
  description: 'text',
  notes: 'text',
  category: 'text',
  tags: 'text',
  merchant: 'text'
});

// ========================================================================
// VIRTUALS
// ========================================================================

// Signed amount (positive for income, negative for expenses)
transactionSchema.virtual('signedAmount').get(function() {
  return this.type === 'income' ? this.amount : -this.amount;
});

// ========================================================================
// PRE-SAVE MIDDLEWARE
// ========================================================================

// Calculate base currency amount before saving
transactionSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('exchangeRate')) {
    this.amountInBaseCurrency = this.amount * this.exchangeRate;
  }
  next();
});

// ========================================================================
// STATIC METHODS
// ========================================================================

// Get transactions within a date range
transactionSchema.statics.getByDateRange = async function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Get transactions by category
transactionSchema.statics.getByCategory = async function(userId, category, startDate, endDate) {
  const query = {
    user: userId,
    category
  };
  
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  return this.find(query).sort({ date: -1 });
};

// Get category totals for a period
transactionSchema.statics.getCategoryTotals = async function(userId, startDate, endDate, type = 'expense') {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Get monthly spending trend
transactionSchema.statics.getMonthlyTrend = async function(userId, months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
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
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};

// ========================================================================
// INSTANCE METHODS
// ========================================================================

// Convert to JSON (hide sensitive fields if any)
transactionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.metadata; // Remove if needed
  return obj;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

