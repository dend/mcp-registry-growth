import { aggregateByGranularity } from '../src/lib/data-transforms';

// Test data based on our CSV
const testData = [
  {
    timestamp: '2025-08-01T00:00:00.000Z',
    localCount: 85,
    remoteCount: 40,
    totalCount: 125,
    uniqueCount: 120
  },
  {
    timestamp: '2025-08-01T12:00:00.000Z',
    localCount: 86,
    remoteCount: 40,
    totalCount: 126,
    uniqueCount: 121
  },
  {
    timestamp: '2025-08-02T00:00:00.000Z',
    localCount: 87,
    remoteCount: 41,
    totalCount: 128,
    uniqueCount: 123
  },
  {
    timestamp: '2025-08-03T00:00:00.000Z',
    localCount: 88,
    remoteCount: 41,
    totalCount: 129,
    uniqueCount: 124
  }
];

console.log('Original data points:', testData.length);
console.log('Original timestamps:', testData.map(d => d.timestamp));

const hourlyAgg = aggregateByGranularity(testData, 'hourly');
console.log('\nHourly aggregation points:', hourlyAgg.length);
console.log('Hourly timestamps:', hourlyAgg.map(d => d.timestamp));

const dailyAgg = aggregateByGranularity(testData, 'daily');
console.log('\nDaily aggregation points:', dailyAgg.length);
console.log('Daily timestamps:', dailyAgg.map(d => d.timestamp));
console.log('Daily data:', dailyAgg.map(d => ({ timestamp: d.timestamp, total: d.totalCount })));

const weeklyAgg = aggregateByGranularity(testData, 'weekly');
console.log('\nWeekly aggregation points:', weeklyAgg.length);
console.log('Weekly timestamps:', weeklyAgg.map(d => d.timestamp));