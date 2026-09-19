export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
    processing: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-500',
    shipped: 'bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-500',
    delivered: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
    cancelled: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
    active: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
    inactive: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
    approved: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
    rejected: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
  };
  return colors[status?.toLowerCase()] || colors.pending;
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
