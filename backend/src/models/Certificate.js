const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    certificateNumber: {
      type: String,
      unique: true,
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    completionStatus: {
      type: String,
      enum: ['completed', 'partial'],
      default: 'completed',
    },
    grade: { type: String },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

certificateSchema.index({ student: 1 });
certificateSchema.index({ certificateNumber: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
