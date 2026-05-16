import api from './axios';

// ── Auth ──
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  changePassword: (data) => api.patch('/auth/change-password', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (data) => api.post('/auth/resend-verification', data),
};

// ── Categories ──
export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ── Products ──
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getVendorProducts: (params) => api.get('/products/vendor/products', { params }),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, data) => api.post(`/products/${id}/images`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (id, imageId) => api.delete(`/products/${id}/images/${imageId}`),
};

// ── Cart ──
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/add', data),
  updateItem: (itemId, data) => api.patch(`/cart/items/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  applyCoupon: (data) => api.post('/cart/coupon', data),
  removeCoupon: () => api.delete('/cart/coupon'),
  clear: () => api.delete('/cart/clear'),
};

// ── Coupons ──
export const couponAPI = {
  getAll: (params) => api.get('/coupons', { params }),
  getById: (id) => api.get(`/coupons/${id}`),
  validate: (data) => api.post('/coupons/validate', data),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.patch(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

// ── Orders ──
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  getVendorOrders: (params) => api.get('/orders/vendor/orders', { params }),
  updateStatus: (orderId, data) => api.patch(`/orders/vendor/orders/${orderId}/status`, data),
  getAll: (params) => api.get('/orders/admin/all', { params }),
};

// ── Flash Sales ──
export const flashSaleAPI = {
  getActive: (params) => api.get('/flash-sales/active', { params }),
  getById: (id) => api.get(`/flash-sales/${id}`),
  getVendorSales: (params) => api.get('/flash-sales/vendor/my-sales', { params }),
  create: (data) => api.post('/flash-sales', data),
  purchase: (id, data) => api.post(`/flash-sales/${id}/purchase`, data),
  adminGetAll: (params) => api.get('/flash-sales/admin', { params }),
  cancel: (id) => api.delete(`/flash-sales/${id}/cancel`),
};

// ── Auctions ──
export const auctionAPI = {
  getActive: (params) => api.get('/auctions/active', { params }),
  getById: (id) => api.get(`/auctions/${id}`),
  create: (data) => api.post('/auctions', data),
  placeBid: (id, data) => api.post(`/auctions/${id}/bid`, data),
  getVendorAuctions: (params) => api.get('/auctions/vendor/my-auctions', { params }),
  cancel: (id) => api.delete(`/auctions/${id}/cancel`),
};

// ── Wallet ──
export const walletAPI = {
  get: () => api.get('/wallet'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  deposit: (data) => api.post('/wallet/deposit', data),
};

// ── Notifications ──
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ── Vendor Dashboard ──
export const vendorDashboardAPI = {
  getOverview: () => api.get('/vendor/dashboard/overview'),
  getProducts: (params) => api.get('/vendor/dashboard/products', { params }),
  getOrders: (params) => api.get('/vendor/dashboard/orders', { params }),
  requestPayout: (data) => api.post('/vendor/dashboard/payouts/request', data),
  getPayouts: (params) => api.get('/vendor/dashboard/payouts', { params }),
};

// ── Admin Dashboard ──
export const adminDashboardAPI = {
  getOverview: () => api.get('/admin/dashboard/overview'),
  getUsers: (params) => api.get('/admin/dashboard/users', { params }),
  banUser: (id, data) => api.patch(`/admin/dashboard/users/${id}/ban`, data),
  getVendors: (params) => api.get('/admin/dashboard/vendors', { params }),
  approveVendor: (id, data) => api.patch(`/admin/dashboard/vendors/${id}/approval`, data),
  getProducts: (params) => api.get('/admin/dashboard/products', { params }),
  deleteProduct: (id) => api.delete(`/admin/dashboard/products/${id}`),
  getPendingPayouts: (params) => api.get('/admin/dashboard/payouts/pending', { params }),
  approvePayout: (id, data) => api.post(`/admin/dashboard/payouts/${id}/approve`, data),
  getSalesReports: (params) => api.get('/admin/dashboard/reports/sales', { params }),
};
