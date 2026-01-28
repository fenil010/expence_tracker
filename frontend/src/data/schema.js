/**
 * Expense Tracker Data Schema
 * 
 * This file defines the data structure and default values for the expense tracker.
 * All types are documented with JSDoc for IDE support.
 */

// ============================================================================
// TYPE DEFINITIONS (JSDoc)
// ============================================================================

/**
 * @typedef {Object} User
 * @property {string} name - User's display name
 * @property {number} creditScore - Credit score (300-850)
 * @property {'Free' | 'Pro'} tier - Account tier
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - Unique transaction ID
 * @property {'income' | 'expense'} type - Transaction type
 * @property {string} category - Category (e.g., 'Food', 'Transport', 'Salary')
 * @property {number} amount - Positive number (type determines sign)
 * @property {string} description - Brief description
 * @property {string} date - ISO 8601 date string
 */

/**
 * @typedef {Object} Goal
 * @property {string} id - Unique goal ID
 * @property {string} name - Goal name (e.g., 'New Car')
 * @property {number} target - Target amount
 * @property {number} current - Current saved amount
 */

/**
 * @typedef {Object} ExpenseData
 * @property {User} user - User profile
 * @property {number} balance - Current total balance
 * @property {number} monthlyBudget - Monthly spending budget
 * @property {Transaction[]} transactions - All transactions
 * @property {Goal[]} goals - Savings goals
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export const STORAGE_KEY = 'expense_tracker_data';

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'],
};

// ============================================================================
// DEFAULT DATA
// ============================================================================

/**
 * Generate a unique ID
 * @returns {string}
 */
export const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Default data structure seeded on first app load.
 * Provides realistic demo data for a polished initial experience.
 * @type {ExpenseData}
 */
export const DEFAULT_DATA = {
  user: {
    name: 'Fenil',
    creditScore: 780,
    tier: 'Pro',
  },

  balance: 24500.0,
  monthlyBudget: 3300.0,

  transactions: [
    {
      id: 'tx-001',
      type: 'income',
      category: 'Salary',
      amount: 5500.0,
      description: 'Monthly Salary',
      date: '2026-01-01T09:00:00.000Z',
    },
    {
      id: 'tx-002',
      type: 'expense',
      category: 'Food',
      amount: 450.0,
      description: 'Groceries',
      date: '2026-01-05T14:30:00.000Z',
    },
    {
      id: 'tx-003',
      type: 'expense',
      category: 'Transport',
      amount: 120.0,
      description: 'Uber rides',
      date: '2026-01-08T18:00:00.000Z',
    },
    {
      id: 'tx-004',
      type: 'expense',
      category: 'Entertainment',
      amount: 85.0,
      description: 'Netflix & Spotify',
      date: '2026-01-10T10:00:00.000Z',
    },
    {
      id: 'tx-005',
      type: 'expense',
      category: 'Shopping',
      amount: 320.0,
      description: 'New headphones',
      date: '2026-01-12T16:45:00.000Z',
    },
    {
      id: 'tx-006',
      type: 'expense',
      category: 'Bills',
      amount: 180.0,
      description: 'Electricity bill',
      date: '2026-01-15T11:00:00.000Z',
    },
    {
      id: 'tx-007',
      type: 'income',
      category: 'Freelance',
      amount: 800.0,
      description: 'Website project',
      date: '2026-01-18T09:30:00.000Z',
    },
    {
      id: 'tx-008',
      type: 'expense',
      category: 'Food',
      amount: 95.0,
      description: 'Restaurant dinner',
      date: '2026-01-20T20:00:00.000Z',
    },
    {
      id: 'tx-009',
      type: 'expense',
      category: 'Health',
      amount: 200.0,
      description: 'Gym membership',
      date: '2026-01-22T08:00:00.000Z',
    },
  ],

  goals: [
    {
      id: 'goal-001',
      name: 'New Car',
      target: 10000.0,
      current: 4500.0,
    },
    {
      id: 'goal-002',
      name: 'Emergency Fund',
      target: 5000.0,
      current: 3200.0,
    },
    {
      id: 'goal-003',
      name: 'Vacation',
      target: 2500.0,
      current: 800.0,
    },
  ],
};
