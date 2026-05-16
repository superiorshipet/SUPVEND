import { Star } from 'lucide-react';

export default function Rating({ value = 0, max = 5, size = 'sm', showValue = true, count }) {
  const sizes = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-5 w-5' };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={`${sizes[size]} ${
              i < Math.floor(value)
                ? 'text-warning-500 fill-warning-500'
                : i < value
                ? 'text-warning-500 fill-warning-500 opacity-50'
                : 'text-surface-300 dark:text-surface-600'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-surface-600 dark:text-surface-400 ml-0.5">
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-surface-400">({count})</span>
      )}
    </div>
  );
}
