import { Link } from 'react-router';
import { ShoppingCart, User, Bell, Search, Menu } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { Badge } from '../ui/Badge';

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { unreadCount } = useNotificationStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-10 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-bold text-xl text-gray-900">SupVend</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/products" className="text-gray-700 hover:text-[#4F46E5] transition-colors">
                Products
              </Link>
              <Link to="/flash-sales" className="text-gray-700 hover:text-[#4F46E5] transition-colors">
                Flash Sales
              </Link>
              <Link to="/auctions" className="text-gray-700 hover:text-[#4F46E5] transition-colors">
                Auctions
              </Link>
            </nav>
          </div>

          <div className="flex-1 max-w-lg mx-8 hidden lg:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-[#4F46E5] transition-colors">
              <ShoppingCart className="size-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-xs font-bold rounded-full size-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {isAuthenticated && (
              <Link to="/dashboard/notifications" className="relative p-2 text-gray-700 hover:text-[#4F46E5] transition-colors">
                <Bell className="size-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-xs font-bold rounded-full size-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 text-gray-700 hover:text-[#4F46E5] transition-colors">
                  <User className="size-6" />
                  <span className="hidden md:block">{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    to={
                      user?.role === 'admin'
                        ? '/admin/dashboard'
                        : user?.role === 'vendor'
                        ? '/vendor/dashboard'
                        : '/dashboard'
                    }
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="block w-full text-left px-4 py-2 text-[#EF4444] hover:bg-gray-50 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-4">
              <Link to="/products" className="text-gray-700 hover:text-[#4F46E5]">
                Products
              </Link>
              <Link to="/flash-sales" className="text-gray-700 hover:text-[#4F46E5]">
                Flash Sales
              </Link>
              <Link to="/auctions" className="text-gray-700 hover:text-[#4F46E5]">
                Auctions
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
