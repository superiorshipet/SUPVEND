import { ShoppingBag, ExternalLink, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Quick Links': [
      { label: 'Home', path: '/' },
      { label: 'Shop', path: '/shop' },
      { label: 'Flash Sales', path: '/flash-sales' },
      { label: 'Auctions', path: '/auctions' },
    ],
    'Account': [
      { label: 'My Account', path: '/dashboard/profile' },
      { label: 'Orders', path: '/dashboard/orders' },
      { label: 'Wishlist', path: '/wishlist' },
      { label: 'Cart', path: '/cart' },
    ],
    'Information': [
      { label: 'About Us', path: '#' },
      { label: 'Privacy Policy', path: '#' },
      { label: 'Terms & Conditions', path: '#' },
      { label: 'Become a Vendor', path: '/register' },
    ],
  };

  return (
    <footer className="bg-surface-900 dark:bg-surface-950 text-surface-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">SUPVEND</span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed max-w-xs">
              Your premium multi-vendor marketplace. Discover amazing products from top vendors around the world.
            </p>
            <div className="flex gap-3">
              {[Globe, ExternalLink, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-surface-800 hover:bg-surface-700 flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-surface-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-surface-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">© {currentYear} SUPVEND. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-surface-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Worldwide
            </span>
            <span className="text-xs text-surface-500 flex items-center gap-1">
              <Phone className="h-3 w-3" /> Support 24/7
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
