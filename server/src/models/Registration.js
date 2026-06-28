const mongoose = require('mongoose');
const crypto   = require('crypto');

// ── Sub-schema: team members (for hackathons etc.) ────────────────────────────

const TeamMemberSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  rollNumber: { type: String, required: true, trim: true },
  email:      { type: String, required: true, lowercase: true, trim: true },
}, { _id: false });

// ── Main Registration Schema ───────────────────────────────────────────────────

const RegistrationSchema = new mongoose.Schema(
  {
    // ── Links ──
    event: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Event',
      required: true,
      index:    true,
    },

    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // ── Team info (only for team events) ──
    teamName: {
      type:  String,
      trim:  true,
    },

    teamMembers: {
      type:    [TeamMemberSchema],
      default: [],
    },

    // ── Status ──
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'cancelled', 'attended', 'no_show'],
      default: 'confirmed',
      index:   true,
    },

    // ── Payment (for paid events) ──
    paymentStatus: {
      type:    String,
      enum:    ['free', 'pending', 'paid', 'refunded'],
      default: 'free',
    },

    transactionId: {
      type:    String,
      default: null,
    },

    amountPaid: {
      type:    Number,
      default: 0,
    },

    // ── Check-in ──
    qrCode: {
      type:   String,
      unique: true,
      index:  true,
    },

    checkInTime: {
      type:    Date,
      default: null,
    },

    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',   // the admin who scanned them in
    },

    // ── Admin notes ──
    notes: {
      type:  String,
      trim:  true,
    },

    // ── Cancellation reason ──
    cancellationReason: {
      type:  String,
      trim:  true,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Compound unique index: one registration per user per event ─────────────────

RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });
RegistrationSchema.index({ event: 1, status: 1 });
RegistrationSchema.index({ qrCode: 1 });

// ── Pre-save: generate unique QR code ─────────────────────────────────────────

RegistrationSchema.pre('save', function (next) {
  if (this.isNew && !this.qrCode) {
    // Short, URL-safe, unique token for QR scanning
    this.qrCode = crypto
      .createHash('sha256')
      .update(`${this.event}-${this.user}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();
  }
  next();
});

// ── Post-save: update the event's registeredCount ────────────────────────────

RegistrationSchema.post('save', async function (doc) {
  try {
    const Event = mongoose.model('Event');

    if (doc.status === 'confirmed') {
      await Event.findByIdAndUpdate(doc.event, { $inc: { registeredCount: 1 } });
    }
  } catch (err) {
    console.error('[Registration] Failed to update registeredCount:', err.message);
  }
});

// ── Post remove / cancellation hook ──────────────────────────────────────────

RegistrationSchema.pre('save', async function (next) {
  // If status just changed TO 'cancelled', decrement the count
  if (this.isModified('status') && this.status === 'cancelled') {
    try {
      const Event = mongoose.model('Event');
      await Event.findByIdAndUpdate(this.event, {
        $inc: { registeredCount: -1 },
      });
    } catch (err) {
      console.error('[Registration] Failed to decrement registeredCount:', err.message);
    }
  }
  next();
});

// ── Virtuals ──────────────────────────────────────────────────────────────────

/** Has this person checked in? */
RegistrationSchema.virtual('hasCheckedIn').get(function () {
  return this.status === 'attended' && !!this.checkInTime;
});

/** Total team size including the leader */
RegistrationSchema.virtual('totalTeamSize').get(function () {
  return 1 + (this.teamMembers?.length || 0);
});

// ── Statics ───────────────────────────────────────────────────────────────────

/**
 * Get full registration stats for an event (used in admin dashboard).
 * Returns: total, confirmed, attended, cancelled, no_show counts.
 */
RegistrationSchema.statics.getEventStats = async function (eventId) {
  const result = await this.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id:       '$status',
        count:     { $sum: 1 },
      },
    },
  ]);

  const stats = {
    total:     0,
    confirmed: 0,
    attended:  0,
    cancelled: 0,
    no_show:   0,
    pending:   0,
  };

  result.forEach(({ _id, count }) => {
    stats[_id]  = count;
    stats.total += count;
  });

  return stats;
};

/**
 * Export all registrations for an event as a flat array (for CSV export).
 */
RegistrationSchema.statics.exportForEvent = async function (eventId) {
  return this.find({ event: eventId })
    .populate('user', 'name email rollNumber department')
    .sort({ createdAt: 1 })
    .lean();
};

// ── Model ─────────────────────────────────────────────────────────────────────

const Registration = mongoose.model('Registration', RegistrationSchema);
module.exports = Registration;