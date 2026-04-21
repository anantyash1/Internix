const mongoose = require('mongoose');

const workScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Default Schedule',
      trim: true,
    },
    workingDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    startTime: {
      type: String, // "09:00" 24h format
      default: '09:00',
    },
    endTime: {
      type: String, // "18:00" 24h format
      default: '18:00',
    },
    graceMinutes: {
      type: Number, // minutes after startTime before marked "late"
      default: 15,
    },
    requirePhoto: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      default: null, // null = global/default schedule
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

workScheduleSchema.index({ internship: 1, isActive: 1 });

module.exports = mongoose.model('WorkSchedule', workScheduleSchema);