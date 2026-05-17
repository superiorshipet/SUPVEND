# Getting Started with SupVend

## Quick Start

This project is built with React, TypeScript, and Tailwind CSS using the Figma Make environment.

### 1. Installation

Dependencies are already installed. If you need to reinstall:

```bash
pnpm install
```

### 2. Development

The Vite dev server runs automatically in the Figma Make environment. Your app is accessible through the preview surface.

### 3. Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Update the API URL to match your backend:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Project Features

### ✅ Implemented

- **React Router 7** with data mode routing
- **State Management** using Zustand
- **API Integration** ready with axios
- **Socket.IO** setup for real-time features
- **Form Validation** with React Hook Form + Zod
- **UI Components** using Radix UI primitives
- **Responsive Design** with Tailwind CSS v4
- **Type Safety** with TypeScript

### 🏗️ Pages Structure

#### Public Pages
- Homepage with featured products, flash sales, and auctions
- Product catalog with filters and search
- Product details page
- Flash sales and auctions pages
- Cart and checkout
- Authentication (login, register, password reset)

#### Customer Dashboard
- Overview with stats
- Orders management
- Wishlist
- Wallet with transactions
- Auction participation tracking
- Notifications

#### Vendor Dashboard
- Sales analytics
- Product management (CRUD)
- Flash sales management
- Auctions management
- Payout requests
- Coupon management

#### Admin Dashboard
- Platform overview
- User management
- Vendor approvals
- Product moderation
- Category management
- Payout approvals
- Reports and analytics

## Testing the App

### 1. Test Login

Use the login form at `/login` with any email and password. The app uses mock authentication that will:
- Accept any credentials
- Create a user session
- Redirect to the dashboard

### 2. Test Shopping

1. Browse products at `/products`
2. Add items to cart
3. View cart at `/cart`
4. Proceed to checkout

### 3. Test Dashboard

After logging in, access:
- Customer: `/dashboard`
- Vendor: `/vendor/dashboard`
- Admin: `/admin/dashboard`

## API Integration

### Mock Data

Currently, the app uses mock data for demonstration. To connect to a real backend:

1. Set `VITE_API_URL` in `.env`
2. Update API endpoints in `src/services/api.ts`
3. Replace mock data in pages with actual API calls

### API Endpoints

All API utilities are in `src/services/api.ts`:

```typescript
import { authApi, productsApi, cartApi, ordersApi } from '../services/api';

// Example usage
const login = async (email, password) => {
  const response = await authApi.login({ email, password });
  return response.data;
};
```

### Real-time Features

Socket.IO client is configured in `src/services/socket.ts`:

```typescript
import { socketService } from '../services/socket';

// Connect
socketService.connect(token);

// Join auction
socketService.joinAuction(auctionId);

// Listen for bids
socketService.onNewBid((data) => {
  console.log('New bid:', data);
});
```

## Customization

### Colors

Main colors are defined using Tailwind classes:

- Primary: `#4F46E5` (Indigo)
- Secondary: `#10B981` (Emerald)
- Danger: `#EF4444` (Red)
- Warning: `#F59E0B` (Amber)

Update colors in component classes or add to `theme.css`.

### Components

All reusable components are in `src/app/components/ui/`.

To create a new component:

```bash
touch src/app/components/ui/MyComponent.tsx
```

### Add New Page

1. Create page component in `src/app/pages/`
2. Add route in `src/app/routes.tsx`
3. Add navigation link in appropriate layout

Example:

```typescript
// src/app/pages/NewPage.tsx
export default function NewPage() {
  return <div>New Page</div>;
}

// src/app/routes.tsx
import NewPage from './pages/NewPage';

// Add to routes array
{ path: 'new-page', Component: NewPage }
```

## State Management

### Zustand Stores

Three main stores:

1. **authStore** - User authentication
2. **cartStore** - Shopping cart
3. **notificationStore** - Notifications

Example usage:

```typescript
import { useAuthStore } from '../store/authStore';

function MyComponent() {
  const { user, login, logout } = useAuthStore();
  
  return (
    <div>
      {user ? `Hello ${user.name}` : 'Not logged in'}
    </div>
  );
}
```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors, check:
1. All imports are correct
2. Types are properly defined in `src/types/index.ts`
3. Run type check: `pnpm tsc --noEmit`

### Missing Dependencies

Reinstall dependencies:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Next Steps

1. **Connect Backend**: Update API endpoints to connect to your backend
2. **Add Authentication**: Implement real JWT authentication
3. **Add Payments**: Integrate Stripe or another payment provider
4. **Add Image Upload**: Implement image upload for products
5. **Add Search**: Implement full-text search for products
6. **Add Analytics**: Add Google Analytics or similar
7. **Add Testing**: Add unit and integration tests

## Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TanStack Query Documentation](https://tanstack.com/query)

## Support

For issues or questions:
1. Check the README.md
2. Review the code documentation
3. Check component examples in the codebase
