const mongoose = require('mongoose');

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const SpeakerSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  designation: { type: String },
  bio:         { type: String },
  image:       { type: String }, // Cloudinary URL
}, { _id: false });

const ScheduleItemSchema = new mongoose.Schema({
  time:     { type: String, required: true }, // e.g. "10:00 AM"
  activity: { type: String, required: true },
  speaker:  { type: String },               // optional speaker name
}, { _id: false });

const PrizeSchema = new mongoose.Schema({
  position: { type: String, required: true }, // "1st Place", "Runner Up"
  reward:   { type: String, required: true }, // "₹10,000 + Certificate"
}, { _id: false });

// ── Main Event Schema ──────────────────────────────────────────────────────────

const EventSchema = new mongoose.Schema(
  {
    // ── Core info ──
    title: {
      type:      String,
      required:  [true, 'Event title is required'],
      trim:      true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    slug: {
      type:   String,
      unique: true,
      lowercase: true,
      index:  true,
    },

    shortDescription: {
      type:      String,
      required:  [true, 'Short description is required'],
      maxlength: [250, 'Short description cannot exceed 250 characters'],
    },

    description: {
      type:     String,
      required: [true, 'Full description is required'],
    },

    coverImage: {
      type:    String,  // Cloudinary URL
      default: null,
    },

    // ── Classification ──
    category: {
      type:     String,
      enum:     ['hackathon', 'placement', 'workshop', 'seminar', 'cultural', 'sports', 'techfest', 'other'],
      required: [true, 'Category is required'],
      index:    true,
    },

    tags: [{
      type:  String,
      lowercase: true,
      trim:  true,
    }],

    // ── Venue ──
    venue: {
      name:     { type: String, required: [true, 'Venue name is required'] },
      building: { type: String },
      room:     { type: String },
      capacity: { type: Number },
    },

    // ── Date & time ──
    date: {
      start: { type: Date, required: [true, 'Start date/time is required'] },
      end:   { type: Date },
    },

    registrationDeadline: { type: Date },

    // ── Registration limits ──
    maxParticipants: {
      type:    Number,
      default: null, // null = unlimited
    },

    registeredCount: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // ── Team support (hackathons etc.) ──
    isTeamEvent: {
      type:    Boolean,
      default: false,
    },

    teamSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 1 },
    },

    // ── Payment ──
    isPaid: {
      type:    Boolean,
      default: false,
    },

    registrationFee: {
      type:    Number,
      default: 0,
      min:     0,
    },

    // ── Organizer ──
    organizer: {
      name:         { type: String, required: true },
      department:   { type: String },
      contactEmail: { type: String },
      contactPhone: { type: String },
    },

    // ── Rich content ──
    speakers: [SpeakerSchema],
    schedule: [ScheduleItemSchema],
    prizes:   [PrizeSchema],

    // ── Status & visibility ──
    status: {
      type:    String,
      enum:    ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
      index:   true,
    },

    isFeatured: {
      type:    Boolean,
      default: false,
      index:   true,
    },

    isRegistrationOpen: {
      type:    Boolean,
      default: true,
    },

    // ── Analytics ──
    viewCount: {
      type:    Number,
      default: 0,
    },

    // ── Audit ──
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  {
    timestamps:        true,      // adds createdAt, updatedAt
    toJSON:            { virtuals: true },
    toObject:          { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────────

EventSchema.index({ status: 1, 'date.start': 1 });         // listing + sorting
EventSchema.index({ isFeatured: 1, status: 1 });           // featured events
EventSchema.index({ category: 1, status: 1 });             // category filter
EventSchema.index({ title: 'text', description: 'text' }); // full-text search

// ── Pre-save hook: auto-generate unique slug ───────────────────────────────────

EventSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  const base = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 55);

  let slug = base;
  let count = 0;

  // Ensure uniqueness
  while (await mongoose.model('Event').exists({ slug, _id: { $ne: this._id } })) {
    count++;
    slug = `${base}-${count}`;
  }

  this.slug = slug;
  next();
});

// ── Virtuals ──────────────────────────────────────────────────────────────────

/** Is the event currently running? */
EventSchema.virtual('isLive').get(function () {
  const now = new Date();
  return this.date.start <= now && (!this.date.end || this.date.end >= now);
});

/** Has registration deadline passed? */
EventSchema.virtual('isDeadlinePassed').get(function () {
  if (!this.registrationDeadline) return false;
  return new Date() > this.registrationDeadline;
});

/** How many seats are still open (null = unlimited) */
EventSchema.virtual('seatsLeft').get(function () {
  if (!this.maxParticipants) return null;
  return Math.max(0, this.maxParticipants - this.registeredCount);
});

/** Is the event fully booked? */
EventSchema.virtual('isFull').get(function () {
  if (!this.maxParticipants) return false;
  return this.registeredCount >= this.maxParticipants;
});

// ── Instance method: increment view ───────────────────────────────────────────

EventSchema.methods.incrementView = async function () {
  this.viewCount += 1;
  await this.save();
};

// ── Model ─────────────────────────────────────────────────────────────────────

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;