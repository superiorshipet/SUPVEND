import { classNames } from '@/utils/helpers';

export default function Card({ children, className, hover = false, padding = true, ...props }) {
  return (
    <div
      className={classNames(
        'bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800',
        padding && 'p-6',
        hover && 'hover:shadow-card-hover hover:border-surface-300 dark:hover:border-surface-600 transition-all duration-300',
        'shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={classNames('pb-4 border-b border-surface-100 dark:border-surface-800', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={classNames('text-lg font-semibold text-surface-900 dark:text-white', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={classNames('pt-4', className)}>
      {children}
    </div>
  );
}
