import { forwardRef } from 'react';
import { classNames } from '@/utils/helpers';

const Textarea = forwardRef(({ label, error, className, id, rows = 4, ...props }, ref) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={classNames(
          'block w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900 placeholder-surface-400',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none',
          'dark:bg-surface-800 dark:border-surface-600 dark:text-surface-100 dark:placeholder-surface-500',
          'transition-all duration-200',
          error && 'border-danger-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
