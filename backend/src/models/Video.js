const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ['youtube', 'upload'], required: true },
    url: { type: String, required: true }, // YouTube URL or Cloudinary URL
    thumbnailUrl: { type: String },
    duration: { type: String }, // e.g. "12:34"
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    order: { type: Number, default: 0 },
    isRequired: { type: Boolean, default: true },
  },
  { timestamps: true }
);

videoSchema.index({ internship: 1 });
videoSchema.index({ createdBy: 1 });

// module.exports = mongoose.model('Video', videoSchema);
module.exports = mongoose.models.Video || mongoose.model('Video', videoSchema);