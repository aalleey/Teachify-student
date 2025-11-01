const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// __dirname is automatically available in CommonJS

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://teachify-student.vercel.app',
    'https://teachify-student-git-main.vercel.app',
    /\.vercel\.app$/,
    /\.railway\.app$/,
    /\.ngrok\.io$/,
    /\.ngrok-free\.app$/
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes (must come before static file serving)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Teachify Server is running',
    timestamp: new Date().toISOString()
  });
});

// Import and use routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/syllabus', require('./routes/syllabus'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/pastPapers', require('./routes/pastPapers'));

// Serve static files from React build directory (production build)
const buildPath = path.join(__dirname, '..', 'client', 'build');

// Only serve static files if build directory exists
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  console.log(`📦 Serving React build from: ${buildPath}`);
} else {
  console.warn(`⚠️  React build folder not found at: ${buildPath}`);
  console.warn('   Please run: cd client && npm run build');
  console.warn('   Server will start but React app will not be served until build is created.\n');
}

// Catch all handler: send back React's index.html file for any non-API routes
// This allows React Router to handle client-side routing
// IMPORTANT: This must come AFTER all API routes and static file serving
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  
  // Check if build folder exists before trying to serve
  const indexPath = path.join(buildPath, 'index.html');
  
  if (!fs.existsSync(buildPath) || !fs.existsSync(indexPath)) {
    return res.status(500).json({ 
      message: 'React build folder not found. Please build the client app first.',
      hint: 'Run: cd client && npm run build',
      path: buildPath
    });
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ message: 'Error serving React app' });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Connect to MongoDB
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teachify', mongoOptions)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`📦 Serving React build from: ${buildPath}`);
  }
});
