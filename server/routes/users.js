const express = require('express');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { uploadProfileImage } = require('../middleware/uploadCloudinary');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, adminAuth, async (req, res) => {
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
    console.log('Sample user:', users.length > 0 ? {
      id: users[0]._id,
      name: users[0].name,
      email: users[0].email,
      role: users[0].role,
      isApproved: users[0].isApproved,
      isBlocked: users[0].isBlocked
    } : 'No users');
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user statistics (Admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
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
router.patch('/:id/approve', auth, adminAuth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Block user (Admin only)
router.patch('/:id/block', auth, adminAuth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Unblock user (Admin only)
router.patch('/:id/unblock', auth, adminAuth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject/Revoke approval (Admin only)
router.patch('/:id/reject', auth, adminAuth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only) - MUST be before GET /:id to avoid route conflicts
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    console.log('DELETE /api/users/:id called with id:', req.params.id);
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('User not found for deletion:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting admins
    if (user.role === 'admin') {
      console.log('Attempted to delete admin account:', req.params.id);
      return res.status(400).json({ message: 'Cannot delete admin account' });
    }
    
    console.log('Deleting user:', user.name, user.email);
    await User.findByIdAndDelete(req.params.id);
    
    console.log('User deleted successfully:', req.params.id);
    res.json({ 
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID (Admin only) - MUST be after /stats route
router.get('/:id', auth, adminAuth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile image (Any authenticated user can upload their own)
router.post('/profile-image', auth, uploadProfileImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile image from Cloudinary if exists
    if (user.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(user.cloudinaryPublicId, 'image');
      } catch (error) {
        console.error('Error deleting old profile image:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new image to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      'teachify/profile-images',
      {
        public_id: `profile-${user._id}-${Date.now()}`,
        resource_type: 'image',
        width: 500,
        height: 500,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto',
        fetch_format: 'auto'
      }
    );

    // Update user profile image
    user.profileImage = cloudinaryResult.secure_url;
    user.cloudinaryPublicId = cloudinaryResult.public_id;
    await user.save();

    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete profile image (Any authenticated user can delete their own)
router.delete('/profile-image', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profileImage) {
      return res.status(400).json({ message: 'No profile image to delete' });
    }

    // Delete from Cloudinary if public ID exists
    if (user.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(user.cloudinaryPublicId, 'image');
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        // Continue with database update even if deletion fails
      }
    }

    // Remove profile image from user
    user.profileImage = undefined;
    user.cloudinaryPublicId = undefined;
    await user.save();

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

