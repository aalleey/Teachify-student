import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getSubjectIcon, getSubjectColor } from '../utils/subjectIcons';

const PastPaperCard = ({ paper, onView, onFavorite, isFavorite = false, isAdmin = false, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(isFavorite);

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFav(!isFav);
    if (onFavorite) {
      onFavorite(paper._id, !isFav);
    }
  };

  const handleView = (e) => {
    e.stopPropagation();
    if (onView) {
      onView(paper);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(paper);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Are you sure you want to delete this past paper?')) {
      onDelete(paper._id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className={`
        relative bg-white dark:bg-[#0d0d0d] rounded-xl shadow-lg
        border border-gray-200 dark:border-[#1a1a1a]
        overflow-hidden cursor-pointer
        transition-all duration-300 ease-in-out
        backdrop-blur-sm
        ${isHovered ? 'shadow-2xl dark:shadow-primary-500/30 shadow-primary-500/20 dark:neon-blue' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleView}
    >
      {/* Subject Icon Badge */}
      <div className={`
        absolute top-4 right-4 
        ${getSubjectColor(paper.subject)} 
        w-12 h-12 rounded-full 
        flex items-center justify-center 
        text-2xl
        shadow-lg
        transition-transform duration-300
        ${isHovered ? 'scale-110 rotate-6' : ''}
      `}>
        {getSubjectIcon(paper.subject)}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Subject & Year */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
            {paper.subject}
          </span>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {paper.year}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {paper.title}
        </h3>

        {/* Description */}
        {paper.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {paper.description}
          </p>
        )}

        {/* Upload Info */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="mr-3">{paper.uploadedBy?.name || 'Admin'}</span>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(paper.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleView}
            className="
              flex-1 bg-primary-600 hover:bg-primary-700 
              text-white font-semibold py-2 px-4 rounded-lg
              transition-colors duration-200
              text-sm
            "
          >
            View Paper
          </button>

          {!isAdmin && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFavorite}
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${isFav 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                }
              `}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={handleEdit}
                className="
                  p-2 bg-blue-100 dark:bg-blue-900/30 
                  text-blue-600 dark:text-blue-400 
                  rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50
                  transition-colors duration-200
                "
                title="Edit paper"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="
                  p-2 bg-red-100 dark:bg-red-900/30 
                  text-red-600 dark:text-red-400 
                  rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50
                  transition-colors duration-200
                "
                title="Delete paper"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent pointer-events-none rounded-xl"
        />
      )}
    </motion.div>
  );
};

export default PastPaperCard;

