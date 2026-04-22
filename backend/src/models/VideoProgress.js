const mongoose = require('mongoose');

const videoProgressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    watchedSeconds: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    lastPositionSeconds: { type: Number, default: 0 },
    maxPositionSeconds: { type: Number, default: 0 },
    lastPingAt: { type: Date },
    skipped: { type: Boolean, default: false },
    skipDetectedAt: { type: Date },
    skipReason: { type: String, default: '' },
  },
  { timestamps: true }
);

videoProgressSchema.index({ student: 1, video: 1 }, { unique: true });
videoProgressSchema.index({ student: 1 });

module.exports = mongoose.models.VideoProgress || mongoose.model('VideoProgress', videoProgressSchema);
