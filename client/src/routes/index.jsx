import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import MainLayout from '@/components/layouts/MainLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import CustomerDashboardWrapper from './CustomerDashboardWrapper';
import VendorDashboardWrapper from './VendorDashboardWrapper';
import AdminDashboardWrapper from './AdminDashboardWrapper';

// Lazy wrapper — creates a Suspense-wrapped lazy component
function S(importFn) {
  const LazyComp = lazy(importFn);
  return (
    <Suspense fallback={<PageLoader />}>
      <LazyComp />
    </Suspense>
  );
}

// Auth Pages
const LoginEl = S(() => import('@/pages/auth/Login'));
const RegisterEl = S(() => import('@/pages/auth/Register'));
const ForgotPasswordEl = S(() => import('@/pages/auth/ForgotPassword'));
const ResetPasswordEl = S(() => import('@/pages/auth/ResetPassword'));
const VerifyEmailEl = S(() => import('@/pages/auth/VerifyEmail'));

// Public Pages
const HomeEl = S(() => import('@/pages/Home'));
const ShopEl = S(() => import('@/pages/Shop'));
const ProductDetailsEl = S(() => import('@/pages/ProductDetails'));
const FlashSalesEl = S(() => import('@/pages/FlashSales'));
const AuctionsEl = S(() => import('@/pages/Auctions'));
const AuctionDetailEl = S(() => import('@/pages/AuctionDetail'));
const VendorProfileEl = S(() => import('@/pages/VendorProfile'));

// Customer Pages
const CartEl = S(() => import('@/pages/Cart'));
const CheckoutEl = S(() => import('@/pages/Checkout'));
const OrderSuccessEl = S(() => import('@/pages/OrderSuccess'));
const WishlistEl = S(() => import('@/pages/Wishlist'));

// Customer Dashboard
const CProfileEl = S(() => import('@/pages/dashboard/customer/Profile'));
const CAddressesEl = S(() => import('@/pages/dashboard/customer/Addresses'));
const COrdersEl = S(() => import('@/pages/dashboard/customer/Orders'));
const COrderDetailsEl = S(() => import('@/pages/dashboard/customer/OrderDetails'));
const CWalletEl = S(() => import('@/pages/dashboard/customer/Wallet'));
const CAuctionsEl = S(() => import('@/pages/dashboard/customer/Auctions'));
const CNotificationsEl = S(() => import('@/pages/dashboard/customer/Notifications'));

// Vendor Dashboard
const VOverviewEl = S(() => import('@/pages/dashboard/vendor/Overview'));
const VProductsEl = S(() => import('@/pages/dashboard/vendor/Products'));
const VProductFormEl = S(() => import('@/pages/dashboard/vendor/ProductForm'));
const VFlashSalesEl = S(() => import('@/pages/dashboard/vendor/FlashSales'));
const VAuctionsEl = S(() => import('@/pages/dashboard/vendor/Auctions'));
const VOrdersEl = S(() => import('@/pages/dashboard/vendor/Orders'));
const VOrderDetailsEl = S(() => import('@/pages/dashboard/vendor/OrderDetails'));
const VCouponsEl = S(() => import('@/pages/dashboard/vendor/Coupons'));
const VProfileEl = S(() => import('@/pages/dashboard/vendor/Profile'));
const VPayoutsEl = S(() => import('@/pages/dashboard/vendor/Payouts'));

// Admin Dashboard
const AOverviewEl = S(() => import('@/pages/dashboard/admin/Overview'));
const AUsersEl = S(() => import('@/pages/dashboard/admin/Users'));
const AVendorsEl = S(() => import('@/pages/dashboard/admin/Vendors'));
const AProductsEl = S(() => import('@/pages/dashboard/admin/Products'));
const AOrdersEl = S(() => import('@/pages/dashboard/admin/Orders'));
const AFlashSalesEl = S(() => import('@/pages/dashboard/admin/FlashSales'));
const AAuctionsEl = S(() => import('@/pages/dashboard/admin/Auctions'));
const ACategoriesEl = S(() => import('@/pages/dashboard/admin/Categories'));
const ACouponsEl = S(() => import('@/pages/dashboard/admin/Coupons'));
const APayoutsEl = S(() => import('@/pages/dashboard/admin/Payouts'));
const AReportsEl = S(() => import('@/pages/dashboard/admin/Reports'));

