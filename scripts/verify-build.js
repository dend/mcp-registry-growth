#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Validates that the production build meets all requirements
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying production build...\n');

let passed = 0;
let failed = 0;

function check(description, condition) {
  if (condition) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.log(`❌ ${description}`);
    failed++;
  }
}

// Check that out directory exists
const outDir = path.join(__dirname, '..', 'out');
check('Static export directory exists', fs.existsSync(outDir));

// Check for required files
const requiredFiles = [
  'index.html',
  '_next/static',
  'data/analytics.json'
];

requiredFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  check(`Required file/directory exists: ${file}`, fs.existsSync(filePath));
});

// Check that index.html contains expected content
if (fs.existsSync(path.join(outDir, 'index.html'))) {
  const indexContent = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
  check('Index.html contains dashboard title', 
    indexContent.includes('MCP Registry') || 
    indexContent.includes('MCP Analytics') ||
    indexContent.includes('Registry Analytics'));
  check('Index.html contains proper meta tags', indexContent.includes('<meta name="description"'));
  check('Index.html has proper charset', 
    indexContent.includes('charSet="utf-8"') || 
    indexContent.includes('charset="utf-8"') ||
    indexContent.includes('charset=utf-8'));
}

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
check('Build script exists', packageJson.scripts && packageJson.scripts.build);
check('Start script exists', packageJson.scripts && packageJson.scripts.start);
check('Test script exists', packageJson.scripts && packageJson.scripts.test);

// Check for analytics data
const analyticsPath = path.join(outDir, 'data', 'analytics.json');
if (fs.existsSync(analyticsPath)) {
  try {
    const analyticsData = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
    check('Analytics data is valid JSON', true);
    check('Analytics data contains records', Array.isArray(analyticsData) && analyticsData.length > 0);
  } catch (e) {
    check('Analytics data is valid JSON', false);
  }
}

// Summary
console.log(`\n📊 Verification Summary:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! Ready for deployment.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please fix issues before deploying.');
  process.exit(1);
}