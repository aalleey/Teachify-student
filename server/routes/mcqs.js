const express = require('express');
const { body, validationResult } = require('express-validator');
const MCQ = require('../models/MCQ');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all MCQs (with optional filters)
// For teachers, automatically filter by their majorSubject if not specified
router.get('/', async (req, res, next) => {
  // Make auth optional - if token exists, verify it and attach user
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
  }
  next();
}, async (req, res) => {
  try {
    const { subject, chapter, uploadedBy, limit = 100, sort = '-createdAt' } = req.query;
    let filter = {};
    
    // If user is a teacher, filter by their majorSubject unless subject is explicitly provided
    if (req.user && req.user.role === 'faculty' && req.user.majorSubject && !subject) {
      filter.subject = req.user.majorSubject;
    } else if (subject) {
      filter.subject = subject;
    }
    
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
router.get('/practice', async (req, res) => {
  try {
    const { subject, chapter, limit = 50 } = req.query;
    
    if (!subject || !chapter) {
      return res.status(400).json({ message: 'Subject and chapter are required' });
    }
    
    const mcqs = await MCQ.find({ subject, chapter })
      .select('-correctAnswer') // Don't send correct answer to students before submission
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.json(mcqs);
  } catch (error) {
    console.error('Get practice MCQs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get MCQ by ID
router.get('/:id', async (req, res) => {
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
router.post('/', auth, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('chapter').notEmpty().withMessage('Chapter is required'),
  body('question').notEmpty().withMessage('Question is required'),
  body('options.a').notEmpty().withMessage('Option A is required'),
  body('options.b').notEmpty().withMessage('Option B is required'),
  body('options.c').notEmpty().withMessage('Option C is required'),
  body('options.d').notEmpty().withMessage('Option D is required'),
  body('correctAnswer').isIn(['a', 'b', 'c', 'd']).withMessage('Valid correct answer is required')
], async (req, res) => {
  console.log('📝 POST /api/mcqs - Creating MCQ');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
  
  try {
    // Allow only teachers/faculty and admins to create MCQs
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user.role !== 'faculty' && req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Teacher or Admin role required.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed. Please check all required fields.',
        errors: errors.array() 
      });
    }

    const { subject, chapter, question, options, correctAnswer, explanation } = req.body;
    
    // For teachers, ensure they can only create MCQs for their majorSubject
    if (req.user.role === 'faculty' && req.user.majorSubject) {
      if (subject !== req.user.majorSubject) {
        return res.status(403).json({ 
          message: `You can only create MCQs for your major subject: ${req.user.majorSubject}` 
        });
      }
    }
    
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

// Bulk create MCQs (from CSV or array)
router.post('/bulk', auth, [
  body('mcqs').isArray().withMessage('MCQs must be an array'),
  body('mcqs.*.subject').notEmpty().withMessage('Subject is required for each MCQ'),
  body('mcqs.*.question').notEmpty().withMessage('Question is required for each MCQ')
], async (req, res) => {
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

// Update MCQ (Teacher can update own, Admin can update any)
router.put('/:id', auth, [
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('question').optional().notEmpty().withMessage('Question cannot be empty'),
  body('correctAnswer').optional().isIn(['a', 'b', 'c', 'd']).withMessage('Valid correct answer is required')
], async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.id);
    
    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }

    // Check permissions: Teacher can only update own MCQs, Admin can update any
    if (req.user.role !== 'admin' && mcq.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own MCQs.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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

// Delete MCQ (Teacher can delete own, Admin can delete any)
router.delete('/:id', auth, async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.id);
    
    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }

    // Check permissions
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

// Get MCQ statistics (for teachers)
router.get('/stats/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Filter by teacher's majorSubject
    const filter = { uploadedBy: req.user._id };
    if (req.user.majorSubject) {
      filter.subject = req.user.majorSubject;
    }

    const totalMCQs = await MCQ.countDocuments(filter);
    const lastUploaded = await MCQ.findOne(filter)
      .sort('-createdAt')
      .select('createdAt');
    
    const subjectStats = await MCQ.aggregate([
      { $match: filter },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const chapterStats = await MCQ.aggregate([
      { $match: filter },
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

module.exports = router;

