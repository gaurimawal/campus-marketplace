import axios from 'axios';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let listingsCache = null;
let listingsCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.startsWith('/auth/login') ||
        error.config?.url?.startsWith('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        if (!window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
    }

    const message =
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: async (data) => {
    const { data: res } = await api.post('/auth/register', data);
    return res;
  },

  login: async (data) => {
    const { data: res } = await api.post('/auth/login', data);
    return res;
  },

  getMe: async () => {
    const { data: res } = await api.get('/auth/me');
    return res.user;
  },

  getUsers: async () => {
    const { data: res } = await api.get('/auth/users');
    return res.users;
  },

  updateUserRole: async (userId, role) => {
    const { data: res } = await api.put(`/auth/users/${userId}/role`, { role });
    return res.user;
  },
};

export const adminApi = {
  getStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data.stats;
  },
};

export const listingsApi = {
  getAll: async (useCache = true) => {
    const now = Date.now();
    if (useCache && listingsCache && now - listingsCacheTime < CACHE_TTL_MS) {
      return listingsCache;
    }

    const { data } = await api.get('/listings');
    listingsCache = data.listings;
    listingsCacheTime = now;
    return data.listings;
  },

  getById: async (id) => {
    const { data } = await api.get(`/listings/${id}`);
    return data.listing;
  },

  create: async (listingData) => {
    const { data } = await api.post('/listings', listingData);
    listingsCache = null;
    return data.listing;
  },

  update: async (id, listingData) => {
    const { data } = await api.put(`/listings/${id}`, listingData);
    listingsCache = null;
    return data.listing;
  },

  delete: async (id) => {
    await api.delete(`/listings/${id}`);
    listingsCache = null;
  },

  invalidateCache: () => {
    listingsCache = null;
  },
};

export const buyRequestsApi = {
  create: async (requestData) => {
    const { data } = await api.post('/buy-requests', requestData);
    return data.request;
  },

  getBuyerRequests: async () => {
    const { data } = await api.get('/buy-requests/buyer');
    return data.requests;
  },

  getSellerRequests: async () => {
    const { data } = await api.get('/buy-requests/seller');
    return data.requests;
  },

  remove: async (requestId) => {
    await api.delete(`/buy-requests/${requestId}`);
  },
};

export const uploadApi = {
  uploadImage: async (file) => {
    const base64 = await import('../utils/imageUtils').then((m) =>
      m.fileToBase64(file)
    );

    const { data } = await api.post('/upload', {
      image: base64,
      contentType: file.type,
    });

    return data.imageUrl;
  },
};

export default api;
