/**
 * Account Model
 * 
 * Supports multiple wallets/accounts per user (cash, bank, credit card, etc.)
 * Each transaction is linked to an account for proper balance tracking.
 */

import mongoose from 'mongoose';
import { getExchangeRate } from '../utils/currencyConverter.js';
import User from './User.js';

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    name: {
        type: String,
        required: [true, 'Account name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },

    type: {
        type: String,
        enum: ['cash', 'bank', 'credit_card', 'digital_wallet', 'investment', 'savings', 'other'],
        required: [true, 'Account type is required']
    },

    balance: {
        type: Number,
        default: 0,
        get: v => Math.round(v * 100) / 100,
        set: v => Math.round(v * 100) / 100
    },

    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },

    icon: {
        type: String,
        default: '💳'
    },

    color: {
        type: String,
        default: '#5c7cfa',
        match: /^#[0-9A-Fa-f]{6}$/
    },

    // Credit card specific fields
    creditLimit: {
        type: Number,
        default: null
    },

    // Whether this is the default account for new transactions
    isDefault: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    notes: {
        type: String,
        trim: true,
        maxlength: [200, 'Notes cannot exceed 200 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
});

// ========================================================================
// INDEXES
// ========================================================================

accountSchema.index({ user: 1, isActive: 1 });
accountSchema.index({ user: 1, type: 1 });
accountSchema.index({ user: 1, isDefault: 1 });

// ========================================================================
// VIRTUALS
// ========================================================================

accountSchema.virtual('availableCredit').get(function () {
    if (this.type !== 'credit_card' || !this.creditLimit) return null;
    return this.creditLimit - Math.abs(this.balance);
});

// ========================================================================
// INSTANCE METHODS
// ========================================================================

/**
 * Adjust account balance atomically
 * @param {number} amount - Positive to add, negative to subtract
 */
accountSchema.methods.adjustBalance = async function (amount) {
    this.balance = Math.round((this.balance + amount) * 100) / 100;
    return this.save();
};

// ========================================================================
// STATIC METHODS
// ========================================================================

accountSchema.statics.getActiveAccounts = async function (userId) {
    return this.find({ user: userId, isActive: true })
        .sort({ isDefault: -1, name: 1 });
};

accountSchema.statics.getDefaultAccount = async function (userId) {
    let account = await this.findOne({ user: userId, isDefault: true, isActive: true });
    if (!account) {
        // Fall back to first active account
        account = await this.findOne({ user: userId, isActive: true });
    }
    return account;
};

accountSchema.statics.getTotalBalance = async function (userId) {
    const user = await User.findById(userId).select('currency');
    const baseCurrency = user?.currency || 'USD';

    // Fetch all active accounts
    const accounts = await this.find({
        user: new mongoose.Types.ObjectId(userId),
        isActive: true
    });

    if (!accounts.length) return 0;

    // Convert each account balance to the user's base currency
    let totalBalance = 0;
    for (const account of accounts) {
        if (!account.balance) continue;

        try {
            const exchangeRate = await getExchangeRate(account.currency || 'USD', baseCurrency);
            totalBalance += (account.balance * exchangeRate);
        } catch (err) {
            console.error(`Failed to convert balance for account ${account._id}:`, err);
            // Fallback (naive sum) if conversion fails
            totalBalance += account.balance;
        }
    }

    return Math.round(totalBalance * 100) / 100;
};

/**
 * Create default accounts for a new user
 */
accountSchema.statics.createDefaultsForUser = async function (userId, session) {
    return this.insertMany([
        {
            user: userId,
            name: 'Cash',
            type: 'cash',
            balance: 0,
            icon: '💵',
            color: '#34C759',
            isDefault: true
        },
        {
            user: userId,
            name: 'Bank Account',
            type: 'bank',
            balance: 0,
            icon: '🏦',
            color: '#007AFF',
            isDefault: false
        }
    ], session ? { session } : {});
};

// ========================================================================
// MIDDLEWARE
// ========================================================================

/**
 * Ensure only one default account per user
 */
accountSchema.pre('save', async function (next) {
    if (this.isModified('isDefault') && this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
    next();
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
