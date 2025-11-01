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

  // Handle logout - clear auth and redirect to login
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    // Redirect to login page after logout
    navigate('/login', { replace: true });
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation links - visible when NOT authenticated (guests)
  const publicNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Teachers', path: '/faculty' },
    { name: 'About', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ];

  // Navigation links - visible when authenticated (logged in users)
  const authNavLinks = [
    { name: 'Dashboard', path: isAdmin ? '/admin/dashboard' : '/student/dashboard' },
    { name: 'Faculty', path: '/faculty' },
    // Add more authenticated-only links here as needed
  ];

  const navLinks = isAuthenticated ? authNavLinks : publicNavLinks;

  return (
    <nav className="bg-white dark:bg-[#000000] shadow-md dark:shadow-black/50 sticky top-0 z-50 border-b border-gray-100 dark:border-[#1a1a1a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            <Link 
              to="/" 
              className="flex items-center space-x-2 lg:space-x-3 group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {/* Logo Icon */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg p-1.5 lg:p-2 group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-6 h-6 lg:w-7 lg:h-7 text-white" 
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
              
              {/* Logo Text */}
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Teachify
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
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
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                // Sun icon for light mode (when dark mode is active)
                <svg className="w-5 h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon icon for dark mode (when light mode is active)
                <svg className="w-5 h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Date and Time Display - Hidden on small screens, visible on medium+ */}
            <div className="hidden md:flex flex-col items-end text-right">
              <div className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(currentDateTime)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(currentDateTime)}
              </div>
            </div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center space-x-3">
                {/* User greeting with role badge */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Welcome, {user?.name}
                </span>
                  {user?.role && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
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

                {/* Dashboard Link */}
                {(isAdmin || isStudent) && (
                    <Link
                    to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                    className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
                    >
                    Dashboard
                    </Link>
                  )}

                {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1"
                  >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                  </button>
                </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
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

        {/* Mobile Menu - Slides down when open */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-gray-200 dark:border-[#1a1a1a]">
            {/* Mobile Dark Mode Toggle */}
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#1a1a1a]">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors duration-200"
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
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-[#1a1a1a] text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(currentDateTime)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(currentDateTime)}
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-[#0d0d0d] text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-primary-600 dark:hover:text-primary-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1a1a1a] space-y-2">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-2 bg-gray-50 dark:bg-[#0d0d0d] rounded-lg">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.name}
                    </div>
                    {user?.role && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.role}
                      </div>
                    )}
                  </div>

                  {/* Dashboard Link */}
                  {(isAdmin || isStudent) && (
                    <Link
                      to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white text-center rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-600 text-white text-center rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 text-center rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white text-center rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
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
