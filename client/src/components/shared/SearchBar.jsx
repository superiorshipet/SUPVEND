import { Search, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={`h-4 w-4 transition-colors ${focused ? 'text-primary-500' : 'text-surface-400'}`} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
        >
          <X className="h-4 w-4 text-surface-400 hover:text-surface-600" />
        </button>
      )}
    </div>
  );
}
