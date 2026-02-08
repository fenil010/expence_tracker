/**
 * 404 Not Found Handler
 * 
 * Catches undefined routes and returns a proper response.
 */

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export { notFound };

