const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get conversation between two users
router.get('/conversation/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.otherUserId;

    // Verify the conversation participants
    const otherUser = await User.findById(otherUserId).select('name role majorSubject');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all messages between these two users, sorted by timestamp
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    })
      .populate('senderId', 'name role')
      .populate('receiverId', 'name role')
      .sort({ timestamp: 1 });

    // Mark messages as read if current user is the receiver
    await Message.updateMany(
      { receiverId: currentUserId, senderId: otherUserId, isRead: false },
      { isRead: true }
    );

    res.json({
      messages,
      otherUser: {
        _id: otherUser._id,
        name: otherUser.name,
        role: otherUser.role,
        subject: otherUser.majorSubject || otherUser.subject
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all conversations for current user (list of people they've chatted with)
router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const userRole = req.user.role;

    let conversations = [];

    if (userRole === 'student') {
      // For students: Get all teachers they've messaged with (based on teacher's subject)
      const messages = await Message.find({
        $or: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      })
        .populate('senderId', 'name role majorSubject')
        .populate('receiverId', 'name role majorSubject')
        .sort({ timestamp: -1 });

      // Get unique teacher IDs the student has conversed with
      const teacherIds = new Set();
      messages.forEach(msg => {
        const otherUser = msg.senderId._id.toString() === currentUserId.toString()
          ? msg.receiverId
          : msg.senderId;
        if (otherUser.role === 'faculty') {
          teacherIds.add(otherUser._id.toString());
        }
      });

      // Get conversation details for each teacher
      for (const teacherId of teacherIds) {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: currentUserId, receiverId: teacherId },
            { senderId: teacherId, receiverId: currentUserId }
          ]
        })
          .populate('senderId', 'name')
          .populate('receiverId', 'name')
          .sort({ timestamp: -1 });

        const teacher = await User.findById(teacherId).select('name majorSubject');
        const unreadCount = await Message.countDocuments({
          senderId: teacherId,
          receiverId: currentUserId,
          isRead: false
        });

        conversations.push({
          userId: teacherId,
          name: teacher.name,
          subject: teacher.majorSubject,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            senderName: lastMessage.senderId.name
          } : null,
          unreadCount
        });
      }
    } else if (userRole === 'faculty') {
      // For teachers: Get all students who have messaged them
      const messages = await Message.find({
        $or: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      })
        .populate('senderId', 'name role')
        .populate('receiverId', 'name role')
        .sort({ timestamp: -1 });

      // Get unique student IDs
      const studentIds = new Set();
      messages.forEach(msg => {
        const otherUser = msg.senderId._id.toString() === currentUserId.toString()
          ? msg.receiverId
          : msg.senderId;
        if (otherUser.role === 'student') {
          studentIds.add(otherUser._id.toString());
        }
      });

      // Get conversation details for each student
      for (const studentId of studentIds) {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: currentUserId, receiverId: studentId },
            { senderId: studentId, receiverId: currentUserId }
          ]
        })
          .populate('senderId', 'name')
          .populate('receiverId', 'name')
          .sort({ timestamp: -1 });

        const student = await User.findById(studentId).select('name');
        const unreadCount = await Message.countDocuments({
          senderId: studentId,
          receiverId: currentUserId,
          isRead: false
        });

        conversations.push({
          userId: studentId,
          name: student.name,
          subject: lastMessage?.subject || '',
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            senderName: lastMessage.senderId.name
          } : null,
          unreadCount
        });
      }
    }

    // Sort by last message timestamp (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get list of available teachers (for students)
router.get('/teachers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const teachers = await User.find({
      role: 'faculty',
      isApproved: true,
      isBlocked: false
    }).select('name majorSubject email');

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send a message (REST API fallback)
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, subject } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content || !subject) {
      return res.status(400).json({ message: 'Receiver ID, content, and subject are required' });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // For students: verify they're messaging a teacher
    if (req.user.role === 'student' && receiver.role !== 'faculty') {
      return res.status(403).json({ message: 'Students can only message teachers' });
    }

    // For teachers: verify they're messaging a student
    if (req.user.role === 'faculty' && receiver.role !== 'student') {
      return res.status(403).json({ message: 'Teachers can only message students' });
    }

    const message = new Message({
      senderId,
      receiverId,
      content: content.trim(),
      subject
    });

    await message.save();
    await message.populate('senderId', 'name role');
    await message.populate('receiverId', 'name role');

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get message summary for admin
router.get('/summary', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const messages = await Message.find()
      .populate('senderId', 'name role')
      .populate('receiverId', 'name role')
      .sort({ timestamp: -1 });

    // Group by conversation pairs
    const conversations = {};
    messages.forEach(msg => {
      const key = [msg.senderId._id.toString(), msg.receiverId._id.toString()]
        .sort()
        .join('-');
      
      if (!conversations[key]) {
        conversations[key] = {
          student: msg.senderId.role === 'student' ? msg.senderId : msg.receiverId,
          teacher: msg.senderId.role === 'faculty' ? msg.senderId : msg.receiverId,
          subject: msg.subject,
          messageCount: 0,
          lastMessage: null
        };
      }
      conversations[key].messageCount++;
      if (!conversations[key].lastMessage || msg.timestamp > conversations[key].lastMessage) {
        conversations[key].lastMessage = msg.timestamp;
      }
    });

    const summary = Object.values(conversations).map(conv => ({
      studentName: conv.student.name,
      teacherName: conv.teacher.name,
      subject: conv.subject,
      messageCount: conv.messageCount,
      lastMessage: conv.lastMessage
    }));

    res.json(summary);
  } catch (error) {
    console.error('Get message summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

