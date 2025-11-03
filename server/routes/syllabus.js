const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const Syllabus = require('../models/Syllabus');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadSyllabus } = require('../middleware/uploadCloudinary');
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require('../utils/cloudinary');

const router = express.Router();

// Get all syllabus
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
    const { department, semester, subject } = req.query;
    let filter = {};
    
    // If user is a teacher, filter by their majorSubject unless subject is explicitly provided
    if (req.user && req.user.role === 'faculty' && req.user.majorSubject && !subject) {
      filter.subject = req.user.majorSubject;
    } else if (subject) {
      filter.subject = subject;
    }
    
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
router.get('/:id', async (req, res) => {
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
router.post('/', auth, adminAuth, uploadSyllabus.single('file'), [
  body('department').notEmpty().withMessage('Department is required'),
  body('semester').notEmpty().withMessage('Semester is required'),
  body('subject').notEmpty().withMessage('Subject is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { department, semester, subject, description } = req.body;
    
    // Upload file to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      'teachify/syllabus',
      {
        public_id: `syllabus-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
        resource_type: 'auto'
      }
    );
    
    // Use Cloudinary URL
    const fileUrl = cloudinaryResult.secure_url;
    
    const syllabus = new Syllabus({
      department,
      semester,
      subject,
      fileUrl,
      description,
      uploadedBy: req.user._id,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      cloudinaryPublicId: cloudinaryResult.public_id // Store public ID for future deletion
    });

    await syllabus.save();
    res.status(201).json(syllabus);
  } catch (error) {
    console.error('Create syllabus error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update syllabus (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
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
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);
    if (!syllabus) {
      return res.status(404).json({ message: 'Syllabus not found' });
    }

    // Delete file from Cloudinary if public ID exists
    if (syllabus.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(syllabus.cloudinaryPublicId, 'auto');
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    } else if (syllabus.fileUrl) {
      // Fallback: Try to extract public ID from URL
      const publicId = getPublicIdFromUrl(syllabus.fileUrl);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId, 'auto');
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
        }
      }
    }

    await Syllabus.findByIdAndDelete(req.params.id);
    res.json({ message: 'Syllabus deleted successfully' });
  } catch (error) {
    console.error('Delete syllabus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
