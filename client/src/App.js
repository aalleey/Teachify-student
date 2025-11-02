import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Faculty from './pages/Faculty';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import PracticeMCQs from './pages/PracticeMCQs';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import api from './services/api';

function App() {
  // Add debugging for deployment issues
  useEffect(() => {
    console.log('App initialized');
    console.log('Environment:', process.env.NODE_ENV);
    
    // Test API connection
    const testApiConnection = async () => {
      try {
        console.log('Testing API connection...');
        // Just log the configuration without making an actual request
        console.log('API base URL:', api.defaults.baseURL);
      } catch (error) {
        console.error('API connection test failed:', error);
      }
    };
    
    testApiConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-[#000000] transition-colors duration-300 flex flex-col">
          <Navbar />
          <main className="flex-1 pt-16 lg:pt-20">
            <Routes>
            {/* Public Routes - Only accessible when NOT logged in */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              } 
            />
            {/* Public routes accessible to everyone */}
            <Route 
              path="/about" 
              element={<About />} 
            />
            <Route 
              path="/contact" 
              element={<Contact />} 
            />
            <Route path="/faculty" element={<Faculty />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes - Require authentication */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/dashboard" 
              element={
                <ProtectedRoute role="faculty">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/practice-mcqs" 
              element={
                <ProtectedRoute role="student">
                  <PracticeMCQs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/leaderboard" 
              element={<Leaderboard />} 
            />
            
            {/* Catch all - redirect to home (or login if authenticated) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
