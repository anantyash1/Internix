const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'reviewed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: { type: Date },
    feedback: { type: String, trim: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ assignedBy: 1 });

module.exports = mongoose.model('Task', taskSchema);
