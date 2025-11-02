const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'faculty'],
    default: 'student'
  },
  majorSubject: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'faculty';
    }
  },
  isApproved: {
    type: Boolean,
    default: function() {
      // Admins are auto-approved, others need approval
      return this.role === 'admin';
    }
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  // Quiz performance fields (for students)
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  progressHistory: [{
    subject: {
      type: String,
      trim: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
