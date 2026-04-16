const mongoose = require('mongoose');

const videoProgressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    watchedSeconds: { type: Number, default: 0 }, // for upload videos
  },
  { timestamps: true }
);

videoProgressSchema.index({ student: 1, video: 1 }, { unique: true });
videoProgressSchema.index({ student: 1 });

module.exports = mongoose.model('VideoProgress', videoProgressSchema);