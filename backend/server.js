/**
 * Expense Tracker API - Main Server File
 * 
 * This is the entry point for the Express.js backend.
 * It sets up middleware, routes, database connection, and error handling.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import categoryRoutes from './routes/categories.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import accountRoutes from './routes/accounts.js';
import notificationRoutes from './routes/notifications.js';
import aiRoutes from './routes/ai.js';

// Import error handling middleware
import errorHandler from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================================================
// SECURITY MIDDLEWARE
// ========================================================================

// Helmet - Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// CORS - Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Max 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// ========================================================================
// BODY PARSING & LOGGING
// ========================================================================

// Parse JSON bodies (tight size limit to prevent payload bombs)
app.use(express.json({ limit: '1mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// NoSQL injection prevention — strips $-prefixed operators from req.body/query/params
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Sanitized ${key} in request from ${req.ip}`);
  }
}));

// HTTP Parameter Pollution protection
app.use(hpp());

// HTTP request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ========================================================================
// API ROUTES
// ========================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Expense Tracker API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount route handlers
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// ========================================================================
// STATIC FILE SERVING (for uploaded receipts)
// ========================================================================

app.use('/uploads', express.static('uploads'));

// ========================================================================
// ERROR HANDLING
// ========================================================================

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ========================================================================
// DATABASE CONNECTION & SERVER START
// ========================================================================

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected Successfully');

    // Log database connection info
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📦 Database: ${dbName}`);

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   💰 Expense Tracker API Server                            ║
║                                                            ║
║   🚀 Server running on port ${PORT}                          ║
║   📍 Environment: ${process.env.NODE_ENV || 'development'}                        ║
║   🔗 API Base: http://localhost:${PORT}/api                  ║
║                                                            ║
║   Endpoints:                                               ║
║   • Auth:         /api/auth                                ║
║   • Transactions: /api/transactions                        ║
║   • Categories:   /api/categories                          ║
║   • Budgets:      /api/budgets                             ║
║   • Goals:        /api/goals                               ║
║   • Users:        /api/users                               ║
║   • Reports:      /api/reports                             ║
║   • Accounts:     /api/accounts                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;

