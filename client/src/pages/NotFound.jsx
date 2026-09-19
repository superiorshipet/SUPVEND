import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
      <div className="text-center">
        <h1 className="text-8xl font-display font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/"><Button variant="gradient" icon={Home}>Go Home</Button></Link>
          <Button variant="secondary" icon={ArrowLeft} onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    </div>
  );
}
