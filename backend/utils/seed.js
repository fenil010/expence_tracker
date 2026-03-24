/**
 * Database Seed Script
 * 
 * Populates the database with realistic sample data for demo purposes.
 * Creates a demo user, accounts, categories, transactions, budgets, goals.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal, { Contribution } from '../models/Goal.js';
import RecurringRule from '../models/RecurringRule.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await Promise.all([
      User.deleteMany({}),
      Account.deleteMany({}),
      Category.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      Goal.deleteMany({}),
      Contribution.deleteMany({}),
      RecurringRule.deleteMany({})
    ]);

    // ========================================================================
    // 1. CREATE DEMO USER
    // ========================================================================
    console.log('👤 Creating demo user...');
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@expensetracker.com',
      password: 'demo1234',
      currency: 'USD',
      isVerified: true,
      role: 'user'
    });

    // ========================================================================
    // 2. CREATE ACCOUNTS
    // ========================================================================
    console.log('🏦 Creating accounts...');
    const accounts = await Account.insertMany([
      {
        user: user._id,
        name: 'Cash',
        type: 'cash',
        balance: 850,
        icon: '💵',
        color: '#34C759',
        isDefault: true
      },
      {
        user: user._id,
        name: 'Bank Account',
        type: 'bank',
        balance: 12500,
        icon: '🏦',
        color: '#007AFF'
      },
      {
        user: user._id,
        name: 'Credit Card',
        type: 'credit_card',
        balance: -1250,
        creditLimit: 5000,
        icon: '💳',
        color: '#FF3B30'
      }
    ]);

    const cashAccount = accounts[0];
    const bankAccount = accounts[1];
    const creditCard = accounts[2];

    // ========================================================================
    // 3. CREATE CATEGORIES
    // ========================================================================
    console.log('📂 Creating categories...');
    const defaultCats = await Category.createDefaultsForUser(user._id);

    // Get category references
    const catMap = {};
    defaultCats.forEach(c => { catMap[c.name] = c._id; });

    // ========================================================================
    // 4. CREATE TRANSACTIONS (60+ realistic transactions over 2 months)
    // ========================================================================
    console.log('💸 Creating transactions...');
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const makeDate = (daysAgo, hour = 12) => {
      const d = new Date(thisYear, thisMonth, now.getDate() - daysAgo, hour, 0, 0);
      return d;
    };

    const transactions = [
      // This month — salary
      { type: 'income', amount: 5500, category: catMap['Salary'], account: bankAccount._id, description: 'Monthly salary', date: makeDate(25), merchant: 'Tech Corp Inc', paymentMethod: 'bank_transfer' },
      { type: 'income', amount: 800, category: catMap['Freelance'], account: bankAccount._id, description: 'Website redesign project', date: makeDate(18), merchant: 'Client - StartupX', paymentMethod: 'bank_transfer' },
      { type: 'income', amount: 120, category: catMap['Investment'], account: bankAccount._id, description: 'Dividend payout', date: makeDate(10), merchant: 'Vanguard', paymentMethod: 'bank_transfer' },

      // Food & Dining
      { type: 'expense', amount: 85.50, category: catMap['Food & Dining'], account: creditCard._id, description: 'Weekly groceries', date: makeDate(2), merchant: 'Whole Foods', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 42.30, category: catMap['Food & Dining'], account: creditCard._id, description: 'Dinner with friends', date: makeDate(5), merchant: 'Olive Garden', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 28.99, category: catMap['Food & Dining'], account: cashAccount._id, description: 'Lunch delivery', date: makeDate(7), merchant: 'DoorDash', paymentMethod: 'cash' },
      { type: 'expense', amount: 95.20, category: catMap['Food & Dining'], account: creditCard._id, description: 'Weekly groceries', date: makeDate(9), merchant: 'Trader Joes', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 15.00, category: catMap['Food & Dining'], account: cashAccount._id, description: 'Coffee and pastry', date: makeDate(1), merchant: 'Starbucks', paymentMethod: 'cash' },
      { type: 'expense', amount: 67.80, category: catMap['Food & Dining'], account: creditCard._id, description: 'Restaurant dinner', date: makeDate(12), merchant: 'Chipotle', paymentMethod: 'credit_card' },

      // Transportation
      { type: 'expense', amount: 55.00, category: catMap['Transportation'], account: creditCard._id, description: 'Gas refill', date: makeDate(3), merchant: 'Shell', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 12.50, category: catMap['Transportation'], account: cashAccount._id, description: 'Uber ride', date: makeDate(8), merchant: 'Uber', paymentMethod: 'digital_wallet' },
      { type: 'expense', amount: 45.00, category: catMap['Transportation'], account: creditCard._id, description: 'Gas refill', date: makeDate(17), merchant: 'Chevron', paymentMethod: 'credit_card' },

      // Shopping
      { type: 'expense', amount: 129.99, category: catMap['Shopping'], account: creditCard._id, description: 'New sneakers', date: makeDate(4), merchant: 'Nike', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 34.99, category: catMap['Shopping'], account: cashAccount._id, description: 'Book purchase', date: makeDate(11), merchant: 'Barnes & Noble', paymentMethod: 'cash' },
      { type: 'expense', amount: 249.00, category: catMap['Shopping'], account: creditCard._id, description: 'Wireless headphones', date: makeDate(15), merchant: 'Apple', paymentMethod: 'credit_card' },

      // Entertainment
      { type: 'expense', amount: 15.99, category: catMap['Entertainment'], account: creditCard._id, description: 'Netflix subscription', date: makeDate(1), merchant: 'Netflix', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 10.99, category: catMap['Entertainment'], account: creditCard._id, description: 'Spotify Premium', date: makeDate(1), merchant: 'Spotify', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 25.00, category: catMap['Entertainment'], account: cashAccount._id, description: 'Movie tickets', date: makeDate(6), merchant: 'AMC Theatres', paymentMethod: 'cash' },

      // Bills & Utilities
      { type: 'expense', amount: 1200.00, category: catMap['Bills & Utilities'], account: bankAccount._id, description: 'Rent payment', date: makeDate(25), merchant: 'Property Management', paymentMethod: 'bank_transfer' },
      { type: 'expense', amount: 89.99, category: catMap['Bills & Utilities'], account: bankAccount._id, description: 'Internet bill', date: makeDate(20), merchant: 'Comcast', paymentMethod: 'bank_transfer' },
      { type: 'expense', amount: 65.30, category: catMap['Bills & Utilities'], account: bankAccount._id, description: 'Electric bill', date: makeDate(18), merchant: 'ConEdison', paymentMethod: 'bank_transfer' },
      { type: 'expense', amount: 45.00, category: catMap['Bills & Utilities'], account: bankAccount._id, description: 'Phone bill', date: makeDate(15), merchant: 'T-Mobile', paymentMethod: 'bank_transfer' },

      // Health & Medical
      { type: 'expense', amount: 35.00, category: catMap['Health & Medical'], account: creditCard._id, description: 'Pharmacy - vitamins', date: makeDate(13), merchant: 'CVS', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 50.00, category: catMap['Health & Medical'], account: bankAccount._id, description: 'Gym membership', date: makeDate(1), merchant: 'Planet Fitness', paymentMethod: 'bank_transfer' },

      // Education
      { type: 'expense', amount: 29.99, category: catMap['Education'], account: creditCard._id, description: 'Online course', date: makeDate(14), merchant: 'Udemy', paymentMethod: 'credit_card' },

      // Personal Care
      { type: 'expense', amount: 45.00, category: catMap['Personal Care'], account: cashAccount._id, description: 'Haircut', date: makeDate(10), merchant: 'Local Barber', paymentMethod: 'cash' },

      // Last month transactions for comparison
      { type: 'income', amount: 5500, category: catMap['Salary'], account: bankAccount._id, description: 'Monthly salary', date: new Date(thisYear, thisMonth - 1, 5), merchant: 'Tech Corp Inc', paymentMethod: 'bank_transfer' },
      { type: 'income', amount: 650, category: catMap['Freelance'], account: bankAccount._id, description: 'Logo design project', date: new Date(thisYear, thisMonth - 1, 15), merchant: 'Client - DesignCo', paymentMethod: 'bank_transfer' },
      { type: 'expense', amount: 1200, category: catMap['Bills & Utilities'], account: bankAccount._id, description: 'Rent payment', date: new Date(thisYear, thisMonth - 1, 1), merchant: 'Property Management', paymentMethod: 'bank_transfer' },
      { type: 'expense', amount: 380, category: catMap['Food & Dining'], account: creditCard._id, description: 'Monthly grocery total', date: new Date(thisYear, thisMonth - 1, 10), merchant: 'Various', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 120, category: catMap['Transportation'], account: creditCard._id, description: 'Gas + Uber', date: new Date(thisYear, thisMonth - 1, 12), merchant: 'Various', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 200, category: catMap['Shopping'], account: creditCard._id, description: 'Clothing purchase', date: new Date(thisYear, thisMonth - 1, 18), merchant: 'H&M', paymentMethod: 'credit_card' },
      { type: 'expense', amount: 89.99, category: catMap['Bills & Utilities'], account: bankAccount._id, description: 'Internet bill', date: new Date(thisYear, thisMonth - 1, 20), merchant: 'Comcast', paymentMethod: 'bank_transfer' },
      { type: 'expense', amount: 65, category: catMap['Bills & Utilities'], account: bankAccount._id, description: 'Electric bill', date: new Date(thisYear, thisMonth - 1, 22), merchant: 'ConEdison', paymentMethod: 'bank_transfer' },
      { type: 'expense', amount: 50, category: catMap['Health & Medical'], account: bankAccount._id, description: 'Gym membership', date: new Date(thisYear, thisMonth - 1, 1), merchant: 'Planet Fitness', paymentMethod: 'bank_transfer' },
    ];

    const createdTransactions = await Transaction.insertMany(
      transactions.map((t) => ({
        ...t,
        user: user._id,
        status: 'completed',
        currency: t.currency || 'USD',
        exchangeRate: 1,
        amountInBaseCurrency: t.amount,
      }))
    );
    console.log(`   Created ${createdTransactions.length} transactions`);

    // ========================================================================
    // 5. CREATE BUDGETS
    // ========================================================================
    console.log('📊 Creating budgets...');
    const startOfMonth = new Date(thisYear, thisMonth, 1);
    const endOfMonth = new Date(thisYear, thisMonth + 1, 0);

    await Budget.insertMany([
      {
        user: user._id,
        name: 'Monthly Budget',
        type: 'monthly',
        amount: 4000,
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 80,
        alertEnabled: true,
        color: '#5c7cfa'
      },
      {
        user: user._id,
        name: 'Food Budget',
        type: 'category',
        amount: 500,
        category: catMap['Food & Dining'],
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 75,
        color: '#FF3B30'
      },
      {
        user: user._id,
        name: 'Entertainment Budget',
        type: 'category',
        amount: 150,
        category: catMap['Entertainment'],
        startDate: startOfMonth,
        endDate: endOfMonth,
        alertThreshold: 90,
        color: '#5856D6'
      }
    ]);

    // ========================================================================
    // 6. CREATE GOALS
    // ========================================================================
    console.log('🎯 Creating goals...');
    const emergencyGoal = await Goal.create({
      user: user._id,
      name: 'Emergency Fund',
      description: '6 months of living expenses for financial security',
      targetAmount: 15000,
      currentAmount: 3200,
      category: 'emergency',
      priority: 'high',
      color: '#FF3B30',
      icon: '🚨',
      monthlyContribution: 500,
      isFeatured: true,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      milestones: [
        { name: '1 Month Expenses', targetAmount: 2500, reached: true, reachedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        { name: '3 Months Expenses', targetAmount: 7500, reached: false },
        { name: '6 Months Expenses', targetAmount: 15000, reached: false }
      ]
    });

    const vacationGoal = await Goal.create({
      user: user._id,
      name: 'Japan Trip 2026',
      description: 'Two-week vacation to Tokyo and Kyoto',
      targetAmount: 5000,
      currentAmount: 1800,
      category: 'vacation',
      priority: 'medium',
      color: '#FF9500',
      icon: '✈️',
      monthlyContribution: 300,
      targetDate: new Date(thisYear, 8, 1)
    });

    const laptopGoal = await Goal.create({
      user: user._id,
      name: 'New MacBook Pro',
      description: 'Upgrade work laptop for better performance',
      targetAmount: 2500,
      currentAmount: 800,
      category: 'purchase',
      priority: 'low',
      color: '#AF52DE',
      icon: '💻',
      monthlyContribution: 200
    });

    // Create contribution history
    await Contribution.insertMany([
      // Emergency fund contributions
      { goal: emergencyGoal._id, user: user._id, type: 'deposit', amount: 500, note: 'Monthly contribution', date: new Date(thisYear, thisMonth - 3, 15) },
      { goal: emergencyGoal._id, user: user._id, type: 'deposit', amount: 500, note: 'Monthly contribution', date: new Date(thisYear, thisMonth - 2, 15) },
      { goal: emergencyGoal._id, user: user._id, type: 'deposit', amount: 1000, note: 'Freelance bonus', date: new Date(thisYear, thisMonth - 2, 25) },
      { goal: emergencyGoal._id, user: user._id, type: 'deposit', amount: 500, note: 'Monthly contribution', date: new Date(thisYear, thisMonth - 1, 15) },
      { goal: emergencyGoal._id, user: user._id, type: 'deposit', amount: 500, note: 'Monthly contribution', date: makeDate(10) },
      { goal: emergencyGoal._id, user: user._id, type: 'withdrawal', amount: 300, note: 'Car repair emergency', date: makeDate(5) },

      // Vacation contributions
      { goal: vacationGoal._id, user: user._id, type: 'deposit', amount: 500, note: 'Initial deposit', date: new Date(thisYear, thisMonth - 2, 1) },
      { goal: vacationGoal._id, user: user._id, type: 'deposit', amount: 300, note: 'Monthly contribution', date: new Date(thisYear, thisMonth - 2, 15) },
      { goal: vacationGoal._id, user: user._id, type: 'deposit', amount: 300, note: 'Monthly contribution', date: new Date(thisYear, thisMonth - 1, 15) },
      { goal: vacationGoal._id, user: user._id, type: 'deposit', amount: 400, note: 'Extra savings', date: makeDate(8) },
      { goal: vacationGoal._id, user: user._id, type: 'deposit', amount: 300, note: 'Monthly contribution', date: makeDate(2) },

      // Laptop contributions
      { goal: laptopGoal._id, user: user._id, type: 'deposit', amount: 300, note: 'Started saving', date: new Date(thisYear, thisMonth - 3, 1) },
      { goal: laptopGoal._id, user: user._id, type: 'deposit', amount: 200, note: 'Monthly contribution', date: new Date(thisYear, thisMonth - 2, 15) },
      { goal: laptopGoal._id, user: user._id, type: 'deposit', amount: 300, note: 'Bonus from work', date: new Date(thisYear, thisMonth - 1, 20) },
    ]);

    // ========================================================================
    // 7. CREATE RECURRING RULES
    // ========================================================================
    console.log('🔄 Creating recurring rules...');
    await RecurringRule.insertMany([
      {
        user: user._id,
        name: 'Monthly Salary',
        template: {
          type: 'income',
          amount: 5500,
          category: catMap['Salary'],
          account: bankAccount._id,
          description: 'Monthly salary',
          merchant: 'Tech Corp Inc',
          paymentMethod: 'bank_transfer'
        },
        frequency: 'monthly',
        dayOfExecution: 5,
        startDate: new Date(thisYear, 0, 1),
        nextRunDate: new Date(thisYear, thisMonth + 1, 5),
        lastRunDate: makeDate(25),
        executionCount: thisMonth + 1,
        isActive: true,
        icon: '💼',
        color: '#34C759'
      },
      {
        user: user._id,
        name: 'Netflix Subscription',
        template: {
          type: 'expense',
          amount: 15.99,
          category: catMap['Entertainment'],
          account: creditCard._id,
          description: 'Netflix subscription',
          merchant: 'Netflix',
          paymentMethod: 'credit_card'
        },
        frequency: 'monthly',
        dayOfExecution: 1,
        startDate: new Date(thisYear, 0, 1),
        nextRunDate: new Date(thisYear, thisMonth + 1, 1),
        lastRunDate: makeDate(1),
        executionCount: thisMonth + 1,
        isActive: true,
        icon: '🎬',
        color: '#E50914'
      },
      {
        user: user._id,
        name: 'Gym Membership',
        template: {
          type: 'expense',
          amount: 50,
          category: catMap['Health & Medical'],
          account: bankAccount._id,
          description: 'Gym membership',
          merchant: 'Planet Fitness',
          paymentMethod: 'bank_transfer'
        },
        frequency: 'monthly',
        dayOfExecution: 1,
        startDate: new Date(thisYear, 0, 1),
        nextRunDate: new Date(thisYear, thisMonth + 1, 1),
        lastRunDate: makeDate(1),
        executionCount: thisMonth + 1,
        isActive: true,
        icon: '🏋️',
        color: '#34C759'
      }
    ]);

    // ========================================================================
    // 8. CREATE SECOND DUMMY USER WITH 2 YEARS OF DATA (GRAPH FRIENDLY)
    // ========================================================================
    console.log('🧑‍💼 Creating second demo user with 24-month history...');
    const powerUser = await User.create({
      name: 'Alex Johnson',
      email: 'alex.demo@expensetracker.com',
      password: 'demo1234',
      currency: 'USD',
      isVerified: true,
      role: 'user'
    });

    const powerAccounts = await Account.insertMany([
      {
        user: powerUser._id,
        name: 'Primary Bank',
        type: 'bank',
        balance: 18400,
        icon: '🏦',
        color: '#007AFF',
        isDefault: true
      },
      {
        user: powerUser._id,
        name: 'Wallet',
        type: 'cash',
        balance: 620,
        icon: '💵',
        color: '#34C759'
      },
      {
        user: powerUser._id,
        name: 'Travel Card',
        type: 'credit_card',
        balance: -420,
        creditLimit: 8000,
        icon: '💳',
        color: '#FF3B30'
      }
    ]);

    const powerBank = powerAccounts[0];
    const powerWallet = powerAccounts[1];
    const powerCard = powerAccounts[2];

    const powerCategories = await Category.createDefaultsForUser(powerUser._id);
    const powerCatMap = {};
    powerCategories.forEach(c => { powerCatMap[c.name] = c._id; });

    const twoYearTransactions = [];
    for (let monthOffset = 23; monthOffset >= 0; monthOffset -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      const index = 23 - monthOffset;
      const seasonalFactor = 1 + Math.sin(index / 3) * 0.08;

      const salary = Math.round((6200 + (index % 4) * 110) * seasonalFactor);
      const groceries = Math.round((360 + (index % 5) * 22) * seasonalFactor);
      const transport = Math.round((140 + (index % 4) * 16) * seasonalFactor);
      const utilities = Math.round((170 + (index % 3) * 18) * seasonalFactor);
      const entertainment = Math.round((120 + (index % 6) * 15) * seasonalFactor);
      const shopping = Math.round((180 + (index % 7) * 24) * seasonalFactor);

      twoYearTransactions.push(
        {
          user: powerUser._id,
          type: 'income',
          amount: salary,
          category: powerCatMap['Salary'],
          account: powerBank._id,
          description: 'Monthly salary',
          date: new Date(year, month, 5),
          merchant: 'Northstar Labs',
          paymentMethod: 'bank_transfer',
          status: 'completed'
        },
        {
          user: powerUser._id,
          type: 'expense',
          amount: 1550,
          category: powerCatMap['Bills & Utilities'],
          account: powerBank._id,
          description: 'Rent payment',
          date: new Date(year, month, 1),
          merchant: 'Skyline Properties',
          paymentMethod: 'bank_transfer',
          status: 'completed'
        },
        {
          user: powerUser._id,
          type: 'expense',
          amount: groceries,
          category: powerCatMap['Food & Dining'],
          account: powerCard._id,
          description: 'Grocery shopping',
          date: new Date(year, month, 7),
          merchant: 'Whole Foods',
          paymentMethod: 'credit_card',
          status: 'completed'
        },
        {
          user: powerUser._id,
          type: 'expense',
          amount: transport,
          category: powerCatMap['Transportation'],
          account: powerCard._id,
          description: 'Fuel and rideshare',
          date: new Date(year, month, 12),
          merchant: 'Uber',
          paymentMethod: 'credit_card',
          status: 'completed'
        },
        {
          user: powerUser._id,
          type: 'expense',
          amount: utilities,
          category: powerCatMap['Bills & Utilities'],
          account: powerBank._id,
          description: 'Utilities bundle',
          date: new Date(year, month, 16),
          merchant: 'City Utilities',
          paymentMethod: 'bank_transfer',
          status: 'completed'
        },
        {
          user: powerUser._id,
          type: 'expense',
          amount: entertainment,
          category: powerCatMap['Entertainment'],
          account: powerCard._id,
          description: 'Streaming and movies',
          date: new Date(year, month, 20),
          merchant: 'Netflix',
          paymentMethod: 'credit_card',
          status: 'completed'
        },
        {
          user: powerUser._id,
          type: 'expense',
          amount: shopping,
          category: powerCatMap['Shopping'],
          account: powerCard._id,
          description: 'General shopping',
          date: new Date(year, month, 24),
          merchant: 'Amazon',
          paymentMethod: 'credit_card',
          status: 'completed'
        },
        {
          user: powerUser._id,
          type: 'expense',
          amount: 52,
          category: powerCatMap['Health & Medical'],
          account: powerBank._id,
          description: 'Gym membership',
          date: new Date(year, month, 2),
          merchant: 'Anytime Fitness',
          paymentMethod: 'bank_transfer',
          status: 'completed'
        },
        {
          user: powerUser._id,
          type: 'expense',
          amount: 40,
          category: powerCatMap['Personal Care'],
          account: powerWallet._id,
          description: 'Personal care',
          date: new Date(year, month, 10),
          merchant: 'Local Barber',
          paymentMethod: 'cash',
          status: 'completed'
        }
      );

      if (index % 3 === 0) {
        twoYearTransactions.push({
          user: powerUser._id,
          type: 'income',
          amount: Math.round((780 + (index % 5) * 60) * seasonalFactor),
          category: powerCatMap['Freelance'],
          account: powerBank._id,
          description: 'Freelance side project',
          date: new Date(year, month, 27),
          merchant: 'Client Studio',
          paymentMethod: 'bank_transfer',
          status: 'completed'
        });
      }
    }

    const createdPowerTransactions = await Transaction.insertMany(
      twoYearTransactions.map((t) => ({
        ...t,
        currency: t.currency || 'USD',
        exchangeRate: 1,
        amountInBaseCurrency: t.amount,
      }))
    );

    // ========================================================================
    // DONE
    // ========================================================================
    console.log('\n✅ Seed completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   User 1:       ${user.email} / demo1234`);
    console.log(`   User 1 Data:  ${accounts.length} accounts, ${defaultCats.length} categories, ${createdTransactions.length} transactions`);
    console.log(`   User 1 Extras:${3} budgets, ${3} goals, ${3} recurring`);
    console.log(`   User 2:       ${powerUser.email} / demo1234`);
    console.log(`   User 2 Data:  ${powerAccounts.length} accounts, ${powerCategories.length} categories, ${createdPowerTransactions.length} transactions (24 months)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
