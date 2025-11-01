import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for current date and time (updates every second)
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formatDate = (date) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle logout - clear auth and redirect to home
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    // Redirect to home page after logout
    navigate('/', { replace: true });
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation links - visible when NOT authenticated (guests)
  const publicNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Teachers', path: '/faculty' },
  ];

  // Role-based navigation links
  const getRoleBasedLinks = () => {
    if (!isAuthenticated) return [];
    
    const { role } = user || {};
    
    if (role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Manage Faculty', path: '/admin/dashboard', icon: '👥' },
        { name: 'Past Papers', path: '/admin/dashboard?tab=pastPapers', icon: '📄' },
      ];
    } else if (role === 'faculty' || role === 'teacher') {
      return [
        { name: 'Dashboard', path: '/teacher/dashboard', icon: '📊' },
        { name: 'Upload Papers', path: '/teacher/dashboard?tab=upload', icon: '📤' },
        { name: 'My Uploads', path: '/teacher/dashboard?tab=myPapers', icon: '📁' },
      ];
    } else if (role === 'student') {
      return [
        { name: 'Dashboard', path: '/student/dashboard', icon: '📊' },
        { name: 'Past Papers', path: '/student/dashboard?tab=pastPapers', icon: '📄' },
        { name: 'My Teachers', path: '/student/dashboard?tab=teachers', icon: '👥' },
      ];
    }
    
    return [];
  };

  const navLinks = isAuthenticated ? getRoleBasedLinks() : publicNavLinks;

  return (
    <nav className="bg-white dark:bg-[#000000] shadow-md dark:shadow-black/50 sticky top-0 z-50 border-b border-gray-100 dark:border-[#1a1a1a] transition-colors duration-300 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center min-h-[64px] h-auto py-2 lg:py-0 lg:h-20">
          {/* Logo Section - Responsive sizing */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {/* Logo Icon - Responsive sizing */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg p-1 sm:p-1.5 md:p-2 group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
              </div>
              
              {/* Logo Text - Responsive sizing */}
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent whitespace-nowrap">
                Teachify
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links - Show on medium screens and up */}
          <div className="hidden md:flex items-center space-x-1 flex-wrap justify-center flex-1 mx-2 lg:mx-4">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-[#0d0d0d]'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                  }`}
                >
                  {link.name}
                  {/* Active indicator underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full"></span>
                  )}
                  {/* Hover underline effect */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              );
            })}
          </div>

          {/* Right Section: Date/Time, Dark Mode Toggle & Auth Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
            {/* Dark Mode Toggle - Always visible */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 touch-manipulation"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Date and Time Display - Responsive: Hide time on xs, show on sm+ */}
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="text-xs sm:text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {formatTime(currentDateTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap hidden md:block">
                {formatDate(currentDateTime)}
              </div>
            </div>

            {/* Auth Section - Desktop: Show on xl screens, Mobile: Show in menu */}
            {isAuthenticated ? (
              <div className="hidden xl:flex items-center space-x-2 xl:space-x-3">
                {/* User greeting - Responsive text */}
                <div className="flex items-center space-x-1.5 xl:space-x-2">
                  <span className="text-xs xl:text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-[100px] xl:max-w-none">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  {user?.role && (
                    <span className={`px-1.5 xl:px-2 py-0.5 xl:py-1 text-[10px] xl:text-xs font-semibold rounded-full transition-colors duration-200 whitespace-nowrap ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                        : user.role === 'student'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                </div>

                {/* Dashboard Link - Responsive */}
                {(isAdmin || isStudent || user?.role === 'faculty' || user?.role === 'teacher') && (
                  <Link
                    to={
                      isAdmin 
                        ? '/admin/dashboard' 
                        : (user?.role === 'faculty' || user?.role === 'teacher')
                        ? '/teacher/dashboard'
                        : '/student/dashboard'
                    }
                    className="px-3 xl:px-4 py-1.5 xl:py-2 bg-primary-600 dark:bg-primary-500 text-white text-xs xl:text-sm font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 whitespace-nowrap"
                  >
                    Dashboard
                  </Link>
                )}

                {/* Logout Button - Responsive */}
                <button
                  onClick={handleLogout}
                  className="px-3 xl:px-4 py-1.5 xl:py-2 bg-red-600 text-white text-xs xl:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1 whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden xl:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 xl:px-4 py-1.5 xl:py-2 text-gray-700 dark:text-gray-300 text-xs xl:text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors duration-200 whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 xl:px-4 py-1.5 xl:py-2 bg-primary-600 dark:bg-primary-500 text-white text-xs xl:text-sm font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button - Always visible on mobile/tablet */}
            <button
              onClick={toggleMobileMenu}
              className="xl:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 touch-manipulation"
              aria-label="Toggle mobile menu"
            >
              {/* Hamburger Icon - Animates to X when open */}
              <div className="w-6 h-6 relative">
                <span
                  className={`absolute top-0 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''
                  }`}
                ></span>
                <span
                  className={`absolute top-2.5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                ></span>
                <span
                  className={`absolute top-5 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Slides down when open, scrollable if needed */}
        <div
          className={`xl:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[90vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-3 sm:py-4 border-t border-gray-200 dark:border-[#1a1a1a] overflow-y-auto max-h-[90vh]">
            {/* Mobile Dark Mode Toggle */}
            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-[#1a1a1a]">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors duration-200 touch-manipulation"
              >
                {isDarkMode ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Mobile Date/Time Display */}
            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-[#1a1a1a] text-center">
              <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(currentDateTime)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {formatDate(currentDateTime)}
              </div>
            </div>

            {/* Mobile Navigation Links - Scrollable if needed */}
            <div className="space-y-1 mb-3 sm:mb-4">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path.split('?')[0];
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 touch-manipulation ${
                      isActive
                        ? 'bg-primary-50 dark:bg-[#0d0d0d] text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    <span className="mr-2">{link.icon || ''}</span>
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Section */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-[#1a1a1a] space-y-2">
              {isAuthenticated ? (
                <>
                  {/* User Info - Responsive */}
                  <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-[#0d0d0d] rounded-lg">
                    <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.name}
                    </div>
                    {user?.role && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                            : user.role === 'student'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dashboard Link - Touch-friendly */}
                  {(isAdmin || isStudent || user?.role === 'faculty' || user?.role === 'teacher') && (
                    <Link
                      to={
                        isAdmin 
                          ? '/admin/dashboard' 
                          : (user?.role === 'faculty' || user?.role === 'teacher')
                          ? '/teacher/dashboard'
                          : '/student/dashboard'
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white text-center rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 touch-manipulation text-sm sm:text-base"
                    >
                      Dashboard
                    </Link>
                  )}

                  {/* Logout Button - Touch-friendly */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-600 text-white text-center rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 touch-manipulation text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 text-center rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-200 touch-manipulation text-sm sm:text-base"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white text-center rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 touch-manipulation text-sm sm:text-base"
                  >
                    Register
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
