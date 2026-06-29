const mongoose    = require('mongoose');
const Event       = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const ApiError    = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const SORT_OPTIONS = {
  newest:    { createdAt: -1 },
  date_asc:  { 'date.start': 1 },
  date_desc: { 'date.start': -1 },
  popular:   { viewCount: -1 },
};

// ── @desc    Create a new event ──────────────────────────────────────────────
// ── @route   POST /api/events ────────────────────────────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.createEvent = asyncHandler(async (req, res) => {
  const {
    title, shortDescription, description, coverImage,
    category, tags, venue, date, registrationDeadline,
    maxParticipants, isTeamEvent, teamSize,
    isPaid, registrationFee, organizer,
    speakers, schedule, prizes,
  } = req.body;

  if (!title || !shortDescription || !description || !category || !venue?.name || !date?.start || !organizer?.name) {
    throw new ApiError(400, 'Missing required event fields');
  }

  if (date.end && new Date(date.end) < new Date(date.start)) {
    throw new ApiError(400, 'Event end date cannot be before start date');
  }

  const event = await Event.create({
    title, shortDescription, description, coverImage,
    category, tags, venue, date, registrationDeadline,
    maxParticipants, isTeamEvent, teamSize,
    isPaid, registrationFee, organizer,
    speakers, schedule, prizes,
    // TODO: replace with req.user._id when auth middleware is added
    createdBy: req.body.createdBy || new mongoose.Types.ObjectId(),
  });

  return res.status(201).json(new ApiResponse(201, event, 'Event created successfully'));
});

// ── @desc    Get all events (filter / search / sort / paginate) ──────────────
// ── @route   GET /api/events ─────────────────────────────────────────────────
// ── @access  Public ──────────────────────────────────────────────────────────

exports.getAllEvents = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 10,
    category, status,
    search, upcoming, past, featured,
    sort = 'date_asc',
  } = req.query;

  const filter = {};

  // Default: show only published events
  // When auth is added, admins will be able to see all statuses
  filter.status = status || 'published';

  if (category)        filter.category   = category;
  if (featured === 'true') filter.isFeatured = true;

  const now = new Date();
  if (upcoming === 'true') filter['date.start'] = { $gte: now };
  if (past === 'true')     filter['date.start'] = { $lt:  now };

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or  = [{ title: regex }, { shortDescription: regex }, { tags: regex }];
  }

  const pageNum  = Math.max(1, parseInt(page,  10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip     = (pageNum - 1) * limitNum;
  const sortBy   = SORT_OPTIONS[sort] || SORT_OPTIONS.date_asc;

  const [events, totalEvents] = await Promise.all([
    Event.find(filter).sort(sortBy).skip(skip).limit(limitNum).lean(),
    Event.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalEvents / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      events,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalEvents,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    }, 'Events fetched successfully')
  );
});

// ── @desc    Get a single event by slug (public detail page) ─────────────────
// ── @route   GET /api/events/slug/:slug ──────────────────────────────────────
// ── @access  Public ──────────────────────────────────────────────────────────

exports.getEventBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const event = await Event.findOne({ slug });

  if (!event)                        throw new ApiError(404, 'Event not found');
  if (event.status !== 'published')  throw new ApiError(404, 'Event not found');

  event.incrementView().catch((err) =>
    console.error('[Event] Failed to increment view count:', err.message)
  );

  return res.status(200).json(new ApiResponse(200, event, 'Event fetched successfully'));
});

// ── @desc    Get event by ID (admin edit form) ───────────────────────────────
// ── @route   GET /api/events/:id ─────────────────────────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new ApiError(400, 'Invalid event ID');

  const event = await Event.findById(id);

  if (!event) throw new ApiError(404, 'Event not found');

  return res.status(200).json(new ApiResponse(200, event, 'Event fetched successfully'));
});

// ── @desc    Update an event ─────────────────────────────────────────────────
// ── @route   PATCH /api/events/:id ───────────────────────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new ApiError(400, 'Invalid event ID');

  const event = await Event.findById(id);

  if (!event) throw new ApiError(404, 'Event not found');

  // Strip system-managed fields — these should never be set directly via PATCH
  const { slug, registeredCount, viewCount, createdBy, ...safeUpdates } = req.body;

  if (safeUpdates.date?.end && safeUpdates.date?.start &&
      new Date(safeUpdates.date.end) < new Date(safeUpdates.date.start)) {
    throw new ApiError(400, 'Event end date cannot be before start date');
  }

  Object.assign(event, safeUpdates);
  // TODO: set event.lastUpdatedBy = req.user._id when auth is added

  await event.save();

  return res.status(200).json(new ApiResponse(200, event, 'Event updated successfully'));
});

// ── @desc    Change event status only ────────────────────────────────────────
// ── @route   PATCH /api/events/:id/status ────────────────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.changeEventStatus = asyncHandler(async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;

  const allowedStatuses = ['draft', 'published', 'cancelled', 'completed'];

  if (!isValidObjectId(id)) throw new ApiError(400, 'Invalid event ID');

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowedStatuses.join(', ')}`);
  }

  const event = await Event.findByIdAndUpdate(id, { status }, { new: true });

  if (!event) throw new ApiError(404, 'Event not found');

  return res.status(200).json(new ApiResponse(200, event, `Event status changed to '${status}'`));
});

// ── @desc    Delete an event ─────────────────────────────────────────────────
// ── @route   DELETE /api/events/:id ──────────────────────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new ApiError(400, 'Invalid event ID');

  const event = await Event.findByIdAndDelete(id);

  if (!event) throw new ApiError(404, 'Event not found');

  // NOTE: registrations for this event are NOT cascade-deleted here.
  // This will be handled in a follow-up task when auth + admin panel is wired up.

  return res.status(200).json(new ApiResponse(200, null, 'Event deleted successfully'));
});