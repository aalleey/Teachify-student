import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { mcqsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MCQForm from './MCQForm';
import Card from './Card';

const TeacherMCQsManagement = () => {
  const { user } = useAuth();
  const [mcqs, setMcqs] = useState([]);
  const [stats, setStats] = useState({
    totalMCQs: 0,
    lastUploaded: null,
    subjectStats: [],
    chapterStats: []
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMCQ, setEditingMCQ] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMCQs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { uploadedBy: user?._id };
      const response = await mcqsAPI.getAll(params);
      setMcqs(response.data || []);
    } catch (error) {
      console.error('Error fetching MCQs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await mcqsAPI.getMyStats();
      setStats(response.data || {
        totalMCQs: 0,
        lastUploaded: null,
        subjectStats: [],
        chapterStats: []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchMCQs();
    fetchStats();
  }, [fetchMCQs, fetchStats]);

  const handleCreate = async (formData) => {
    try {
      await mcqsAPI.create(formData);
      await fetchMCQs();
      await fetchStats();
    } catch (error) {
      console.error('Create MCQ error:', error);
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        throw new Error(errorMessages);
      }
      // Handle other error formats
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to create MCQ. Please check your connection and try again.';
      throw new Error(errorMessage);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await mcqsAPI.update(editingMCQ._id, formData);
      await fetchMCQs();
      await fetchStats();
      setEditingMCQ(null);
    } catch (error) {
      console.error('Update MCQ error:', error);
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        throw new Error(errorMessages);
      }
      // Handle other error formats
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to update MCQ. Please check your connection and try again.';
      throw new Error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this MCQ?')) return;
    
    try {
      await mcqsAPI.delete(id);
      await fetchMCQs();
      await fetchStats();
    } catch (error) {
      alert('Failed to delete MCQ');
    }
  };

  const filteredMCQs = mcqs.filter(mcq => {
    const matchesSearch = searchTerm === '' || 
      mcq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mcq.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === '' || mcq.subject === filterSubject;
    const matchesChapter = filterChapter === '' || mcq.chapter === filterChapter;
    return matchesSearch && matchesSubject && matchesChapter;
  });

  const uniqueSubjects = [...new Set(mcqs.map(m => m.subject))].sort();
  const uniqueChapters = [...new Set(mcqs.map(m => m.chapter))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            MCQs Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage multiple choice questions for your subjects
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMCQ(null);
            setShowForm(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create MCQ
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {stats.totalMCQs}
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">Total MCQs</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {uniqueSubjects.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">Subjects</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {uniqueChapters.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">Chapters</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by question or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chapter
            </label>
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100"
            >
              <option value="">All Chapters</option>
              {uniqueChapters.map(chapter => (
                <option key={chapter} value={chapter}>{chapter}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* MCQs List */}
      {loading ? (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading MCQs...</p>
          </div>
        </Card>
      ) : filteredMCQs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {mcqs.length === 0 ? 'No MCQs created yet.' : 'No MCQs match your filters.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMCQs.map((mcq) => (
            <motion.div
              key={mcq._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#0d0d0d] rounded-xl shadow-lg border border-gray-200 dark:border-[#1a1a1a] p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
                      {mcq.subject}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                      {mcq.chapter}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {mcq.question}
                  </h3>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingMCQ(mcq);
                      setShowForm(true);
                    }}
                    className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    title="Edit MCQ"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(mcq._id)}
                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    title="Delete MCQ"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className={`p-3 rounded-lg ${mcq.correctAnswer === 'a' ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-400' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">A:</span>
                  <p className="text-gray-900 dark:text-gray-100">{mcq.options.a}</p>
                </div>
                <div className={`p-3 rounded-lg ${mcq.correctAnswer === 'b' ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-400' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">B:</span>
                  <p className="text-gray-900 dark:text-gray-100">{mcq.options.b}</p>
                </div>
                <div className={`p-3 rounded-lg ${mcq.correctAnswer === 'c' ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-400' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">C:</span>
                  <p className="text-gray-900 dark:text-gray-100">{mcq.options.c}</p>
                </div>
                <div className={`p-3 rounded-lg ${mcq.correctAnswer === 'd' ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-400' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">D:</span>
                  <p className="text-gray-900 dark:text-gray-100">{mcq.options.d}</p>
                </div>
              </div>

              {mcq.explanation && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Explanation:</strong> {mcq.explanation}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <MCQForm
          editingMCQ={editingMCQ}
          onClose={() => {
            setShowForm(false);
            setEditingMCQ(null);
          }}
          onSuccess={editingMCQ ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
};

export default TeacherMCQsManagement;

