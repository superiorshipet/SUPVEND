import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ navItems = [], title = 'Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 z-30 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface-200 dark:border-surface-800">
          {!collapsed && <span className="font-display font-bold text-surface-900 dark:text-white">{title}</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer">
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className={`p-4 border-t border-surface-200 dark:border-surface-800 ${collapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-surface-500 truncate capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-surface-900 z-50 lg:hidden shadow-xl">
              <div className="h-16 flex items-center justify-between px-4 border-b border-surface-200 dark:border-surface-800">
                <span className="font-display font-bold text-surface-900 dark:text-white">{title}</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 cursor-pointer"><X className="h-5 w-5" /></button>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => (
                  <NavLink key={item.path} to={item.path} end={item.end}
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center px-4 lg:px-6 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 mr-3 cursor-pointer">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-surface-900 dark:text-white">{title}</h1>
        </header>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--color-surface-900)', color: '#fff', fontSize: '14px' } }} />
    </div>
  );
}
