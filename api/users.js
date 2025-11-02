const express = require('express');
const { connectToDatabase } = require('./_utils');
const User = require('../server/models/User');
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

// Get all users (Admin only)
app.get('/', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const { role, isApproved, isBlocked, search } = req.query;
    let filter = {};
    
    // Always exclude admins from the list
    filter.role = { $ne: 'admin' };
    
    // Filter by role if specified
    if (role && role !== 'admin' && (role === 'student' || role === 'faculty')) {
      filter.role = role;
    }
    
    // Filter by approval status
    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true' || isApproved === true;
    }
    
    // Filter by blocked status
    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked === 'true' || isBlocked === true;
    }
    
    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Fetching users with filter:', JSON.stringify(filter, null, 2));
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics (Admin only)
app.get('/stats', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    console.log('Fetching user statistics...');
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'faculty' });
    const pendingApproval = await User.countDocuments({ 
      role: { $ne: 'admin' }, 
      isApproved: false,
      isBlocked: false 
    });
    const blockedUsers = await User.countDocuments({ 
      role: { $ne: 'admin' }, 
      isBlocked: true 
    });
    const approvedUsers = await User.countDocuments({ 
      role: { $ne: 'admin' }, 
      isApproved: true,
      isBlocked: false 
    });
    
    const stats = {
      totalUsers,
      totalStudents,
      totalTeachers,
      pendingApproval,
      blockedUsers,
      approvedUsers
    };
    
    console.log('User statistics:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve user (Admin only)
app.patch('/:id/approve', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow approving admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin account' });
    }
    
    user.isApproved = true;
    user.isBlocked = false; // Unblock if was blocked
    await user.save();
    
    res.json({ 
      message: 'User approved successfully',
      user: await User.findById(req.params.id).select('-password')
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Block user (Admin only)
app.patch('/:id/block', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow blocking admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin account' });
    }
    
    user.isBlocked = true;
    await user.save();
    
    res.json({ 
      message: 'User blocked successfully',
      user: await User.findById(req.params.id).select('-password')
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unblock user (Admin only)
app.patch('/:id/unblock', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow modifying admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin account' });
    }
    
    user.isBlocked = false;
    await user.save();
    
    res.json({ 
      message: 'User unblocked successfully',
      user: await User.findById(req.params.id).select('-password')
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject/Revoke approval (Admin only)
app.patch('/:id/reject', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow modifying admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin account' });
    }
    
    user.isApproved = false;
    await user.save();
    
    res.json({ 
      message: 'User approval revoked successfully',
      user: await User.findById(req.params.id).select('-password')
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (Admin only)
app.delete('/:id', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin account' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID (Admin only) - MUST be after /stats route
app.get('/:id', auth, adminAuth, async (req, res) => {
  if (!dbReady) {
    await connectToDatabase();
    dbReady = true;
  }

  try {
    // Check if the id is actually "stats" - should not happen, but just in case
    if (req.params.id === 'stats') {
      return res.status(404).json({ message: 'Invalid route' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Vercel serverless function handler
module.exports = app;

