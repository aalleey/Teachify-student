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
    /\.onrender\.com$/,
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
console.log('📋 Registering API routes...');
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ /api/auth registered');
  app.use('/api/syllabus', require('./routes/syllabus'));
  console.log('✅ /api/syllabus registered');
  app.use('/api/notes', require('./routes/notes'));
  console.log('✅ /api/notes registered');
  app.use('/api/announcements', require('./routes/announcements'));
  console.log('✅ /api/announcements registered');
  app.use('/api/calendar', require('./routes/calendar'));
  console.log('✅ /api/calendar registered');
  app.use('/api/faculty', require('./routes/faculty'));
  console.log('✅ /api/faculty registered');
  app.use('/api/pastPapers', require('./routes/pastPapers'));
  console.log('✅ /api/pastPapers registered');
  app.use('/api/mcqs', require('./routes/mcqs'));
  console.log('✅ /api/mcqs registered');
  app.use('/api/quizResults', require('./routes/quizResults'));
  console.log('✅ /api/quizResults registered');
  
  // Register users route with error handling
  console.log('📝 Attempting to load users route...');
  try {
    const usersRouterPath = path.join(__dirname, 'routes', 'users.js');
    console.log('   Route file path:', usersRouterPath);
    console.log('   File exists:', fs.existsSync(usersRouterPath));
    
    if (!fs.existsSync(usersRouterPath)) {
      throw new Error(`Users route file not found at ${usersRouterPath}`);
    }
    
    const usersRouter = require('./routes/users');
    console.log('   Router loaded:', typeof usersRouter);
    
    if (!usersRouter || typeof usersRouter !== 'function') {
      throw new Error('Users router is not a valid Express router');
    }
    
    app.use('/api/users', usersRouter);
    console.log('✅ /api/users registered successfully');
    console.log('   Available routes:');
    console.log('   - GET /api/users (requires auth & admin)');
    console.log('   - GET /api/users/stats (requires auth & admin)');
    console.log('   - GET /api/users/:id (requires auth & admin)');
    console.log('   - PATCH /api/users/:id/approve (requires auth & admin)');
    console.log('   - PATCH /api/users/:id/block (requires auth & admin)');
    console.log('   - PATCH /api/users/:id/unblock (requires auth & admin)');
    console.log('   - PATCH /api/users/:id/reject (requires auth & admin)');
    console.log('   - DELETE /api/users/:id (requires auth & admin)');
  } catch (userRouteError) {
    console.error('❌ CRITICAL: Error registering /api/users route');
    console.error('   Error message:', userRouteError.message);
    console.error('   Error code:', userRouteError.code);
    console.error('   Error name:', userRouteError.name);
    if (userRouteError.stack) {
      console.error('   Stack trace:', userRouteError.stack);
    }
    // Don't throw - let server start anyway, but log the error clearly
    console.error('   ⚠️  Server will continue but /api/users endpoints will not work!');
  }
  
  console.log('✅ All API routes registration completed');
} catch (error) {
  console.error('❌ Fatal error registering routes:', error);
  console.error('Error details:', error.message);
  if (error.stack) {
    console.error('Stack:', error.stack);
  }
}

// Add a route list endpoint for debugging
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const basePath = middleware.regexp.source.replace('\\/?', '').replace('(?=\\/|$)', '');
          routes.push({
            path: basePath + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

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
    console.log('⚠️  API route not found:', req.path);
    return res.status(404).json({ 
      message: 'API route not found',
      path: req.path,
      method: req.method,
      hint: 'Check server console for registered routes'
    });
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
