import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import AnnouncementForm from '../components/AnnouncementForm';
import FacultyForm from '../components/FacultyForm';
import SyllabusUploadForm from '../components/SyllabusUploadForm';
import PastPapersSection from '../components/PastPapersSection';
import TeacherMCQsManagement from '../components/TeacherMCQsManagement';
import UserManagement from '../components/UserManagement';
import MessageSummary from '../components/MessageSummary';
import api, { 
  syllabusAPI, 
  notesAPI, 
  announcementsAPI, 
  calendarAPI, 
  facultyAPI 
} from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    syllabus: 0,
    notes: 0,
    announcements: 0,
    events: 0,
    faculty: 0
  });
  const [announcements, setAnnouncements] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [syllabus, setSyllabus] = useState([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [showSyllabusForm, setShowSyllabusForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchAnnouncements();
    fetchFaculty();
    fetchSyllabus();
  }, []);

  const fetchStats = async () => {
    try {
      const [syllabusRes, notesRes, announcementsRes, calendarRes, facultyRes] = await Promise.all([
        syllabusAPI.getAll(),
        notesAPI.getAll(),
        announcementsAPI.getAll(),
        calendarAPI.getAll(),
        facultyAPI.getAll()
      ]);

      setStats({
        syllabus: syllabusRes.data.length,
        notes: notesRes.data.length,
        announcements: announcementsRes.data.length,
        events: calendarRes.data.length,
        faculty: facultyRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementsAPI.getAll();
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await facultyAPI.getAll();
      setFaculty(response.data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchSyllabus = async () => {
    try {
      const response = await syllabusAPI.getAll();
      setSyllabus(response.data);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
    }
  };

  const resolveUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = api.defaults.baseURL || '';
    const serverOrigin = base.endsWith('/api') ? base.replace(/\/api$/, '') : base;
    return `${serverOrigin}${url}`;
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementForm(true);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementsAPI.delete(id);
        fetchAnnouncements();
        fetchStats();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const handleEditFaculty = (facultyMember) => {
    setEditingFaculty(facultyMember);
    setShowFacultyForm(true);
  };

  const handleDeleteFaculty = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await facultyAPI.delete(id);
        fetchFaculty();
        fetchStats();
      } catch (error) {
        console.error('Error deleting faculty:', error);
      }
    }
  };

  const handleDeleteSyllabus = async (id) => {
    if (window.confirm('Are you sure you want to delete this syllabus?')) {
      try {
        await syllabusAPI.delete(id);
        fetchSyllabus();
        fetchStats();
      } catch (error) {
        console.error('Error deleting syllabus:', error);
      }
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'mcqs', name: 'MCQs', icon: '❓' },
    { id: 'syllabus', name: 'Syllabus', icon: '📚' },
    { id: 'announcements', name: 'Announcements', icon: '📢' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'faculty', name: 'Faculty', icon: '👨‍🏫' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'messages', name: 'Messages', icon: '💬' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your academic platform</p>
      </div>

      {/* Stats Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.syllabus}</div>
                <div className="text-gray-600 dark:text-gray-400">Syllabus</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.notes}</div>
                <div className="text-gray-600 dark:text-gray-400">Notes</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.announcements}</div>
                <div className="text-gray-600 dark:text-gray-400">Announcements</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.events}</div>
                <div className="text-gray-600 dark:text-gray-400">Events</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.faculty}</div>
                <div className="text-gray-600 dark:text-gray-400">Faculty</div>
              </div>
            </Card>
          </div>
          
          {/* Past Papers Section */}
          <div className="mt-8">
            <PastPapersSection isAdmin={true} />
          </div>
        </>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left">
                  📚 Add New Syllabus
                </button>
                <button className="w-full btn-secondary text-left">
                  📢 Create Announcement
                </button>
                <button className="w-full btn-secondary text-left">
                  📅 Add Calendar Event
                </button>
                <button className="w-full btn-secondary text-left">
                  👥 Add Faculty Member
                </button>
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">System Status</div>
                  <div className="text-green-600">All systems operational</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Last Backup</div>
                  <div>2 hours ago</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Active Users</div>
                  <div>24 users online</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'syllabus' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Syllabus Management</h3>
              <button 
                onClick={() => setShowSyllabusForm(true)}
                className="btn-primary"
              >
                Upload New Syllabus
              </button>
            </div>
            <div className="space-y-4">
              {syllabus.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No syllabus uploaded yet
                </div>
              ) : (
                syllabus.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.subject}</h4>
                        <p className="text-sm text-gray-600">
                          {item.department} - {item.semester}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-xs text-gray-400">
                            File: {item.originalFileName}
                          </span>
                          {item.fileSize && (
                            <span className="text-xs text-gray-400">
                              Size: {Math.round(item.fileSize / 1024)} KB
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={resolveUrl(item.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
                        >
                          View
                        </a>
                        <button 
                          onClick={() => handleDeleteSyllabus(item._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {activeTab === 'announcements' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Announcements</h3>
              <button 
                onClick={() => setShowAnnouncementForm(true)}
                className="btn-primary"
              >
                Create Announcement
              </button>
            </div>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{announcement.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                          announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {announcement.priority}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(announcement.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="btn-secondary text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'calendar' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Calendar Events</h3>
              <button className="btn-primary">Add Event</button>
            </div>
            <div className="text-center py-8 text-gray-500">
              Calendar management interface will be implemented here
            </div>
          </Card>
        )}

        {activeTab === 'mcqs' && (
          <TeacherMCQsManagement />
        )}

        {activeTab === 'users' && (
          <UserManagement />
        )}

        {activeTab === 'analytics' && (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Quiz Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Analytics dashboard coming soon...
            </p>
          </Card>
        )}

        {activeTab === 'messages' && (
          <MessageSummary />
        )}

        {activeTab === 'faculty' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Faculty Management</h3>
              <button 
                onClick={() => setShowFacultyForm(true)}
                className="btn-primary"
              >
                Add Faculty
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {faculty.map((member) => (
                <div key={member._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.subject}</p>
                  <p className="text-sm text-gray-500">{member.department}</p>
                  <p className="text-sm text-primary-600">{member.email}</p>
                  {member.office && (
                    <p className="text-xs text-gray-400 mt-1">Office: {member.office}</p>
                  )}
                  <div className="flex space-x-2 mt-3">
                    <button 
                      onClick={() => handleEditFaculty(member)}
                      className="btn-secondary text-xs"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteFaculty(member._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Forms */}
      {showAnnouncementForm && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onClose={() => {
            setShowAnnouncementForm(false);
            setEditingAnnouncement(null);
          }}
          onSuccess={() => {
            fetchAnnouncements();
            fetchStats();
          }}
        />
      )}

      {showFacultyForm && (
        <FacultyForm
          faculty={editingFaculty}
          onClose={() => {
            setShowFacultyForm(false);
            setEditingFaculty(null);
          }}
          onSuccess={() => {
            fetchFaculty();
            fetchStats();
          }}
        />
      )}

      {showSyllabusForm && (
        <SyllabusUploadForm
          onClose={() => setShowSyllabusForm(false)}
          onSuccess={() => {
            fetchSyllabus();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
