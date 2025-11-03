# Cloudinary Setup Guide

## ✅ Configuration Complete

Your Cloudinary credentials have been verified:

- **Cloud Name:** `dqgoleqga`
- **API Key:** `574366883697562`
- **API Secret:** `EotWBxDs3HzH5jkModagJfgFyyI` ✅ (verified)

## 📝 Setup Your .env File

Create or update `server/.env` with the following:

```env
# Environment
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://aalleey27:laptop321@techify.zoafzhc.mongodb.net/

# JWT Secret
JWT_SECRET=laptop321

# Server Port
PORT=5000

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=dqgoleqga
CLOUDINARY_API_KEY=574366883697562
CLOUDINARY_API_SECRET=EotWBxDs3HzH5jkModagJfgFyyI
```

## 🚀 What's Been Implemented

### 1. Syllabus Upload
- All syllabus files are now uploaded to Cloudinary
- Stored in folder: `teachify/syllabus`
- Supports: PDF, images, documents (JPG, PNG, GIF, PDF, TXT, DOC, DOCX)
- Max file size: 10MB
- Automatic cleanup when syllabus is deleted

### 2. Profile Images
- User profile images uploaded to Cloudinary
- Stored in folder: `teachify/profile-images`
- Automatic resizing: 500x500px with face detection
- Supports: JPG, PNG, GIF, WEBP
- Max file size: 5MB
- Old images automatically deleted when uploading new ones

## 📡 API Endpoints

### Upload Profile Image
```javascript
POST /api/users/profile-image
Content-Type: multipart/form-data
Body: { image: File }

Response: {
  message: "Profile image uploaded successfully",
  profileImage: "https://res.cloudinary.com/..."
}
```

### Delete Profile Image
```javascript
DELETE /api/users/profile-image

Response: {
  message: "Profile image deleted successfully"
}
```

### Upload Syllabus (Admin only)
```javascript
POST /api/syllabus
Content-Type: multipart/form-data
Body: {
  file: File,
  department: string,
  semester: string,
  subject: string,
  description?: string
}
```

## 🧪 Testing

To test your Cloudinary connection, run:
```bash
cd server
node test-cloudinary.js
```

## ⚠️ Important Notes

1. **Never commit your `.env` file to git** - it contains sensitive credentials
2. **For production deployment**, add these environment variables to your hosting platform:
   - Railway
   - Render
   - Vercel
   - etc.

3. **File Organization**: All files are organized in Cloudinary folders:
   - `teachify/syllabus/` - Syllabus files
   - `teachify/profile-images/` - User profile images

4. **Automatic Cleanup**: When you delete a syllabus or profile image, the file is automatically removed from Cloudinary

## 🎉 You're All Set!

Your Cloudinary integration is complete and ready to use. You can now:
- Upload syllabus files (they'll be stored on Cloudinary)
- Upload/update user profile images
- All files will be automatically optimized and served via Cloudinary CDN

