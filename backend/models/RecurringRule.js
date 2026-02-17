/**
 * Recurring Rule Model
 * 
 * Separates recurring transaction configuration from individual transactions.
 * Stores the template + schedule; a cron job or hook generates actual transactions.
 */

import mongoose from 'mongoose';

const recurringRuleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Transaction template — snapshot of what gets created each cycle
    template: {
        type: {
            type: String,
            enum: ['income', 'expense'],
            required: true
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than 0']
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null
        },
        description: {
            type: String,
            trim: true,
            default: ''
        },
        merchant: {
            type: String,
            trim: true,
            default: ''
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other', null],
            default: null
        },
        tags: [{
            type: String,
            trim: true
        }]
    },

    // Schedule
    name: {
        type: String,
        required: [true, 'Rule name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },

    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
        required: [true, 'Frequency is required']
    },

    // Day of week (0-6) for weekly, day of month (1-31) for monthly
    dayOfExecution: {
        type: Number,
        default: null
    },

    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },

    endDate: {
        type: Date,
        default: null
    },

    nextRunDate: {
        type: Date,
        required: true,
        index: true
    },

    lastRunDate: {
        type: Date,
        default: null
    },

    // Tracking
    executionCount: {
        type: Number,
        default: 0
    },

    maxExecutions: {
        type: Number,
        default: null // null = unlimited
    },

    isActive: {
        type: Boolean,
        default: true
    },

    // Color/Icon for UI
    color: {
        type: String,
        default: '#5c7cfa'
    },
    icon: {
        type: String,
        default: '🔄'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ========================================================================
// INDEXES
// ========================================================================

recurringRuleSchema.index({ user: 1, isActive: 1 });
recurringRuleSchema.index({ nextRunDate: 1, isActive: 1 }); // For cron/scheduled queries
recurringRuleSchema.index({ user: 1, frequency: 1 });

// ========================================================================
// VIRTUALS
// ========================================================================

recurringRuleSchema.virtual('isExpired').get(function () {
    if (this.endDate && this.endDate < new Date()) return true;
    if (this.maxExecutions && this.executionCount >= this.maxExecutions) return true;
    return false;
});

recurringRuleSchema.virtual('remainingExecutions').get(function () {
    if (!this.maxExecutions) return null;
    return Math.max(0, this.maxExecutions - this.executionCount);
});

// ========================================================================
// INSTANCE METHODS
// ========================================================================

/**
 * Calculate the next run date based on frequency
 */
recurringRuleSchema.methods.calculateNextRunDate = function () {
    const current = this.lastRunDate || this.startDate;
    const next = new Date(current);

    switch (this.frequency) {
        case 'daily':
            next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        case 'biweekly':
            next.setDate(next.getDate() + 14);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            if (this.dayOfExecution) {
                next.setDate(Math.min(this.dayOfExecution, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
            }
            break;
        case 'quarterly':
            next.setMonth(next.getMonth() + 3);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
    }

    return next;
};

/**
 * Mark this rule as executed and compute next run date
 */
recurringRuleSchema.methods.markExecuted = async function () {
    this.lastRunDate = new Date();
    this.executionCount += 1;
    this.nextRunDate = this.calculateNextRunDate();

    // Auto-deactivate if max executions reached or past end date
    if (this.isExpired) {
        this.isActive = false;
    }

    return this.save();
};

// ========================================================================
// STATIC METHODS
// ========================================================================

/**
 * Get all rules that are due for execution
 */
recurringRuleSchema.statics.getDueRules = async function (cutoffDate = new Date()) {
    return this.find({
        isActive: true,
        nextRunDate: { $lte: cutoffDate }
    }).populate('template.category template.account');
};

/**
 * Get all active rules for a user
 */
recurringRuleSchema.statics.getActiveRules = async function (userId) {
    return this.find({
        user: userId,
        isActive: true
    })
        .populate('template.category', 'name icon color')
        .populate('template.account', 'name icon')
        .sort({ nextRunDate: 1 });
};

const RecurringRule = mongoose.model('RecurringRule', recurringRuleSchema);

export default RecurringRule;
