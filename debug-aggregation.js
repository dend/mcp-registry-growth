// Debug script to test aggregation
const { aggregateByGranularity } = require('./src/lib/data-transforms.ts');

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
  }
];

console.log('Original data:', testData.length, 'points');
console.log('Daily aggregation:', aggregateByGranularity(testData, 'daily').length, 'points');
console.log('Weekly aggregation:', aggregateByGranularity(testData, 'weekly').length, 'points');