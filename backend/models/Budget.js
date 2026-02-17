/**
 * Budget Model
 * 
 * Defines budget schemas for monthly and category-wise budgeting
 * with duplicate prevention, auto-archival, and aggregation-based spending.
 */

import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Budget name
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },

  // Budget type
  type: {
    type: String,
    enum: ['monthly', 'category', 'yearly', 'custom'],
    required: true
  },

  // Budget amount
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget amount must be positive']
  },

  // Currency
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },

  // Category — ObjectId reference (for category-specific budgets)
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  // Date range
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },

  // Alert settings
  alertThreshold: {
    type: Number,
    default: 80,
    min: 50,
    max: 100
  },
  alertEnabled: {
    type: Boolean,
    default: true
  },

  // Rollover settings
  rolloverEnabled: {
    type: Boolean,
    default: false
  },
  rolloverType: {
    type: String,
    enum: ['percentage', 'amount', 'none'],
    default: 'none'
  },
  rolloverValue: {
    type: Number,
    default: 0
  },
  carryOverAmount: {
    type: Number,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active'
  },

  // Color for UI
  color: {
    type: String,
    default: '#5c7cfa'
  },

  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========================================================================
// INDEXES
// ========================================================================

budgetSchema.index({ user: 1, status: 1 });
budgetSchema.index({ user: 1, startDate: 1, endDate: 1 });
// Prevent duplicate budgets for same user/type/category/period
budgetSchema.index(
  { user: 1, type: 1, category: 1, startDate: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['active', 'paused'] } } }
);

// ========================================================================
// VIRTUALS
// ========================================================================

budgetSchema.virtual('spent').get(function () {
  return this._spent || 0;
});

budgetSchema.virtual('remaining').get(function () {
  const totalBudget = this.amount + this.carryOverAmount;
  return totalBudget - (this._spent || 0);
});

budgetSchema.virtual('usagePercentage').get(function () {
  const totalBudget = this.amount + this.carryOverAmount;
  if (totalBudget === 0) return 0;
  return Math.round(((this._spent || 0) / totalBudget) * 100);
});

budgetSchema.virtual('isOverBudget').get(function () {
  const totalBudget = this.amount + this.carryOverAmount;
  return (this._spent || 0) > totalBudget;
});

budgetSchema.virtual('effectiveAmount').get(function () {
  return this.amount + this.carryOverAmount;
});

// ========================================================================
// INSTANCE METHODS
// ========================================================================

/**
 * Calculate actual spending from transactions via aggregation
 */
budgetSchema.methods.calculateSpent = async function () {
  const Transaction = mongoose.model('Transaction');

  const match = {
    user: this.user,
    type: 'expense',
    date: { $gte: this.startDate, $lte: this.endDate },
    status: { $ne: 'cancelled' },
    isTemplate: { $ne: true }
  };

  if (this.category) {
    match.category = this.category;
  }

  const result = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  return result[0]?.total || 0;
};

// ========================================================================
// PRE-SAVE MIDDLEWARE
// ========================================================================

/**
 * Auto-archive expired budgets
 */
budgetSchema.pre('save', function (next) {
  if (this.status === 'active' && this.endDate < new Date()) {
    this.status = 'archived';
  }
  next();
});

// ========================================================================
// STATIC METHODS
// ========================================================================

budgetSchema.statics.getActiveBudgets = async function (userId) {
  const now = new Date();
  return this.find({
    user: userId,
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).populate('category', 'name icon color');
};

budgetSchema.statics.getByPeriod = async function (userId, startDate, endDate) {
  return this.find({
    user: userId,
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  }).populate('category', 'name icon color');
};

budgetSchema.statics.getCurrentMonthlyBudget = async function (userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return this.findOne({
    user: userId,
    type: 'monthly',
    status: 'active',
    startDate: { $lte: endOfMonth },
    endDate: { $gte: startOfMonth }
  });
};

/**
 * Create default monthly budget
 */
budgetSchema.statics.createDefaultMonthlyBudget = async function (userId, amount = 5000) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return this.create({
    user: userId,
    name: 'Monthly Budget',
    type: 'monthly',
    amount,
    startDate: startOfMonth,
    endDate: endOfMonth,
    alertThreshold: 80,
    alertEnabled: true,
    color: '#5c7cfa'
  });
};

/**
 * Get all budgets with spending data using a single aggregation pipeline
 * instead of N+1 queries
 */
budgetSchema.statics.getAllWithSpending = async function (userId) {
  const Transaction = mongoose.model('Transaction');
  const budgets = await this.find({ user: userId })
    .populate('category', 'name icon color')
    .sort({ startDate: -1 })
    .lean();

  if (budgets.length === 0) return [];

  // Batch all spending calculations into one aggregation
  const spendingData = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        status: { $ne: 'cancelled' },
        isTemplate: { $ne: true }
      }
    },
    {
      $group: {
        _id: {
          category: '$category',
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Map spending to budgets
  return budgets.map(budget => {
    let spent = 0;
    for (const sd of spendingData) {
      const sdStart = new Date(sd._id.year, sd._id.month - 1, 1);
      const sdEnd = new Date(sd._id.year, sd._id.month, 0);

      const dateOverlap = sdStart <= budget.endDate && sdEnd >= budget.startDate;
      const categoryMatch = !budget.category ||
        (sd._id.category && sd._id.category.toString() === (budget.category._id || budget.category).toString());

      if (dateOverlap && categoryMatch) {
        spent += sd.total;
      }
    }

    const totalBudget = budget.amount + (budget.carryOverAmount || 0);
    return {
      ...budget,
      spent: Math.round(spent * 100) / 100,
      remaining: Math.round((totalBudget - spent) * 100) / 100,
      usagePercentage: totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0,
      isOverBudget: spent > totalBudget
    };
  });
};

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
