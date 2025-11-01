// Seed database with dummy data including admin user
// Run with: node seed-database.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models from server folder
const User = require('./server/models/User');
const Syllabus = require('./server/models/Syllabus');
const Notes = require('./server/models/Notes');
const Announcement = require('./server/models/Announcement');
const Calendar = require('./server/models/Calendar');
const Faculty = require('./server/models/Faculty');

// Load environment variables from server folder
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

// Also try loading from root if server/.env doesn't have it
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

// Connect to MongoDB
const mongoOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
};

let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teachify';

// Clean up MongoDB URI - remove trailing whitespace and fix formatting
MONGODB_URI = MONGODB_URI.trim();

// If URI is incomplete, use the known working URI
if (!MONGODB_URI.includes('retryWrites=true')) {
  // Use the working MongoDB URI from env.example
  MONGODB_URI = 'mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/teachify?retryWrites=true&w=majority';
}

console.log('📝 Using MongoDB URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials in log

const connectDB = async () => {
  console.log('🔗 Connecting to MongoDB...');
  
  try {
    await mongoose.connect(MONGODB_URI, mongoOptions);
    console.log('✅ Connected to MongoDB');
    
    // Wait a bit for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Wait for connection to be ready
    if (mongoose.connection.readyState === 1) {
      return true;
    } else {
      throw new Error('Connection not ready');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

const seedData = async () => {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Option to clear existing data (comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    
    // Use try-catch for each delete operation to continue even if one fails
    try {
      await User.deleteMany({}).maxTimeMS(30000);
      await Syllabus.deleteMany({}).maxTimeMS(30000);
      await Notes.deleteMany({}).maxTimeMS(30000);
      await Announcement.deleteMany({}).maxTimeMS(30000);
      await Calendar.deleteMany({}).maxTimeMS(30000);
      await Faculty.deleteMany({}).maxTimeMS(30000);
      console.log('✅ Existing data cleared\n');
    } catch (clearError) {
      console.warn('⚠️  Warning: Some data could not be cleared:', clearError.message);
      console.log('Continuing with seeding...\n');
    }

    // ========== CREATE USERS ==========
    console.log('👤 Creating users...');
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@teachify.com',
      password: 'admin123',
      role: 'admin'
    });

    const studentUser1 = new User({
      name: 'John Doe',
      email: 'john@student.com',
      password: 'student123',
      role: 'student'
    });

    const studentUser2 = new User({
      name: 'Sarah Wilson',
      email: 'sarah@student.com',
      password: 'student123',
      role: 'student'
    });

    const facultyUser = new User({
      name: 'Dr. Jane Smith',
      email: 'jane@faculty.com',
      password: 'faculty123',
      role: 'faculty'
    });

    await adminUser.save();
    await studentUser1.save();
    await studentUser2.save();
    await facultyUser.save();

    console.log('✅ Users created');
    console.log('   📧 Admin: admin@teachify.com / admin123');
    console.log('   📧 Student 1: john@student.com / student123');
    console.log('   📧 Student 2: sarah@student.com / student123');
    console.log('   📧 Faculty: jane@faculty.com / faculty123\n');

    // ========== CREATE FACULTY ==========
    console.log('👨‍🏫 Creating faculty members...');
    
    const faculty1 = new Faculty({
      name: 'Dr. Jane Smith',
      subject: 'Computer Science',
      email: 'jane.smith@university.edu',
      department: 'Computer Science',
      phone: '+1-555-0123',
      office: 'CS-101',
      bio: 'Professor of Computer Science with 15 years of experience in software engineering and data structures.',
      status: 'Available'
    });

    const faculty2 = new Faculty({
      name: 'Dr. Michael Johnson',
      subject: 'Mathematics',
      email: 'michael.johnson@university.edu',
      department: 'Mathematics',
      phone: '+1-555-0124',
      office: 'MATH-205',
      bio: 'Associate Professor of Mathematics specializing in calculus and linear algebra.',
      status: 'Available'
    });

    const faculty3 = new Faculty({
      name: 'Dr. Emily Chen',
      subject: 'Physics',
      email: 'emily.chen@university.edu',
      department: 'Physics',
      phone: '+1-555-0125',
      office: 'PHYS-302',
      bio: 'Assistant Professor of Physics with expertise in quantum mechanics and thermodynamics.',
      status: 'Busy'
    });

    await faculty1.save();
    await faculty2.save();
    await faculty3.save();

    console.log('✅ Faculty created\n');

    // ========== CREATE SYLLABUS ==========
    console.log('📚 Creating syllabus...');
    
    const syllabus1 = new Syllabus({
      department: 'Computer Science',
      semester: 'Fall 2024',
      subject: 'Data Structures and Algorithms',
      fileUrl: '/uploads/syllabus/dsa-fall2024.pdf',
      description: 'Comprehensive course covering fundamental data structures (arrays, linked lists, trees, graphs) and algorithms (sorting, searching, dynamic programming).',
      uploadedBy: adminUser._id,
      originalFileName: 'DSA-Syllabus.pdf',
      fileSize: 245000,
      fileType: 'application/pdf'
    });

    const syllabus2 = new Syllabus({
      department: 'Mathematics',
      semester: 'Fall 2024',
      subject: 'Calculus I',
      fileUrl: '/uploads/syllabus/calculus-fall2024.pdf',
      description: 'Introduction to differential and integral calculus including limits, derivatives, and applications.',
      uploadedBy: adminUser._id,
      originalFileName: 'Calculus-Syllabus.pdf',
      fileSize: 189000,
      fileType: 'application/pdf'
    });

    const syllabus3 = new Syllabus({
      department: 'Physics',
      semester: 'Fall 2024',
      subject: 'Quantum Mechanics',
      fileUrl: '/uploads/syllabus/quantum-fall2024.pdf',
      description: 'Advanced course on quantum mechanics, wave functions, and quantum states.',
      uploadedBy: adminUser._id,
      originalFileName: 'Quantum-Syllabus.pdf',
      fileSize: 312000,
      fileType: 'application/pdf'
    });

    await syllabus1.save();
    await syllabus2.save();
    await syllabus3.save();

    console.log('✅ Syllabus created\n');

    // ========== CREATE NOTES ==========
    console.log('📝 Creating notes...');
    
    const notes1 = new Notes({
      subject: 'Data Structures and Algorithms',
      title: 'Binary Trees - Complete Guide',
      fileUrl: '/uploads/notes/binary-trees.pdf',
      description: 'Comprehensive notes on binary tree operations, traversals (inorder, preorder, postorder), and applications.',
      uploadedBy: facultyUser._id
    });

    const notes2 = new Notes({
      subject: 'Calculus I',
      title: 'Derivatives Summary',
      fileUrl: '/uploads/notes/derivatives.pdf',
      description: 'Quick reference guide for derivative rules, chain rule, and common derivatives.',
      uploadedBy: facultyUser._id
    });

    const notes3 = new Notes({
      subject: 'Data Structures and Algorithms',
      title: 'Sorting Algorithms Comparison',
      fileUrl: '/uploads/notes/sorting-algorithms.pdf',
      description: 'Detailed comparison of bubble sort, quicksort, mergesort, and their time complexities.',
      uploadedBy: facultyUser._id
    });

    await notes1.save();
    await notes2.save();
    await notes3.save();

    console.log('✅ Notes created\n');

    // ========== CREATE ANNOUNCEMENTS ==========
    console.log('📢 Creating announcements...');
    
    const announcement1 = new Announcement({
      title: 'Midterm Exam Schedule Released',
      description: 'Midterm exams will be held from October 15-20. Please check your individual schedules in the calendar section. Good luck with your preparations!',
      priority: 'high',
      createdBy: adminUser._id
    });

    const announcement2 = new Announcement({
      title: 'Library Hours Extended',
      description: 'The university library will now be open until 11 PM on weekdays to accommodate study needs. Study rooms are available for group sessions.',
      priority: 'medium',
      createdBy: adminUser._id
    });

    const announcement3 = new Announcement({
      title: 'New Course Materials Available',
      description: 'All syllabus documents and course materials for Fall 2024 are now available in the syllabus section.',
      priority: 'low',
      createdBy: adminUser._id
    });

    await announcement1.save();
    await announcement2.save();
    await announcement3.save();

    console.log('✅ Announcements created\n');

    // ========== CREATE CALENDAR EVENTS ==========
    console.log('📅 Creating calendar events...');
    
    const today = new Date();
    const event1 = new Calendar({
      eventName: 'Midterm Exams Begin',
      date: new Date(today.getFullYear(), today.getMonth(), 15),
      description: 'Midterm examination period begins for all courses',
      eventType: 'exam',
      createdBy: adminUser._id
    });

    const event2 = new Calendar({
      eventName: 'Thanksgiving Break',
      date: new Date(today.getFullYear(), 10, 28), // November 28
      description: 'University closed for Thanksgiving holiday',
      eventType: 'holiday',
      createdBy: adminUser._id
    });

    const event3 = new Calendar({
      eventName: 'Final Project Submission Deadline',
      date: new Date(today.getFullYear(), 11, 10), // December 10
      description: 'Final project submission deadline for all courses',
      eventType: 'assignment',
      createdBy: adminUser._id
    });

    const event4 = new Calendar({
      eventName: 'Student Orientation',
      date: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      description: 'Welcome event for new students',
      eventType: 'other',
      createdBy: adminUser._id
    });

    await event1.save();
    await event2.save();
    await event3.save();
    await event4.save();

    console.log('✅ Calendar events created\n');

    // ========== SUMMARY ==========
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════');
    console.log('🔐 ADMIN ACCOUNT:');
    console.log('   Email: admin@teachify.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👨‍🎓 STUDENT ACCOUNTS:');
    console.log('   Email: john@student.com | Password: student123');
    console.log('   Email: sarah@student.com | Password: student123');
    console.log('');
    console.log('👨‍🏫 FACULTY ACCOUNT:');
    console.log('   Email: jane@faculty.com');
    console.log('   Password: faculty123');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📊 DATA SUMMARY:');
    console.log(`   ✅ ${await User.countDocuments()} users created`);
    console.log(`   ✅ ${await Faculty.countDocuments()} faculty members created`);
    console.log(`   ✅ ${await Syllabus.countDocuments()} syllabus documents created`);
    console.log(`   ✅ ${await Notes.countDocuments()} notes created`);
    console.log(`   ✅ ${await Announcement.countDocuments()} announcements created`);
    console.log(`   ✅ ${await Calendar.countDocuments()} calendar events created\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seed
(async () => {
  try {
    await connectDB();
    await seedData();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
})();

