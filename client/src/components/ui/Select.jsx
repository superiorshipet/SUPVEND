import { forwardRef } from 'react';
import { classNames } from '@/utils/helpers';

const Select = forwardRef(({ label, error, options = [], className, placeholder, id, ...props }, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={classNames(
          'block w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-900',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
          'dark:bg-surface-800 dark:border-surface-600 dark:text-surface-100',
          'transition-all duration-200',
          error && 'border-danger-500',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
