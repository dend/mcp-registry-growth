import React, { memo, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AnalyticsDataPoint, FilterState, ChartTheme, TimeGranularity } from '@/types';
import { formatTooltipValue } from '@/lib/chart-utils';
import { cn } from '@/lib/utils';

interface AnalyticsChartProps {
  data: AnalyticsDataPoint[];
  filterState: FilterState;
  theme: ChartTheme;
  className?: string;
  height?: number;
  isLoading?: boolean;
  onClick?: (dataPoint: AnalyticsDataPoint) => void;
}

export const AnalyticsChart = memo<AnalyticsChartProps>(({ 
  data, 
  filterState, 
  theme, 
  className, 
  height = 400,
  isLoading = false,
  onClick
}) => {
  // Memoize the custom tooltip to prevent unnecessary re-renders
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {formatTooltipValue(entry.value, entry.dataKey)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  // Memoize loading state to prevent re-renders
  const loadingComponent = useMemo(() => (
    <div 
      className={cn(
        "flex items-center justify-center border rounded-lg bg-card",
        className
      )} 
      style={{ height }}
      role="status"
      aria-label="Loading analytics chart"
    >
      <div className="text-center">
        <p className="text-lg font-medium text-muted-foreground">Loading chart...</p>
      </div>
    </div>
  ), [className, height]);

  if (isLoading) {
    return loadingComponent;
  }

  if (data.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center border rounded-lg bg-card",
        className
      )} style={{ height }}>
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">No data available</p>
          <p className="text-sm text-muted-foreground">
            Check your filters or data source
          </p>
        </div>
      </div>
    );
  }

  // Format date based on granularity
  const formatDateForGranularity = useCallback((timestamp: string, granularity: TimeGranularity): string => {
    const date = new Date(timestamp);
    
    switch (granularity) {
      case 'hourly':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          hour12: true,
          timeZone: 'UTC'
        });
        
      case 'daily':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC'
        });
        
      case 'weekly':
        const endOfWeek = new Date(date);
        endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
        return `Week of ${date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          timeZone: 'UTC'
        })}`;
        
      case 'monthly':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          timeZone: 'UTC'
        });
        
      default:
        return date.toLocaleDateString('en-US', { timeZone: 'UTC' });
    }
  }, []);

  // Prepare chart data based on filter state  
  const chartData = useMemo(() => {
    return data.map(point => {
      // The data is already aggregated by granularity, so we just need to format for display
      const formattedDate = formatDateForGranularity(point.timestamp, filterState.timeGranularity);
      
      if (filterState.serverTypeFilter === 'all') {
        // Return data for multiple lines
        return {
          date: formattedDate,
          local: point.localCount,
          remote: point.remoteCount,
          total: point.totalCount,
          originalData: point
        };
      } else {
        // Return data for single line
        let count: number;
        switch (filterState.serverTypeFilter) {
          case 'local':
            count = point.localCount;
            break;
          case 'remote':
            count = point.remoteCount;
            break;
          default:
            count = point.totalCount;
            break;
        }
        
        return {
          date: formattedDate,
          count,
          originalData: point
        };
      }
    });
  }, [data, filterState]);

  return (
    <div className={cn("w-full", className, "dark")} role="region" aria-label="Analytics chart visualization">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
          role="img"
          aria-label={`Line chart showing ${filterState.serverTypeFilter === 'all' ? 'total' : filterState.serverTypeFilter} server count over time`}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme.text}
            opacity={0.3}
          />
          <XAxis
            dataKey="date"
            stroke={theme.text}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.text }}
          />
          <YAxis
            stroke={theme.text}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.text }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              color: theme.text,
              fontSize: '14px'
            }}
          />
          {filterState.serverTypeFilter === 'all' ? (
            // Multiple lines for all server types
            <>
              <Line
                type="monotone"
                dataKey="local"
                stroke={theme.primary}
                strokeWidth={2}
                dot={{
                  fill: theme.primary,
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  stroke: theme.primary,
                  strokeWidth: 2,
                  fill: theme.background
                }}
                name="Local Servers"
              />
              <Line
                type="monotone"
                dataKey="remote"
                stroke={theme.secondary}
                strokeWidth={2}
                dot={{
                  fill: theme.secondary,
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  stroke: theme.secondary,
                  strokeWidth: 2,
                  fill: theme.background
                }}
                name="Remote Servers"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={theme.accent}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  fill: theme.accent,
                  strokeWidth: 2,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  stroke: theme.accent,
                  strokeWidth: 2,
                  fill: theme.background
                }}
                name="Total Servers"
              />
            </>
          ) : (
            // Single line for specific server type
            <Line
              type="monotone"
              dataKey="count"
              stroke={theme.primary}
              strokeWidth={2}
              dot={{
                fill: theme.primary,
                strokeWidth: 2,
                r: 4
              }}
              activeDot={{
                r: 6,
                stroke: theme.primary,
                strokeWidth: 2,
                fill: theme.background
              }}
              name={`${filterState.serverTypeFilter.charAt(0).toUpperCase() + filterState.serverTypeFilter.slice(1)} Servers`}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

AnalyticsChart.displayName = 'AnalyticsChart';