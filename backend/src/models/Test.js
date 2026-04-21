const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true, trim: true },
  type: { type: String, enum: ['mcq', 'short_answer'], default: 'mcq' },
  options: {
    A: { type: String, trim: true, default: '' },
    B: { type: String, trim: true, default: '' },
    C: { type: String, trim: true, default: '' },
    D: { type: String, trim: true, default: '' },
  },
  correctAnswer: { type: String, trim: true }, // 'A','B','C','D' for mcq
  points: { type: Number, default: 1, min: 0 },
  order: { type: Number, default: 0 },
});

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    instructions: { type: String, trim: true, default: '' },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    questions: [questionSchema],
    totalPoints: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      default: null,
    },
    // empty array = assigned to all students
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
    },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    allowedAttempts: { type: Number, default: 1, min: 1 },
    showResultsToStudent: { type: Boolean, default: true },
    passingScore: { type: Number, default: 0, min: 0, max: 100 }, // percentage
  },
  { timestamps: true }
);

// Auto-calculate totalPoints before save
testSchema.pre('save', function (next) {
  this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  next();
});

testSchema.index({ createdBy: 1 });
testSchema.index({ status: 1 });
testSchema.index({ internship: 1 });

module.exports = mongoose.model('Test', testSchema);