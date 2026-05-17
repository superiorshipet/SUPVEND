import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
};

// Products API
export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  uploadImages: (id: string, formData: FormData) =>
    api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Cart API
export const cartApi = {
  get: () => api.get('/cart'),
  add: (data: { productId: string; quantity: number; variantId?: string }) =>
    api.post('/cart/add', data),
  updateQuantity: (itemId: string, quantity: number) =>
    api.patch(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  applyCoupon: (code: string) => api.post('/cart/coupon', { couponCode: code }),
  removeCoupon: () => api.delete('/cart/coupon'),
  clear: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: (params?: any) => api.get('/orders/my-orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.post(`/orders/${id}/cancel`),
  updateStatus: (orderId: string, productId: string, status: string, note?: string) =>
    api.patch(`/orders/vendor/orders/${orderId}/status`, { productId, status, note }),
};

// Flash Sales API
export const flashSalesApi = {
  getActive: () => api.get('/flash-sales/active'),
  getById: (id: string) => api.get(`/flash-sales/${id}`),
  purchase: (id: string, quantity: number) =>
    api.post(`/flash-sales/${id}/purchase`, { quantity }),
  create: (data: any) => api.post('/flash-sales', data),
};

// Auctions API
export const auctionsApi = {
  getActive: () => api.get('/auctions/active'),
  getById: (id: string) => api.get(`/auctions/${id}`),
  placeBid: (id: string, amount: number) =>
    api.post(`/auctions/${id}/bid`, { bidAmount: amount }),
};

// Wallet API
export const walletApi = {
  get: () => api.get('/wallet'),
  getTransactions: (params?: any) => api.get('/wallet/transactions', { params }),
  deposit: (amount: number) => api.post('/wallet/deposit', { amount }),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Vendor API
export const vendorApi = {
  getOverview: () => api.get('/vendor/dashboard/overview'),
  getProducts: () => api.get('/vendor/dashboard/products'),
  getOrders: (params?: any) => api.get('/vendor/dashboard/orders', { params }),
  requestPayout: (data: any) => api.post('/vendor/dashboard/payouts/request', data),
  getPayouts: () => api.get('/vendor/dashboard/payouts'),
};

// Admin API
export const adminApi = {
  getOverview: () => api.get('/admin/dashboard/overview'),
  getUsers: (params?: any) => api.get('/admin/dashboard/users', { params }),
  banUser: (id: string) => api.patch(`/admin/dashboard/users/${id}/ban`),
  getVendors: (params?: any) => api.get('/admin/dashboard/vendors', { params }),
  approveVendor: (id: string, status: string, rejectionReason?: string) =>
    api.patch(`/admin/dashboard/vendors/${id}/approval`, { status, rejectionReason }),
  getProducts: (params?: any) => api.get('/admin/dashboard/products', { params }),
  deleteProduct: (id: string) => api.delete(`/admin/dashboard/products/${id}`),
  getPendingPayouts: () => api.get('/admin/dashboard/payouts/pending'),
  approvePayout: (id: string) => api.post(`/admin/dashboard/payouts/${id}/approve`),
  getSalesReport: (params: any) => api.get('/admin/dashboard/reports/sales', { params }),
};

// Coupons API
export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    api.post('/coupons/validate', { code, subtotal }),
  getAll: () => api.get('/coupons'),
  getById: (id: string) => api.get(`/coupons/${id}`),
  create: (data: any) => api.post('/coupons', data),
  update: (id: string, data: any) => api.patch(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};
