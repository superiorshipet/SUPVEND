import { useCountdown } from '@/hooks/useCountdown';
import { classNames } from '@/utils/helpers';

export default function CountdownTimer({ targetDate, variant = 'default', size = 'md', label }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return (
      <span className="text-danger-600 dark:text-danger-400 text-sm font-medium">Expired</span>
    );
  }

  const variants = {
    default: 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white',
    primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    danger: 'bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300',
    accent: 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300',
  };

  const sizes = {
    sm: 'text-xs px-1.5 py-1 min-w-[28px]',
    md: 'text-sm px-2 py-1.5 min-w-[36px]',
    lg: 'text-lg px-3 py-2 min-w-[48px]',
  };

  const blocks = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hrs' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ];

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">{label}</span>}
      <div className="flex items-center gap-1">
        {blocks.map((block, i) => (
          <div key={block.label} className="flex items-center gap-1">
            <div className={classNames('text-center rounded-lg font-bold tabular-nums', variants[variant], sizes[size])}>
              {String(block.value).padStart(2, '0')}
            </div>
            {i < blocks.length - 1 && (
              <span className="text-surface-400 dark:text-surface-500 font-bold">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
