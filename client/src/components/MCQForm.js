import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const MCQForm = ({ onClose, onSuccess, editingMCQ = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: editingMCQ?.subject || (user?.majorSubject || ''),
    chapter: editingMCQ?.chapter || '',
    question: editingMCQ?.question || '',
    options: {
      a: editingMCQ?.options?.a || '',
      b: editingMCQ?.options?.b || '',
      c: editingMCQ?.options?.c || '',
      d: editingMCQ?.options?.d || ''
    },
    correctAnswer: editingMCQ?.correctAnswer || 'a',
    explanation: editingMCQ?.explanation || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Auto-set subject for teachers
  useEffect(() => {
    if (user?.role === 'faculty' && user?.majorSubject && !editingMCQ) {
      setFormData(prev => ({ ...prev, subject: user.majorSubject }));
    }
  }, [user, editingMCQ]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const optionKey = name.replace('option', '').toLowerCase();
      setFormData({
        ...formData,
        options: {
          ...formData.options,
          [optionKey]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.subject || !formData.chapter || !formData.question) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    if (!formData.options.a || !formData.options.b || !formData.options.c || !formData.options.d) {
      setError('Please fill all four options');
      setLoading(false);
      return;
    }

    try {
      await onSuccess(formData);
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to save MCQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:bg-opacity-70 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#0d0d0d] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {editingMCQ ? 'Edit MCQ' : 'Create New MCQ'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
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
              <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chapter *
              </label>
              <input
                type="text"
                id="chapter"
                name="chapter"
                value={formData.chapter}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
                placeholder="e.g., Chapter 1: Introduction"
              />
            </div>
          </div>

          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question *
            </label>
            <textarea
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
              placeholder="Enter the question text..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="optionA" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Option A *
              </label>
              <input
                type="text"
                id="optionA"
                name="optionA"
                value={formData.options.a}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
                placeholder="Option A"
              />
            </div>

            <div>
              <label htmlFor="optionB" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Option B *
              </label>
              <input
                type="text"
                id="optionB"
                name="optionB"
                value={formData.options.b}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
                placeholder="Option B"
              />
            </div>

            <div>
              <label htmlFor="optionC" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Option C *
              </label>
              <input
                type="text"
                id="optionC"
                name="optionC"
                value={formData.options.c}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
                placeholder="Option C"
              />
            </div>

            <div>
              <label htmlFor="optionD" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Option D *
              </label>
              <input
                type="text"
                id="optionD"
                name="optionD"
                value={formData.options.d}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
                placeholder="Option D"
              />
            </div>
          </div>

          <div>
            <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correct Answer *
            </label>
            <select
              id="correctAnswer"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
            >
              <option value="a">Option A</option>
              <option value="b">Option B</option>
              <option value="c">Option C</option>
              <option value="d">Option D</option>
            </select>
          </div>

          <div>
            <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Explanation (Optional)
            </label>
            <textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
              placeholder="Explain why this is the correct answer..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (editingMCQ ? 'Updating...' : 'Creating...') : (editingMCQ ? 'Update MCQ' : 'Create MCQ')}
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
      </motion.div>
    </div>
  );
};

export default MCQForm;

