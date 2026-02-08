/**
 * Savings Goal Model
 * 
 * Defines savings goals with progress tracking and milestones.
 */

import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  // User reference
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
  
  // Current saved amount
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
  
  // Start date
  startDate: {
    type: Date,
    default: Date.now
  },
  
  // Target date
  targetDate: {
    type: Date,
    default: null
  },
  
  // Category
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
  
  // Contributions history
  contributions: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  
  // Milestones
  milestones: [{
    name: String,
    targetAmount: Number,
    reached: {
      type: Boolean,
      default: false
    },
    reachedDate: Date
  }],
  
  // Auto-contribute settings
  autoContributeEnabled: {
    type: Boolean,
    default: false
  },
  
  // Is this goal featured/primary
  isFeatured: {
    type: Boolean,
    default: false
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

// Progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.round((this.currentAmount / this.targetAmount) * 100);
});

// Progress percentage capped at 100
goalSchema.virtual('progressPercentageCapped').get(function() {
  return Math.min(100, this.progressPercentage);
});

// Remaining amount
goalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Days remaining
goalSchema.virtual('daysRemaining').get(function() {
  if (!this.targetDate) return null;
  const now = new Date();
  const target = new Date(this.targetDate);
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Is completed
goalSchema.virtual('isCompleted').get(function() {
  return this.currentAmount >= this.targetAmount;
});

// ========================================================================
// PRE-SAVE MIDDLEWARE
// ========================================================================

// Update currentAmount from contributions before saving
goalSchema.pre('save', function(next) {
  if (this.isModified('contributions') || this.isNew) {
    this.currentAmount = this.contributions.reduce((sum, c) => sum + c.amount, 0);
    
    // Check and update milestones
    if (this.milestones && this.milestones.length > 0) {
      this.milestones = this.milestones.map(m => {
        if (!m.reached && this.currentAmount >= m.targetAmount) {
          return { ...m, reached: true, reachedDate: new Date() };
        }
        return m;
      });
    }
    
    // Update status if completed
    if (this.currentAmount >= this.targetAmount && this.status === 'active') {
      this.status = 'completed';
    }
  }
  next();
});

// ========================================================================
// STATIC METHODS
// ========================================================================

// Get active goals for a user
goalSchema.statics.getActiveGoals = async function(userId) {
  return this.find({
    user: userId,
    status: 'active'
  }).sort({ priority: 1, createdAt: -1 });
};

// Get featured goals
goalSchema.statics.getFeaturedGoals = async function(userId) {
  return this.find({
    user: userId,
    isFeatured: true,
    status: 'active'
  });
};

// Calculate total savings
goalSchema.statics.getTotalSavings = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'active' } },
    { $group: { _id: null, total: { $sum: '$currentAmount' } } }
  ]);
  return result[0]?.total || 0;
};

// Add contribution to a goal
goalSchema.statics.addContribution = async function(goalId, amount, note = '') {
  const goal = await this.findById(goalId);
  if (!goal) throw new Error('Goal not found');
  
  goal.contributions.push({
    amount,
    date: new Date(),
    note
  });
  
  await goal.save();
  return goal;
};

// Create default emergency fund goal
goalSchema.statics.createEmergencyFundGoal = async function(userId, targetAmount = 10000) {
  return this.create({
    user: userId,
    name: 'Emergency Fund',
    description: '3-6 months of living expenses',
    targetAmount,
    category: 'emergency',
    priority: 'high',
    color: '#FF3B30',
    icon: '🚨',
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  });
};

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;

