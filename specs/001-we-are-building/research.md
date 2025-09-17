# Research: MCP Server Analytics Dashboard

**Feature**: 001-we-are-building  
**Date**: 2025-09-16  
**Phase**: 0 - Technology Research & Patterns

## Research Findings

### Next.js Static Export for CSV Data Consumption

**Decision**: Use Next.js 14+ App Router with static export and build-time data loading

**Rationale**: 
- Next.js static export generates pure HTML/CSS/JS files, aligning with constitution's static site requirement
- App Router provides better data loading patterns for build-time CSV consumption
- Built-in performance optimizations for static sites
- Excellent TypeScript support for type-safe data handling

**Implementation Pattern**:
```typescript
// In lib/data.ts - build-time data loading
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function loadMCPData() {
  const csvPath = path.join(process.cwd(), 'data', 'mcp-servers.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  return parse(csvContent, { columns: true, skip_empty_lines: true });
}
```

**Alternatives Considered**:
- Vanilla React SPA: Rejected due to lack of build-time optimization
- Vite static site: Rejected due to less mature ecosystem for this use case
- Astro: Rejected due to additional learning curve and framework complexity

### ShadCN Dark Theme with Purple/Blue/Pink Colors

**Decision**: Use ShadCN/UI with custom dark theme using CSS variables and Tailwind CSS

**Rationale**:
- ShadCN provides accessible, well-tested components out of the box
- Built-in dark mode support with CSS variables
- Minimal bundle size impact (only import used components)
- Excellent TypeScript support and documentation

**Implementation Pattern**:
```css
/* In globals.css */
@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 262.1 83.3% 57.8%; /* Purple */
    --secondary: 215.4 16.3% 26.9%; /* Blue */
    --accent: 330 81% 60%; /* Pink */
  }
}
```

**Color Scheme**:
- Primary: Purple (#8B5CF6) - Main interactive elements
- Secondary: Blue (#3B82F6) - Secondary actions and accents  
- Accent: Pink (#EC4899) - Highlights and data visualization
- Background: Dark slate for main areas
- Text: High contrast whites and grays

**Alternatives Considered**:
- Chakra UI: Rejected due to larger bundle size
- Material UI: Rejected due to Material Design constraints
- Custom CSS: Rejected due to accessibility and maintenance concerns

### Recharts Time-Series Visualization

**Decision**: Use Recharts library for responsive time-series charts with granularity switching

**Rationale**:
- Built specifically for React with excellent TypeScript support
- Responsive by default with configurable breakpoints
- Built-in accessibility features (ARIA labels, keyboard navigation)
- Supports complex time-series data transformations
- Minimal performance impact with proper data memoization

**Implementation Pattern**:
```typescript
// Chart component with granularity switching
const TimeSeriesChart = ({ data, granularity, filterType }) => {
  const processedData = useMemo(() => 
    aggregateByGranularity(data, granularity, filterType), 
    [data, granularity, filterType]
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={processedData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#8B5CF6" />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

**Alternatives Considered**:
- Chart.js: Rejected due to imperative API not fitting React patterns
- D3.js: Rejected due to complexity and development time
- Victory: Rejected due to larger bundle size and less active maintenance

### PowerShell API Pagination Pattern

**Decision**: Use recursive PowerShell function with cursor-based pagination

**Rationale**:
- PowerShell native JSON handling simplifies API consumption
- Recursive pattern handles unknown page count elegantly
- Error handling and retry logic can be built in
- Windows GitHub Actions runner provides PowerShell by default

**Implementation Pattern**:
```powershell
function Get-AllMCPServers {
    param([string]$Cursor = $null)
    
    $url = "https://registry.modelcontextprotocol.io/v0/servers"
    if ($Cursor) { $url += "?cursor=$Cursor" }
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET
        $allServers = @($response.servers)
        
        if ($response.metadata.next_cursor) {
            $allServers += Get-AllMCPServers -Cursor $response.metadata.next_cursor
        }
        
        return $allServers
    }
    catch {
        Write-Error "Failed to fetch MCP servers: $_"
        throw
    }
}
```

**Alternatives Considered**:
- Python script: Rejected due to Windows runner setup complexity
- Node.js script: Rejected due to additional runtime dependencies
- Bash script: Not available on Windows runners

### GitHub Actions Windows Runner Configuration

**Decision**: Use Windows-latest runner with hourly cron schedule and artifact storage

**Rationale**:
- PowerShell available by default on Windows runners
- Consistent execution environment
- Built-in artifact storage for CSV files
- Cron scheduling for hourly data collection

**Implementation Pattern**:
```yaml
name: Collect MCP Data
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:      # Manual trigger for testing

jobs:
  collect-data:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Data Collection
        run: .\scripts\Collect-MCPData.ps1
      - name: Commit and Push
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/mcp-servers.csv
          git commit -m "Update MCP server data" || exit 0
          git push
```

**Alternatives Considered**:
- Ubuntu runner with PowerShell Core: Rejected for simplicity
- Manual data updates: Rejected due to automation requirements
- Database storage: Rejected due to static site architecture requirement

## Data Processing Strategy

**Server Classification Logic**:
```typescript
function classifyServer(server: MCPServer): 'local' | 'remote' | 'both' {
  const hasRemotes = server.remotes && server.remotes.length > 0;
  const hasPackages = server.packages && server.packages.length > 0;
  
  if (hasRemotes && hasPackages) return 'both';
  if (hasRemotes) return 'remote';
  return 'local'; // Default for servers with packages or neither
}
```

**Time Granularity Aggregation**:
- Hourly: Direct timestamp grouping by hour
- Daily: Group by date, sum hourly counts
- Weekly: Group by week start date, sum daily counts  
- Monthly: Group by month start date, sum weekly counts

**CSV Output Format**:
```csv
timestamp,local_count,remote_count,total_count,granularity
2025-09-16T14:00:00Z,150,75,225,hourly
2025-09-16T15:00:00Z,152,76,228,hourly
```

## Performance Considerations

**Build-Time Optimizations**:
- CSV parsing only at build time, not client-side
- Data pre-aggregation for all granularities to avoid client-side computation
- Component code splitting for chart libraries
- Image optimization for any dashboard graphics

**Runtime Optimizations**:
- React.memo for chart components
- useMemo for data transformations
- Debounced filter updates to prevent excessive re-renders
- Lazy loading for non-critical components

## Accessibility Requirements

**Chart Accessibility**:
- ARIA labels for all chart elements
- Keyboard navigation support
- Screen reader compatible data tables as fallback
- High contrast mode support
- Focus indicators for interactive elements

**Responsive Design**:
- Mobile-first breakpoints: 320px, 768px, 1024px, 1280px
- Touch targets minimum 44px
- Horizontal scrolling for large data tables on mobile
- Collapsible filters on smaller screens

---

**Research Status**: ✅ Complete  
**Next Phase**: Design & Contracts (Phase 1)