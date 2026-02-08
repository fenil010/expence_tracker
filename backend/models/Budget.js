/**
 * Budget Model
 * 
 * Defines budget schemas for monthly and category-wise budgeting.
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
  
  // Category (for category budgets)
  category: {
    type: String,
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
    default: 80, // Alert at 80% usage
    min: 50,
    max: 100
  },
  alertEnabled: {
    type: Boolean,
    default: true
  },
  
  // Rollover settings (carry over unused budget)
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

// ========================================================================
// VIRTUALS
// ========================================================================

// Current spent amount (calculated field)
budgetSchema.virtual('spent').get(function() {
  return this._spent || 0;
});

// Remaining budget
budgetSchema.virtual('remaining').get(function() {
  return this.amount - (this._spent || 0);
});

// Usage percentage
budgetSchema.virtual('usagePercentage').get(function() {
  if (this.amount === 0) return 0;
  return Math.round(((this._spent || 0) / this.amount) * 100);
});

// Check if over budget
budgetSchema.virtual('isOverBudget').get(function() {
  return (this._spent || 0) > this.amount;
});

// ========================================================================
// STATIC METHODS
// ========================================================================

// Get active budgets for a user
budgetSchema.statics.getActiveBudgets = async function(userId) {
  const now = new Date();
  return this.find({
    user: userId,
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Get budgets by period
budgetSchema.statics.getByPeriod = async function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  });
};

// Get current monthly budget
budgetSchema.statics.getCurrentMonthlyBudget = async function(userId) {
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

// Create default monthly budget for a user
budgetSchema.statics.createDefaultMonthlyBudget = async function(userId, amount = 5000) {
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

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;

