const express = require('express');
const { body, validationResult } = require('express-validator');
const { connectToDatabase } = require('./_utils');
const Calendar = require('../server/models/Calendar');
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

// Get all calendar events
app.get('/', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

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
app.get('/:id', async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

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
app.post('/', auth, adminAuth, [
  body('eventName').notEmpty().withMessage('Event name is required'),
  body('date').isISO8601().withMessage('Valid date is required')
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
app.put('/:id', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

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
app.delete('/:id', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

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

// Vercel serverless function handler
module.exports = app;

