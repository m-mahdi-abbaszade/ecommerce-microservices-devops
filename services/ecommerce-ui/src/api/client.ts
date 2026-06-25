import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
};

export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getByProduct: (productId: number) => api.get(`/inventory/${productId}`),
};

export const orderApi = {
  create: (data: any) => api.post('/orders', data),
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: number) => api.get(`/orders/${id}`),
  cancel: (id: number) => api.delete(`/orders/${id}`),
};

export const profileApi = {
  register: (data: any) => api.post('/profiles/register', data),
  login: (data: any) => api.post('/profiles/login', data),
  getById: (id: number) => api.get(`/profiles/${id}`),
  getAddresses: (id: number) => api.get(`/profiles/${id}/addresses`),
};

export const shippingApi = {
  getMethods: () => api.get('/shipping/methods'),
  track: (trackingNumber: string) => api.get(`/shipping/tracking/${trackingNumber}`),
};

export const supportApi = {
  createTicket: (data: any) => api.post('/support/tickets', data),
  getTickets: (params?: any) => api.get('/support/tickets', { params }),
  getTicketById: (id: number) => api.get(`/support/tickets/${id}`),
  addMessage: (ticketId: number, data: any) => api.post(`/support/tickets/${ticketId}/messages`, data),
};

export default api;
