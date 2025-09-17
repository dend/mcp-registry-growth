# Data Model: MCP Server Analytics Dashboard

**Feature**: 001-we-are-building  
**Date**: 2025-09-16  
**Phase**: 1 - Data Structure Design

## Core Entities

### MCPServer
Represents an individual Model Context Protocol server from the registry.

**Fields**:
- `id`: string - Unique identifier from registry metadata
- `name`: string - Server name (e.g., "io.github.containers/kubernetes-mcp-server")
- `description`: string - Human-readable description
- `status`: "active" | "inactive" - Current server status
- `version`: string - Current version number
- `publishedAt`: ISO8601 timestamp - When server was first published
- `updatedAt`: ISO8601 timestamp - Last update timestamp
- `isLatest`: boolean - Whether this is the latest version
- `repositoryUrl`: string - GitHub repository URL
- `serverType`: "local" | "remote" | "both" - Classification based on packages/remotes

**Classification Logic**:
```typescript
interface MCPServer {
  name: string;
  description: string;
  status?: "active" | "inactive";
  version: string;
  repository?: {
    url: string;
    source: string;
  };
  packages?: Array<{
    registry_type: string;
    identifier: string;
    version: string;
    transport: { type: string };
  }>;
  remotes?: Array<{
    type: string;
    url: string;
  }>;
  _meta: {
    "io.modelcontextprotocol.registry/official": {
      id: string;
      published_at: string;
      updated_at: string;
      is_latest: boolean;
    };
  };
}

function classifyServerType(server: MCPServer): "local" | "remote" | "both" {
  const hasRemotes = server.remotes && server.remotes.length > 0;
  const hasPackages = server.packages && server.packages.length > 0;
  
  if (hasRemotes && hasPackages) return "both";
  if (hasRemotes) return "remote";
  return "local";
}
```

### AnalyticsDataPoint
Represents aggregated server counts at a specific point in time.

**Fields**:
- `timestamp`: ISO8601 timestamp - When data was collected
- `localCount`: number - Count of local servers at this time
- `remoteCount`: number - Count of remote servers at this time
- `totalCount`: number - Total server count (may include "both" servers in both categories)
- `uniqueCount`: number - Unique server count (each server counted once)
- `granularity`: "hourly" | "daily" | "weekly" | "monthly" - Time aggregation level

**Relationships**:
- Derived from MCPServer entities through time-based aggregation
- Multiple granularities can exist for the same time period

**Validation Rules**:
- `totalCount` >= `localCount` + `remoteCount` (accounts for "both" classification)
- `uniqueCount` <= `totalCount` (no double counting in unique view)
- `timestamp` must align with granularity boundaries (hour/day/week/month start)

### FilterState
Represents current user interface state for data filtering and display.

**Fields**:
- `serverTypeFilter`: "all" | "local" | "remote" - Current server type filter
- `timeGranularity`: "hourly" | "daily" | "weekly" | "monthly" - Current time scale
- `dateRange`: { start: ISO8601, end: ISO8601 } - Currently displayed time range
- `isLoading`: boolean - Whether data is being processed
- `lastUpdated`: ISO8601 timestamp - When filter state last changed

**State Transitions**:
```typescript
interface FilterState {
  serverTypeFilter: "all" | "local" | "remote";
  timeGranularity: "hourly" | "daily" | "weekly" | "monthly";
  dateRange: {
    start: string; // ISO8601
    end: string;   // ISO8601
  };
  isLoading: boolean;
  lastUpdated: string; // ISO8601
}

// Valid transitions maintain data consistency
const validGranularityTransitions = {
  hourly: ["daily", "weekly", "monthly"],
  daily: ["hourly", "weekly", "monthly"],
  weekly: ["hourly", "daily", "monthly"],
  monthly: ["hourly", "daily", "weekly"]
};
```

### ChartConfiguration
Represents visual configuration for chart rendering.

**Fields**:
- `theme`: "dark" - Theme mode (only dark supported per requirements)
- `colorScheme`: { primary: string, secondary: string, accent: string } - Color values
- `responsiveBreakpoints`: { mobile: number, tablet: number, desktop: number } - Screen size breakpoints
- `animationDuration`: number - Chart transition duration in milliseconds
- `accessibility`: { announceDataChanges: boolean, showDataTable: boolean } - A11y settings

**Default Values**:
```typescript
const defaultChartConfig: ChartConfiguration = {
  theme: "dark",
  colorScheme: {
    primary: "#8B5CF6",   // Purple
    secondary: "#3B82F6", // Blue  
    accent: "#EC4899"     // Pink
  },
  responsiveBreakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  },
  animationDuration: 300,
  accessibility: {
    announceDataChanges: true,
    showDataTable: true
  }
};
```

