import React, { useState, useEffect, useCallback } from 'react';
import api, { syllabusAPI } from '../services/api';

const SyllabusViewer = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [filteredSyllabus, setFilteredSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Economics',
    'Business Administration',
    'Engineering'
  ];

  const semesters = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester'
  ];

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      const response = await syllabusAPI.getAll();
      setSyllabus(response.data);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSyllabus = useCallback(() => {
    let filtered = syllabus;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(item => item.department === selectedDepartment);
    }

    if (selectedSemester) {
      filtered = filtered.filter(item => item.semester === selectedSemester);
    }

    setFilteredSyllabus(filtered);
  }, [syllabus, searchTerm, selectedDepartment, selectedSemester]);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  useEffect(() => {
    filterSyllabus();
  }, [filterSyllabus]);

  const handleViewFile = (syllabusItem) => {
    setSelectedFile(syllabusItem);
    setShowPreview(true);
  };

  const resolveUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = api.defaults.baseURL || '';
    const serverOrigin = base.endsWith('/api') ? base.replace(/\/api$/, '') : base;
    return `${serverOrigin}${url}`;
  };

  const handleDownloadFile = async (syllabusItem) => {
    setDownloading(true);
    console.log('Starting download for:', syllabusItem);
    
    try {
      const fileUrl = resolveUrl(syllabusItem.fileUrl);
      const fileName = syllabusItem.originalFileName || `${syllabusItem.subject}.pdf`;
      
      console.log('File URL:', fileUrl);
      console.log('File Name:', fileName);
      
      // Method 1: Try direct download with fetch
      try {
        console.log('Trying fetch method...');
        const response = await fetch(fileUrl);
        console.log('Fetch response:', response.status, response.ok);
        
        if (response.ok) {
          const blob = await response.blob();
          console.log('Blob created:', blob.size, 'bytes');
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          console.log('Download completed via fetch method');
          return;
        }
      } catch (fetchError) {
        console.log('Fetch method failed:', fetchError);
      }

      // Method 2: Direct link download
      console.log('Trying direct link method...');
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Download initiated via direct link method');
      
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      console.log('Opening in new tab as fallback...');
      window.open(resolveUrl(syllabusItem.fileUrl), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('text')) return '📝';
    if (fileType?.includes('word')) return '📝';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Search & Filter Syllabus</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject or description..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input-field"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="input-field"
            >
              <option value="">All Semesters</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Syllabus Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSyllabus.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {syllabus.length === 0 ? 'No syllabus available' : 'No syllabus matches your search criteria'}
          </div>
        ) : (
          filteredSyllabus.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getFileIcon(item.fileType)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.subject}</h4>
                    <p className="text-sm text-gray-600">{item.department}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Semester:</span> {item.semester}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  <span className="font-medium">File:</span> {item.originalFileName}
                  {item.fileSize && (
                    <span> ({formatFileSize(item.fileSize)})</span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  Uploaded {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewFile(item)}
                  className="flex-1 btn-secondary text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => handleDownloadFile(item)}
                  disabled={downloading}
                  className="flex-1 btn-primary text-sm disabled:opacity-50"
                >
                  {downloading ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">File Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium">{selectedFile.subject}</h4>
              <p className="text-sm text-gray-600">
                {selectedFile.department} - {selectedFile.semester}
              </p>
              {selectedFile.description && (
                <p className="text-sm text-gray-600 mt-1">{selectedFile.description}</p>
              )}
            </div>

            <div className="border rounded-lg p-4 mb-4">
              {selectedFile.fileType?.includes('image') ? (
                <img
                  src={resolveUrl(selectedFile.fileUrl)}
                  alt={selectedFile.subject}
                  className="max-w-full max-h-96 mx-auto"
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">{getFileIcon(selectedFile.fileType)}</div>
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedFile.originalFileName}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleDownloadFile(selectedFile)}
                disabled={downloading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {downloading ? 'Downloading...' : 'Download File'}
              </button>
              <button
                onClick={() => window.open(resolveUrl(selectedFile.fileUrl), '_blank')}
                className="flex-1 btn-secondary"
              >
                Open in New Tab
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyllabusViewer;
