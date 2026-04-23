const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    domain: { type: String, trim: true, default: '' }, // e.g. "Full-Stack Dev", "Data Science"
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    color: { type: String, default: '#2563eb' }, // hex color for display
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

groupSchema.index({ internship: 1 });
groupSchema.index({ mentor: 1 });

module.exports = mongoose.model('Group', groupSchema);