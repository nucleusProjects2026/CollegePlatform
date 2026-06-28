const express = require('express');
const router  = express.Router();

const {
  createEvent,
  getAllEvents,
  getEventBySlug,
  getEventById,
  updateEvent,
  changeEventStatus,
  deleteEvent,
} = require('../controllers/eventController');

const { protect, optionalAuth, restrictTo } = require('../middlewares/auth');

// ── Public routes ──────────────────────────────────────────────────────────
// optionalAuth attaches req.user IF a valid token is present, without
// rejecting anonymous visitors. This lets a logged-in admin browsing the
// site preview draft events, while everyone else only ever sees published ones.

router.get('/', optionalAuth, getAllEvents);
router.get('/slug/:slug', optionalAuth, getEventBySlug);

// ── Admin-only routes ─────────────────────────────────────────────────────
// protect requires a valid token. restrictTo('admin') then requires the
// logged-in user's role to actually be 'admin'.

router.post('/', protect, restrictTo('admin'), createEvent);
router.get('/:id', protect, restrictTo('admin'), getEventById);
router.patch('/:id', protect, restrictTo('admin'), updateEvent);
router.patch('/:id/status', protect, restrictTo('admin'), changeEventStatus);
router.delete('/:id', protect, restrictTo('admin'), deleteEvent);

module.exports = router;