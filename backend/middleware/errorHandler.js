/**
 * Error Handler Middleware
 * 
 * Centralized error handling for the API.
 */

/**
 * Custom Error class
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Cast error handler (invalid MongoDB ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Duplicate key error handler
 */
const handleDuplicateKeyDB = (err) => {
  // Extract the field name from the error
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate value for ${field}. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Validation error handler
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * JWT error handler
 */
const handleJWTError = () => 
  new AppError('Invalid token. Please log in again.', 401);

/**
 * JWT expired error handler
 */
const handleJWTExpiredError = () => 
  new AppError('Your token has expired. Please log in again.', 401);

/**
 * Send error in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Send error in production
 */
const sendErrorProd = (err, res) => {
  // Operational error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('ERROR 💥', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};

/**
 * Main error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log error for debugging
  console.error(`[ERROR] ${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Handle specific error types
  if (err.name === 'CastError') {
    err = handleCastErrorDB(err);
  }
  
  if (err.code === 11000) {
    err = handleDuplicateKeyDB(err);
  }
  
  if (err.name === 'ValidationError') {
    err = handleValidationErrorDB(err);
  }
  
  if (err.name === 'JsonWebTokenError') {
    err = handleJWTError();
  }
  
  if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

export default errorHandler;

