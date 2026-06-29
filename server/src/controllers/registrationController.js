const mongoose     = require('mongoose');
const Registration = require('../models/Registration');
const Event        = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const ApiError     = require('../utils/ApiError');
const ApiResponse  = require('../utils/ApiResponse');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────────────────────────────────────────
// TEMPORARY: Until auth middleware is added back, all endpoints that need a
// user ID accept it from req.body.userId or req.query.userId.
// When auth is added, replace every instance of getUserId(req) with req.user._id
// ─────────────────────────────────────────────────────────────────────────────

const getUserId = (req) => {
  const id = req.body.userId || req.query.userId;
  if (!id || !isValidObjectId(id)) {
    throw new ApiError(400, 'userId is required (pass as body or query param until auth is added)');
  }
  return id;
};

// ── @desc    Register for an event ──────────────────────────────────────────
// ── @route   POST /api/registrations/event/:eventId ─────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId      = getUserId(req);

  if (!isValidObjectId(eventId)) throw new ApiError(400, 'Invalid event ID');

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, 'Event not found');

  if (event.status !== 'published') {
    throw new ApiError(400, 'This event is not open for registration');
  }

  if (!event.isRegistrationOpen) {
    throw new ApiError(400, 'Registration is closed for this event');
  }

  if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
    throw new ApiError(400, 'Registration deadline has passed');
  }

  if (event.maxParticipants && event.registeredCount >= event.maxParticipants) {
    throw new ApiError(400, 'This event is fully booked');
  }

  const existing = await Registration.findOne({ event: eventId, user: userId });
  if (existing) {
    if (existing.status === 'cancelled') {
      throw new ApiError(400, 'You previously cancelled your registration. Contact the organiser to re-register');
    }
    throw new ApiError(409, 'You are already registered for this event');
  }

  const { teamName, teamMembers } = req.body;

  if (event.isTeamEvent) {
    if (!teamName?.trim()) throw new ApiError(400, 'Team name is required for team events');
    const totalSize = (teamMembers || []).length + 1;
    if (totalSize < event.teamSize.min) {
      throw new ApiError(400, `Minimum team size is ${event.teamSize.min} (including you)`);
    }
    if (totalSize > event.teamSize.max) {
      throw new ApiError(400, `Maximum team size is ${event.teamSize.max} (including you)`);
    }
  }

  const registration = await Registration.create({
    event:         eventId,
    user:          userId,
    teamName:      event.isTeamEvent ? teamName?.trim() : undefined,
    teamMembers:   event.isTeamEvent ? (teamMembers || []) : [],
    paymentStatus: event.isPaid ? 'pending' : 'free',
  });

  const populated = await registration.populate('event', 'title date venue category coverImage');

  return res.status(201).json(new ApiResponse(201, populated, 'Successfully registered for the event!'));
});

// ── @desc    Cancel a registration ──────────────────────────────────────────
// ── @route   PATCH /api/registrations/:id/cancel ────────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.cancelRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new ApiError(400, 'Invalid registration ID');

  const registration = await Registration.findById(id).populate('event', 'date title');
  if (!registration) throw new ApiError(404, 'Registration not found');

  if (registration.status === 'cancelled') {
    throw new ApiError(400, 'This registration is already cancelled');
  }

  if (registration.status === 'attended') {
    throw new ApiError(400, 'Cannot cancel a registration that has already been checked in');
  }

  // TODO: When auth is added, check ownership:
  // if (registration.user.toString() !== req.user._id.toString()) throw new ApiError(403, ...)

  registration.status             = 'cancelled';
  registration.cancellationReason = req.body.reason || null;
  await registration.save();

  return res.status(200).json(new ApiResponse(200, registration, 'Registration cancelled successfully'));
});

// ── @desc    Get all events a user is registered for (My Events page) ────────
// ── @route   GET /api/registrations/my ──────────────────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.getMyRegistrations = asyncHandler(async (req, res) => {
  const userId      = getUserId(req);
  const { filter }  = req.query;

  const query = { user: userId };

  if (filter === 'cancelled') {
    query.status = 'cancelled';
  } else if (filter === 'upcoming' || filter === 'past') {
    query.status = { $ne: 'cancelled' };
  }

  let registrations = await Registration.find(query)
    .populate('event', 'title shortDescription date venue category coverImage status slug')
    .sort({ createdAt: -1 })
    .lean();

  const now = new Date();

  if (filter === 'upcoming') {
    registrations = registrations.filter(
      (r) => r.event?.date?.start && new Date(r.event.date.start) >= now
    );
  } else if (filter === 'past') {
    registrations = registrations.filter(
      (r) => r.event?.date?.start && new Date(r.event.date.start) < now
    );
  }

  return res.status(200).json(
    new ApiResponse(200, { registrations, total: registrations.length }, 'Registrations fetched')
  );
});

