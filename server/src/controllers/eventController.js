const mongoose      = require('mongoose');
const Event         = require('../models/Event');
const asyncHandler   = require('../utils/asyncHandler');
const ApiError       = require('../utils/ApiError');
const ApiResponse    = require('../utils/ApiResponse');

// ── Helpers ──────────────────────────────────────────────────────────────────

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Allowed sort options exposed to the client, mapped to actual sort objects */
const SORT_OPTIONS = {
  newest:     { createdAt: -1 },
  date_asc:   { 'date.start': 1 },
  date_desc:  { 'date.start': -1 },
  popular:    { viewCount: -1 },
};

// ── @desc    Create a new event ─────────────────────────────────────────────
// ── @route   POST /api/events ────────────────────────────────────────────────
// ── @access  Admin ──────────────────────────────────────────────────────────

exports.createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    shortDescription,
    description,
    coverImage,
    category,
    tags,
    venue,
    date,
    registrationDeadline,
    maxParticipants,
    isTeamEvent,
    teamSize,
    isPaid,
    registrationFee,
    organizer,
    speakers,
    schedule,
    prizes,
  } = req.body;

  // Basic required-field validation (mongoose validates too, but we want
  // a clean 400 before hitting the DB at all)
  if (!title || !shortDescription || !description || !category || !venue?.name || !date?.start || !organizer?.name) {
    throw new ApiError(400, 'Missing required event fields');
  }

  // Sanity check: end date can't be before start date
  if (date.end && new Date(date.end) < new Date(date.start)) {
    throw new ApiError(400, 'Event end date cannot be before start date');
  }

  const event = await Event.create({
    title,
    shortDescription,
    description,
    coverImage,
    category,
    tags,
    venue,
    date,
    registrationDeadline,
    maxParticipants,
    isTeamEvent,
    teamSize,
    isPaid,
    registrationFee,
    organizer,
    speakers,
    schedule,
    prizes,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, event, 'Event created successfully'));
});

// ── @desc    Get all events — supports filtering, search, sorting, pagination ──
// ── @route   GET /api/events ─────────────────────────────────────────────────
// ── @access  Public (shows only published) / Admin (sees everything) ─────────

exports.getAllEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    status,
    search,
    upcoming,
    past,
    featured,
    sort = 'date_asc',
  } = req.query;

  const isAdmin = req.user?.role === 'admin';
  const filter = {};

  // ── Status: public users only ever see published events ──
  if (isAdmin) {
    if (status) filter.status = status; // admin can filter by any status, or omit for all
  } else {
    filter.status = 'published';
  }

  if (category) filter.category = category;
  if (featured === 'true') filter.isFeatured = true;

  // ── Time window filters ──
  const now = new Date();
  if (upcoming === 'true') filter['date.start'] = { $gte: now };
  if (past === 'true') filter['date.start'] = { $lt: now };

  // ── Search across title, short description, and tags ──
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { title: regex },
      { shortDescription: regex },
      { tags: regex },
    ];
  }

  // ── Pagination ──
  const pageNum  = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip     = (pageNum - 1) * limitNum;

  const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.date_asc;

  const [events, totalEvents] = await Promise.all([
    Event.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email')
      .lean(),
    Event.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalEvents / limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      events,
      pagination: {
        currentPage:  pageNum,
        totalPages,
        totalEvents,
        hasNextPage:  pageNum < totalPages,
        hasPrevPage:  pageNum > 1,
      },
    }, 'Events fetched successfully')
  );
});

// ── @desc    Get a single event by its slug (public-facing detail page) ──────
// ── @route   GET /api/events/slug/:slug ──────────────────────────────────────
// ── @access  Public ──────────────────────────────────────────────────────────

exports.getEventBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const event = await Event.findOne({ slug }).populate('createdBy', 'name email');

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Non-admins should never be able to view an unpublished event by guessing its slug
  const isAdmin = req.user?.role === 'admin';
  if (event.status !== 'published' && !isAdmin) {
    throw new ApiError(404, 'Event not found');
  }

  // Fire-and-forget view increment — don't block the response on it
  event.incrementView().catch((err) =>
    console.error('[Event] Failed to increment view count:', err.message)
  );

  return res
    .status(200)
    .json(new ApiResponse(200, event, 'Event fetched successfully'));
});

// ── @desc    Get a single event by its Mongo ID (used to prefill admin edit form) ──
// ── @route   GET /api/events/:id ─────────────────────────────────────────────
// ── @access  Admin ──────────────────────────────────────────────────────────

exports.getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid event ID');
  }

  const event = await Event.findById(id).populate('createdBy', 'name email');

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, event, 'Event fetched successfully'));
});

// ── @desc    Update an event ─────────────────────────────────────────────────
// ── @route   PATCH /api/events/:id ───────────────────────────────────────────
// ── @access  Admin ──────────────────────────────────────────────────────────

exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid event ID');
  }

  const event = await Event.findById(id);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Prevent slug/registeredCount/viewCount from being overwritten directly
  // through this endpoint — they're system-managed fields.
  const { slug, registeredCount, viewCount, createdBy, ...safeUpdates } = req.body;

  if (safeUpdates.date?.end && safeUpdates.date?.start &&
      new Date(safeUpdates.date.end) < new Date(safeUpdates.date.start)) {
    throw new ApiError(400, 'Event end date cannot be before start date');
  }

  Object.assign(event, safeUpdates);
  event.lastUpdatedBy = req.user._id;

  await event.save(); // triggers slug regen if title changed

  return res
    .status(200)
    .json(new ApiResponse(200, event, 'Event updated successfully'));
});

// ── @desc    Change only the status of an event (draft/published/cancelled) ──
// ── @route   PATCH /api/events/:id/status ────────────────────────────────────
// ── @access  Admin ──────────────────────────────────────────────────────────

exports.changeEventStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['draft', 'published', 'cancelled', 'completed'];

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid event ID');
  }

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowedStatuses.join(', ')}`);
  }

  const event = await Event.findByIdAndUpdate(
    id,
    { status, lastUpdatedBy: req.user._id },
    { new: true }
  );

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, event, `Event status changed to '${status}'`));
});

// ── @desc    Delete an event ─────────────────────────────────────────────────
// ── @route   DELETE /api/events/:id ──────────────────────────────────────────
// ── @access  Admin ──────────────────────────────────────────────────────────

exports.deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid event ID');
  }

  const event = await Event.findByIdAndDelete(id);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // NOTE: this does not currently cascade-delete the event's Registration
  // documents. We'll handle that in Step 4 (Registration controller) —
  // likely by either blocking deletion if registrations exist, or
  // cascading the delete. Flagging here so it isn't forgotten.

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Event deleted successfully'));
});