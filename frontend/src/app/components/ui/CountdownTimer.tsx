import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface CountdownTimerProps {
  endTime: string;
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
}

export function CountdownTimer({
  endTime,
  onExpire,
  className,
  showIcon = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft(null);
        onExpire?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (!timeLeft) {
    return (
      <div className={cn('text-[#EF4444] font-medium', className)}>
        Expired
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && <Clock className="size-5 text-[#F59E0B]" />}
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-gray-900 text-white px-2 py-1 rounded text-sm font-medium min-w-[2.5rem] text-center">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-gray-600">:</span>
          </>
        )}
        <span className="bg-gray-900 text-white px-2 py-1 rounded text-sm font-medium min-w-[2.5rem] text-center">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-gray-600">:</span>
        <span className="bg-gray-900 text-white px-2 py-1 rounded text-sm font-medium min-w-[2.5rem] text-center">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-gray-600">:</span>
        <span className="bg-gray-900 text-white px-2 py-1 rounded text-sm font-medium min-w-[2.5rem] text-center">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
