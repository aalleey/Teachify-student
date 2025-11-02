import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-[#050505] text-gray-300 border-t border-gray-800 dark:border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2 flex-wrap">
            <span>© {currentYear} Teachify</span>
            <span className="hidden sm:inline">|</span>
            <span className="text-lg">🚀</span>
            <span className="font-medium text-gray-300">
              Proudly developed by <span className="text-primary-400 font-semibold">Ali Siddiqui</span>
            </span>
            <span className="text-lg">💡</span>
            <span className="text-gray-500">with help of</span>
            <span className="text-primary-400 font-semibold">Safeer Ali</span>
            <span className="text-lg">✨</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
