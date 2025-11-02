import React, { useState, useEffect } from 'react';
import { pastPapersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PastPaperUploadForm = ({ onClose, onSuccess, editingPaper = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: editingPaper?.subject || (user?.majorSubject || ''),
    title: editingPaper?.title || '',
    year: editingPaper?.year || new Date().getFullYear(),
    description: editingPaper?.description || ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Auto-set subject for teachers
  useEffect(() => {
    if (user?.role === 'faculty' && user?.majorSubject && !editingPaper) {
      setFormData(prev => ({ ...prev, subject: user.majorSubject }));
    }
  }, [user, editingPaper]);

  const subjects = [
    'Mathematics',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'Geography',
    'Economics',
    'Business',
    'Art',
    'Music',
    'Physical Education',
    'Literature',
    'Philosophy',
    'Psychology',
    'Engineering'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (20MB limit)
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError('File size must be less than 20MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF and image files are allowed');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (editingPaper) {
      // Update existing paper
      try {
        const updateData = { ...formData };
        if (file) {
          // For Vercel, you'd need to upload to Cloudinary first and get URL
          // For now, we'll just send the existing fileUrl
          updateData.fileUrl = editingPaper.fileUrl;
          updateData.originalFileName = file.name;
          updateData.fileSize = file.size;
          updateData.fileType = file.type;
        }
        
        await pastPapersAPI.update(editingPaper._id, updateData);
        
        onSuccess && onSuccess();
        onClose();
      } catch (error) {
        console.error('Past paper update error:', error);
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error
          || error.response?.data?.errors?.[0]?.msg
          || error.message
          || 'Update failed. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Create new paper
      if (!file) {
        setError('Please select a file to upload');
        setLoading(false);
        return;
      }

      try {
        const formDataToSend = new FormData();
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('year', formData.year);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('file', file);

        await pastPapersAPI.create(formDataToSend);
        
        onSuccess && onSuccess();
        onClose();
      } catch (error) {
        console.error('Past paper upload error:', error);
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error
          || error.response?.data?.errors?.[0]?.msg
          || error.message
          || 'Upload failed. Please check your connection and try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:bg-opacity-70">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {editingPaper ? 'Edit Past Paper' : 'Upload Past Paper'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject *
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={user?.role === 'faculty' && user?.majorSubject}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            {user?.role === 'faculty' && user?.majorSubject && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your major subject is locked to: {user.majorSubject}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Paper Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100"
              placeholder="e.g., Final Exam Paper 2024"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year *
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100"
              placeholder="Enter description (optional)"
            />
          </div>

          {!editingPaper && (
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                File (PDF or Image) *
              </label>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                required={!editingPaper}
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supported formats: PDF, Images (JPG, PNG, GIF). Max size: 20MB
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (editingPaper ? 'Updating...' : 'Uploading...') : (editingPaper ? 'Update Paper' : 'Upload Paper')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PastPaperUploadForm;

