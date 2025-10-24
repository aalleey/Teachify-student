const express = require('express');
const { body, validationResult } = require('express-validator');
const Calendar = require('../models/Calendar');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all calendar events
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = {};
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const events = await Calendar.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get calendar event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Calendar.findById(req.params.id)
      .populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Get calendar event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create calendar event (Admin only)
router.post('/', auth, adminAuth, [
  body('eventName').notEmpty().withMessage('Event name is required'),
  body('date').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventName, date, description, eventType = 'other' } = req.body;
    
    const event = new Calendar({
      eventName,
      date,
      description,
      eventType,
      createdBy: req.user._id
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update calendar event (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { eventName, date, description, eventType } = req.body;
    
    const event = await Calendar.findByIdAndUpdate(
      req.params.id,
      { eventName, date, description, eventType },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete calendar event (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const event = await Calendar.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
