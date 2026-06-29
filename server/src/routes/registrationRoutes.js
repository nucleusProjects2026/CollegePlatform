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

// NOTE: Auth middleware removed for now 
// When auth is added back, import { protect, restrictTo } from '../middlewares/auth'
// and add them back to each route.

// IMPORTANT: specific named routes (/my, /checkin) MUST stay above param
// routes (/:id, /event/:eventId) so Express doesn't treat them as ID values.

router.get('/my',                        getMyRegistrations);
router.get('/event/:eventId/status',     checkRegistrationStatus);
router.get('/event/:eventId/export',     exportRegistrations);
router.get('/event/:eventId',            getEventRegistrations);
router.post('/event/:eventId',           registerForEvent);
router.patch('/checkin',                 checkInAttendee);
router.patch('/:id/cancel',              cancelRegistration);
router.patch('/:id/status',              updateRegistrationStatus);

module.exports = router;