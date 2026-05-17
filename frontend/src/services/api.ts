import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Products API
export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
};

// Cart API
export const cartApi = {
  get: () => api.get('/cart'),
  add: (data: any) => api.post('/cart/add', data),
  updateQuantity: (itemId: string, quantity: number) => api.patch(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  applyCoupon: (code: string) => api.post('/cart/coupon', { couponCode: code }),
  clear: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
};

// Auctions API
export const auctionsApi = {
  getActive: () => api.get('/auctions/active'),
  getById: (id: string) => api.get(`/auctions/${id}`),
  placeBid: (id: string, amount: number) => api.post(`/auctions/${id}/bid`, { bidAmount: amount }),
};

// Wallet API
export const walletApi = {
  get: () => api.get('/wallet'),
  getTransactions: () => api.get('/wallet/transactions'),
  deposit: (amount: number) => api.post('/wallet/deposit', { amount }),
};

// Flash Sales API
export const flashSalesApi = {
  getActive: () => api.get('/flash-sales/active'),
};

// Coupons API
export const couponsApi = {
  validate: (code: string, subtotal: number) => api.post('/coupons/validate', { code, subtotal }),
};
