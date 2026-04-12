const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    department: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
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
    maxStudents: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

internshipSchema.index({ status: 1 });
internshipSchema.index({ mentor: 1 });

module.exports = mongoose.model('Internship', internshipSchema);
