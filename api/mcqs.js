const express = require('express');
const { body, validationResult } = require('express-validator');
const { connectToDatabase } = require('./_utils');
const MCQ = require('../server/models/MCQ');
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

// Get all MCQs (with optional filters)
app.get('/', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { subject, chapter, uploadedBy, limit = 100, sort = '-createdAt' } = req.query;
    let filter = {};
    
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    
    const mcqs = await MCQ.find(filter)
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .limit(parseInt(limit));
    
    res.json(mcqs);
  } catch (error) {
    console.error('Get MCQs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get MCQs by subject and chapter (for student practice)
app.get('/practice', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { subject, chapter, limit = 50 } = req.query;
    
    if (!subject || !chapter) {
      return res.status(400).json({ message: 'Subject and chapter are required' });
    }
    
    const mcqs = await MCQ.find({ subject, chapter })
      .select('-correctAnswer')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.json(mcqs);
  } catch (error) {
    console.error('Get practice MCQs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get MCQ by ID
app.get('/:id', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const mcq = await MCQ.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }
    
    res.json(mcq);
  } catch (error) {
    console.error('Get MCQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create MCQ (Teacher or Admin only)
app.post('/', auth, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('chapter').notEmpty().withMessage('Chapter is required'),
  body('question').notEmpty().withMessage('Question is required'),
  body('options.a').notEmpty().withMessage('Option A is required'),
  body('options.b').notEmpty().withMessage('Option B is required'),
  body('options.c').notEmpty().withMessage('Option C is required'),
  body('options.d').notEmpty().withMessage('Option D is required'),
  body('correctAnswer').isIn(['a', 'b', 'c', 'd']).withMessage('Valid correct answer is required')
], async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Teacher or Admin role required.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { subject, chapter, question, options, correctAnswer, explanation } = req.body;
    
    const mcq = new MCQ({
      subject,
      chapter,
      question,
      options: {
        a: options.a,
        b: options.b,
        c: options.c,
        d: options.d
      },
      correctAnswer: correctAnswer.toLowerCase(),
      explanation,
      uploadedBy: req.user._id
    });

    await mcq.save();
    await mcq.populate('uploadedBy', 'name email');
    
    res.status(201).json(mcq);
  } catch (error) {
    console.error('Create MCQ error:', error);
    // Send more detailed error message
    const errorMessage = error.message || 'Server error';
    res.status(500).json({ 
      message: 'Failed to create MCQ',
      error: errorMessage 
    });
  }
});

// Bulk create MCQs
app.post('/bulk', auth, [
  body('mcqs').isArray().withMessage('MCQs must be an array')
], async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Teacher or Admin role required.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mcqs } = req.body;
    const createdMCQs = [];

    for (const mcqData of mcqs) {
      const mcq = new MCQ({
        subject: mcqData.subject,
        chapter: mcqData.chapter || 'General',
        question: mcqData.question,
        options: {
          a: mcqData.options?.a || mcqData.optionA,
          b: mcqData.options?.b || mcqData.optionB,
          c: mcqData.options?.c || mcqData.optionC,
          d: mcqData.options?.d || mcqData.optionD
        },
        correctAnswer: (mcqData.correctAnswer || mcqData.correct).toLowerCase(),
        explanation: mcqData.explanation || '',
        uploadedBy: req.user._id
      });

      await mcq.save();
      createdMCQs.push(mcq);
    }

    res.status(201).json({
      message: `${createdMCQs.length} MCQs created successfully`,
      mcqs: createdMCQs
    });
  } catch (error) {
    console.error('Bulk create MCQs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update MCQ
app.put('/:id', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const mcq = await MCQ.findById(req.params.id);
    
    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }

    if (req.user.role !== 'admin' && mcq.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own MCQs.' });
    }

    const { subject, chapter, question, options, correctAnswer, explanation } = req.body;
    const updateData = {};
    
    if (subject) updateData.subject = subject;
    if (chapter) updateData.chapter = chapter;
    if (question) updateData.question = question;
    if (options) updateData.options = options;
    if (correctAnswer) updateData.correctAnswer = correctAnswer.toLowerCase();
    if (explanation !== undefined) updateData.explanation = explanation;
    
    const updatedMCQ = await MCQ.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('uploadedBy', 'name email');

    res.json(updatedMCQ);
  } catch (error) {
    console.error('Update MCQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete MCQ
app.delete('/:id', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const mcq = await MCQ.findById(req.params.id);
    
    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }

    if (req.user.role !== 'admin' && mcq.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own MCQs.' });
    }

    await MCQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'MCQ deleted successfully' });
  } catch (error) {
    console.error('Delete MCQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get MCQ statistics
app.get('/stats/my', auth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalMCQs = await MCQ.countDocuments({ uploadedBy: req.user._id });
    const lastUploaded = await MCQ.findOne({ uploadedBy: req.user._id })
      .sort('-createdAt')
      .select('createdAt');
    
    const subjectStats = await MCQ.aggregate([
      { $match: { uploadedBy: req.user._id } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const chapterStats = await MCQ.aggregate([
      { $match: { uploadedBy: req.user._id } },
      { $group: { _id: { subject: '$subject', chapter: '$chapter' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalMCQs,
      lastUploaded: lastUploaded?.createdAt || null,
      subjectStats,
      chapterStats
    });
  } catch (error) {
    console.error('Get MCQ stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;

