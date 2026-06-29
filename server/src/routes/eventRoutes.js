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

// NOTE: Auth middleware removed for now 
// When auth is added back, import { protect, restrictTo } from '../middlewares/auth'
// and add them to the admin routes below.

router.get('/',             getAllEvents);
router.get('/slug/:slug',   getEventBySlug);
router.post('/',            createEvent);
router.get('/:id',          getEventById);
router.patch('/:id',        updateEvent);
router.patch('/:id/status', changeEventStatus);
router.delete('/:id',       deleteEvent);

module.exports = router;