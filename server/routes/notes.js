const express = require('express');
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all notes
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.post('/', auth, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('fileUrl').notEmpty().withMessage('File URL is required'),
  body('title').notEmpty().withMessage('Title is required')
], async (req, res) => {
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
router.put('/:id', auth, async (req, res) => {
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
router.delete('/:id', auth, async (req, res) => {
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

module.exports = router;
