/**
 * Global error handler. Must be registered LAST in app.js, after all
 * routes — Express only calls error-handling middleware (4 args)
 * when something upstream calls next(err) or throws inside an
 * asyncHandler-wrapped function.
 *
 * Usage in app.js:
 *   const errorHandler = require('./middlewares/errorHandler');
 *   // ...all your app.use(routes) calls...
 *   app.use(errorHandler); // must be last
 */

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Mongoose: invalid ObjectId format passed in a route param
  if (err.name === 'CastError') {
    error = { statusCode: 400, message: `Invalid ${err.path}: ${err.value}` };
  }

  // Mongoose: schema validation failed (required field missing, enum mismatch, etc.)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = { statusCode: 400, message: messages.join(', ') };
  }

  // Mongoose: duplicate key (e.g. unique slug, or the event+user compound index)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = { statusCode: 409, message: `Duplicate value for '${field}' — this already exists` };
  }

  const statusCode = error.statusCode || 500;
  const message     = error.message || 'Internal server error';

  if (statusCode === 500) {
    // Log full details server-side for unexpected errors — never expose
    // stack traces to the client in production.
    console.error('[Unhandled Error]', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;