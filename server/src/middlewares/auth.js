const jwt          = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError     = require('../utils/ApiError');
//const User         = require('../models/User');

// ───────────────────────────────────────────────────────────────────────────
// NOTE FOR TEAM: this file assumes a few things about how login/signup
// issues tokens. Whoever owns the auth flow should double check and adjust:
//   1. Where the token lives — Authorization: Bearer header, or a cookie?
//      (extractToken below checks both, cookie first)
//   2. What field the JWT payload uses for the user id — assumed `id`.
//   3. That the User model has a `role` field (e.g. 'student' | 'admin').
// If your login flow already issues tokens differently, update
// extractToken() and the payload field name here rather than creating
// a second, conflicting auth middleware elsewhere.
// ───────────────────────────────────────────────────────────────────────────

const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }

  return null;
};

/**
 * Mandatory auth — blocks the request entirely if there's no valid token.
 * Use on any route only logged-in users should reach at all.
 */
exports.protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ApiError(401, 'You must be logged in to access this resource');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists');
  }

  req.user = user;
  next();
});

/**
 * Optional auth — for public routes (event listing, event detail page)
 * that need to behave slightly differently for a logged-in admin
 * (e.g. seeing draft events) but must NOT reject anonymous visitors.
 * Never throws — worst case, req.user just stays undefined.
 */
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (err) {
    // Expired/invalid token on a public route — just continue as anonymous
  }

  next();
});

/**
 * Role gate — use AFTER protect(). Throws 403 if the logged-in user's
 * role isn't in the allowed list.
 *
 * Usage: router.post('/', protect, restrictTo('admin'), createEvent);
 */
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'You must be logged in to access this resource');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Your role ('${req.user.role}') is not permitted to perform this action`);
    }

    next();
  };
};