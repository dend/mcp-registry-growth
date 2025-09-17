# Quickstart Guide: MCP Server Analytics Dashboard

**Feature**: 001-we-are-building  
**Purpose**: Verify implementation meets functional requirements through step-by-step testing  
**Prerequisites**: Completed implementation of all tasks from tasks.md

## Environment Setup

### 1. Repository Clone and Dependencies
```bash
# Clone the repository
git checkout 001-we-are-building

# Install dependencies
npm install

# Verify all required packages are installed
npm list next @shadcn/ui recharts tailwindcss typescript
```

**Expected Result**: All dependencies installed without errors, versions compatible with package.json

### 2. Development Environment
```bash
# Start development server
npm run dev

# Verify server starts on port 3000
```
**Expected Result**: Server starts successfully, accessible at http://localhost:3000

### 3. Build Process Test
```bash
# Test static export build
npm run build

# Verify static files generated
ls out/  # Should contain HTML, CSS, JS files
```
**Expected Result**: Static site builds successfully, generates `out/` directory with static assets

## Data Pipeline Verification

### 4. Sample Data Setup
```bash
# Create sample CSV data for testing
mkdir -p data
cat > data/mcp-servers.csv << 'EOF'
timestamp,local_count,remote_count,total_count,unique_count,collection_time
2025-09-16T10:00:00.000Z,100,50,160,150,2025-09-16T10:05:30.123Z
2025-09-16T11:00:00.000Z,102,51,163,153,2025-09-16T11:05:28.456Z
2025-09-16T12:00:00.000Z,105,52,167,157,2025-09-16T12:05:32.789Z
2025-09-16T13:00:00.000Z,108,54,172,162,2025-09-16T13:05:29.012Z
EOF
```

### 5. PowerShell Script Test
```powershell
# Test data collection script (if available)
.\scripts\Collect-MCPData.ps1 -OutputPath "data/test-output.csv" -Verbose

# Verify output format
Get-Content "data/test-output.csv" | Select-Object -First 2
```
**Expected Result**: Script executes successfully, generates properly formatted CSV with header

### 6. GitHub Actions Simulation
```bash
# Test workflow locally (if using act or similar)
# Or verify workflow file syntax
cat .github/workflows/data-aggregation.yml
```
**Expected Result**: Workflow file is valid YAML with correct job definitions

## User Interface Testing

### 7. Dashboard Page Load
1. Navigate to http://localhost:3000
2. Wait for page to fully load

**Verification Checklist**:
- [ ] Page loads without JavaScript errors
- [ ] Dark theme is applied correctly
- [ ] Purple/blue/pink color scheme is visible
- [ ] Charts render with sample data
- [ ] Filter controls are visible and interactive
- [ ] Last updated timestamp is displayed

### 8. Chart Functionality
**Test Time-Series Chart**:
1. Verify chart displays with X-axis showing dates, Y-axis showing counts
2. Hover over data points to see tooltips
3. Verify chart is responsive on mobile screen sizes

**Expected Results**:
- [ ] Chart renders correctly with sample data
- [ ] Tooltips show accurate data point information
- [ ] Chart scales appropriately on different screen sizes
- [ ] Accessibility: Chart announces changes to screen readers

### 9. Filter Controls Testing
**Server Type Filter**:
1. Click "All" button - verify chart shows total counts
2. Click "Local" button - verify chart shows only local server counts
3. Click "Remote" button - verify chart shows only remote server counts

**Time Granularity Filter**:
1. Select "Hourly" - verify hourly data points displayed
2. Select "Daily" - verify data aggregated by day
3. Select "Weekly" - verify data aggregated by week
4. Select "Monthly" - verify data aggregated by month

**Expected Results**:
- [ ] Server type filters update chart data correctly
- [ ] Granularity changes re-aggregate data appropriately
- [ ] Filter state persists during interactions
- [ ] Loading states shown during filter changes
- [ ] URL updates reflect current filter state (if implemented)

### 10. About Page Navigation
1. Navigate to /about or click About link
2. Verify page content and navigation back to dashboard

**Verification Checklist**:
- [ ] About page loads successfully
- [ ] Content explains dashboard purpose and data sources
- [ ] Navigation back to dashboard works
- [ ] Page maintains dark theme consistency
- [ ] Mobile responsive design

## Responsive Design Testing

### 11. Mobile Device Simulation
Use browser dev tools to test different screen sizes:

**Mobile (320px - 767px)**:
- [ ] Chart adjusts to mobile screen width
- [ ] Filter controls stack vertically or use mobile-friendly layout
- [ ] Touch targets are at least 44px
- [ ] Text remains readable
- [ ] No horizontal scrolling required

**Tablet (768px - 1023px)**:
- [ ] Layout adapts to tablet screen size
- [ ] Chart utilizes available width effectively
- [ ] Filter controls remain accessible

**Desktop (1024px+)**:
- [ ] Full desktop layout displays correctly
- [ ] Chart and filters use horizontal space efficiently
- [ ] All interactive elements are easily accessible

