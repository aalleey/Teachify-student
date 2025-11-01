import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark mode state
 * - Persists preference to localStorage
 * - Applies/removes 'dark' class on <html> element
 * - Returns dark mode state and toggle function
 */
export const useDarkMode = () => {
  // Initialize from localStorage or default to false (light mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark class to HTML element when mode changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return [isDarkMode, toggleDarkMode];
};

