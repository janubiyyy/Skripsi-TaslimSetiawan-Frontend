// src/api/axios.js — Axios instance terkonfigurasi

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Tambah token JWT ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 (token expired) ────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── API Service Methods ───────────────────────────────────────────────────

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Datasets
export const datasetAPI = {
  getAll: (params) => api.get('/datasets', { params }),
  getById: (id) => api.get(`/datasets/${id}`),
  getGerbangList: () => api.get('/datasets/meta/gerbang'),
  getTahunList: () => api.get('/datasets/meta/tahun'),
  update: (id, data) => api.put(`/datasets/${id}`, data),
  deleteById: (id) => api.delete(`/datasets/${id}`),
  resetAll: () => api.delete('/datasets/reset'),
};

// Preprocessing
export const preprocessingAPI = {
  importFile: (formData) =>
    api.post('/preprocessing/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  runScaling: () => api.post('/preprocessing/scale'),
  getResults: (params) => api.get('/preprocessing/results', { params }),
  getLogs: () => api.get('/preprocessing/logs'),
  getStats: () => api.get('/preprocessing/stats'),
};

// K-Means
export const kmeansAPI = {
  run: (k = 3) => api.post('/kmeans/run', { k }),
  getResults: (k = 3, params = {}) => api.get('/kmeans/results', { params: { k, ...params } }),
  getElbow: (kMin = 2, kMax = 8) =>
    api.get('/kmeans/elbow', { params: { k_min: kMin, k_max: kMax } }),
  getAvailableK: () => api.get('/kmeans/available-k'),
};

// Time Series
export const timeseriesAPI = {
  generate: () => api.post('/timeseries/generate'),
  getSummary: (params) => api.get('/timeseries/summary', { params }),
  getYoY: (params) => api.get('/timeseries/yoy', { params }),
  calculateMAPE: (data) => api.post('/timeseries/mape', data),
};
