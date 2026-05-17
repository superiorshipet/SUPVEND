import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary: 'bg-[#4F46E5] text-white hover:bg-[#4338CA] focus-visible:ring-[#4F46E5]',
      secondary: 'bg-[#10B981] text-white hover:bg-[#059669] focus-visible:ring-[#10B981]',
      danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] focus-visible:ring-[#EF4444]',
      outline:
        'border-2 border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white focus-visible:ring-[#4F46E5]',
      ghost: 'hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-300',
    };

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-5 text-base',
      lg: 'h-14 px-7 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
