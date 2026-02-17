/**
 * Category Model
 * 
 * Defines transaction categories with custom category support,
 * unique constraint enforcement, and usage tracking.
 */

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  // User reference (null for system categories)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },

  // Category name
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  // Category type
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },

  // Description
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  },

  // Icon/emoji
  icon: {
    type: String,
    default: '💰'
  },

  // Color (hex code)
  color: {
    type: String,
    default: '#5c7cfa',
    match: /^#[0-9A-Fa-f]{6}$/
  },

  // Parent category (for subcategories)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  // Budget allocated (for expense categories)
  budgetAllocation: {
    type: Number,
    default: 0,
    min: 0
  },

  // Cached transaction count for performance
  transactionCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Sort order
  sortOrder: {
    type: Number,
    default: 0
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // System category flag (can't be deleted)
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ========================================================================
// INDEXES
// ========================================================================

categorySchema.index({ user: 1, type: 1 });
categorySchema.index({ user: 1, isActive: 1 });
// Unique compound index — prevents duplicate categories per user + type
categorySchema.index(
  { user: 1, name: 1, type: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// ========================================================================
// STATIC METHODS
// ========================================================================

categorySchema.statics.getDefaultCategories = function () {
  return {
    income: [
      { name: 'Salary', icon: '💼', color: '#34C759', isSystem: true, description: 'Regular salary and wages' },
      { name: 'Freelance', icon: '💻', color: '#5856D6', isSystem: true, description: 'Freelance and contract work' },
      { name: 'Investment', icon: '📈', color: '#007AFF', isSystem: true, description: 'Returns from investments' },
      { name: 'Gift', icon: '🎁', color: '#FF9500', isSystem: true, description: 'Gifts and bonuses received' },
      { name: 'Other Income', icon: '💵', color: '#8E8E93', isSystem: true, description: 'Miscellaneous income' }
    ],
    expense: [
      { name: 'Food & Dining', icon: '🍽️', color: '#FF3B30', isSystem: true, description: 'Groceries, restaurants, delivery' },
      { name: 'Transportation', icon: '🚗', color: '#FF9500', isSystem: true, description: 'Gas, parking, public transit, rides' },
      { name: 'Shopping', icon: '🛍️', color: '#AF52DE', isSystem: true, description: 'Clothing, electronics, general shopping' },
      { name: 'Entertainment', icon: '🎬', color: '#5856D6', isSystem: true, description: 'Movies, games, subscriptions' },
      { name: 'Bills & Utilities', icon: '📄', color: '#007AFF', isSystem: true, description: 'Electricity, water, internet, phone' },
      { name: 'Health & Medical', icon: '🏥', color: '#34C759', isSystem: true, description: 'Doctor, pharmacy, insurance' },
      { name: 'Travel', icon: '✈️', color: '#FF9500', isSystem: true, description: 'Flights, hotels, vacation expenses' },
      { name: 'Education', icon: '📚', color: '#5856D6', isSystem: true, description: 'Courses, books, tuition' },
      { name: 'Personal Care', icon: '💆', color: '#AF52DE', isSystem: true, description: 'Haircuts, skincare, grooming' },
      { name: 'Other Expense', icon: '💰', color: '#8E8E93', isSystem: true, description: 'Miscellaneous expenses' }
    ]
  };
};

/**
 * Create default categories for a new user
 */
categorySchema.statics.createDefaultsForUser = async function (userId) {
  const defaults = this.getDefaultCategories();
  const categories = [];

  for (const cat of defaults.income) {
    categories.push({ user: userId, ...cat, type: 'income' });
  }
  for (const cat of defaults.expense) {
    categories.push({ user: userId, ...cat, type: 'expense' });
  }

  return this.insertMany(categories);
};

/**
 * Get categories for a user (their own categories only)
 */
categorySchema.statics.getUserCategories = async function (userId, type = null) {
  const query = {
    user: userId,
    isActive: true
  };

  if (type) {
    query.type = type;
  }

  return this.find(query).sort({ type: 1, sortOrder: 1, name: 1 });
};

/**
 * Find or create a category by name for a user
 */
categorySchema.statics.findOrCreate = async function (userId, name, type, icon, color) {
  let category = await this.findOne({
    user: userId,
    name: new RegExp(`^${name}$`, 'i'),
    type,
    isActive: true
  });

  if (!category) {
    category = await this.create({
      user: userId,
      name,
      type,
      icon: icon || '💰',
      color: color || '#5c7cfa',
      isSystem: false
    });
  }

  return category;
};

/**
 * Increment transaction count for a category
 */
categorySchema.statics.incrementTransactionCount = async function (categoryId, amount = 1) {
  return this.findByIdAndUpdate(categoryId, {
    $inc: { transactionCount: amount }
  });
};

const Category = mongoose.model('Category', categorySchema);

export default Category;
