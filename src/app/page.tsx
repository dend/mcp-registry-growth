'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LazyAnalyticsChart } from '@/components/charts/LazyAnalyticsChart';
import { FilterControls } from '@/components/filters/FilterControls';
import { LoadingState, ChartLoading } from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsDataPoint, FilterState, ChartDataPoint, ChartTheme } from '@/types';
import { loadAnalyticsData } from '@/lib/data';
import { aggregateByGranularity, filterByServerType, filterByDateRange } from '@/lib/data-transforms';
import { prepareChartData, generateMockData } from '@/lib/chart-utils';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<FilterState>(() => {
    const now = new Date();
    // Set date range to cover all our CSV data (August 1 to September 16, 2025)
    const startDate = new Date('2025-08-01T00:00:00.000Z');
    
    return {
      serverTypeFilter: 'all',
      timeGranularity: 'daily',
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    };
  });

  // Define theme for chart
  const chartTheme: ChartTheme = {
    primary: '#8B5CF6',
    secondary: '#3B82F6',
    accent: '#EC4899',
    background: '#0f172a',
    text: '#f8fafc'
  };

  // Load data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Try to load real data, fall back to mock data
        let analyticsData: AnalyticsDataPoint[];
        try {
          analyticsData = await loadAnalyticsData();
        } catch (loadError) {
          console.warn('Failed to load real data, using mock data:', loadError);
          analyticsData = generateMockData(24 * 7); // 7 days of hourly data
        }
        
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Process data based on current filters
  const processedData = useMemo(() => {
    if (data.length === 0) return [];
    
    let filtered = filterByDateRange(data, filterState.dateRange.start, filterState.dateRange.end);
    filtered = filterByServerType(filtered, filterState.serverTypeFilter);
    
    const aggregated = aggregateByGranularity(filtered, filterState.timeGranularity);
    
    return aggregated;
  }, [data, filterState]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (processedData.length === 0) {
      return { current: 0, growth: 0, trend: 'stable' as const };
    }
    
    const latest = processedData[processedData.length - 1];
    const earliest = processedData[0];
    
    // Get count based on filter type
    let latestCount: number, earliestCount: number;
    switch (filterState.serverTypeFilter) {
      case 'local':
        latestCount = latest.localCount;
        earliestCount = earliest.localCount;
        break;
      case 'remote':
        latestCount = latest.remoteCount;
        earliestCount = earliest.remoteCount;
        break;
      case 'all':
      default:
        latestCount = latest.totalCount;
        earliestCount = earliest.totalCount;
        break;
    }
    
    const growth = latestCount - earliestCount;
    const growthPercent = earliestCount > 0 ? (growth / earliestCount) * 100 : 0;
    
    return {
      current: latestCount,
      growth: growthPercent,
      trend: growth > 0 ? 'up' as const : growth < 0 ? 'down' as const : 'stable' as const
    };
  }, [processedData, filterState.serverTypeFilter]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            MCP Registry Analytics
          </h1>
          <p className="text-muted-foreground">
            Tracking Model Context Protocol server growth
          </p>
        </div>
        <LoadingState message="Loading analytics data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            MCP Registry Analytics
          </h1>
          <p className="text-muted-foreground">
            Tracking Model Context Protocol server growth
          </p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>
              We encountered an issue while loading the analytics data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <section aria-label="Summary statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Current Total
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" aria-label={`Current total: ${summaryStats.current.toLocaleString()} servers`}>
                {summaryStats.current.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {filterState.serverTypeFilter === 'all' ? 'Total servers' : 
                 filterState.serverTypeFilter === 'local' ? 'Local servers' : 'Remote servers'}
              </p>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Growth Rate
            </p>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              summaryStats.trend === 'up' ? 'text-green-500' : 
              summaryStats.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {summaryStats.growth > 0 ? '+' : ''}{summaryStats.growth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Since period start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Data Points
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {processedData.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filterState.timeGranularity} intervals
            </p>
          </CardContent>
        </Card>
      </div>
      </section>

      {/* Filters */}
      <section aria-label="Data filters">
        <FilterControls
          currentState={filterState}
          onFilterChange={handleFilterChange}
        />
      </section>

      {/* Main Chart */}
      <section aria-label="Analytics chart">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Server Growth Over Time</h2>
            <CardDescription>
              {filterState.serverTypeFilter === 'all' ? 'Total server count' : 
               filterState.serverTypeFilter === 'local' ? 'Local server count' : 'Remote server count'} 
              {' '}aggregated by {filterState.timeGranularity} intervals
            </CardDescription>
          </CardHeader>
        <CardContent>
          {processedData.length === 0 ? (
            <div className="h-96 flex items-center justify-center border rounded-lg bg-muted/5">
              <div className="text-center">
                <p className="text-lg font-medium text-muted-foreground">No data available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or check back later
                </p>
              </div>
            </div>
          ) : (
            <LazyAnalyticsChart 
              data={processedData}
              filterState={filterState}
              theme={chartTheme}
              height={400}
            />
          )}
        </CardContent>
      </Card>
      </section>

      {/* Data Info */}
      <section aria-label="Data information">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold leading-none tracking-tight">About This Data</h2>
          </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This dashboard tracks the growth of servers in the Model Context Protocol (MCP) registry.
            Data is collected hourly from the official registry and aggregated for analysis.
          </p>
          <p>
            <strong>Local servers:</strong> Servers that run locally on the user&apos;s machine.
            <br />
            <strong>Remote servers:</strong> Servers that are accessed over the network.
          </p>
          <p>
            Use the filters above to customize the view by server type, time granularity, and date range.
          </p>
        </CardContent>
      </Card>
      </section>
    </div>
  );
}