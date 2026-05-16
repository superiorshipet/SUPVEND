import { Skeleton, TableRowSkeleton } from './Skeleton';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function DataTable({ columns, data, isLoading, emptyMessage = 'No data found', emptyIcon: EmptyIcon, sortable = false, onSort }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (!sortable) return;
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.({ key, direction });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-400 ${
                  col.sortable ? 'cursor-pointer hover:text-surface-900 dark:hover:text-white select-none' : ''
                } ${col.className || ''}`}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortConfig.key === col.key && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={columns.length} />
            ))
          ) : data?.length > 0 ? (
            data.map((row, i) => (
              <tr key={row._id || row.id || i} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-surface-700 dark:text-surface-300 ${col.className || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  {EmptyIcon && <EmptyIcon className="h-12 w-12 text-surface-300 dark:text-surface-600" />}
                  <p className="text-surface-500 dark:text-surface-400">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
