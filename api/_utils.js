// Shared utilities for Vercel serverless functions
const mongoose = require('mongoose');

let cachedDb = null;

// Normalize MongoDB URI to ensure it includes database name
function normalizeMongoURI(uri) {
  if (!uri) return 'mongodb://localhost:27017/teachify';
  
  let normalized = uri.trim();
  
  // If URI doesn't end with database name or query params
  if (normalized.endsWith('/')) {
    // Add database name
    normalized = normalized + 'teachify';
  } else if (!normalized.includes('/') && normalized.includes('@')) {
    // URI like mongodb+srv://user:pass@cluster.net (missing /dbname)
    normalized = normalized + '/teachify';
  }
  
  // Add query parameters if not present
  if (!normalized.includes('?')) {
    normalized = normalized + '?retryWrites=true&w=majority';
  } else if (!normalized.includes('retryWrites')) {
    normalized = normalized + '&retryWrites=true&w=majority';
  }
  
  return normalized;
}

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachify';
  uri = normalizeMongoURI(uri);
  
  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(uri, options);
    cachedDb = mongoose.connection;
    console.log('✅ MongoDB connected (Vercel function)');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectToDatabase };

