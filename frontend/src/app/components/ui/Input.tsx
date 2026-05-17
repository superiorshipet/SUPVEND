import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-[#EF4444] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            'transition-colors',
            error && 'border-[#EF4444] focus:ring-[#EF4444]',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[#EF4444]">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
