import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
};

// Syllabus API
export const syllabusAPI = {
  getAll: (params) => api.get('/api/syllabus', { params }),
  getById: (id) => api.get(`/api/syllabus/${id}`),
  create: (data) => api.post('/api/syllabus', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, data) => api.put(`/api/syllabus/${id}`, data),
  delete: (id) => api.delete(`/api/syllabus/${id}`),
};

// Notes API
export const notesAPI = {
  getAll: (params) => api.get('/api/notes', { params }),
  getById: (id) => api.get(`/api/notes/${id}`),
  create: (data) => api.post('/api/notes', data),
  update: (id, data) => api.put(`/api/notes/${id}`, data),
  delete: (id) => api.delete(`/api/notes/${id}`),
};

// Announcements API
export const announcementsAPI = {
  getAll: () => api.get('/api/announcements'),
  getById: (id) => api.get(`/api/announcements/${id}`),
  create: (data) => api.post('/api/announcements', data),
  update: (id, data) => api.put(`/api/announcements/${id}`, data),
  delete: (id) => api.delete(`/api/announcements/${id}`),
};

// Calendar API
export const calendarAPI = {
  getAll: (params) => api.get('/api/calendar', { params }),
  getById: (id) => api.get(`/api/calendar/${id}`),
  create: (data) => api.post('/api/calendar', data),
  update: (id, data) => api.put(`/api/calendar/${id}`, data),
  delete: (id) => api.delete(`/api/calendar/${id}`),
};

// Faculty API
export const facultyAPI = {
  getAll: (params) => api.get('/api/faculty', { params }),
  getById: (id) => api.get(`/api/faculty/${id}`),
  create: (data) => api.post('/api/faculty', data),
  update: (id, data) => api.put(`/api/faculty/${id}`, data),
  delete: (id) => api.delete(`/api/faculty/${id}`),
};

export default api;
