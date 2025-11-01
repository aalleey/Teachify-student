import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Initialize dark mode on app load
const initializeDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  const isDarkMode = saved ? JSON.parse(saved) : false;
  const root = window.document.documentElement;
  
  if (isDarkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Apply dark mode before rendering
initializeDarkMode();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
