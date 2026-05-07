import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  getAllUsers: () => api.get('/api/auth/users'),
};

// Project APIs
export const projectAPI = {
  getAll: () => api.get('/api/projects'),
  getOne: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
  addMember: (id, data) => api.post(`/api/projects/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/api/projects/${id}/members/${userId}`),
  getAnalytics: (id) => api.get(`/api/projects/${id}/analytics`),
};

// Task APIs
export const taskAPI = {
  getProjectTasks: (projectId, params) =>
    api.get(`/api/tasks/project/${projectId}`, { params }),
  getMyTasks: () => api.get('/api/tasks/my'),
  getOne: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
  reorder: (data) => api.put('/api/tasks/reorder', data),
  getDashboard: () => api.get('/api/tasks/dashboard'),
};

// Comment APIs
export const commentAPI = {
  getTaskComments: (taskId) => api.get(`/api/comments/task/${taskId}`),
  add: (taskId, data) => api.post(`/api/comments/task/${taskId}`, data),
  delete: (id) => api.delete(`/api/comments/${id}`),
};

// Activity APIs
export const activityAPI = {
  getProjectActivities: (projectId) => api.get(`/api/activities/project/${projectId}`),
  getAll: (params) => api.get('/api/activities', { params }),
};

export default api;
