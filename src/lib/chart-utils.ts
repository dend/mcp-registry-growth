import { AnalyticsDataPoint, FilterState, TimeGranularity, ChartDataPoint } from '@/types';

export function prepareChartData(
  data: AnalyticsDataPoint[],
  filterState: FilterState
): ChartDataPoint[] {
  if (data.length === 0) return [];
  
  return data.map(point => {
    let count: number;
    let type: "local" | "remote" | "total";
    
    switch (filterState.serverTypeFilter) {
      case 'local':
        count = point.localCount;
        type = 'local';
        break;
      case 'remote':
        count = point.remoteCount;
        type = 'remote';
        break;
      case 'all':
      default:
        count = point.totalCount;
        type = 'total';
        break;
    }
    
    return {
      date: formatDateForGranularity(point.timestamp, filterState.timeGranularity),
      count,
      timestamp: point.timestamp,
      type
    };
  });
}

export function formatDateForGranularity(
  timestamp: string,
  granularity: TimeGranularity
): string {
  const date = new Date(timestamp);
  
  switch (granularity) {
    case 'hourly':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        hour12: true
      });
      
    case 'daily':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
    case 'weekly':
      const endOfWeek = new Date(date);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      
    case 'monthly':
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
      
    default:
      return date.toLocaleDateString('en-US');
  }
}

export function getChartConfig() {
  return {
    colors: {
      primary: '#8B5CF6',   // Purple
      secondary: '#3B82F6', // Blue
      accent: '#EC4899',    // Pink
      background: '#0f172a',
      text: '#f8fafc',
      grid: '#334155'
    },
    responsive: {
      mobile: 320,
      tablet: 768,
      desktop: 1024
    }
  };
}

export function calculateYAxisDomain(data: ChartDataPoint[]): [number, number] {
  if (data.length === 0) return [0, 100];
  
  const counts = data.map(d => d.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  
  // Add some padding
  const padding = (max - min) * 0.1;
  return [Math.max(0, min - padding), max + padding];
}

export function formatTooltipValue(value: number, dataKey: string): string {
  const typeLabel = {
    local: 'Local Servers',
    remote: 'Remote Servers',
    total: 'Total Servers',
    count: 'Server Count'
  }[dataKey] || 'Servers';
  
  return `${value.toLocaleString()}`;
}

export function generateMockData(hours: number = 24): AnalyticsDataPoint[] {
  const data: AnalyticsDataPoint[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
    const baseLocal = 100 + Math.floor(Math.random() * 50);
    const baseRemote = 50 + Math.floor(Math.random() * 30);
    const bothCount = Math.floor(Math.random() * 10);
    
    data.push({
      timestamp: timestamp.toISOString(),
      localCount: baseLocal + bothCount,
      remoteCount: baseRemote + bothCount,
      totalCount: baseLocal + baseRemote + bothCount,
      uniqueCount: baseLocal + baseRemote
    });
  }
  
  return data;
}