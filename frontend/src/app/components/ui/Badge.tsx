import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'gray';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20',
      success: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
      danger: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
      warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
