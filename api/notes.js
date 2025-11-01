const express = require('express');
const { body, validationResult } = require('express-validator');
const { connectToDatabase } = require('./_utils');
const Notes = require('../server/models/Notes');
const { auth } = require('../server/middleware/auth');

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

// Get all notes
app.get('/', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { subject } = req.query;
    let filter = {};
    
    if (subject) filter.subject = subject;
    
    const notes = await Notes.find(filter).populate('uploadedBy', 'name email');
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notes by ID
app.get('/:id', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const notes = await Notes.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!notes) {
      return res.status(404).json({ message: 'Notes not found' });
    }
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create notes
app.post('/', auth, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('fileUrl').notEmpty().withMessage('File URL is required'),
  body('title').notEmpty().withMessage('Title is required')
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

    const { subject, fileUrl, title, description } = req.body;
    
    const notes = new Notes({
      subject,
      fileUrl,
      title,
      description,
      uploadedBy: req.user._id
    });

    await notes.save();
    res.status(201).json(notes);
  } catch (error) {
    console.error('Create notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notes (only by uploader or admin)
app.put('/:id', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const notes = await Notes.findById(req.params.id);
    if (!notes) {
      return res.status(404).json({ message: 'Notes not found' });
    }

    // Check if user is the uploader or admin
    if (notes.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this notes' });
    }

    const { subject, fileUrl, title, description } = req.body;
    
    const updatedNotes = await Notes.findByIdAndUpdate(
      req.params.id,
      { subject, fileUrl, title, description },
      { new: true }
    );

    res.json(updatedNotes);
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notes (only by uploader or admin)
app.delete('/:id', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const notes = await Notes.findById(req.params.id);
    if (!notes) {
      return res.status(404).json({ message: 'Notes not found' });
    }

    // Check if user is the uploader or admin
    if (notes.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this notes' });
    }

    await Notes.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notes deleted successfully' });
  } catch (error) {
    console.error('Delete notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vercel serverless function handler
module.exports = app;

