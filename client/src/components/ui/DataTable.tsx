'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  totalItems?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string | number; _id?: string | number }>({
  columns,
  data,
  isLoading = false,
  totalItems = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  emptyMessage = 'No records found.'
}: DataTableProps<T>) {
  const [searchVal, setSearchVal] = useState('');
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchVal);
    }
  };

  const clearSearch = () => {
    setSearchVal('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search Header Action */}
      {onSearchChange && (
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full items-center">
          <Input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={searchPlaceholder}
            icon="🔍"
            className="flex-1"
          />
          <Button type="submit" variant="ghost">Search</Button>
          {searchVal && (
            <Button type="button" variant="ghost" onClick={clearSearch} className="px-3">✕</Button>
          )}
        </form>
      )}

      {/* Grid container */}
      <div className="glass rounded-2xl overflow-x-auto border border-border">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-bg-hover/40 text-xs font-bold text-text-secondary uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4.5">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm text-text-secondary">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-bg-hover rounded-md w-2/3" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row._id || row.id || rIdx}
                  className="hover:bg-bg-hover/20 transition duration-150"
                >
                  {columns.map((col, cIdx) => {
                    const renderVal =
                      typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode);
                    return (
                      <td key={cIdx} className="px-6 py-4 font-medium text-text-primary/90">
                        {renderVal}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls footer */}
      {onPageChange && totalItems > pageSize && (
        <div className="flex items-center justify-between gap-4 mt-2">
          <span className="text-xs text-text-muted">
            Showing page <span className="font-semibold text-text-secondary">{currentPage}</span> of{' '}
            <span className="font-semibold text-text-secondary">{totalPages}</span> ({totalItems} items)
          </span>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
