import { Outlet, Link, useLocation } from 'react-router';
import { Home, Package, Heart, Wallet, Gavel, Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../components/layout/Header';

const customerMenuItems = [
  { icon: Home, label: 'Overview', path: '/dashboard' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
  { icon: Package, label: 'Orders', path: '/dashboard/orders' },
  { icon: Heart, label: 'Wishlist', path: '/dashboard/wishlist' },
  { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet' },
  { icon: Gavel, label: 'My Auctions', path: '/dashboard/auctions' },
  { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                {customerMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#4F46E5] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="size-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#EF4444] hover:bg-red-50 w-full transition-colors"
                >
                  <LogOut className="size-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
