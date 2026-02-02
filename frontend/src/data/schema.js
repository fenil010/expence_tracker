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
    name: 'Alex Morgan',
    creditScore: 780,
    tier: 'Pro',
  },

  balance: 28750.0,
  monthlyBudget: 4500.0,

  transactions: [
    // January 2026
    {
      id: 'tx-001',
      type: 'income',
      category: 'Salary',
      amount: 6500.0,
      description: 'Monthly Salary - January',
      date: '2026-01-01T09:00:00.000Z',
    },
    {
      id: 'tx-002',
      type: 'expense',
      category: 'Food',
      amount: 385.50,
      description: 'Whole Foods groceries',
      date: '2026-01-03T14:30:00.000Z',
    },
    {
      id: 'tx-003',
      type: 'expense',
      category: 'Transport',
      amount: 145.00,
      description: 'Uber & Lyft rides',
      date: '2026-01-05T18:00:00.000Z',
    },
    {
      id: 'tx-004',
      type: 'expense',
      category: 'Shopping',
      amount: 520.00,
      description: 'AirPods Pro',
      date: '2026-01-08T16:45:00.000Z',
    },
    {
      id: 'tx-005',
      type: 'expense',
      category: 'Bills',
      amount: 220.00,
      description: 'Internet & Phone',
      date: '2026-01-10T11:00:00.000Z',
    },
    {
      id: 'tx-006',
      type: 'income',
      category: 'Freelance',
      amount: 1200.0,
      description: 'UI Design project',
      date: '2026-01-12T09:30:00.000Z',
    },
    {
      id: 'tx-007',
      type: 'expense',
      category: 'Entertainment',
      amount: 95.00,
      description: 'Streaming subscriptions',
      date: '2026-01-15T10:00:00.000Z',
    },
    {
      id: 'tx-008',
      type: 'expense',
      category: 'Food',
      amount: 125.00,
      description: 'Dinner at Nobu',
      date: '2026-01-18T20:00:00.000Z',
    },
    {
      id: 'tx-009',
      type: 'expense',
      category: 'Health',
      amount: 180.00,
      description: 'Equinox membership',
      date: '2026-01-20T08:00:00.000Z',
    },
    {
      id: 'tx-010',
      type: 'expense',
      category: 'Shopping',
      amount: 280.00,
      description: 'Nike running shoes',
      date: '2026-01-22T15:30:00.000Z',
    },
    {
      id: 'tx-011',
      type: 'expense',
      category: 'Transport',
      amount: 85.00,
      description: 'Gas station',
      date: '2026-01-24T12:00:00.000Z',
    },
    {
      id: 'tx-012',
      type: 'expense',
      category: 'Food',
      amount: 78.50,
      description: 'Starbucks & lunch',
      date: '2026-01-26T13:15:00.000Z',
    },
    {
      id: 'tx-013',
      type: 'expense',
      category: 'Entertainment',
      amount: 145.00,
      description: 'Concert tickets',
      date: '2026-01-28T19:00:00.000Z',
    },
    {
      id: 'tx-014',
      type: 'expense',
      category: 'Bills',
      amount: 195.00,
      description: 'Electricity bill',
      date: '2026-01-30T10:00:00.000Z',
    },
    // February 2026
    {
      id: 'tx-015',
      type: 'income',
      category: 'Salary',
      amount: 6500.0,
      description: 'Monthly Salary - February',
      date: '2026-02-01T09:00:00.000Z',
    },
    {
      id: 'tx-016',
      type: 'expense',
      category: 'Food',
      amount: 165.00,
      description: 'Weekend groceries',
      date: '2026-02-02T11:00:00.000Z',
    },
  ],

  goals: [
    {
      id: 'goal-001',
      name: 'MacBook Pro M4',
      target: 3500.0,
      current: 1850.0,
    },
    {
      id: 'goal-002',
      name: 'Emergency Fund',
      target: 10000.0,
      current: 6200.0,
    },
    {
      id: 'goal-003',
      name: 'Japan Trip',
      target: 5000.0,
      current: 1400.0,
    },
  ],
};
