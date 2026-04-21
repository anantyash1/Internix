const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer: { type: String, trim: true, default: '' },
  isCorrect: { type: Boolean, default: null }, // null = pending review (short_answer)
  pointsAwarded: { type: Number, default: 0 },
  mentorNote: { type: String, trim: true, default: '' }, // mentor feedback on answer
});

const testSubmissionSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted', 'reviewed'],
      default: 'not_started',
    },
    startedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    timeTakenSeconds: { type: Number, default: 0 },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    reviewNotes: { type: String, trim: true, default: '' },
    passed: { type: Boolean, default: null },
    autoSubmitted: { type: Boolean, default: false }, // true if timer ran out
  },
  { timestamps: true }
);

// One submission per student per test
testSubmissionSchema.index({ test: 1, student: 1 }, { unique: true });
testSubmissionSchema.index({ student: 1 });
testSubmissionSchema.index({ test: 1 });

module.exports = mongoose.model('TestSubmission', testSubmissionSchema);