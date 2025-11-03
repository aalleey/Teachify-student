const multer = require('multer');
const path = require('path');

// Use memory storage for Cloudinary (since we'll upload to Cloudinary, not disk)
const storage = multer.memoryStorage();

// File filter for syllabus uploads
const syllabusFileFilter = (req, file, cb) => {
  // Allow PDF, images, and text files
  const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, image, and document files are allowed!'));
  }
};

// File filter for profile images
const profileImageFilter = (req, file, cb) => {
  // Allow only images
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer for syllabus uploads
const uploadSyllabus = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: syllabusFileFilter
});

// Configure multer for profile images
const uploadProfileImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile images
  },
  fileFilter: profileImageFilter
});

module.exports = {
  uploadSyllabus,
  uploadProfileImage
};

