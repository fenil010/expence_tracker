/**
 * API Service
 * Handles all HTTP requests to the backend API.
 * Includes automatic token refresh for expired access tokens.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = null;
    this.refreshToken = null;
    this._refreshPromise = null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  setRefreshToken(token) {
    this.refreshToken = token;
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  getRefreshToken() {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Attempt to refresh the access token using the refresh token
   */
  async refreshAccessToken() {
    // Prevent multiple refresh calls at once
    if (this._refreshPromise) {
      return this._refreshPromise;
    }

    this._refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Token refresh failed');
        }

        this.setToken(data.data.token);
        this.setRefreshToken(data.data.refreshToken);
        return data.data.token;
      } catch (error) {
        // Clear all tokens on refresh failure
        this.setToken(null);
        this.setRefreshToken(null);
        throw error;
      } finally {
        this._refreshPromise = null;
      }
    })();

    return this._refreshPromise;
  }

  async request(method, endpoint, data = null, params = null) {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
    }

    const options = { method, headers: this.getHeaders() };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
      options.body = JSON.stringify(data);
    }

    try {
      let response = await fetch(url.toString(), options);

      // Auto-refresh on 401
      if (response.status === 401 && this.getRefreshToken()) {
        try {
          await this.refreshAccessToken();
          options.headers = this.getHeaders();
          response = await fetch(url.toString(), options);
        } catch {
          // Refresh failed — user needs to re-login
        }
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'An error occurred');
      }

      return responseData;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  get(endpoint, params) {
    return this.request('GET', endpoint, null, params);
  }

  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  delete(endpoint, data) {
    return this.request('DELETE', endpoint, data);
  }
}

export const api = new ApiService();

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  deleteAccount: () => api.delete('/users/account'),
};

export const transactionApi = {
  getAll: (params) => api.get('/transactions', params),
  getSummary: (params) => api.get('/transactions/summary', params),
  getStats: (params) => api.get('/transactions/stats', params),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  bulkCreate: (transactions) => api.post('/transactions/bulk', { transactions }),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  deleteMultiple: (ids) => api.delete('/transactions', { ids }),
};

export const categoryApi = {
  getAll: (type) => api.get('/categories', type ? { type } : {}),
  getDefaults: () => api.get('/categories/defaults'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  merge: (sourceId, targetId) => api.post('/categories/merge', { sourceId, targetId }),
};

export const budgetApi = {
  getAll: () => api.get('/budgets'),
  getCurrent: () => api.get('/budgets/current'),
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
};

export const goalApi = {
  getAll: (params) => api.get('/goals', params),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  contribute: (id, data) => api.post(`/goals/${id}/contribute`, data),
  withdraw: (id, data) => api.post(`/goals/${id}/withdraw`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  getContributions: (id, params) => api.get(`/goals/${id}/contributions`, params),
  deleteContribution: (goalId, contributionId) => api.delete(`/goals/${goalId}/contributions/${contributionId}`),
};

export const reportApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getMonthly: (params) => api.get('/reports/monthly', params),
  getYearly: (params) => api.get('/reports/yearly', params),
  getTrends: (params) => api.get('/reports/trends', params),
  exportCsv: (params) => api.get('/reports/export/csv', params),
};

export const accountApi = {
  getAll: () => api.get('/accounts'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
};

export default api;
