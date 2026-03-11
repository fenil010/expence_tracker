/**
 * Savings Goal Model
 * 
 * Defines savings goals with progress tracking, milestones,
 * separate contribution tracking, and withdrawal support.
 */

import mongoose from 'mongoose';

// ========================================================================
// CONTRIBUTION SUB-SCHEMA (separate collection for scalability)
// ========================================================================

const contributionSchema = new mongoose.Schema({
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    default: 'deposit'
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot exceed 200 characters'],
    default: ''
  }
}, {
  timestamps: true
});

contributionSchema.index({ goal: 1, date: -1 });
contributionSchema.index({ user: 1, date: -1 });

export const Contribution = mongoose.model('Contribution', contributionSchema);

// ========================================================================
// GOAL SCHEMA
// ========================================================================

const milestoneSchema = new mongoose.Schema({
  name: String,
  targetAmount: Number,
  reached: {
    type: Boolean,
    default: false
  },
  reachedDate: Date
}, { _id: true });

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Goal name
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },

  // Description
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Target amount
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target must be at least 1']
  },

  // Current saved amount (cached, updated from contributions)
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },

  // Currency
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },

  // Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    default: null
  },

  // Categorization
  category: {
    type: String,
    enum: ['emergency', 'vacation', 'purchase', 'investment', 'education', 'home', 'car', 'wedding', 'retirement', 'other'],
    default: 'other'
  },

  // Priority
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },

  // Color for UI
  color: {
    type: String,
    default: '#34C759'
  },

  // Icon
  icon: {
    type: String,
    default: '🎯'
  },

  // Monthly contribution target
  monthlyContribution: {
    type: Number,
    default: 0,
    min: 0
  },

  // Milestones
  milestones: [milestoneSchema],

  // Cached summary fields (updated when contributions change)
  contributionCount: {
    type: Number,
    default: 0
  },
  lastContributionDate: {
    type: Date,
    default: null
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },

  // Auto-contribute settings
  autoContributeEnabled: {
    type: Boolean,
    default: false
  },

  // Is this goal featured/primary
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Linked account for auto-tracking
  linkedAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null
  },

  // Reminder frequency
  reminderFrequency: {
    type: String,
    enum: ['none', 'weekly', 'biweekly', 'monthly'],
    default: 'none'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========================================================================
// INDEXES
// ========================================================================

goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, targetDate: 1 });
goalSchema.index({ user: 1, priority: 1 });

// ========================================================================
// VIRTUALS
// ========================================================================

goalSchema.virtual('progressPercentage').get(function () {
  if (this.targetAmount === 0) return 0;
  return Math.round((this.currentAmount / this.targetAmount) * 100);
});

goalSchema.virtual('progressPercentageCapped').get(function () {
  return Math.min(100, this.progressPercentage);
});

goalSchema.virtual('remainingAmount').get(function () {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

goalSchema.virtual('daysRemaining').get(function () {
  if (!this.targetDate) return null;
  const now = new Date();
  const target = new Date(this.targetDate);
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

goalSchema.virtual('isCompleted').get(function () {
  return this.currentAmount >= this.targetAmount;
});

/**
 * Estimated completion date based on current monthly contribution rate
 */
goalSchema.virtual('estimatedCompletionDate').get(function () {
  if (this.currentAmount >= this.targetAmount) return new Date();
  if (!this.monthlyContribution || this.monthlyContribution <= 0) return null;

  const remaining = this.targetAmount - this.currentAmount;
  const monthsNeeded = Math.ceil(remaining / this.monthlyContribution);
  const estimated = new Date();
  estimated.setMonth(estimated.getMonth() + monthsNeeded);
  return estimated;
});

// ========================================================================
// INSTANCE METHODS
// ========================================================================

/**
 * Recalculate currentAmount from contributions collection
 */
goalSchema.methods.recalculateAmount = async function () {
  const result = await Contribution.aggregate([
    { $match: { goal: this._id } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        lastDate: { $max: '$date' }
      }
    }
  ]);

  let deposits = 0;
  let withdrawals = 0;
  let totalCount = 0;
  let lastDate = null;

  result.forEach(r => {
    if (r._id === 'deposit') {
      deposits = r.total;
      totalCount += r.count;
      if (!lastDate || r.lastDate > lastDate) lastDate = r.lastDate;
    } else if (r._id === 'withdrawal') {
      withdrawals = r.total;
      totalCount += r.count;
      if (!lastDate || r.lastDate > lastDate) lastDate = r.lastDate;
    }
  });

  this.currentAmount = Math.max(0, deposits - withdrawals);
  this.totalWithdrawn = withdrawals;
  this.contributionCount = totalCount;
  this.lastContributionDate = lastDate;

  // Check and update milestones
  if (this.milestones && this.milestones.length > 0) {
    this.milestones = this.milestones.map(m => {
      if (!m.reached && this.currentAmount >= m.targetAmount) {
        return { ...m.toObject(), reached: true, reachedDate: new Date() };
      }
      return m;
    });
  }

  // Auto-complete if target reached
  if (this.currentAmount >= this.targetAmount && this.status === 'active') {
    this.status = 'completed';
  }

  return this.save();
};

/**
 * Add a contribution (deposit or withdrawal)
 */
goalSchema.methods.addContribution = async function (amount, type = 'deposit', note = '') {
  if (type === 'withdrawal' && amount > this.currentAmount) {
    throw new Error('Withdrawal amount exceeds current savings');
  }

  await Contribution.create({
    goal: this._id,
    user: this.user,
    type,
    amount,
    note
  });

  return this.recalculateAmount();
};

// ========================================================================
// STATIC METHODS
// ========================================================================

goalSchema.statics.getActiveGoals = async function (userId) {
  return this.find({
    user: userId,
    status: 'active'
  }).sort({ priority: 1, createdAt: -1 });
};

goalSchema.statics.getFeaturedGoals = async function (userId) {
  return this.find({
    user: userId,
    isFeatured: true,
    status: 'active'
  });
};

goalSchema.statics.getTotalSavings = async function (userId) {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'active' } },
    { $group: { _id: null, total: { $sum: '$currentAmount' } } }
  ]);
  return result[0]?.total || 0;
};

goalSchema.statics.createEmergencyFundGoal = async function (userId, session, targetAmount = 10000) {
  const opts = session ? { session } : {};
  const [goal] = await this.create([{
    user: userId,
    name: 'Emergency Fund',
    description: '3-6 months of living expenses',
    targetAmount,
    category: 'emergency',
    priority: 'high',
    color: '#FF3B30',
    icon: '🚨',
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  }], opts);
  return goal;
};

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
