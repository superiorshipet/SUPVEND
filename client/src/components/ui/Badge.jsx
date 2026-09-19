import { classNames } from '@/utils/helpers';

export default function Badge({ children, variant = 'default', size = 'sm', className, dot }) {
  const variants = {
    default: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    danger: 'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
    accent: 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${variant === 'success' ? 'bg-success-500' : variant === 'danger' ? 'bg-danger-500' : variant === 'warning' ? 'bg-warning-500' : 'bg-primary-500'}`} />}
      {children}
    </span>
  );
}
