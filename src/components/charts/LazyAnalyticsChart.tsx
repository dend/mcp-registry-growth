'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AnalyticsDataPoint, FilterState, ChartTheme } from '@/types';
import { cn } from '@/lib/utils';

// Dynamically import the AnalyticsChart for better code splitting
const AnalyticsChart = dynamic(
  () => import('./AnalyticsChart').then(mod => ({ default: mod.AnalyticsChart })),
  {
    ssr: false,
    loading: () => <ChartLoadingFallback />
  }
);

interface LazyAnalyticsChartProps {
  data: AnalyticsDataPoint[];
  filterState: FilterState;
  theme: ChartTheme;
  className?: string;
  height?: number;
  isLoading?: boolean;
  onClick?: (dataPoint: AnalyticsDataPoint) => void;
}

// Optimized loading component
function ChartLoadingFallback() {
  return (
    <div 
      className="flex items-center justify-center border rounded-lg bg-card"
      style={{ height: 400 }}
      role="status"
      aria-label="Loading chart"
    >
      <div className="text-center">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
        </div>
        <p className="text-lg font-medium text-muted-foreground mt-2">
          Loading chart...
        </p>
      </div>
    </div>
  );
}

export function LazyAnalyticsChart(props: LazyAnalyticsChartProps) {
  return (
    <Suspense fallback={<ChartLoadingFallback />}>
      <AnalyticsChart {...props} />
    </Suspense>
  );
}