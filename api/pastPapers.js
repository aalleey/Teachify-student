const express = require('express');
const { body, validationResult } = require('express-validator');
const { connectToDatabase } = require('./_utils');
const PastPaper = require('../server/models/PastPaper');
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

// Get all past papers (with optional filters)
app.get('/', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { subject, year, limit = 50, sort = '-createdAt' } = req.query;
    let filter = {};
    
    if (subject) filter.subject = subject;
    if (year) filter.year = parseInt(year);
    
    const papers = await PastPaper.find(filter)
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .limit(parseInt(limit));
    
    res.json(papers);
  } catch (error) {
    console.error('Get past papers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent past papers (for Recently Added section)
app.get('/recent', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const limit = parseInt(req.query.limit) || 5;
    const papers = await PastPaper.find()
      .populate('uploadedBy', 'name email')
      .sort('-createdAt')
      .limit(limit);
    
    res.json(papers);
  } catch (error) {
    console.error('Get recent past papers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get past paper by ID
app.get('/:id', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const paper = await PastPaper.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!paper) {
      return res.status(404).json({ message: 'Past paper not found' });
    }
    
    res.json(paper);
  } catch (error) {
    console.error('Get past paper error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create past paper (Admin only) - Note: File upload would need Cloudinary or similar for Vercel
app.post('/', auth, adminAuth, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  body('description').optional(),
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

    const { subject, title, year, description, fileUrl, originalFileName, fileSize, fileType } = req.body;
    
    const pastPaper = new PastPaper({
      subject,
      title,
      year: parseInt(year),
      description,
      fileUrl,
      uploadedBy: req.user._id,
      originalFileName: originalFileName || 'uploaded-file',
      fileSize: fileSize || 0,
      fileType: fileType || 'application/pdf'
    });

    await pastPaper.save();
    
    // Populate uploadedBy for response
    await pastPaper.populate('uploadedBy', 'name email');
    
    res.status(201).json(pastPaper);
  } catch (error) {
    console.error('Create past paper error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update past paper (Admin only)
app.put('/:id', auth, adminAuth, [
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required')
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

    const { subject, title, year, description, fileUrl } = req.body;
    const updateData = {};
    
    if (subject) updateData.subject = subject;
    if (title) updateData.title = title;
    if (year) updateData.year = parseInt(year);
    if (description !== undefined) updateData.description = description;
    if (fileUrl) updateData.fileUrl = fileUrl;
    
    const pastPaper = await PastPaper.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('uploadedBy', 'name email');

    if (!pastPaper) {
      return res.status(404).json({ message: 'Past paper not found' });
    }

    res.json(pastPaper);
  } catch (error) {
    console.error('Update past paper error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete past paper (Admin only)
app.delete('/:id', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const pastPaper = await PastPaper.findByIdAndDelete(req.params.id);
    
    if (!pastPaper) {
      return res.status(404).json({ message: 'Past paper not found' });
    }
    
    res.json({ message: 'Past paper deleted successfully' });
  } catch (error) {
    console.error('Delete past paper error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vercel serverless function handler
module.exports = app;

