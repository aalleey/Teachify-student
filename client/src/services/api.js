import axios from 'axios';

// Determine API base URL
// When app is served from Express (production build or ngrok), use relative URLs
// When using React dev server (npm start), use localhost
let baseURL;

if (process.env.REACT_APP_API_URL) {
  // Use explicit API URL if set in environment variable
  baseURL = `${process.env.REACT_APP_API_URL}/api`;
} else if (process.env.NODE_ENV === 'production') {
  // Production: Use relative URL since app is served from same server
  baseURL = '/api';
} else {
  // Development: React dev server runs on 3000, API on 5000
  baseURL = 'http://localhost:5000/api';
}

console.log('API Base URL:', baseURL);
console.log('Environment:', process.env.NODE_ENV);
console.log('Window Origin:', window.location.origin);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't override Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Syllabus API
export const syllabusAPI = {
  getAll: (params) => api.get('/syllabus', { params }),
  getById: (id) => api.get(`/syllabus/${id}`),
  create: (data) => api.post('/syllabus', data),
  update: (id, data) => api.put(`/syllabus/${id}`, data),
  delete: (id) => api.delete(`/syllabus/${id}`),
};

// Notes API
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// Announcements API
export const announcementsAPI = {
  getAll: () => api.get('/announcements'),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// Calendar API
export const calendarAPI = {
  getAll: (params) => api.get('/calendar', { params }),
  getById: (id) => api.get(`/calendar/${id}`),
  create: (data) => api.post('/calendar', data),
  update: (id, data) => api.put(`/calendar/${id}`, data),
  delete: (id) => api.delete(`/calendar/${id}`),
};

// Faculty API
export const facultyAPI = {
  getAll: (params) => api.get('/faculty', { params }),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
  // Custom: update only status (requires backend PATCH endpoint)
  updateStatus: (id, status) => api.patch(`/faculty/${id}/status`, { status }),
};

// Past Papers API
export const pastPapersAPI = {
  getAll: (params) => api.get('/pastPapers', { params }),
  getRecent: (limit) => api.get('/pastPapers/recent', { params: { limit } }),
  getById: (id) => api.get(`/pastPapers/${id}`),
  create: (data) => api.post('/pastPapers', data),
  update: (id, data) => api.put(`/pastPapers/${id}`, data),
  delete: (id) => api.delete(`/pastPapers/${id}`),
};

// MCQs API
export const mcqsAPI = {
  getAll: (params) => {
    console.log('MCQs getAll called with params:', params);
    return api.get('/mcqs', { params });
  },
  getPractice: (params) => {
    console.log('MCQs getPractice called with params:', params);
    return api.get('/mcqs/practice', { params });
  },
  getById: (id) => api.get(`/mcqs/${id}`),
  create: (data) => {
    console.log('MCQs create called with data:', data);
    console.log('Full URL will be:', api.defaults.baseURL + '/mcqs');
    return api.post('/mcqs', data).catch(error => {
      console.error('MCQ create error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url
      });
      throw error;
    });
  },
  bulkCreate: (mcqs) => api.post('/mcqs/bulk', { mcqs }),
  update: (id, data) => api.put(`/mcqs/${id}`, data),
  delete: (id) => api.delete(`/mcqs/${id}`),
  getMyStats: () => api.get('/mcqs/stats/my'),
};

// Quiz Results API
export const quizResultsAPI = {
  submit: (data) => api.post('/quizResults/submit', data),
  getMyResults: (params) => api.get('/quizResults/my-results', { params }),
  getLeaderboard: (params) => api.get('/quizResults/leaderboard', { params }),
  getMyRank: (params) => api.get('/quizResults/my-rank', { params }),
  getAnalytics: () => api.get('/quizResults/analytics'),
  getById: (id) => api.get(`/quizResults/${id}`),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  approve: (id) => api.patch(`/users/${id}/approve`),
  block: (id) => api.patch(`/users/${id}/block`),
  unblock: (id) => api.patch(`/users/${id}/unblock`),
  reject: (id) => api.patch(`/users/${id}/reject`),
  delete: (id) => api.delete(`/users/${id}`),
  // Profile image management (any authenticated user)
  uploadProfileImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/users/profile-image', formData);
  },
  deleteProfileImage: () => api.delete('/users/profile-image'),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (otherUserId) => api.get(`/messages/conversation/${otherUserId}`),
  getTeachers: () => api.get('/messages/teachers'),
  sendMessage: (data) => api.post('/messages', data),
  getSummary: () => api.get('/messages/summary'),
};

export default api;
