const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Read CSV file
const csvPath = path.join(process.cwd(), 'data', 'analytics.csv');
const jsonPath = path.join(process.cwd(), 'public', 'data', 'analytics.json');

// Ensure public/data directory exists
const publicDataDir = path.dirname(jsonPath);
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

// Read and parse CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Convert to proper format
const analyticsData = records.map(record => ({
  timestamp: record.timestamp,
  totalCount: parseInt(record.totalCount, 10),
  localCount: parseInt(record.localCount, 10),
  remoteCount: parseInt(record.remoteCount, 10),
  uniqueCount: parseInt(record.uniqueCount, 10)
}));

// Write JSON file
fs.writeFileSync(jsonPath, JSON.stringify(analyticsData, null, 2));

console.log(`Converted ${records.length} records from CSV to JSON`);
console.log(`Output: ${jsonPath}`);