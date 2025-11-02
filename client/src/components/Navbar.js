import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  // Navigation links for public users
  const publicNavLinks = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'About', path: '/about', icon: '📖' },
    { name: 'Faculty', path: '/faculty', icon: '👨‍🏫' },
    { name: 'Contact', path: '/contact', icon: '📧' },
  ];

  // Role-based navigation links
  const getRoleBasedLinks = () => {
    if (!isAuthenticated) return [];
    
    const { role } = user || {};
    
    if (role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Users', path: '/admin/dashboard', icon: '👥', tab: 'users' },
        { name: 'Messages', path: '/admin/dashboard', icon: '💬', tab: 'messages' },
        { name: 'MCQs', path: '/admin/dashboard', icon: '❓', tab: 'mcqs' },
        { name: 'Analytics', path: '/admin/dashboard', icon: '📈', tab: 'analytics' },
        { name: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
      ];
    } else if (role === 'faculty' || role === 'teacher') {
      return [
        { name: 'Dashboard', path: '/teacher/dashboard', icon: '📊' },
        { name: 'Messages', path: '/teacher/dashboard', icon: '💬', tab: 'messages' },
        { name: 'MCQs', path: '/teacher/dashboard', icon: '❓', tab: 'mcqs' },
        { name: 'Papers', path: '/teacher/dashboard', icon: '📤', tab: 'upload' },
        { name: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
      ];
    } else if (role === 'student') {
      return [
        { name: 'Dashboard', path: '/student/dashboard', icon: '📊' },
        { name: 'Messages', path: '/student/dashboard', icon: '💬', tab: 'messages' },
        { name: 'Practice', path: '/practice-mcqs', icon: '❓' },
        { name: 'Results', path: '/student/dashboard', icon: '📈', tab: 'results' },
        { name: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
      ];
    }
    
    return [];
  };

  const navLinks = isAuthenticated ? getRoleBasedLinks() : publicNavLinks;

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (!user) return '/';
    if (isAdmin) return '/admin/dashboard';
    if (user.role === 'faculty' || user.role === 'teacher') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-800/50' 
        : 'bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-2 group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-6 h-6 lg:w-7 lg:h-7 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
              </div>
            </div>
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
              Teachify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center mx-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path.split('?')[0] || 
                              (link.tab && location.search.includes(`tab=${link.tab}`));
              return (
                <Link
                  key={link.name}
                  to={link.path + (link.tab ? `?tab=${link.tab}` : '')}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{link.icon}</span>
                    <span>{link.name}</span>
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:scale-110"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Authenticated User Section */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center space-x-3">
                {/* User Profile */}
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <span className={`text-[10px] font-medium ${
                      user?.role === 'admin' 
                        ? 'text-purple-600 dark:text-purple-400'
                        : user?.role === 'student'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}
                    </span>
                  </div>
                </div>

                {/* Dashboard Button */}
                <Link
                  to={getDashboardPath()}
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Dashboard
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 relative">
                <span className={`absolute top-0 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                <span className={`absolute top-2.5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`absolute top-5 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            {/* Mobile Navigation Links */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path.split('?')[0] || 
                              (link.tab && location.search.includes(`tab=${link.tab}`));
              return (
                <Link
                  key={link.name}
                  to={link.path + (link.tab ? `?tab=${link.tab}` : '')}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {user?.name}
                        </div>
                        <div className={`text-xs font-medium ${
                          user?.role === 'admin' 
                            ? 'text-purple-600 dark:text-purple-400'
                            : user?.role === 'student'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-500 text-white text-center rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 text-center rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
