/**
 * Async Handler Middleware
 * 
 * Wraps async route handlers to automatically catch errors
 * and pass them to Express error handling middleware.
 * Eliminates try/catch boilerplate in every route.
 */

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
