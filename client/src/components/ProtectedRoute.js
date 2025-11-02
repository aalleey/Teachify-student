import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from './Card';

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
  const { isAuthenticated, user, loading, refreshUser } = useAuth();
  const refreshIntervalRef = useRef(null);
  const visibilityRefreshRef = useRef(null);

  // Periodically refresh user data if pending approval (so we can detect when admin approves)
  // This hook MUST be called before any conditional returns (React Hooks rule)
  useEffect(() => {
    if (user && user.role !== 'admin' && !user.isApproved) {
      // Refresh user data every 3 seconds when pending approval (more aggressive)
      const performRefresh = async () => {
        const updatedUser = await refreshUser();
        // If user was just approved, force a full page reload to ensure all state is reset
        if (updatedUser && updatedUser.isApproved && !user.isApproved) {
          console.log('✅ User approved! Reloading page to ensure clean state...');
          // Small delay to ensure state is saved
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      };

      // Initial refresh
      performRefresh();

      // Set up interval for periodic refresh
      refreshIntervalRef.current = setInterval(() => {
        performRefresh();
      }, 3000);

      // Also refresh when page becomes visible again
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          performRefresh();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      visibilityRefreshRef.current = handleVisibilityChange;

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
        if (visibilityRefreshRef.current) {
          document.removeEventListener('visibilitychange', visibilityRefreshRef.current);
        }
      };
    } else {
      // Clean up intervals if user is approved
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
  }, [user, refreshUser]);

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

  // Check if user is blocked
  if (user?.isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#000000]">
        <div className="max-w-md w-full mx-4">
          <Card>
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Account Blocked
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your account has been blocked. Please contact the administrator for assistance.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user is approved (admins are always approved)
  if (user?.role !== 'admin' && !user?.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#000000]">
        <div className="max-w-md w-full mx-4">
          <Card>
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Pending Approval
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your account is pending approval. Please contact the administrator for access.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                This page will automatically refresh when your account is approved.
              </p>
              <button
                onClick={async () => {
                  const updatedUser = await refreshUser();
                  if (updatedUser && updatedUser.isApproved) {
                    // User was just approved, reload page
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  }
                }}
                className="btn-secondary mb-2"
              >
                🔄 Refresh Status
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="btn-primary"
              >
                Back to Login
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
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
