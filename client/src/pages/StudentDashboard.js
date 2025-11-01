import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import SyllabusViewer from '../components/SyllabusViewer';
import PastPapersSection from '../components/PastPapersSection';
import { 
  syllabusAPI, 
  notesAPI, 
  announcementsAPI, 
  calendarAPI, 
  facultyAPI 
} from '../services/api';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [syllabus, setSyllabus] = useState([]);
  const [notes, setNotes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [syllabusRes, notesRes, announcementsRes, calendarRes, facultyRes] = await Promise.all([
        syllabusAPI.getAll(),
        notesAPI.getAll(),
        announcementsAPI.getAll(),
        calendarAPI.getAll(),
        facultyAPI.getAll()
      ]);

      setSyllabus(syllabusRes.data);
      setNotes(notesRes.data);
      setAnnouncements(announcementsRes.data);
      setEvents(calendarRes.data);
      setFaculty(facultyRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '🏠' },
    { id: 'syllabus', name: 'Syllabus', icon: '📚' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'announcements', name: 'Announcements', icon: '📢' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'faculty', name: 'Faculty', icon: '👥' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome to your academic hub</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{syllabus.length}</div>
                  <div className="text-gray-600 dark:text-gray-400">Available Syllabus</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{notes.length}</div>
                  <div className="text-gray-600 dark:text-gray-400">Study Notes</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{announcements.length}</div>
                  <div className="text-gray-600 dark:text-gray-400">Announcements</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{events.length}</div>
                  <div className="text-gray-600 dark:text-gray-400">Upcoming Events</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{faculty.length}</div>
                  <div className="text-gray-600 dark:text-gray-400">Faculty Members</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">4.2</div>
                  <div className="text-gray-600 dark:text-gray-400">GPA</div>
                </div>
              </Card>
            </div>
            
            {/* Past Papers Section */}
            <div className="mt-8">
              <PastPapersSection isAdmin={false} />
            </div>
          </>
        )}

        {activeTab === 'syllabus' && (
          <SyllabusViewer />
        )}

        {activeTab === 'notes' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Study Notes</h3>
            {notes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notes available
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.subject}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Uploaded by {item.uploadedBy?.name} on {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'announcements' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Latest Announcements</h3>
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No announcements available
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.priority === 'high' ? 'bg-red-100 text-red-800' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'calendar' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Academic Calendar</h3>
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No events scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.eventName}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.eventType === 'exam' ? 'bg-red-100 text-red-800' :
                        item.eventType === 'holiday' ? 'bg-blue-100 text-blue-800' :
                        item.eventType === 'assignment' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.eventType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'faculty' && (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Faculty Directory</h3>
            {faculty.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No faculty information available
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {faculty.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.subject}</p>
                    <p className="text-sm text-gray-500">{item.department}</p>
                    <p className="text-sm text-primary-600">{item.email}</p>
                    {item.office && (
                      <p className="text-xs text-gray-400 mt-1">Office: {item.office}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
