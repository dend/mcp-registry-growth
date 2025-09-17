import { 
  aggregateByGranularity, 
  filterByServerType, 
  filterByDateRange,
  clearAggregationCache
} from '@/lib/data-transforms';
import { AnalyticsDataPoint, TimeGranularity, ServerType } from '@/types';

const mockHourlyData: AnalyticsDataPoint[] = [
  {
    timestamp: '2025-09-16T10:00:00.000Z',
    localCount: 100,
    remoteCount: 50,
    totalCount: 160,
    uniqueCount: 150
  },
  {
    timestamp: '2025-09-16T11:00:00.000Z',
    localCount: 102,
    remoteCount: 51,
    totalCount: 163,
    uniqueCount: 153
  },
  {
    timestamp: '2025-09-16T12:00:00.000Z',
    localCount: 105,
    remoteCount: 52,
    totalCount: 167,
    uniqueCount: 157
  }
];

describe('Data Transformation Utilities Contract', () => {
  describe('aggregateByGranularity', () => {
    test('should aggregate hourly data to daily', () => {
      const result = aggregateByGranularity(mockHourlyData, 'daily');
      
      expect(result).toHaveLength(1); // Should consolidate to one day
      expect(result[0].timestamp).toBe('2025-09-16T00:00:00.000Z');
      
      // Should use latest (most recent) values for the day
      expect(result[0].localCount).toBe(105);  // Latest value (12:00)
      expect(result[0].remoteCount).toBe(52);   // Latest value (12:00)
      expect(result[0].totalCount).toBe(167);   // Latest value (12:00)
      expect(result[0].uniqueCount).toBe(157);  // Latest value (12:00)
    });

    test('should aggregate hourly data to weekly', () => {
      const result = aggregateByGranularity(mockHourlyData, 'weekly');
      
      expect(result).toHaveLength(1);
      // Should align to start of week
      expect(result[0].timestamp).toMatch(/T00:00:00.000Z$/);
    });

    test('should aggregate hourly data to monthly', () => {
      const result = aggregateByGranularity(mockHourlyData, 'monthly');
      
      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBe('2025-09-01T00:00:00.000Z');
    });

    test('should return original data for same granularity', () => {
      const result = aggregateByGranularity(mockHourlyData, 'hourly');
      
      expect(result).toEqual(mockHourlyData);
    });

    test('should handle empty data array', () => {
      const result = aggregateByGranularity([], 'daily');
      
      expect(result).toEqual([]);
    });

    test('should use latest value, not maximum value when aggregating', () => {
      // Clear cache to ensure fresh aggregation
      clearAggregationCache();
      
      // Create data where the latest value is NOT the maximum
      const testData: AnalyticsDataPoint[] = [
        {
          timestamp: '2025-09-16T10:00:00.000Z',
          localCount: 100,
          remoteCount: 50,
          totalCount: 150,
          uniqueCount: 140
        },
        {
          timestamp: '2025-09-16T11:00:00.000Z',
          localCount: 120, // Higher values (maximum)
          remoteCount: 70,
          totalCount: 190,
          uniqueCount: 180
        },
        {
          timestamp: '2025-09-16T12:00:00.000Z',
          localCount: 110, // Latest but not maximum
          remoteCount: 60,
          totalCount: 170,
          uniqueCount: 160
        }
      ];

      const result = aggregateByGranularity(testData, 'daily');
      
      expect(result).toHaveLength(1);
      // Should use latest values (12:00), not maximum values (11:00)
      expect(result[0].localCount).toBe(110);  // Latest, not 120 (max)
      expect(result[0].remoteCount).toBe(60);   // Latest, not 70 (max)
      expect(result[0].totalCount).toBe(170);   // Latest, not 190 (max)
      expect(result[0].uniqueCount).toBe(160);  // Latest, not 180 (max)
    });
  });

  describe('filterByServerType', () => {
    test('should return all data for "all" filter', () => {
      const result = filterByServerType(mockHourlyData, 'all');
      
      expect(result).toEqual(mockHourlyData);
    });

    test('should filter to show only local server data', () => {
      const result = filterByServerType(mockHourlyData, 'local');
      
      expect(result).toHaveLength(3);
      result.forEach(point => {
        expect(point.localCount).toBeGreaterThan(0);
        // When filtering by local, should show localCount as main count
        expect(point).toHaveProperty('localCount');
      });
    });

    test('should filter to show only remote server data', () => {
      const result = filterByServerType(mockHourlyData, 'remote');
      
      expect(result).toHaveLength(3);
      result.forEach(point => {
        expect(point.remoteCount).toBeGreaterThan(0);
        // When filtering by remote, should show remoteCount as main count
        expect(point).toHaveProperty('remoteCount');
      });
    });

    test('should handle empty data array', () => {
      const result = filterByServerType([], 'local');
      
      expect(result).toEqual([]);
    });
  });

  describe('filterByDateRange', () => {
    test('should filter data within date range', () => {
      const startDate = '2025-09-16T10:30:00.000Z';
      const endDate = '2025-09-16T11:30:00.000Z';
      
      const result = filterByDateRange(mockHourlyData, startDate, endDate);
      
      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBe('2025-09-16T11:00:00.000Z');
    });

    test('should include boundary dates correctly', () => {
      const startDate = '2025-09-16T10:00:00.000Z';
      const endDate = '2025-09-16T12:00:00.000Z';
      
      const result = filterByDateRange(mockHourlyData, startDate, endDate);
      
      expect(result).toHaveLength(3);
    });

    test('should return empty array when no data in range', () => {
      const startDate = '2025-09-17T00:00:00.000Z';
      const endDate = '2025-09-17T23:59:59.999Z';
      
      const result = filterByDateRange(mockHourlyData, startDate, endDate);
      
      expect(result).toEqual([]);
    });

    test('should handle invalid date range gracefully', () => {
      const startDate = '2025-09-16T12:00:00.000Z';
      const endDate = '2025-09-16T10:00:00.000Z'; // end before start
      
      const result = filterByDateRange(mockHourlyData, startDate, endDate);
      
      expect(result).toEqual([]);
    });

    test('should handle empty data array', () => {
      const result = filterByDateRange([], '2025-09-16T00:00:00.000Z', '2025-09-16T23:59:59.999Z');
      
      expect(result).toEqual([]);
    });
  });

  describe('Data transformation edge cases', () => {
    test('should preserve data integrity through transformations', () => {
      let data = mockHourlyData;
      
      // Apply multiple transformations
      data = filterByServerType(data, 'local');
      data = filterByDateRange(data, '2025-09-16T00:00:00.000Z', '2025-09-16T23:59:59.999Z');
      data = aggregateByGranularity(data, 'daily');
      
      // Should still be valid data
      expect(Array.isArray(data)).toBe(true);
      data.forEach(point => {
        expect(point.localCount).toBeGreaterThanOrEqual(0);
        expect(point.remoteCount).toBeGreaterThanOrEqual(0);
        expect(point.totalCount).toBeGreaterThanOrEqual(0);
        expect(point.uniqueCount).toBeGreaterThanOrEqual(0);
      });
    });
  });
});