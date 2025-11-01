const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Syllabus = require('./models/Syllabus');
const Notes = require('./models/Notes');
const Announcement = require('./models/Announcement');
const Calendar = require('./models/Calendar');
const Faculty = require('./models/Faculty');

// Connect to MongoDB
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teachify', mongoOptions);

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Syllabus.deleteMany({});
    await Notes.deleteMany({});
    await Announcement.deleteMany({});
    await Calendar.deleteMany({});
    await Faculty.deleteMany({});

    // Create users
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@teachify.com',
      password: 'admin123',
      role: 'admin'
    });

    const studentUser = new User({
      name: 'John Doe',
      email: 'john@student.com',
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
    await studentUser.save();
    await facultyUser.save();

    console.log('✅ Users created');

    // Create faculty
    const faculty1 = new Faculty({
      name: 'Dr. Jane Smith',
      subject: 'Computer Science',
      email: 'jane.smith@university.edu',
      department: 'Computer Science',
      phone: '+1-555-0123',
      office: 'CS-101',
      bio: 'Professor of Computer Science with 15 years of experience in software engineering.'
    });

    const faculty2 = new Faculty({
      name: 'Dr. Michael Johnson',
      subject: 'Mathematics',
      email: 'michael.johnson@university.edu',
      department: 'Mathematics',
      phone: '+1-555-0124',
      office: 'MATH-205',
      bio: 'Associate Professor of Mathematics specializing in calculus and linear algebra.'
    });

    await faculty1.save();
    await faculty2.save();

    console.log('✅ Faculty created');

    // Create syllabus
    const syllabus1 = new Syllabus({
      department: 'Computer Science',
      semester: 'Fall 2024',
      subject: 'Data Structures and Algorithms',
      fileUrl: 'https://example.com/syllabus/dsa.pdf',
      description: 'Comprehensive course covering fundamental data structures and algorithms.',
      uploadedBy: adminUser._id
    });

    const syllabus2 = new Syllabus({
      department: 'Mathematics',
      semester: 'Fall 2024',
      subject: 'Calculus I',
      fileUrl: 'https://example.com/syllabus/calculus.pdf',
      description: 'Introduction to differential and integral calculus.',
      uploadedBy: adminUser._id
    });

    await syllabus1.save();
    await syllabus2.save();

    console.log('✅ Syllabus created');

    // Create notes
    const notes1 = new Notes({
      subject: 'Data Structures and Algorithms',
      title: 'Binary Trees Notes',
      fileUrl: 'https://example.com/notes/binary-trees.pdf',
      description: 'Comprehensive notes on binary tree operations and traversals.',
      uploadedBy: facultyUser._id
    });

    const notes2 = new Notes({
      subject: 'Calculus I',
      title: 'Derivatives Summary',
      fileUrl: 'https://example.com/notes/derivatives.pdf',
      description: 'Quick reference guide for derivative rules and formulas.',
      uploadedBy: facultyUser._id
    });

    await notes1.save();
    await notes2.save();

    console.log('✅ Notes created');

    // Create announcements
    const announcement1 = new Announcement({
      title: 'Midterm Exam Schedule',
      description: 'Midterm exams will be held from October 15-20. Please check your individual schedules.',
      priority: 'high',
      createdBy: adminUser._id
    });

    const announcement2 = new Announcement({
      title: 'Library Hours Extended',
      description: 'The library will now be open until 11 PM on weekdays to accommodate study needs.',
      priority: 'medium',
      createdBy: adminUser._id
    });

    await announcement1.save();
    await announcement2.save();

    console.log('✅ Announcements created');

    // Create calendar events
    const event1 = new Calendar({
      eventName: 'Midterm Exams',
      date: new Date('2024-10-15'),
      description: 'Midterm examination period begins',
      eventType: 'exam',
      createdBy: adminUser._id
    });

    const event2 = new Calendar({
      eventName: 'Thanksgiving Break',
      date: new Date('2024-11-28'),
      description: 'University closed for Thanksgiving holiday',
      eventType: 'holiday',
      createdBy: adminUser._id
    });

    const event3 = new Calendar({
      eventName: 'Final Project Due',
      date: new Date('2024-12-10'),
      description: 'Final project submission deadline',
      eventType: 'assignment',
      createdBy: adminUser._id
    });

    await event1.save();
    await event2.save();
    await event3.save();

    console.log('✅ Calendar events created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@teachify.com / admin123');
    console.log('Student: john@student.com / student123');
    console.log('Faculty: jane@faculty.com / faculty123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