### 12. Performance Testing
```bash
# Build production version
npm run build
npm run start

# Test lighthouse scores (if lighthouse CLI available)
lighthouse http://localhost:3000 --only-categories=performance,accessibility --chrome-flags="--headless"
```

**Performance Targets**:
- [ ] First Contentful Paint < 2 seconds
- [ ] Largest Contentful Paint < 2.5 seconds  
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3 seconds

## Accessibility Testing

### 13. Keyboard Navigation
1. Use Tab key to navigate through all interactive elements
2. Use arrow keys within chart area (if implemented)
3. Use Enter/Space to activate buttons and controls

**Verification Checklist**:
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are clearly visible
- [ ] Tab order is logical and intuitive
- [ ] Chart data can be accessed via keyboard
- [ ] Skip links available for screen readers

### 14. Screen Reader Testing
If available, test with NVDA, JAWS, or VoiceOver:

**Verification Checklist**:
- [ ] Page structure is announced correctly
- [ ] Chart data is accessible via data table fallback
- [ ] Filter changes are announced
- [ ] Button labels are descriptive
- [ ] Form controls have proper labels

## Error Handling Testing

### 15. Empty Data State
```bash
# Test with empty CSV file
echo "timestamp,local_count,remote_count,total_count,unique_count,collection_time" > data/mcp-servers.csv
```

**Expected Results**:
- [ ] Dashboard displays "no data available" message
- [ ] Charts show empty state gracefully
- [ ] No JavaScript errors in console
- [ ] User can still interact with controls

### 16. Malformed Data Test
```bash
# Test with invalid CSV data
echo "invalid,csv,data" > data/mcp-servers.csv
```

**Expected Results**:
- [ ] Application handles invalid data gracefully
- [ ] Error message displayed to user
- [ ] Fallback to empty state or previous valid data
- [ ] No application crash

### 17. Network Connectivity
Simulate network issues in browser dev tools:

**Expected Results**:
- [ ] Static assets load correctly (no network dependency)
- [ ] Application functions normally offline
- [ ] No broken functionality due to network issues

## Data Accuracy Testing

### 18. Data Processing Verification
Using the sample data, manually verify calculations:

**Sample Data Analysis**:
- Hour 13:00: 108 local, 54 remote, 172 total, 162 unique
- Verify: total_count ≥ local_count + remote_count (accounts for "both" classification)
- Verify: unique_count ≤ total_count

**Filter Accuracy**:
- [ ] "Local" filter shows correct subset of data
- [ ] "Remote" filter shows correct subset of data  
- [ ] "All" filter shows complete dataset
- [ ] Granularity changes aggregate data correctly

## Integration Testing

### 19. End-to-End User Journey
**Complete User Flow**:
1. User visits dashboard homepage
2. Views default chart with hourly data showing all servers
3. Changes filter to show only local servers
4. Changes granularity to daily view
5. Navigates to about page
6. Returns to dashboard (state should persist)

**Success Criteria**:
- [ ] All steps complete without errors
- [ ] User can accomplish primary goals (view trends, filter data)
- [ ] Interface is intuitive and responsive
- [ ] Performance remains acceptable throughout journey

### 20. Cross-Browser Testing
Test in multiple browsers:
- [ ] Chrome/Chromium - all functionality works
- [ ] Firefox - all functionality works  
- [ ] Safari - all functionality works
- [ ] Edge - all functionality works

## Deployment Testing

### 21. Static Site Deployment
```bash
# Test static export
npm run build

# Verify all required files present
find out/ -name "*.html" -o -name "*.css" -o -name "*.js" | head -10

# Test serving static files
npx serve out/
```

**Verification**:
- [ ] Static site serves correctly from `out/` directory
- [ ] All routes work without server-side rendering
- [ ] Assets load with correct MIME types
- [ ] No 404 errors for required resources

### 22. GitHub Actions Integration
If GitHub Actions workflow is available:
1. Create a test branch
2. Trigger workflow manually or wait for hourly run
3. Verify CSV file is updated
4. Verify commit is created with data changes

**Expected Results**:
- [ ] Workflow executes successfully
- [ ] CSV file is updated with new data
- [ ] Git commit contains data changes
- [ ] No workflow errors or failures

## Success Criteria Summary

**Core Functionality** (Must Pass All):
- [ ] Dashboard loads and displays charts
- [ ] Filters work correctly (server type and granularity)
- [ ] Responsive design works on all screen sizes  
- [ ] Dark theme with purple/blue/pink colors applied
- [ ] About page accessible and informative
- [ ] Static site builds and deploys successfully

**Performance & Accessibility** (Must Pass All):
- [ ] Core Web Vitals targets met
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatibility maintained
- [ ] Mobile-friendly interface

**Data Pipeline** (Must Pass All):
- [ ] CSV data loading works correctly
- [ ] Data aggregation functions accurately
- [ ] Error states handled gracefully
- [ ] GitHub Actions workflow functional

**Quality Assurance**:
- [ ] No JavaScript console errors
- [ ] No broken links or missing assets
- [ ] Cross-browser compatibility maintained
- [ ] Code follows TypeScript best practices

---

**Quickstart Status**: Ready for execution after implementation  
**Next Steps**: Execute /tasks command to generate implementation tasks