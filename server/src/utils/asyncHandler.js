/**
 * Wraps an async Express route handler so any thrown error or rejected
 * promise is automatically forwarded to next(err) — removing the need
 * for try/catch in every single controller function.
 *
 * Usage:
 *   exports.getAllEvents = asyncHandler(async (req, res) => { ... });
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;