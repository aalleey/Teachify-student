const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  chapter: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    a: {
      type: String,
      required: true,
      trim: true
    },
    b: {
      type: String,
      required: true,
      trim: true
    },
    c: {
      type: String,
      required: true,
      trim: true
    },
    d: {
      type: String,
      required: true,
      trim: true
    }
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['a', 'b', 'c', 'd'],
    lowercase: true
  },
  explanation: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
mcqSchema.index({ subject: 1, chapter: 1 });
mcqSchema.index({ uploadedBy: 1 });
mcqSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MCQ', mcqSchema);

