import { PackageX } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ icon: Icon = PackageX, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-surface-400 dark:text-surface-500" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
        {title || 'Nothing here yet'}
      </h3>
      {description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-sm mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
