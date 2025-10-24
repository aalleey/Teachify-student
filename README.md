# Teachify - Student Management System

A comprehensive MERN stack application for managing academic resources, announcements, and student information.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Syllabus Management**: Upload and manage course syllabi
- **Notes & Resources**: Share and access study materials
- **Announcements**: Important updates and notifications
- **Academic Calendar**: Track important dates and events
- **Faculty Directory**: Connect with professors and advisors
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Cloudinary for file uploads (optional)

### Frontend
- React.js
- Tailwind CSS
- React Router
- Axios for API calls
- Context API for state management

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd teachify-student
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   
   **Backend (.env in server folder):**
   ```env
   MONGODB_URI=mongodb://localhost:27017/teachify
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   **Frontend (.env in client folder):**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and React development server (port 3000).

## 🗄️ Database Models

### User
- name, email, password, role (admin/student/faculty)

### Syllabus
- department, semester, subject, fileUrl, description

### Notes
- subject, uploadedBy, fileUrl, title, description, date

### Announcement
- title, description, date, priority, createdBy

### Calendar
- eventName, date, description, eventType, createdBy

### Faculty
- name, subject, email, department, phone, office, bio

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Syllabus
- `GET /api/syllabus` - Get all syllabus
- `POST /api/syllabus` - Create syllabus (Admin only)
- `PUT /api/syllabus/:id` - Update syllabus (Admin only)
- `DELETE /api/syllabus/:id` - Delete syllabus (Admin only)

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create notes
- `PUT /api/notes/:id` - Update notes
- `DELETE /api/notes/:id` - Delete notes

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (Admin only)
- `PUT /api/announcements/:id` - Update announcement (Admin only)
- `DELETE /api/announcements/:id` - Delete announcement (Admin only)

### Calendar
- `GET /api/calendar` - Get all events
- `POST /api/calendar` - Create event (Admin only)
- `PUT /api/calendar/:id` - Update event (Admin only)
- `DELETE /api/calendar/:id` - Delete event (Admin only)

### Faculty
- `GET /api/faculty` - Get all faculty
- `POST /api/faculty` - Create faculty (Admin only)
- `PUT /api/faculty/:id` - Update faculty (Admin only)
- `DELETE /api/faculty/:id` - Delete faculty (Admin only)

## 🚀 Deployment

### Backend Deployment (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `CLOUDINARY_*` (if using Cloudinary)

### Frontend Deployment (Vercel)
1. Connect your GitHub repository
2. Set environment variables:
   - `REACT_APP_API_URL` (your deployed backend URL)

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your backend environment

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Admin Dashboard**: Manage all academic resources
3. **Student Dashboard**: Access syllabi, notes, announcements, and calendar
4. **Faculty Directory**: Connect with professors

## 🔧 Development

### Available Scripts
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start only backend
- `npm run client` - Start only frontend
- `npm run build` - Build for production

### Project Structure
```
teachify-student/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js
└── package.json           # Root package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@teachify.com or create an issue in the repository.
