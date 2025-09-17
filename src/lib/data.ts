import { AnalyticsDataPoint } from '@/types';

// Cache for loaded data
let cachedData: AnalyticsDataPoint[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Mock data for development and testing
const generateMockData = (): AnalyticsDataPoint[] => {
  const data: AnalyticsDataPoint[] = [];
  const now = new Date();
  
  for (let i = 168; i >= 0; i -= 6) { // Last 7 days, every 6 hours
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseCount = 45 + Math.floor(i / 24) * 2; // Growth over time
    const noise = Math.floor(Math.random() * 5);
    
    const total = baseCount + noise;
    const local = Math.floor(total * 0.6);
    const remote = total - local;
    
    data.push({
      timestamp: timestamp.toISOString(),
      totalCount: total,
      localCount: local,
      remoteCount: remote,
      uniqueCount: total // Assuming unique = total for simplicity
    });
  }
  
  return data;
};

export async function loadAnalyticsData(): Promise<AnalyticsDataPoint[]> {
  // Check cache first
  const now = Date.now();
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedData;
  }
  
  let data: AnalyticsDataPoint[];
  
  try {
    // Try to fetch the JSON data from the public directory
    const response = await fetch('/data/analytics.json');
    
    if (response.ok) {
      data = await response.json();
    } else {
      console.warn('Could not load analytics.json, using mock data');
      data = generateMockData();
    }
  } catch (error) {
    console.warn('Error loading analytics data, using mock data:', error);
    data = generateMockData();
  }

  // Cache the data
  cachedData = data;
  cacheTimestamp = now;
  
  return data;
}

export function validateDataIntegrity(data: AnalyticsDataPoint[]): AnalyticsDataPoint[] {
  return data.filter(point => {
    // Validate data integrity constraints
    const isValid = 
      point.totalCount >= point.localCount &&
      point.totalCount >= point.remoteCount &&
      point.uniqueCount <= point.totalCount &&
      point.localCount >= 0 &&
      point.remoteCount >= 0 &&
      point.totalCount >= 0 &&
      point.uniqueCount >= 0;
    
    if (!isValid) {
      console.warn('Invalid data point filtered out:', point);
    }
    
    return isValid;
  });
}