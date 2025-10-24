const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Announcement = require('./models/Announcement');
const Faculty = require('./models/Faculty');

// Connect to MongoDB
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teachify', mongoOptions);

const modifyData = async () => {
  try {
    console.log('🔧 Modifying faculty and announcement data...');

    // Example: Update existing faculty
    const facultyToUpdate = await Faculty.findOne({ email: 'jane.smith@university.edu' });
    if (facultyToUpdate) {
      facultyToUpdate.name = 'Dr. Jane Smith (Updated)';
      facultyToUpdate.office = 'CS-102';
      facultyToUpdate.bio = 'Updated bio: Professor of Computer Science with 20 years of experience.';
      await facultyToUpdate.save();
      console.log('✅ Faculty updated:', facultyToUpdate.name);
    }

    // Example: Add new faculty
    const newFaculty = new Faculty({
      name: 'Dr. Sarah Wilson',
      subject: 'Data Science',
      email: 'sarah.wilson@university.edu',
      department: 'Computer Science',
      phone: '+1-555-0125',
      office: 'CS-103',
      bio: 'Assistant Professor specializing in machine learning and data analysis.'
    });
    await newFaculty.save();
    console.log('✅ New faculty added:', newFaculty.name);

    // Example: Update existing announcement
    const announcementToUpdate = await Announcement.findOne({ title: 'Midterm Exam Schedule' });
    if (announcementToUpdate) {
      announcementToUpdate.title = 'Updated: Midterm Exam Schedule';
      announcementToUpdate.description = 'Updated: Midterm exams will be held from October 15-20. Please check your individual schedules. Room assignments have been posted.';
      announcementToUpdate.priority = 'high';
      await announcementToUpdate.save();
      console.log('✅ Announcement updated:', announcementToUpdate.title);
    }

    // Example: Add new announcement
    const newAnnouncement = new Announcement({
      title: 'Library Extended Hours',
      description: 'The library will now be open 24/7 during exam week to support student study needs.',
      priority: 'medium',
      createdBy: new mongoose.Types.ObjectId() // You'll need a valid user ID
    });
    await newAnnouncement.save();
    console.log('✅ New announcement added:', newAnnouncement.title);

    console.log('🎉 Data modification completed successfully!');

  } catch (error) {
    console.error('❌ Error modifying data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Interactive menu
const showMenu = () => {
  console.log('\n📋 Data Modification Options:');
  console.log('1. Update existing faculty');
  console.log('2. Add new faculty');
  console.log('3. Update existing announcement');
  console.log('4. Add new announcement');
  console.log('5. Run all modifications');
  console.log('6. Exit');
};

// Run the modifications
modifyData();
