const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  wrongAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MCQ',
      required: true
    },
    selectedAnswer: {
      type: String,
      enum: ['a', 'b', 'c', 'd'],
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  dateAttempted: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
quizResultSchema.index({ studentId: 1, dateAttempted: -1 });
quizResultSchema.index({ subject: 1, chapter: 1 });
quizResultSchema.index({ score: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);

