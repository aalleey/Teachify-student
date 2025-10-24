# 📝 How to Change Faculty and Announcement Data

## 🎯 **Method 1: Through Admin Dashboard (Recommended)**

### **Access the Admin Dashboard**
1. **Login as Admin**: Use `admin@teachify.com` / `admin123`
2. **Navigate to**: http://localhost:3000/admin/dashboard
3. **Click on tabs**: "Announcements" or "Faculty"

### **For Announcements:**
- **View**: See all existing announcements with priority levels
- **Create**: Click "Create Announcement" button
- **Edit**: Click "Edit" button on any announcement
- **Delete**: Click "Delete" button on any announcement

### **For Faculty:**
- **View**: See all faculty members in a grid layout
- **Create**: Click "Add Faculty" button
- **Edit**: Click "Edit" button on any faculty member
- **Delete**: Click "Delete" button on any faculty member

---

## 🛠️ **Method 2: Direct Database Modification**

### **Using the Modify Script**
```bash
cd server
node modify-data.js
```

This script will:
- Update existing faculty information
- Add new faculty members
- Update existing announcements
- Add new announcements

### **Manual Database Operations**
You can also modify data directly using MongoDB Atlas or MongoDB Compass:

1. **Connect to your MongoDB Atlas cluster**
2. **Navigate to the `teachify` database**
3. **Modify collections**: `announcements` and `faculty`

---

## 📊 **Method 3: API Endpoints (For Developers)**

### **Announcements API**
```bash
# Get all announcements
GET http://localhost:5000/api/announcements

# Create announcement
POST http://localhost:5000/api/announcements
{
  "title": "New Announcement",
  "description": "Description here",
  "priority": "high"
}

# Update announcement
PUT http://localhost:5000/api/announcements/:id
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "medium"
}

# Delete announcement
DELETE http://localhost:5000/api/announcements/:id
```

### **Faculty API**
```bash
# Get all faculty
GET http://localhost:5000/api/faculty

# Create faculty
POST http://localhost:5000/api/faculty
{
  "name": "Dr. John Doe",
  "subject": "Mathematics",
  "email": "john.doe@university.edu",
  "department": "Mathematics",
  "phone": "+1-555-0123",
  "office": "MATH-101",
  "bio": "Professor of Mathematics"
}

# Update faculty
PUT http://localhost:5000/api/faculty/:id
{
  "name": "Dr. John Doe (Updated)",
  "subject": "Advanced Mathematics",
  "email": "john.doe@university.edu",
  "department": "Mathematics",
  "phone": "+1-555-0123",
  "office": "MATH-102",
  "bio": "Updated bio"
}

# Delete faculty
DELETE http://localhost:5000/api/faculty/:id
```

---

## 🎨 **Method 4: Custom Modification Script**

Create your own script to modify data:

```javascript
// custom-modify.js
const mongoose = require('mongoose');
const Faculty = require('./models/Faculty');
const Announcement = require('./models/Announcement');

// Connect to database
mongoose.connect('your-mongodb-uri');

// Example: Add multiple faculty members
const addMultipleFaculty = async () => {
  const facultyMembers = [
    {
      name: 'Dr. Alice Johnson',
      subject: 'Physics',
      email: 'alice.johnson@university.edu',
      department: 'Physics',
      phone: '+1-555-0126',
      office: 'PHYS-201',
      bio: 'Professor of Physics specializing in quantum mechanics.'
    },
    {
      name: 'Dr. Bob Chen',
      subject: 'Chemistry',
      email: 'bob.chen@university.edu',
      department: 'Chemistry',
      phone: '+1-555-0127',
      office: 'CHEM-301',
      bio: 'Associate Professor of Chemistry with expertise in organic chemistry.'
    }
  ];

  for (const faculty of facultyMembers) {
    const newFaculty = new Faculty(faculty);
    await newFaculty.save();
    console.log(`Added: ${faculty.name}`);
  }
};

// Example: Update all announcements to high priority
const updateAllAnnouncements = async () => {
  await Announcement.updateMany({}, { priority: 'high' });
  console.log('All announcements updated to high priority');
};

// Run your modifications
addMultipleFaculty();
```

---

## 🔍 **Method 5: Using MongoDB Compass (GUI)**

1. **Download MongoDB Compass**: https://www.mongodb.com/products/compass
2. **Connect to your Atlas cluster** using the connection string
3. **Navigate to the `teachify` database**
4. **Select collections**: `announcements` or `faculty`
5. **Edit documents directly** in the GUI
6. **Save changes**

---

## 📋 **Quick Reference: Data Structure**

### **Announcement Document**
```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "date": "Date",
  "priority": "low|medium|high",
  "createdBy": "ObjectId (User ID)"
}
```

### **Faculty Document**
```json
{
  "_id": "ObjectId",
  "name": "String",
  "subject": "String",
  "email": "String",
  "department": "String",
  "phone": "String (optional)",
  "office": "String (optional)",
  "bio": "String (optional)"
}
```

---

## 🚀 **Best Practices**

1. **Always backup data** before making bulk changes
2. **Use the Admin Dashboard** for regular updates
3. **Test changes** in development before production
4. **Validate data** before saving (required fields, email format, etc.)
5. **Use transactions** for related data changes

---

## 🆘 **Troubleshooting**

### **Common Issues:**
- **"Server error"**: Check MongoDB connection
- **"Validation error"**: Ensure required fields are provided
- **"Duplicate email"**: Faculty emails must be unique
- **"Permission denied"**: Ensure you're logged in as admin

### **Quick Fixes:**
```bash
# Restart servers
npm run dev

# Re-seed database
npm run seed

# Check MongoDB connection
cd server && node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error)"
```
