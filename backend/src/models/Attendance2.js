const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
    checkInTime: { type: String },
    checkOutTime: { type: String },

    // Photo fields
    checkInPhoto: { type: String, default: null },      // Cloudinary URL
    checkInPhotoPublicId: { type: String, default: null },
    checkOutPhoto: { type: String, default: null },     // Cloudinary URL
    checkOutPhotoPublicId: { type: String, default: null },

    // Photo verification
    isPhotoVerified: { type: Boolean, default: false },
    photoVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: { type: String, trim: true },

    // Work schedule snapshot at time of marking
    scheduledStartTime: { type: String, default: null },
    scheduledEndTime: { type: String, default: null },

    // Track if this was an override (marked by mentor/admin)
    isManualOverride: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);