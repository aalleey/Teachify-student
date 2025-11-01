const express = require('express');
const { body, validationResult } = require('express-validator');
const { connectToDatabase } = require('./_utils');
const Faculty = require('../server/models/Faculty');
const { auth, adminAuth } = require('../server/middleware/auth');

const app = express();

// Enable CORS for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection
let dbReady = false;
connectToDatabase().then(() => {
  dbReady = true;
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Get all faculty
app.get('/', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

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
app.get('/:id', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

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
app.post('/', auth, adminAuth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').notEmpty().withMessage('Department is required')
], async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

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
app.put('/:id', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { name, subject, email, department, phone, office, bio, status, photoUrl } = req.body;
    
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { name, subject, email, department, phone, office, bio, status, photoUrl },
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

// Update faculty status (Admin or the faculty member themselves)
app.patch('/:id/status', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { status } = req.body;
    
    // Validate status
    if (!['Available', 'Busy', 'On Leave'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be: Available, Busy, or On Leave' });
    }

    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check if user is admin or the faculty member themselves
    const isAdmin = req.user.role === 'admin';
    const isFacultyMember = req.user.email && faculty.email && 
                            req.user.email.toLowerCase() === faculty.email.toLowerCase();

    if (!isAdmin && !isFacultyMember) {
      return res.status(403).json({ message: 'You do not have permission to update this status' });
    }

    faculty.status = status;
    await faculty.save();

    res.json(faculty);
  } catch (error) {
    console.error('Update faculty status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete faculty (Admin only)
app.delete('/:id', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

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

// Vercel serverless function handler
module.exports = app;