## Data Aggregation Pipeline

### CSV Data Schema
The GitHub Actions pipeline outputs data in CSV format for build-time consumption.

**CSV Structure**:
```csv
timestamp,local_count,remote_count,total_count,unique_count,collection_time
2025-09-16T14:00:00Z,150,75,225,200,2025-09-16T14:05:32Z
2025-09-16T15:00:00Z,152,76,228,203,2025-09-16T15:05:28Z
```

**Field Mappings**:
- `timestamp`: Data point timestamp (hourly boundaries)
- `local_count`: Servers with packages only or neither packages nor remotes
- `remote_count`: Servers with remotes only
- `total_count`: Sum including servers with both packages and remotes (counted in both categories)
- `unique_count`: Each server counted exactly once regardless of type
- `collection_time`: When the API call was made

### Data Transformation Pipeline

**Stage 1: Raw API Data → Server Classification**
```typescript
function processAPIResponse(servers: MCPServer[]): ProcessedServer[] {
  return servers.map(server => ({
    ...server,
    serverType: classifyServerType(server),
    processedAt: new Date().toISOString()
  }));
}
```

**Stage 2: Server Classification → Time Aggregation**
```typescript
function aggregateByHour(servers: ProcessedServer[]): AnalyticsDataPoint[] {
  const hourlyGroups = groupBy(servers, server => 
    new Date(server._meta["io.modelcontextprotocol.registry/official"].published_at)
      .toISOString().slice(0, 13) + ":00:00.000Z"
  );

  return Object.entries(hourlyGroups).map(([timestamp, serversInHour]) => {
    const localCount = serversInHour.filter(s => s.serverType === "local" || s.serverType === "both").length;
    const remoteCount = serversInHour.filter(s => s.serverType === "remote" || s.serverType === "both").length;
    const uniqueCount = serversInHour.length;
    
    return {
      timestamp,
      localCount,
      remoteCount,
      totalCount: localCount + remoteCount,
      uniqueCount,
      granularity: "hourly" as const
    };
  });
}
```

**Stage 3: Hourly Data → Multiple Granularities**
```typescript
function aggregateToDaily(hourlyData: AnalyticsDataPoint[]): AnalyticsDataPoint[] {
  const dailyGroups = groupBy(hourlyData, point => 
    point.timestamp.slice(0, 10) + "T00:00:00.000Z"
  );

  return Object.entries(dailyGroups).map(([timestamp, pointsInDay]) => ({
    timestamp,
    localCount: Math.max(...pointsInDay.map(p => p.localCount)),
    remoteCount: Math.max(...pointsInDay.map(p => p.remoteCount)),
    totalCount: Math.max(...pointsInDay.map(p => p.totalCount)),
    uniqueCount: Math.max(...pointsInDay.map(p => p.uniqueCount)),
    granularity: "daily" as const
  }));
}
```

## Validation Rules

### Data Integrity
1. **Timestamp Consistency**: All timestamps must be valid ISO8601 format
2. **Count Relationships**: `totalCount >= localCount` and `totalCount >= remoteCount`
3. **Unique Count Logic**: `uniqueCount <= totalCount` always true
4. **Granularity Alignment**: Timestamps must align with granularity boundaries
5. **Monotonic Growth**: Server counts should generally increase over time (with occasional decreases for removed servers)

### Business Logic
1. **Server Classification**: Each server must have exactly one primary type (local/remote/both)
2. **Historical Data**: Data points older than 1 year may be archived/aggregated
3. **Real-time Updates**: New data appears within 1 hour of collection
4. **Filter Consistency**: UI filters must produce consistent results across granularities

### Performance Constraints
1. **CSV File Size**: Maximum 10MB for efficient build-time loading
2. **Data Points**: Maximum 8760 hourly points (1 year) in memory at once
3. **Chart Rendering**: Maximum 1000 points per chart for smooth interaction
4. **Update Frequency**: Data aggregation runs hourly, not more frequently

## Error Handling

### Data Collection Errors
- **API Timeout**: Retry with exponential backoff, max 3 attempts
- **Invalid Response**: Log error, use previous valid data point
- **Rate Limiting**: Respect rate limits, schedule retry

### Data Processing Errors  
- **Invalid CSV**: Fallback to previous version, alert monitoring
- **Missing Data**: Interpolate gaps shorter than 6 hours
- **Corrupted Timestamps**: Skip invalid points, log for investigation

### UI Error States
- **No Data Available**: Show message with last successful update time
- **Loading States**: Progressive loading with skeleton screens
- **Chart Render Errors**: Fallback to data table view

---

**Data Model Status**: ✅ Complete  
**Next**: API Contracts & Component Interfaces