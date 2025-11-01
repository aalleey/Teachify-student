const express = require('express');
const { connectToDatabase } = require('./_utils');

// Connect to database on function cold start
connectToDatabase().catch(console.error);

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

// Import route handlers
const authRoutes = require('./auth');
const facultyRoutes = require('./faculty');
const syllabusRoutes = require('./syllabus');
const announcementsRoutes = require('./announcements');
const notesRoutes = require('./notes');
const calendarRoutes = require('./calendar');
const pastPapersRoutes = require('./pastPapers');

// Mount routes with /api prefix (Vercel keeps full path in request)
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/pastPapers', pastPapersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Teachify Server is running',
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/api', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Teachify API is running',
    endpoints: ['/api/health', '/api/auth', '/api/faculty', '/api/syllabus', '/api/announcements', '/api/notes', '/api/calendar', '/api/pastPapers']
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Export for Vercel
module.exports = app;

