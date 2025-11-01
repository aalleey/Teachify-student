const mongoose = require('mongoose');

const pastPaperSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
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

// Index for faster searches
pastPaperSchema.index({ subject: 1, year: 1 });
pastPaperSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PastPaper', pastPaperSchema);

