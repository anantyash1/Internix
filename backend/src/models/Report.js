const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    filePublicId: { type: String },
    fileType: {
      type: String,
      enum: ['pdf', 'image'],
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected'],
      default: 'submitted',
    },
    feedback: { type: String, trim: true },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

reportSchema.index({ student: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
