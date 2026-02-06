import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Forms API
export const formsAPI = {
  create: (data) => api.post('/forms', data),
  getAll: () => api.get('/forms'),
  getById: (id) => api.get(`/forms/${id}`),
  getPublic: (id) => api.get(`/forms/public/${id}`),
  update: (id, data) => api.put(`/forms/${id}`, data),
  delete: (id) => api.delete(`/forms/${id}`),
  toggle: (id) => api.patch(`/forms/${id}/toggle`),
};

// Customers API
export const customersAPI = {
  submit: (data) => api.post('/customers/submit', data),
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Leads API
export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  getStats: () => api.get('/leads/stats'),
  getDueFollowUps: () => api.get('/leads/due-follow-up'),
  updateClassification: (id, data) => api.patch(`/leads/${id}/classification`, data),
  updateFollowUp: (id, data) => api.patch(`/leads/${id}/follow-up`, data),
  addNote: (id, data) => api.post(`/leads/${id}/notes`, data),
  convert: (id, data) => api.patch(`/leads/${id}/convert`, data),
};

export default api;