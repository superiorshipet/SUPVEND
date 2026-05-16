import { forwardRef } from 'react';
import { classNames } from '@/utils/helpers';

const Input = forwardRef(({ label, error, icon: Icon, className, id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-surface-400" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={classNames(
            'block w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900 placeholder-surface-400',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
            'dark:bg-surface-800 dark:border-surface-600 dark:text-surface-100 dark:placeholder-surface-500 dark:focus:border-primary-400',
            'transition-all duration-200',
            Icon && 'pl-10',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-danger-600 dark:text-danger-400 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
