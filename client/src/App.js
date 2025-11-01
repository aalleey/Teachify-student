import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Faculty from './pages/Faculty';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
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
        <div className="min-h-screen bg-gray-50 dark:bg-[#000000] transition-colors duration-300">
          <Navbar />
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
            {/* Public route accessible to everyone (guests and authenticated users) */}
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
              path="/student/dashboard" 
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to home (or login if authenticated) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
