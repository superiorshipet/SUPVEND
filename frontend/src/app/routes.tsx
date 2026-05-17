import { createBrowserRouter } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import FlashSalesPage from './pages/FlashSalesPage';
import AuctionsPage from './pages/AuctionsPage';
import AuctionDetailsPage from './pages/AuctionDetailsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Customer Dashboard
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import ProfilePage from './pages/dashboard/ProfilePage';
import OrdersPage from './pages/dashboard/OrdersPage';
import OrderDetailsPage from './pages/dashboard/OrderDetailsPage';
import WishlistPage from './pages/dashboard/WishlistPage';
import WalletPage from './pages/dashboard/WalletPage';
import MyAuctionsPage from './pages/dashboard/MyAuctionsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';

// Vendor Dashboard
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import AddProductPage from './pages/vendor/AddProductPage';
import EditProductPage from './pages/vendor/EditProductPage';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';
import VendorFlashSalesPage from './pages/vendor/VendorFlashSalesPage';
import VendorAuctionsPage from './pages/vendor/VendorAuctionsPage';
import PayoutsPage from './pages/vendor/PayoutsPage';
import CouponsPage from './pages/vendor/CouponsPage';
import VendorProfilePage from './pages/vendor/VendorProfilePage';

// Admin Dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import VendorsManagementPage from './pages/admin/VendorsManagementPage';
import ProductsModerationPage from './pages/admin/ProductsModerationPage';
import CategoriesManagementPage from './pages/admin/CategoriesManagementPage';
import AllOrdersPage from './pages/admin/AllOrdersPage';
import PayoutsManagementPage from './pages/admin/PayoutsManagementPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import ReportsPage from './pages/admin/ReportsPage';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'flash-sales', element: <FlashSalesPage /> },
      { path: 'auctions', element: <AuctionsPage /> },
      { path: 'auctions/:id', element: <AuctionDetailsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },
    ],
  },
  
  // Customer Dashboard
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <CustomerDashboard /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailsPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'auctions', element: <MyAuctionsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
    ],
  },
  
  // Vendor Dashboard
  {
    path: '/vendor',
    element: (
      <ProtectedRoute allowedRoles={['vendor', 'admin']}>
        <VendorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <VendorDashboard /> },
      { path: 'dashboard', element: <VendorDashboard /> },
      { path: 'products', element: <VendorProductsPage /> },
      { path: 'products/add', element: <AddProductPage /> },
      { path: 'products/:id/edit', element: <EditProductPage /> },
      { path: 'orders', element: <VendorOrdersPage /> },
      { path: 'flash-sales', element: <VendorFlashSalesPage /> },
      { path: 'auctions', element: <VendorAuctionsPage /> },
      { path: 'payouts', element: <PayoutsPage /> },
      { path: 'coupons', element: <CouponsPage /> },
      { path: 'profile', element: <VendorProfilePage /> },
    ],
  },
  
  // Admin Dashboard
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <UsersManagementPage /> },
      { path: 'vendors', element: <VendorsManagementPage /> },
      { path: 'products', element: <ProductsModerationPage /> },
      { path: 'categories', element: <CategoriesManagementPage /> },
      { path: 'orders', element: <AllOrdersPage /> },
      { path: 'payouts', element: <PayoutsManagementPage /> },
      { path: 'coupons', element: <AdminCouponsPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
]);

export default router;
