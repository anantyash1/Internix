const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['general', 'announcement', 'reminder', 'alert'],
      default: 'general',
    },
    targetRoles: {
      type: [String],
      enum: ['student', 'mentor', 'admin', 'all'],
      default: ['all'],
    },
    targetInternship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      default: null, // null = all internships
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

noticeSchema.index({ isActive: 1, createdAt: -1 });
noticeSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);