// ── @desc    Check if a user is registered for a specific event ──────────────
// ── @route   GET /api/registrations/event/:eventId/status ───────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.checkRegistrationStatus = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId      = getUserId(req);

  if (!isValidObjectId(eventId)) throw new ApiError(400, 'Invalid event ID');

  const registration = await Registration.findOne({ event: eventId, user: userId })
    .select('status qrCode teamName createdAt');

  return res.status(200).json(
    new ApiResponse(200, {
      isRegistered: !!registration,
      registration: registration || null,
    }, 'Registration status fetched')
  );
});

// ── @desc    Admin — get all registrations for an event ──────────────────────
// ── @route   GET /api/registrations/event/:eventId ──────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.getEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId }              = req.params;
  const { status, page = 1, limit = 50 } = req.query;

  if (!isValidObjectId(eventId)) throw new ApiError(400, 'Invalid event ID');

  const event = await Event.findById(eventId).select('title');
  if (!event) throw new ApiError(404, 'Event not found');

  const filter = { event: eventId };
  if (status) filter.status = status;

  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip     = (pageNum - 1) * limitNum;

  const [registrations, total] = await Promise.all([
    Registration.find(filter)
      .populate('user', 'name email rollNumber department avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Registration.countDocuments(filter),
  ]);

  const stats = await Registration.getEventStats(eventId);

  return res.status(200).json(
    new ApiResponse(200, {
      event: { _id: event._id, title: event.title },
      stats,
      registrations,
      pagination: {
        currentPage: pageNum,
        totalPages:  Math.ceil(total / limitNum),
        total,
      },
    }, 'Event registrations fetched')
  );
});

// ── @desc    Admin — check in an attendee via QR code ───────────────────────
// ── @route   PATCH /api/registrations/checkin ───────────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.checkInAttendee = asyncHandler(async (req, res) => {
  const { qrCode } = req.body;

  if (!qrCode?.trim()) throw new ApiError(400, 'QR code is required');

  const registration = await Registration.findOne({ qrCode: qrCode.trim().toUpperCase() })
    .populate('user', 'name email rollNumber')
    .populate('event', 'title date');

  if (!registration) throw new ApiError(404, 'Invalid QR code — no registration found');

  if (registration.status === 'cancelled') {
    throw new ApiError(400, 'This registration was cancelled');
  }

  if (registration.status === 'attended') {
    return res.status(200).json(
      new ApiResponse(200, registration, `⚠️ Already checked in at ${registration.checkInTime?.toLocaleTimeString()}`)
    );
  }

  registration.status      = 'attended';
  registration.checkInTime = new Date();
  // TODO: set registration.checkedInBy = req.user._id when auth is added
  await registration.save();

  return res.status(200).json(
    new ApiResponse(200, registration, `✅ ${registration.user.name} checked in successfully`)
  );
});

// ── @desc    Admin — export all registrations for an event as CSV ────────────
// ── @route   GET /api/registrations/event/:eventId/export ───────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.exportRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!isValidObjectId(eventId)) throw new ApiError(400, 'Invalid event ID');

  const event = await Event.findById(eventId).select('title');
  if (!event) throw new ApiError(404, 'Event not found');

  const registrations = await Registration.exportForEvent(eventId);

  if (registrations.length === 0) {
    throw new ApiError(404, 'No registrations found for this event');
  }

  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const headers = [
    'No.', 'Name', 'Email', 'Roll Number', 'Department',
    'Team Name', 'Team Members', 'Status',
    'QR Code', 'Registered At', 'Checked In At',
  ];

  const rows = registrations.map((reg, i) => {
    const teamMemberNames = (reg.teamMembers || [])
      .map((m) => `${m.name} (${m.rollNumber})`).join(' | ');

    return [
      i + 1,
      reg.user?.name       || 'N/A',
      reg.user?.email      || 'N/A',
      reg.user?.rollNumber || 'N/A',
      reg.user?.department || 'N/A',
      reg.teamName         || '',
      teamMemberNames,
      reg.status,
      reg.qrCode,
      new Date(reg.createdAt).toLocaleString('en-IN'),
      reg.checkInTime ? new Date(reg.checkInTime).toLocaleString('en-IN') : '',
    ].map(escape).join(',');
  });

  const csv      = [headers.map(escape).join(','), ...rows].join('\n');
  const filename = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_registrations.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send('\uFEFF' + csv);
});

// ── @desc    Admin — manually update a registration's status ─────────────────
// ── @route   PATCH /api/registrations/:id/status ────────────────────────────
// ── @access  Public (auth will be added later) ───────────────────────────────

exports.updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;

  const allowed = ['pending', 'confirmed', 'cancelled', 'attended', 'no_show'];

  if (!isValidObjectId(id))       throw new ApiError(400, 'Invalid registration ID');
  if (!allowed.includes(status))  throw new ApiError(400, `Status must be one of: ${allowed.join(', ')}`);

  const registration = await Registration.findById(id);
  if (!registration) throw new ApiError(404, 'Registration not found');

  registration.status = status;
  if (status === 'attended' && !registration.checkInTime) {
    registration.checkInTime = new Date();
    // TODO: set registration.checkedInBy = req.user._id when auth is added
  }

  await registration.save();

  return res.status(200).json(
    new ApiResponse(200, registration, `Registration status updated to '${status}'`)
  );
});