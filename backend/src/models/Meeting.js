const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    meetingLink: { type: String, trim: true, default: '' },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      required: true,
    },
    meetingTime: {
      type: String, // "HH:MM" 24h format
      required: true,
    },
    dayOfWeek: {
      type: Number, // 0=Sun, 1=Mon … 6=Sat (for weekly)
      min: 0, max: 6, default: 1,
    },
    dayOfMonth: {
      type: Number, // 1–31 (for monthly)
      min: 1, max: 31, default: 1,
    },
    specificDate: { type: Date, default: null }, // for 'once'
    targetRoles: {
      type: [String],
      enum: ['student', 'mentor', 'admin', 'all'],
      default: ['all'],
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      default: null,
    },
    notifyMinutesBefore: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

meetingSchema.index({ isActive: 1 });
meetingSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);