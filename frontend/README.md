# SupVend - E-Commerce Platform

A comprehensive e-commerce platform built with React, TypeScript, and Tailwind CSS, featuring flash sales, live auctions, and multi-vendor support.

## Features

### Customer Features
- 🛍️ Product browsing with advanced filters
- ⚡ Flash Sales with countdown timers
- 🔨 Live Auctions with real-time bidding
- 🛒 Shopping cart with coupon support
- 💳 Wallet system for payments
- 📦 Order tracking and management
- ❤️ Wishlist functionality
- 🔔 Real-time notifications

### Vendor Features
- 📊 Dashboard with sales analytics
- 📦 Product management
- ⚡ Flash sale creation and management
- 🔨 Auction management
- 💰 Payout requests
- 🎫 Coupon management
- 📈 Sales reports

### Admin Features
- 👥 User management
- 🏪 Vendor approval and management
- 📦 Product moderation
- 📂 Category management
- 💸 Payout approvals
- 📊 Platform analytics and reports

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router 7
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Real-time**: Socket.io-client
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives
- **Notifications**: Sonner

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   └── product/         # Product-specific components
│   ├── layouts/             # Page layouts
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Customer dashboard
│   │   ├── vendor/          # Vendor dashboard
│   │   └── admin/           # Admin dashboard
│   ├── routes.tsx           # Route configuration
│   └── App.tsx              # Main app component
├── services/                # API and Socket services
├── store/                   # Zustand stores
├── types/                   # TypeScript types
└── utils/                   # Utility functions
```

## Pages

### Public Pages
- `/` - Homepage with featured products, flash sales, and auctions
- `/products` - Product catalog with filters
- `/products/:id` - Product details
- `/flash-sales` - Flash sales page
- `/auctions` - Live auctions
- `/auctions/:id` - Auction details
- `/vendors/:id` - Vendor profile
- `/login` - Login page
- `/register` - Registration (Customer/Vendor)
- `/cart` - Shopping cart
- `/checkout` - Checkout page

### Customer Dashboard (`/dashboard`)
- `/dashboard` - Overview
- `/dashboard/profile` - Profile settings
- `/dashboard/orders` - Order history
- `/dashboard/orders/:id` - Order details
- `/dashboard/wishlist` - Wishlist
- `/dashboard/wallet` - Wallet and transactions
- `/dashboard/auctions` - Auction participation
- `/dashboard/notifications` - Notifications

### Vendor Dashboard (`/vendor`)
- `/vendor/dashboard` - Overview and analytics
- `/vendor/products` - Product management
- `/vendor/products/add` - Add new product
- `/vendor/products/:id/edit` - Edit product
- `/vendor/orders` - Order management
- `/vendor/flash-sales` - Flash sales management
- `/vendor/auctions` - Auction management
- `/vendor/payouts` - Payout requests
- `/vendor/coupons` - Coupon management
- `/vendor/profile` - Store profile

### Admin Dashboard (`/admin`)
- `/admin/dashboard` - Platform overview
- `/admin/users` - User management
- `/admin/vendors` - Vendor management
- `/admin/products` - Product moderation
- `/admin/categories` - Category management
- `/admin/orders` - All orders
- `/admin/payouts` - Payout approvals
- `/admin/coupons` - Coupon management
- `/admin/reports` - Analytics and reports

## API Integration

The platform is designed to work with a backend API. API endpoints are configured in `src/services/api.ts`.

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### API Endpoints

All API calls are made through the service layer:

- **Auth**: `authApi` - Login, register, password management
- **Products**: `productsApi` - CRUD operations
- **Cart**: `cartApi` - Cart management
- **Orders**: `ordersApi` - Order creation and tracking
- **Flash Sales**: `flashSalesApi` - Flash sale operations
- **Auctions**: `auctionsApi` - Auction and bidding
- **Wallet**: `walletApi` - Wallet and transactions
- **Notifications**: `notificationsApi` - Notification management
- **Vendor**: `vendorApi` - Vendor-specific operations
- **Admin**: `adminApi` - Admin operations
- **Coupons**: `couponsApi` - Coupon management

## Real-time Features

WebSocket connection is established using Socket.io for:

- Live auction bidding
- Real-time notifications
- Bid updates and auction extensions
- Outbid alerts

Connection is managed through `src/services/socket.ts`.

## State Management

### Stores

- **authStore**: User authentication and session
- **cartStore**: Shopping cart with items, coupons, and totals
- **notificationStore**: Notifications and unread count

## Color Palette

- **Primary**: #4F46E5 (Indigo)
- **Secondary**: #10B981 (Emerald)
- **Danger**: #EF4444 (Red)
- **Warning**: #F59E0B (Amber)
- **Dark**: #1F2937 (Gray-800)
- **Light**: #F9FAFB (Gray-50)

## Development

This project uses pnpm for package management.

Install dependencies:
```bash
pnpm install
```

The Vite dev server runs automatically in the Figma Make environment.

## License

MIT
