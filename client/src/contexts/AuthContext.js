import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const register = async (name, email, password, role = 'student', majorSubject = '') => {
    try {
      const requestData = { 
        name, email, password, role 
      };
      
      // Only include majorSubject if role is faculty
      if (role === 'faculty' && majorSubject) {
        requestData.majorSubject = majorSubject;
      }
      
      const response = await api.post('/auth/register', requestData);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return null;
    
    try {
      // Add cache-busting timestamp to prevent browser caching
      const timestamp = Date.now();
      const response = await api.get(`/auth/me?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const updatedUser = response.data.user;
      
      // Force state update even if values appear the same (handles isApproved changes)
      setUser(prevUser => {
        // If user was not approved and now is approved, force update
        if (prevUser && !prevUser.isApproved && updatedUser.isApproved) {
          console.log('✅ User approval status changed! Forcing state update.');
          // Return a new object to force React to re-render
          return { ...updatedUser, _forceUpdate: Date.now() };
        }
        // Always return a new object to ensure React detects the change
        return { ...updatedUser };
      });
      
      return updatedUser;
    } catch (error) {
      console.error('Refresh user failed:', error);
      // If refresh fails (e.g., token expired), logout
      if (error.response?.status === 401) {
        logout();
      }
      return null;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isFaculty: user?.role === 'faculty'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
