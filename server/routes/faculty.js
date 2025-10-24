const express = require('express');
const { body, validationResult } = require('express-validator');
const Faculty = require('../models/Faculty');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all faculty
router.get('/', async (req, res) => {
  try {
    const { department, subject } = req.query;
    let filter = {};
    
    if (department) filter.department = department;
    if (subject) filter.subject = subject;
    
    const faculty = await Faculty.find(filter).sort({ name: 1 });
    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get faculty by ID
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create faculty (Admin only)
router.post('/', auth, adminAuth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, subject, email, department, phone, office, bio } = req.body;
    
    // Check if faculty with email already exists
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty with this email already exists' });
    }
    
    const faculty = new Faculty({
      name,
      subject,
      email,
      department,
      phone,
      office,
      bio
    });

    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update faculty (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, subject, email, department, phone, office, bio } = req.body;
    
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { name, subject, email, department, phone, office, bio },
      { new: true }
    );

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(faculty);
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete faculty (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
