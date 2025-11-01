import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * PublicRoute - Redirects authenticated users to their dashboard
 * Use this for routes that should only be accessible to guests (not logged in)
 * Examples: Home, About, Contact, Login, Register
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#000000]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  // If user is authenticated, redirect them to their dashboard
  if (isAuthenticated) {
    // Redirect based on role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else {
      // Default fallback for other roles or if role is undefined
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // User is not authenticated, show the public route
  return children;
};

export default PublicRoute;

