import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import PastPaperUploadForm from '../components/PastPaperUploadForm';
import PastPaperCard from '../components/PastPaperCard';
import PastPaperViewer from '../components/PastPaperViewer';
import TeacherMCQsManagement from '../components/TeacherMCQsManagement';
import Messages from '../components/Messages';
import { pastPapersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [papers, setPapers] = useState([]);
  const [myPapers, setMyPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [viewingPaper, setViewingPaper] = useState(null);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'mcqs', name: 'MCQs Management', icon: '❓' },
    { id: 'upload', name: 'Upload Papers', icon: '📤' },
    { id: 'myPapers', name: 'My Uploads', icon: '📁' },
    { id: 'messages', name: 'Messages', icon: '💬' },
  ];

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchAllPapers = useCallback(async () => {
    try {
      const response = await pastPapersAPI.getAll({ limit: 10, sort: '-createdAt' });
      setPapers(response.data || []);
    } catch (error) {
      console.error('Error fetching papers:', error);
    }
  }, []);

  const fetchMyPapers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pastPapersAPI.getAll({});
      // Filter papers uploaded by current user
      const filtered = (response.data || []).filter(
        paper => paper.uploadedBy?._id === user?._id || paper.uploadedBy === user?._id
      );
      setMyPapers(filtered);
    } catch (error) {
      console.error('Error fetching my papers:', error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchMyPapers();
    if (activeTab === 'overview') {
      fetchAllPapers();
    }
  }, [activeTab, fetchMyPapers, fetchAllPapers]);

  const handleUploadSuccess = () => {
    fetchMyPapers();
    fetchAllPapers();
    setShowUploadForm(false);
    // Show success toast (you can add a toast library later)
    alert('Past paper uploaded successfully!');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#000000] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.name}! Manage your past papers and resources.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {myPapers.length}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-2">
                      My Uploaded Papers
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {papers.length}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-2">
                      Total Papers Available
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {user?.name?.split(' ')[0] || 'Teacher'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-2">
                      Your Profile
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Papers from All Teachers */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Recent Papers
                </h2>
                {papers.length === 0 ? (
                  <Card>
                    <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                      No papers available yet.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {papers.slice(0, 6).map((paper) => (
                      <PastPaperCard
                        key={paper._id}
                        paper={paper}
                        onView={setViewingPaper}
                        isAdmin={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MCQs Tab */}
          {activeTab === 'mcqs' && (
            <TeacherMCQsManagement />
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <Card>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Upload Past Paper
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Share past exam papers with students. All uploads will be reviewed before publication.
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="
                    bg-primary-600 hover:bg-primary-700 
                    text-white font-semibold py-3 px-6 rounded-lg
                    transition-colors duration-200
                    flex items-center gap-2
                  "
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload New Paper
                </button>
              </Card>
            </div>
          )}

          {/* My Papers Tab */}
          {activeTab === 'myPapers' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  My Uploaded Papers ({myPapers.length})
                </h2>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="
                    bg-primary-600 hover:bg-primary-700 
                    text-white font-semibold py-2 px-4 rounded-lg
                    transition-colors duration-200
                    flex items-center gap-2 text-sm
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload New
                </button>
              </div>

              {loading ? (
                <Card>
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading papers...</p>
                  </div>
                </Card>
              ) : myPapers.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      You haven't uploaded any papers yet.
                    </p>
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="
                        bg-primary-600 hover:bg-primary-700 
                        text-white font-semibold py-2 px-6 rounded-lg
                        transition-colors duration-200
                      "
                    >
                      Upload Your First Paper
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myPapers.map((paper) => (
                    <PastPaperCard
                      key={paper._id}
                      paper={paper}
                      onView={setViewingPaper}
                      isAdmin={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <Messages userRole="faculty" />
          )}
        </div>

        {/* Modals */}
        {showUploadForm && (
          <PastPaperUploadForm
            onClose={() => setShowUploadForm(false)}
            onSuccess={handleUploadSuccess}
          />
        )}

        {viewingPaper && (
          <PastPaperViewer
            paper={viewingPaper}
            onClose={() => setViewingPaper(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

