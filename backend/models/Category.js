/**
 * Category Model
 * 
 * Defines transaction categories with custom category support.
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

// ========================================================================
// STATIC METHODS - Default categories
// ========================================================================

categorySchema.statics.getDefaultCategories = function() {
  return {
    income: [
      { name: 'Salary', icon: '💼', color: '#34C759', isSystem: true },
      { name: 'Freelance', icon: '💻', color: '#5856D6', isSystem: true },
      { name: 'Investment', icon: '📈', color: '#007AFF', isSystem: true },
      { name: 'Gift', icon: '🎁', color: '#FF9500', isSystem: true },
      { name: 'Other Income', icon: '💵', color: '#8E8E93', isSystem: true }
    ],
    expense: [
      { name: 'Food & Dining', icon: '🍽️', color: '#FF3B30', isSystem: true },
      { name: 'Transportation', icon: '🚗', color: '#FF9500', isSystem: true },
      { name: 'Shopping', icon: '🛍️', color: '#AF52DE', isSystem: true },
      { name: 'Entertainment', icon: '🎬', color: '#5856D6', isSystem: true },
      { name: 'Bills & Utilities', icon: '📄', color: '#007AFF', isSystem: true },
      { name: 'Health & Medical', icon: '🏥', color: '#34C759', isSystem: true },
      { name: 'Travel', icon: '✈️', color: '#FF9500', isSystem: true },
      { name: 'Education', icon: '📚', color: '#5856D6', isSystem: true },
      { name: 'Personal Care', icon: '💆', color: '#AF52DE', isSystem: true },
      { name: 'Other Expense', icon: '💰', color: '#8E8E93', isSystem: true }
    ]
  };
};

// Create default categories for a user
categorySchema.statics.createDefaultsForUser = async function(userId) {
  const defaults = this.getDefaultCategories();
  const categories = [];
  
  // Create income categories
  for (const cat of defaults.income) {
    categories.push({
      user: userId,
      ...cat,
      type: 'income',
      isSystem: true
    });
  }
  
  // Create expense categories
  for (const cat of defaults.expense) {
    categories.push({
      user: userId,
      ...cat,
      type: 'expense',
      isSystem: true
    });
  }
  
  return this.insertMany(categories);
};

// Get categories for a user (including system categories)
categorySchema.statics.getUserCategories = async function(userId, type = null) {
  const query = {
    $or: [
      { user: userId },
      { user: null, isSystem: true }
    ],
    isActive: true
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query).sort({ type: 1, sortOrder: 1, name: 1 });
};

const Category = mongoose.model('Category', categorySchema);

export default Category;

