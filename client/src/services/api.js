import axios from 'axios';
import { useAuthStore } from '../store';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401, refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = data.data;
          useAuthStore.getState().setTokens(accessToken, newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============= Auth API =============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  logFocusSession: (duration) => api.post('/auth/focus-session', { duration }),
};

// ============= Task API =============
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  toggleComplete: (id) => api.patch(`/tasks/${id}/complete`),
  reorder: (tasks) => api.patch('/tasks/reorder', { tasks }),
  getCategories: () => api.get('/tasks/categories'),
};

// ============= Analytics API =============
export const analyticsAPI = {
  getAll: () => api.get('/analytics'),
  getProductivityScore: () => api.get('/analytics/productivity-score'),
  getStreaks: () => api.get('/analytics/streaks'),
};

// ============= Habit API =============
export const habitAPI = {
  getAll: () => api.get('/habits'),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  complete: (id, note) => api.post(`/habits/${id}/complete`, { note }),
};

// ============= AI API =============
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  generateSubtasks: (title, description) => api.post('/ai/subtasks', { title, description }),
  suggestPriority: (title, dueDate) => api.post('/ai/suggest-priority', { title, dueDate }),
  getDailyPlan: () => api.get('/ai/daily-plan'),
  getInsights: (analytics) => api.post('/ai/insights', { analytics }),
  getQuote: () => api.get('/ai/quote'),
  getTip: () => api.get('/ai/tip'),
};

// ============= Mood API =============
export const moodAPI = {
  getAll: (params) => api.get('/mood', { params }),
  log: (data) => api.post('/mood', data),
  getTrend: () => api.get('/mood/trend'),
};

export default api;
