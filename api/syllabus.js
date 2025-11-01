const express = require('express');
const { body, validationResult } = require('express-validator');
const { connectToDatabase } = require('./_utils');
const Syllabus = require('../server/models/Syllabus');
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

// Get all syllabus
app.get('/', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { department, semester } = req.query;
    let filter = {};
    
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    
    const syllabus = await Syllabus.find(filter).populate('uploadedBy', 'name email');
    res.json(syllabus);
  } catch (error) {
    console.error('Get syllabus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get syllabus by ID
app.get('/:id', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const syllabus = await Syllabus.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }
    res.json(syllabus);
  } catch (error) {
    console.error('Get syllabus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create syllabus (Admin only)
// Note: File upload would need to be handled differently in Vercel (e.g., use Cloudinary or similar)
app.post('/', auth, adminAuth, [
  body('department').notEmpty().withMessage('Department is required'),
  body('semester').notEmpty().withMessage('Semester is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('fileUrl').notEmpty().withMessage('File URL is required')
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

    const { department, semester, subject, fileUrl, description, originalFileName, fileSize, fileType } = req.body;
    
    const syllabus = new Syllabus({
      department,
      semester,
      subject,
      fileUrl,
      description,
      uploadedBy: req.user._id,
      originalFileName: originalFileName || 'uploaded-file',
      fileSize: fileSize || 0,
      fileType: fileType || 'application/octet-stream'
    });

    await syllabus.save();
    res.status(201).json(syllabus);
  } catch (error) {
    console.error('Create syllabus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update syllabus (Admin only)
app.put('/:id', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { department, semester, subject, fileUrl, description } = req.body;
    
    const syllabus = await Syllabus.findByIdAndUpdate(
      req.params.id,
      { department, semester, subject, fileUrl, description },
      { new: true }
    );

    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    res.json(syllabus);
  } catch (error) {
    console.error('Update syllabus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete syllabus (Admin only)
app.delete('/:id', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const syllabus = await Syllabus.findByIdAndDelete(req.params.id);
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }
    res.json({ message: 'Syllabus deleted successfully' });
  } catch (error) {
    console.error('Delete syllabus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vercel serverless function handler
module.exports = app;