// 404
const NotFoundEl = S(() => import('@/pages/NotFound'));

export const router = createBrowserRouter([
  // Auth routes
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <GuestRoute>{LoginEl}</GuestRoute> },
      { path: 'register', element: <GuestRoute>{RegisterEl}</GuestRoute> },
      { path: 'forgot-password', element: <GuestRoute>{ForgotPasswordEl}</GuestRoute> },
      { path: 'reset-password/:token', element: <GuestRoute>{ResetPasswordEl}</GuestRoute> },
      { path: 'verify-email/:token', element: VerifyEmailEl },
    ],
  },
  // Main public routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: HomeEl },
      { path: 'shop', element: ShopEl },
      { path: 'products/:id', element: ProductDetailsEl },
      { path: 'flash-sales', element: FlashSalesEl },
      { path: 'auctions', element: AuctionsEl },
      { path: 'auctions/:id', element: AuctionDetailEl },
      { path: 'vendors/:id', element: VendorProfileEl },
      { path: 'cart', element: <ProtectedRoute>{CartEl}</ProtectedRoute> },
      { path: 'checkout', element: <ProtectedRoute>{CheckoutEl}</ProtectedRoute> },
      { path: 'order-success', element: <ProtectedRoute>{OrderSuccessEl}</ProtectedRoute> },
      { path: 'wishlist', element: <ProtectedRoute>{WishlistEl}</ProtectedRoute> },
    ],
  },
  // Customer dashboard
  {
    path: '/dashboard',
    element: <ProtectedRoute roles={['customer']}><CustomerDashboardWrapper /></ProtectedRoute>,
    children: [
      { index: true, element: CProfileEl },
      { path: 'profile', element: CProfileEl },
      { path: 'addresses', element: CAddressesEl },
      { path: 'orders', element: COrdersEl },
      { path: 'orders/:id', element: COrderDetailsEl },
      { path: 'wallet', element: CWalletEl },
      { path: 'auctions', element: CAuctionsEl },
      { path: 'notifications', element: CNotificationsEl },
    ],
  },
  // Vendor dashboard
  {
    path: '/vendor',
    element: <ProtectedRoute roles={['vendor']}><VendorDashboardWrapper /></ProtectedRoute>,
    children: [
      { index: true, element: VOverviewEl },
      { path: 'products', element: VProductsEl },
      { path: 'products/new', element: VProductFormEl },
      { path: 'products/:id/edit', element: VProductFormEl },
      { path: 'flash-sales', element: VFlashSalesEl },
      { path: 'auctions', element: VAuctionsEl },
      { path: 'orders', element: VOrdersEl },
      { path: 'orders/:id', element: VOrderDetailsEl },
      { path: 'coupons', element: VCouponsEl },
      { path: 'profile', element: VProfileEl },
      { path: 'payouts', element: VPayoutsEl },
    ],
  },
  // Admin dashboard
  {
    path: '/admin',
    element: <ProtectedRoute roles={['admin']}><AdminDashboardWrapper /></ProtectedRoute>,
    children: [
      { index: true, element: AOverviewEl },
      { path: 'users', element: AUsersEl },
      { path: 'vendors', element: AVendorsEl },
      { path: 'products', element: AProductsEl },
      { path: 'orders', element: AOrdersEl },
      { path: 'flash-sales', element: AFlashSalesEl },
      { path: 'auctions', element: AAuctionsEl },
      { path: 'categories', element: ACategoriesEl },
      { path: 'coupons', element: ACouponsEl },
      { path: 'payouts', element: APayoutsEl },
      { path: 'reports', element: AReportsEl },
    ],
  },
  { path: '*', element: NotFoundEl },
]);
