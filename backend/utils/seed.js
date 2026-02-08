/**
 * Database Seed Script
 * 
 * Seeds the database with initial data for development and testing.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';

dotenv.config();

const sampleTransactions = [
  {
    type: 'income',
    category: 'Salary',
    amount: 6500.00,
    description: 'Monthly Salary',
    date: new Date('2026-01-01'),
    status: 'completed'
  },
  {
    type: 'expense',
    category: 'Food & Dining',
    amount: 385.50,
    description: 'Whole Foods groceries',
    date: new Date('2026-01-03'),
    status: 'completed'
  },
  {
    type: 'expense',
    category: 'Transportation',
    amount: 145.00,
    description: 'Uber rides',
    date: new Date('2026-01-05'),
    status: 'completed'
  },
  {
    type: 'expense',
    category: 'Shopping',
    amount: 520.00,
    description: 'New headphones',
    date: new Date('2026-01-08'),
    status: 'completed'
  },
  {
    type: 'income',
    category: 'Freelance',
    amount: 1200.00,
    description: 'UI Design project',
    date: new Date('2026-01-12'),
    status: 'completed'
  }
];

const sampleGoals = [
  {
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 3500,
    category: 'emergency',
    priority: 'high',
    color: '#FF3B30',
    icon: '🚨',
    targetDate: new Date('2026-12-31'),
    status: 'active'
  },
  {
    name: 'Vacation Fund',
    targetAmount: 5000,
    currentAmount: 1200,
    category: 'vacation',
    priority: 'medium',
    color: '#34C759',
    icon: '✈️',
    targetDate: new Date('2026-08-01'),
    status: 'active'
  }
];

async function seed() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Transaction.deleteMany({}),
      Category.deleteMany({}),
      Budget.deleteMany({}),
      Goal.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    const user = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'demo1234',
      currency: 'USD',
      isVerified: true
    });
    console.log('👤 Created demo user');

    const defaultCategories = Category.getDefaultCategories();
    const categoryDocs = [];
    for (const cat of defaultCategories.income) {
      categoryDocs.push({ user: user._id, ...cat, type: 'income', isSystem: true });
    }
    for (const cat of defaultCategories.expense) {
      categoryDocs.push({ user: user._id, ...cat, type: 'expense', isSystem: true });
    }
    await Category.insertMany(categoryDocs);
    console.log('📁 Created categories');

    const transactionDocs = sampleTransactions.map(t => ({
      ...t,
      user: user._id,
      currency: 'USD',
      amountInBaseCurrency: t.amount,
      exchangeRate: 1
    }));
    await Transaction.insertMany(transactionDocs);
    console.log('💰 Created transactions');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    await Budget.create({
      user: user._id,
      name: 'Monthly Budget',
      type: 'monthly',
      amount: 4500,
      startDate: startOfMonth,
      endDate: endOfMonth,
      alertThreshold: 80,
      color: '#5c7cfa'
    });
    console.log('📊 Created budget');

    const goalDocs = sampleGoals.map(g => ({
      ...g,
      user: user._id,
      currency: 'USD'
    }));
    await Goal.insertMany(goalDocs);
    console.log('🎯 Created goals');

    console.log('\n✅ Seed completed!');
    console.log('Email: demo@example.com');
    console.log('Password: demo1234\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

