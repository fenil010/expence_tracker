/**
 * Error Handler Middleware
 * 
 * Centralized error handling with custom AppError class.
 * Handles MongoDB-specific errors, JWT errors, validation errors,
 * session/transaction errors, and rate limit errors.
 */

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle MongoDB Cast Error (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Duplicate Key Error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue?.[field];
  const message = field
    ? `Duplicate value for "${field}": "${value}". Please use a different value.`
    : 'Duplicate field value. Please use a different value.';
  return new AppError(message, 400);
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(e => e.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Invalid Token Error
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

/**
 * Handle JWT Expired Token Error
 */
const handleJWTExpiredError = () => {
  return new AppError('Token has expired. Please log in again.', 401);
};

/**
 * Handle MongoDB Transaction/Session Errors
 */
const handleTransactionError = (err) => {
  return new AppError('Database transaction failed. Please try again.', 500);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status || 'error',
    message: err.message,
    error: err,
    stack: err.stack
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational errors: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  } else {
    // Programming/unknown errors: don't leak details
    console.error('ERROR 💥:', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    // MongoDB Cast Error
    if (err.name === 'CastError') error = handleCastError(err);

    // MongoDB Duplicate Key
    if (err.code === 11000) error = handleDuplicateKeyError(err);

    // Mongoose Validation Error
    if (err.name === 'ValidationError') error = handleValidationError(err);

    // JWT Errors
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // MongoDB Transaction Errors
    if (err.message?.includes('Transaction') || err.message?.includes('session')) {
      error = handleTransactionError(err);
    }

    sendErrorProd(error, res);
  }
};

export { AppError };
export default errorHandler;
