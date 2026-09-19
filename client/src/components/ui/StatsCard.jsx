import { TrendingUp, TrendingDown } from 'lucide-react';
import { classNames } from '@/utils/helpers';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, className, color = 'primary' }) {
  const isPositive = trend === 'up';
  const colors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
    danger: 'bg-danger-50 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
  };

  return (
    <div className={classNames(
      'bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 shadow-card hover:shadow-card-hover transition-all duration-300',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
        </div>
        {Icon && (
          <div className={classNames('p-3 rounded-xl', colors[color])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trendValue && (
        <div className="flex items-center gap-1 mt-3">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-success-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-danger-500" />
          )}
          <span className={`text-xs font-medium ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
            {trendValue}
          </span>
          <span className="text-xs text-surface-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
