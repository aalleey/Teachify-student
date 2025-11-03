const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'student', 'faculty']).withMessage('Invalid role'),
  body('majorSubject').optional().notEmpty().withMessage('Major subject is required for teachers')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role = 'student', majorSubject } = req.body;

    // Validate majorSubject for teachers
    if (role === 'faculty' && !majorSubject) {
      return res.status(400).json({ message: 'Major subject is required for teachers' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const userData = { name, email, password, role };
    if (role === 'faculty' && majorSubject) {
      userData.majorSubject = majorSubject;
    }
    // Set approval status - admins are auto-approved, others need admin approval
    if (role === 'admin') {
      userData.isApproved = true;
    } else {
      userData.isApproved = false;
    }
    
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const successMessage = role === 'admin' 
      ? 'User registered successfully' 
      : 'User registered successfully. Your account is pending admin approval.';

    res.status(201).json({
      message: successMessage,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isBlocked: user.isBlocked,
        majorSubject: user.majorSubject || undefined,
        profileImage: user.profileImage || undefined
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact admin.' });
    }

    // Check if user is approved (admins are always approved)
    if (user.role !== 'admin' && !user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval. Please contact admin for access.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isBlocked: user.isBlocked,
        majorSubject: user.majorSubject || undefined,
        profileImage: user.profileImage || undefined
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    // Explicitly fetch fresh user data from database to ensure we have latest approval status
    const freshUser = await User.findById(req.user._id).select('-password');
    
    if (!freshUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Set no-cache headers to prevent browser/proxy caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      user: {
        id: freshUser._id,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        isApproved: freshUser.isApproved,
        isBlocked: freshUser.isBlocked,
        majorSubject: freshUser.majorSubject || undefined,
        profileImage: freshUser.profileImage || undefined
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
