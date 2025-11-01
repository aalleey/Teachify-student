// Shared utilities for Vercel serverless functions
const mongoose = require('mongoose');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachify';
  
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

