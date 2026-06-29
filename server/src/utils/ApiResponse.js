/**
 * Standard success response shape for the whole backend, so every
 * endpoint — yours and your teammates' — returns JSON in the same shape.
 *
 * Usage:
 *   return res.status(200).json(new ApiResponse(200, event, 'Event fetched'));
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;