import { Link } from 'react-router';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="size-10 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-bold text-xl text-white">SupVend</span>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted marketplace for quality products, flash sales, and exciting auctions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/flash-sales" className="text-sm hover:text-white transition-colors">
                  Flash Sales
                </Link>
              </li>
              <li>
                <Link to="/auctions" className="text-sm hover:text-white transition-colors">
                  Auctions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard/orders" className="text-sm hover:text-white transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/dashboard/wishlist" className="text-sm hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <div className="flex items-center gap-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="size-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="size-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="size-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} SupVend. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
