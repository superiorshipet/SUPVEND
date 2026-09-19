import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--color-surface-900)', color: '#fff', fontSize: '14px' } }} />
    </div>
  );
}
