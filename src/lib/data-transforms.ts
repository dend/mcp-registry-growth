import { AnalyticsDataPoint, TimeGranularity, ServerType } from '@/types';

// Cache for aggregated data
const aggregationCache = new Map<string, AnalyticsDataPoint[]>();

// Generate cache key for aggregation
function getAggregationCacheKey(data: AnalyticsDataPoint[], granularity: TimeGranularity): string {
  // Create a more robust hash including all data points
  const dataHash = data.length + '_' + granularity + '_' + 
    data.map(d => `${d.timestamp}_${d.localCount}_${d.remoteCount}_${d.totalCount}_${d.uniqueCount}`).join('|');
  return dataHash;
}

// Export function to clear cache (useful for testing)
export function clearAggregationCache(): void {
  aggregationCache.clear();
}

export function aggregateByGranularity(
  data: AnalyticsDataPoint[],
  granularity: TimeGranularity
): AnalyticsDataPoint[] {
  if (data.length === 0) return [];
  
  // Check cache first
  const cacheKey = getAggregationCacheKey(data, granularity);
  if (aggregationCache.has(cacheKey)) {
    return aggregationCache.get(cacheKey)!;
  }

  const grouped = new Map<string, AnalyticsDataPoint[]>();
  
  data.forEach(point => {
    const key = getTimeKey(point.timestamp, granularity);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(point);
  });
  
  const result = Array.from(grouped.entries()).map(([timestamp, points]) => {
    // Use the latest (most recent) values for aggregation to track actual growth
    const sortedPoints = points.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const latestPoint = sortedPoints[sortedPoints.length - 1];
    
    return {
      timestamp,
      localCount: latestPoint.localCount,
      remoteCount: latestPoint.remoteCount,
      totalCount: latestPoint.totalCount,
      uniqueCount: latestPoint.uniqueCount
    };
  }).sort((a, b) => a.timestamp.localeCompare(b.timestamp));  // Cache the result
  aggregationCache.set(cacheKey, result);
  
  return result;
}

export function filterByServerType(
  data: AnalyticsDataPoint[],
  serverType: ServerType
): AnalyticsDataPoint[] {
  if (serverType === 'all') {
    return data;
  }
  
  // For filtering, we keep the structure but could highlight specific counts
  // The actual filtering logic depends on how the UI wants to display the data
  return data.map(point => ({
    ...point,
    // Could modify display logic here based on serverType
    // For now, we keep all data but mark the filter type
  }));
}

export function filterByDateRange(
  data: AnalyticsDataPoint[],
  startDate: string,
  endDate: string
): AnalyticsDataPoint[] {
  if (!startDate || !endDate) return data;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Handle invalid date range
  if (start > end) {
    return [];
  }
  
  return data.filter(point => {
    const pointDate = new Date(point.timestamp);
    return pointDate >= start && pointDate <= end;
  });
}

function getTimeKey(timestamp: string, granularity: TimeGranularity): string {
  const date = new Date(timestamp);
  
  switch (granularity) {
    case 'hourly':
      return timestamp; // Keep original hourly timestamp
      
    case 'daily':
      const daily = new Date(date);
      daily.setUTCHours(0, 0, 0, 0);
      return daily.toISOString();
      
    case 'weekly':
      const weekly = new Date(date);
      const dayOfWeek = weekly.getUTCDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekly.setUTCDate(weekly.getUTCDate() - daysToMonday);
      weekly.setUTCHours(0, 0, 0, 0);
      return weekly.toISOString();
      
    case 'monthly':
      const monthly = new Date(date);
      monthly.setUTCDate(1);
      monthly.setUTCHours(0, 0, 0, 0);
      return monthly.toISOString();
      
    default:
      return timestamp;
  }
}

export function getDateRangeForGranularity(
  granularity: TimeGranularity,
  dataPoints: AnalyticsDataPoint[]
): { start: string; end: string } {
  if (dataPoints.length === 0) {
    const now = new Date();
    return {
      start: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      end: now.toISOString()
    };
  }
  
  const timestamps = dataPoints.map(p => p.timestamp).sort();
  const start = timestamps[0];
  const end = timestamps[timestamps.length - 1];
  
  return { start, end };
}