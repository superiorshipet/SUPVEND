import { Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'size-4',
    md: 'size-8',
    lg: 'size-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-[#4F46E5]', sizes[size])} />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
