const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://teachify-student.vercel.app',
      'https://teachify-student-git-main.vercel.app',
      /\.vercel\.app$/,
      /\.railway\.app$/
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://teachify-student.vercel.app',
    'https://teachify-student-git-main.vercel.app',
    /\.vercel\.app$/,
    /\.railway\.app$/
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Teachify Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/syllabus', require('./routes/syllabus'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/pastPapers', require('./routes/pastPapers'));
app.use('/api/mcqs', require('./routes/mcqs'));
app.use('/api/quizResults', require('./routes/quizResults'));

// Users route - with logging
try {
  const usersRouter = require('./routes/users');
  app.use('/api/users', usersRouter);
  console.log('✅ /api/users route registered');
  console.log('   Available methods: GET /, GET /stats, GET /:id, PATCH /:id/approve, PATCH /:id/block, PATCH /:id/unblock, PATCH /:id/reject, DELETE /:id');
} catch (error) {
  console.error('❌ Error loading users route:', error);
}

// Messages route
try {
  const messagesRouter = require('./routes/messages');
  app.use('/api/messages', messagesRouter);
  console.log('✅ /api/messages route registered');
  console.log('   Available methods: GET /conversations, GET /conversation/:otherUserId, GET /teachers, GET /summary, POST /');
} catch (error) {
  console.error('❌ Error loading messages route:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teachify', mongoOptions)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection handling
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);
  
  // Store user connection
  connectedUsers.set(socket.userId, socket.id);
  
  // Emit online status to relevant users
  socket.broadcast.emit('user_online', { userId: socket.userId });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, content, subject } = data;
      
      if (!receiverId || !content || !subject) {
        socket.emit('message_error', { message: 'Missing required fields' });
        return;
      }

      // Verify receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        socket.emit('message_error', { message: 'Receiver not found' });
        return;
      }

      // Role verification
      if (socket.userRole === 'student' && receiver.role !== 'faculty') {
        socket.emit('message_error', { message: 'Students can only message teachers' });
        return;
      }

      if (socket.userRole === 'faculty' && receiver.role !== 'student') {
        socket.emit('message_error', { message: 'Teachers can only message students' });
        return;
      }

      // Create and save message
      const message = new Message({
        senderId: socket.userId,
        receiverId,
        content: content.trim(),
        subject
      });

      await message.save();
      await message.populate('senderId', 'name role');
      await message.populate('receiverId', 'name role');

      // Emit to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {
          message: {
            _id: message._id,
            senderId: { _id: socket.userId, name: socket.userName, role: socket.userRole },
            receiverId: { _id: receiver._id, name: receiver.name, role: receiver.role },
            content: message.content,
            subject: message.subject,
            timestamp: message.timestamp,
            isRead: message.isRead
          },
          senderName: socket.userName
        });
      }

      // Confirm to sender
      socket.emit('message_sent', {
        message: {
          _id: message._id,
          senderId: { _id: socket.userId, name: socket.userName, role: socket.userRole },
          receiverId: { _id: receiver._id, name: receiver.name, role: receiver.role },
          content: message.content,
          subject: message.subject,
          timestamp: message.timestamp,
          isRead: message.isRead
        }
      });

      console.log(`📨 Message sent from ${socket.userName} to ${receiver.name}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message_error', { message: 'Failed to send message', error: error.message });
    }
  });

  // Handle marking messages as read
  socket.on('mark_read', async (data) => {
    try {
      const { senderId } = data;
      await Message.updateMany(
        { senderId, receiverId: socket.userId, isRead: false },
        { isRead: true }
      );
      console.log(`✅ Messages marked as read for ${socket.userName}`);
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.userName} (${socket.userId})`);
    connectedUsers.delete(socket.userId);
    socket.broadcast.emit('user_offline', { userId: socket.userId });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server initialized`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
