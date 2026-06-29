/**
 * Standard error class for the whole backend. Throw this from any
 * controller/service and the global error middleware (in app.js)
 * will format it into a consistent JSON response.
 *
 * Usage:
 *   throw new ApiError(404, 'Event not found');
 *   throw new ApiError(400, 'Invalid input', ['title is required']);
 */
class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.data = null;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;