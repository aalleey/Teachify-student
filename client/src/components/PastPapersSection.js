import React, { useState, useEffect, useMemo } from 'react';
import { pastPapersAPI } from '../services/api';
import PastPaperCard from './PastPaperCard';
import PastPaperViewer from './PastPaperViewer';
import PastPaperUploadForm from './PastPaperUploadForm';

const PastPapersSection = ({ isAdmin = false }) => {
  const [papers, setPapers] = useState([]);
  const [recentPapers, setRecentPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingPaper, setViewingPaper] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('pastPapersFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  // Fetch papers
  useEffect(() => {
    fetchPapers();
    fetchRecentPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await pastPapersAPI.getAll();
      setPapers(response.data || []);
    } catch (error) {
      console.error('Error fetching past papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPapers = async () => {
    try {
      const response = await pastPapersAPI.getRecent(5);
      setRecentPapers(response.data || []);
    } catch (error) {
      console.error('Error fetching recent papers:', error);
    }
  };

  // Get unique subjects and years for filters
  const uniqueSubjects = useMemo(() => {
    const subjects = [...new Set(papers.map(p => p.subject))].sort();
    return subjects;
  }, [papers]);

  const uniqueYears = useMemo(() => {
    const years = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);
    return years;
  }, [papers]);

  // Filter papers
  const filteredPapers = useMemo(() => {
    return papers.filter(paper => {
      const matchesSearch = searchTerm === '' || 
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (paper.description && paper.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSubject = filterSubject === '' || paper.subject === filterSubject;
      const matchesYear = filterYear === '' || paper.year.toString() === filterYear;
      
      return matchesSearch && matchesSubject && matchesYear;
    });
  }, [papers, searchTerm, filterSubject, filterYear]);

  const handleFavorite = (paperId, isFavorite) => {
    let newFavorites;
    if (isFavorite) {
      newFavorites = [...favorites, paperId];
    } else {
      newFavorites = favorites.filter(id => id !== paperId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('pastPapersFavorites', JSON.stringify(newFavorites));
  };

  const handleDelete = async (paperId) => {
    try {
      await pastPapersAPI.delete(paperId);
      setPapers(papers.filter(p => p._id !== paperId));
      setRecentPapers(recentPapers.filter(p => p._id !== paperId));
    } catch (error) {
      console.error('Error deleting paper:', error);
      alert('Failed to delete paper. Please try again.');
    }
  };

  const handleEdit = (paper) => {
    setEditingPaper(paper);
    setShowUploadForm(true);
  };

  const handleUploadSuccess = () => {
    fetchPapers();
    fetchRecentPapers();
    setEditingPaper(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSubject('');
    setFilterYear('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Past Papers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Access previous exam papers for practice and preparation
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingPaper(null);
              setShowUploadForm(true);
            }}
            className="
              bg-primary-600 hover:bg-primary-700 
              text-white font-semibold py-2 px-6 rounded-lg
              transition-colors duration-200
              flex items-center gap-2
            "
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Paper
          </button>
        )}
      </div>

      {/* Recently Added Section */}
      {recentPapers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recently Added
            </h3>
            <button
              onClick={() => {
                setFilterSubject('');
                setFilterYear('');
                setSearchTerm('');
              }}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentPapers.map((paper) => (
              <PastPaperCard
                key={paper._id}
                paper={paper}
                onView={setViewingPaper}
                onFavorite={handleFavorite}
                isFavorite={favorites.includes(paper._id)}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Papers
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, subject, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full px-4 py-2 pl-10 
                  border border-gray-300 dark:border-gray-700 
                  rounded-lg 
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  bg-white dark:bg-[#0d0d0d] 
                  text-gray-900 dark:text-gray-100
                "
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="
                w-full px-4 py-2 
                border border-gray-300 dark:border-gray-700 
                rounded-lg 
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                bg-white dark:bg-[#0d0d0d] 
                text-gray-900 dark:text-gray-100
              "
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="
                w-full px-4 py-2 
                border border-gray-300 dark:border-gray-700 
                rounded-lg 
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                bg-white dark:bg-[#0d0d0d] 
                text-gray-900 dark:text-gray-100
              "
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filterSubject || filterYear) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredPapers.length} of {papers.length} papers
        </div>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-400">Loading papers...</div>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            {papers.length === 0 
              ? 'No past papers available yet.' 
              : 'No papers match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPapers.map((paper) => (
            <PastPaperCard
              key={paper._id}
              paper={paper}
              onView={setViewingPaper}
              onFavorite={handleFavorite}
              isFavorite={favorites.includes(paper._id)}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {viewingPaper && (
        <PastPaperViewer
          paper={viewingPaper}
          onClose={() => setViewingPaper(null)}
        />
      )}

      {showUploadForm && (
        <PastPaperUploadForm
          editingPaper={editingPaper}
          onClose={() => {
            setShowUploadForm(false);
            setEditingPaper(null);
          }}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default PastPapersSection;

