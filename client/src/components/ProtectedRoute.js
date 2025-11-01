import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - Protects routes that require authentication
 * @param {React.ReactNode} children - The component to render if authenticated
 * @param {string} role - Optional role requirement (e.g., 'admin', 'student')
 * 
 * Usage:
 * <ProtectedRoute role="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#000000] transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is specified and user doesn't have that role, redirect to their dashboard
  if (role && user?.role !== role) {
    // Redirect user to their appropriate dashboard
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'faculty' || user?.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />;
    } else if (user?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else {
      // If role doesn't match and user role is unknown, redirect to login
      return <Navigate to="/login" replace />;
    }
  }

  // User is authenticated and has the required role (if specified)
  return children;
};

export default ProtectedRoute;
