const express = require('express');
const router  = express.Router();

const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  checkRegistrationStatus,
  getEventRegistrations,
  checkInAttendee,
  exportRegistrations,
  updateRegistrationStatus,
} = require('../controllers/registrationController');

const { protect, restrictTo } = require('../middlewares/auth');

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: specific routes MUST come before param routes (:id, :eventId)
// to avoid Express treating "my" or "checkin" as an id value.
// ─────────────────────────────────────────────────────────────────────────────

// ── Student routes ────────────────────────────────────────────────────────────

// GET  /api/registrations/my
// → All events the logged-in user registered for (My Events page)
router.get('/my', protect, getMyRegistrations);

// GET  /api/registrations/event/:eventId/status
// → Is the current user registered for this event? (Event Detail page button)
router.get('/event/:eventId/status', protect, checkRegistrationStatus);

// POST /api/registrations/event/:eventId
// → Register for an event
router.post('/event/:eventId', protect, registerForEvent);

// PATCH /api/registrations/:id/cancel
// → Student cancels their own registration
router.patch('/:id/cancel', protect, cancelRegistration);

// ── Admin routes ──────────────────────────────────────────────────────────────

// GET  /api/registrations/event/:eventId/export
// → Download CSV of all registrations for an event
// NOTE: /export must be before /event/:eventId to avoid param collision
router.get('/event/:eventId/export', protect, restrictTo('admin'), exportRegistrations);

// GET  /api/registrations/event/:eventId
// → Admin views all registrations for an event (with stats + pagination)
router.get('/event/:eventId', protect, restrictTo('admin'), getEventRegistrations);

// PATCH /api/registrations/checkin
// → Admin scans a QR code to check in an attendee
router.patch('/checkin', protect, restrictTo('admin'), checkInAttendee);

// PATCH /api/registrations/:id/status
// → Admin manually changes any registration's status
router.patch('/:id/status', protect, restrictTo('admin'), updateRegistrationStatus);

module.exports = router;