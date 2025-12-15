import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// HEC API calls
export const hecApi = {
  getEmployees: () => api.get('/hec/employees'),
  getEmployee: (id) => api.get(`/hec/employees/${id}`),
  createEmployee: (data) => api.post('/hec/employees', data),
  updateEmployee: (id, data) => api.put(`/hec/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/hec/employees/${id}`),
  getStatistics: () => api.get('/hec/statistics'),
};

// University API calls
export const universityApi = {
  getAll: (params) => api.get('/universities', { params }),
  getOne: (id) => api.get(`/universities/${id}`),
  create: (data) => api.post('/universities', data),
  update: (id, data) => api.put(`/universities/${id}`, data),
  suspend: (id, reason) => api.post(`/universities/${id}/suspend`, { reason }),
  reactivate: (id) => api.post(`/universities/${id}/reactivate`),
  getDepartments: (id) => api.get(`/universities/${id}/departments`),
  addDepartment: (id, data) => api.post(`/universities/${id}/departments`, data),
};

// User API calls
export const userApi = {
  getByUniversity: (universityId) => api.get(`/users/university/${universityId}`),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getByRole: (universityId, role) => api.get(`/users/university/${universityId}/role/${role}`),
};

// Degree API calls
export const degreeApi = {
  getAll: (params) => api.get('/degrees', { params }),
  getOne: (id) => api.get(`/degrees/${id}`),
  create: (data) => api.post('/degrees', data),
  verify: (id, data) => api.post(`/degrees/${id}/verify`, data),
  attest: (id, data) => api.post(`/degrees/${id}/attest`, data),
  reject: (id, data) => api.post(`/degrees/${id}/reject`, data),
  getHistory: (id) => api.get(`/degrees/${id}/history`),
  getByStudent: (cnic) => api.get(`/degrees/student/${cnic}`),
  publicVerify: (data) => api.post('/degrees/public/verify', data),
};
