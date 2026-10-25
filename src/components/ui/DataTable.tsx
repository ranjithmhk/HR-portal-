import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Check, X } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  bulkActions?: (selectedIds: string[]) => React.ReactNode;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  bulkActions,
  onRowClick,
  emptyState,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDirection]);

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange && onSelectionChange([]);
    } else {
      onSelectionChange && onSelectionChange(data.map(keyExtractor));
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (data.length === 0 && emptyState) {
    return <div className="w-full">{emptyState}</div>;
  }

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-border bg-surface ${className}`}>
      {/* Sliding Bulk Selection Bar */}
      {selectable && selectedIds.length > 0 && (
        <div className="bg-primary-50 px-4 py-2.5 border-b border-primary-100 flex items-center justify-between text-xs font-medium text-primary animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="font-semibold px-2 py-0.5 rounded-full bg-primary text-white text-[11px]">
              {selectedIds.length}
            </span>
            <span>selected from current view</span>
            <button
              onClick={() => onSelectionChange && onSelectionChange([])}
              className="text-text-secondary hover:text-text underline text-xs ml-2 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.75} /> Clear selection
            </button>
          </div>
          {bulkActions && <div className="flex items-center gap-2">{bulkActions(selectedIds)}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-muted border-b border-border text-[11px] font-semibold uppercase tracking-wider text-text-secondary sticky top-0 z-10">
              {selectable && (
                <th className="w-12 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allSelected}
                    ref={input => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 border-border cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer hover:text-text select-none' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-text-tertiary">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5" strokeWidth={1.75} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData.map(item => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.includes(id);

              return (
                <tr
                  key={id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`min-h-[52px] h-[52px] transition-colors ${
                    isSelected ? 'bg-primary-50/50' : 'hover:bg-primary-50/20'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {selectable && (
                    <td className="w-12 px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select row ${id}`}
                        checked={isSelected}
                        onChange={e => handleSelectRow(id, e as any)}
                        className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 border-border cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className={`px-4 py-3.5 text-sm text-text ${col.className || ''}`}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
