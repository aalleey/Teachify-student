const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
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

module.exports = mongoose.model('Syllabus', syllabusSchema);
