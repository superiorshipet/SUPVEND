import { Star } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  readonly?: boolean;
  onChange?: (value: number) => void;
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  showValue = false,
  className,
  readonly = true,
  onChange,
}: RatingProps) {
  const sizes = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={cn(
            'transition-colors',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizes[size],
              star <= value
                ? 'fill-[#F59E0B] text-[#F59E0B]'
                : 'fill-none text-gray-300'
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {value.toFixed(1)} / {max}
        </span>
      )}
    </div>
  );
}
