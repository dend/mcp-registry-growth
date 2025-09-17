'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { FilterState, ServerType, TimeGranularity } from '@/types';
import { cn } from '@/lib/utils';

interface FilterControlsProps {
  currentState: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  className?: string;
}

export const FilterControls = memo<FilterControlsProps>(({ 
  currentState, 
  onFilterChange, 
  className 
}) => {
  // Memoize static options to prevent recreation on every render
  const serverTypeOptions = useMemo(() => [
    { value: 'all' as ServerType, label: 'All Servers' },
    { value: 'local' as ServerType, label: 'Local Servers' },
    { value: 'remote' as ServerType, label: 'Remote Servers' }
  ], []);

  const granularityOptions = useMemo(() => [
    { value: 'hourly' as TimeGranularity, label: 'Hourly' },
    { value: 'daily' as TimeGranularity, label: 'Daily' },
    { value: 'weekly' as TimeGranularity, label: 'Weekly' },
    { value: 'monthly' as TimeGranularity, label: 'Monthly' }
  ], []);

  // Memoize date formatting function
  const formatDateForInput = useCallback((isoString: string) => {
    return new Date(isoString).toISOString().split('T')[0];
  }, []);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleDateChange = useCallback((field: 'start' | 'end', value: string) => {
    const date = new Date(value);
    if (field === 'end') {
      // Set time to end of day for end date
      date.setHours(23, 59, 59, 999);
    }
    
    onFilterChange({
      dateRange: {
        ...currentState.dateRange,
        [field]: date.toISOString()
      }
    });
  }, [currentState.dateRange, onFilterChange]);

  const handleReset = useCallback(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    onFilterChange({
      serverTypeFilter: 'all',
      timeGranularity: 'daily',
      dateRange: {
        start: thirtyDaysAgo.toISOString(),
        end: now.toISOString()
      }
    });
  }, [onFilterChange]);

  return (
    <div className={cn(
      "filter-controls flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border",
      className
    )}>
      {/* Server Type Filter */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="server-type-select" className="text-sm font-medium text-foreground">
          Server Type
        </label>
        <select
          id="server-type-select"
          value={currentState.serverTypeFilter}
          onChange={(e) => onFilterChange({ 
            serverTypeFilter: e.target.value as ServerType 
          })}
          aria-label="Filter by server type"
          className="px-3 py-2 bg-background border rounded-md text-foreground 
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                     font-sans text-sm h-[42px]"
        >
          {serverTypeOptions.map(option => (
            <option key={option.value} value={option.value} className="font-sans text-sm">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Time Granularity Filter */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="time-granularity-select" className="text-sm font-medium text-foreground">
          Time Period
        </label>
        <select
          id="time-granularity-select"
          value={currentState.timeGranularity}
          onChange={(e) => onFilterChange({ 
            timeGranularity: e.target.value as TimeGranularity 
          })}
          aria-label="Select time granularity for data aggregation"
          className="px-3 py-2 bg-background border rounded-md text-foreground 
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                     font-sans text-sm h-[42px]"
        >
          {granularityOptions.map(option => (
            <option key={option.value} value={option.value} className="font-sans text-sm">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="start-date-input" className="text-sm font-medium text-foreground">
            Start Date
          </label>
          <input
            id="start-date-input"
            type="date"
            value={formatDateForInput(currentState.dateRange.start)}
            onChange={(e) => handleDateChange('start', e.target.value)}
            aria-label="Select start date for data range"
            className="px-3 py-2 bg-background border rounded-md text-foreground 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                       font-sans text-sm h-[42px]"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="end-date-input" className="text-sm font-medium text-foreground">
            End Date
          </label>
          <input
            id="end-date-input"
            type="date"
            value={formatDateForInput(currentState.dateRange.end)}
            onChange={(e) => handleDateChange('end', e.target.value)}
            aria-label="Select end date for data range"
            className="px-3 py-2 bg-background border rounded-md text-foreground 
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                       font-sans text-sm h-[42px]"
          />
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex flex-col justify-end">
        <button
          onClick={handleReset}
          aria-label="Reset all filters to default values"
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md 
                     hover:bg-secondary/80 transition-colors focus:outline-none 
                     focus:ring-2 focus:ring-secondary focus:ring-offset-2
                     font-sans text-sm h-[42px]"
        >
          Reset
        </button>
      </div>
    </div>
  );
});

FilterControls.displayName = 'FilterControls';