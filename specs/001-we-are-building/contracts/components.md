# React Component Contracts

**Purpose**: Define prop interfaces and component contracts for the MCP Analytics Dashboard  
**Framework**: Next.js 14+ with TypeScript and ShadCN/UI components

## Core Type Definitions

### Shared Types
```typescript
// types/index.ts
export type ServerType = "local" | "remote" | "all";
export type TimeGranularity = "hourly" | "daily" | "weekly" | "monthly";

export interface AnalyticsDataPoint {
  timestamp: string; // ISO8601
  localCount: number;
  remoteCount: number;
  totalCount: number;
  uniqueCount: number;
  granularity: TimeGranularity;
}

export interface FilterState {
  serverTypeFilter: ServerType;
  timeGranularity: TimeGranularity;
  dateRange: {
    start: string; // ISO8601
    end: string;   // ISO8601
  };
}

export interface ChartTheme {
  primary: string;   // Purple: #8B5CF6
  secondary: string; // Blue: #3B82F6
  accent: string;    // Pink: #EC4899
  background: string;
  text: string;
}
```

## Component Contracts

### Dashboard Page Component
```typescript
// app/page.tsx
interface DashboardPageProps {
  // Build-time props from getStaticProps equivalent
  initialData: AnalyticsDataPoint[];
  lastUpdated: string; // ISO8601
}

export default function DashboardPage(props: DashboardPageProps): JSX.Element;
```

**Requirements**:
- Must render analytics chart with initial data
- Must include filter controls 
- Must handle responsive layout
- Must show loading states during filter changes
- Must display last updated timestamp

### Analytics Chart Component
```typescript
// components/charts/AnalyticsChart.tsx
interface AnalyticsChartProps {
  data: AnalyticsDataPoint[];
  filterState: FilterState;
  theme: ChartTheme;
  isLoading?: boolean;
  onDataPointClick?: (dataPoint: AnalyticsDataPoint) => void;
  className?: string;
}

export function AnalyticsChart(props: AnalyticsChartProps): JSX.Element;
```

**Requirements**:
- Must render responsive time-series line chart
- Must handle empty data states gracefully
- Must support different time granularities
- Must apply server type filtering to displayed data
- Must show loading skeleton when `isLoading` is true
- Must be accessible with ARIA labels and keyboard navigation

### Filter Controls Component
```typescript
// components/filters/FilterControls.tsx
interface FilterControlsProps {
  currentState: FilterState;
  onFilterChange: (newState: Partial<FilterState>) => void;
  disabled?: boolean;
  className?: string;
}

export function FilterControls(props: FilterControlsProps): JSX.Element;
```

**Requirements**:
- Must provide server type toggle (All/Local/Remote)
- Must provide time granularity selector
- Must provide date range picker
- Must disable controls when `disabled` is true
- Must call `onFilterChange` with partial state updates
- Must be keyboard accessible and screen reader friendly

### Server Type Toggle Component
```typescript
// components/filters/ServerTypeToggle.tsx
interface ServerTypeToggleProps {
  selected: ServerType;
  onChange: (serverType: ServerType) => void;
  disabled?: boolean;
  counts?: {
    all: number;
    local: number;
    remote: number;
  };
}

export function ServerTypeToggle(props: ServerTypeToggleProps): JSX.Element;
```

**Requirements**:
- Must use ShadCN Toggle Group component
- Must show server counts if provided
- Must highlight selected option
- Must be touch-friendly on mobile devices

### Time Granularity Selector Component
```typescript
// components/filters/TimeGranularitySelector.tsx
interface TimeGranularitySelectorProps {
  selected: TimeGranularity;
  onChange: (granularity: TimeGranularity) => void;
  disabled?: boolean;
  availableOptions?: TimeGranularity[];
}

export function TimeGranularitySelector(props: TimeGranularitySelectorProps): JSX.Element;
```

**Requirements**:
- Must use ShadCN Select component
- Must default to all options if `availableOptions` not provided
- Must disable unavailable options based on data availability
- Must show option labels (Hour/Day/Week/Month)

### About Page Component
```typescript
// app/about/page.tsx
interface AboutPageProps {
  lastDataUpdate: string; // ISO8601
  totalServers: number;
  updateFrequency: string; // e.g., "hourly"
}

export default function AboutPage(props: AboutPageProps): JSX.Element;
```

**Requirements**:
- Must explain purpose of analytics dashboard
- Must describe data sources and collection methodology
- Must show data freshness information
- Must link back to main dashboard
- Must be accessible and mobile-friendly

### Layout Component
```typescript
// app/layout.tsx
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout(props: RootLayoutProps): JSX.Element;
```

**Requirements**:
- Must apply dark theme globally
- Must include responsive navigation
- Must set up ShadCN theme provider
- Must include proper meta tags for SEO
- Must ensure accessibility standards (WCAG 2.1 AA)

## Data Transformation Contracts

### Data Aggregation Utilities
```typescript
// lib/data-transforms.ts
export function aggregateByGranularity(
  data: AnalyticsDataPoint[],
  granularity: TimeGranularity
): AnalyticsDataPoint[];

export function filterByServerType(
  data: AnalyticsDataPoint[],
  serverType: ServerType
): AnalyticsDataPoint[];

export function filterByDateRange(
  data: AnalyticsDataPoint[],
  start: string,
  end: string
): AnalyticsDataPoint[];

export function getDateRangeForGranularity(
  granularity: TimeGranularity,
  dataPoints: AnalyticsDataPoint[]
): { start: string; end: string };
```

**Requirements**:
- Functions must be pure (no side effects)
- Must handle edge cases (empty arrays, invalid dates)
- Must preserve data type contracts
- Must be performant for up to 10,000 data points

### Chart Data Preparation
```typescript
// lib/chart-utils.ts
export interface ChartDataPoint {
  date: string; // Formatted for display
  count: number;
  timestamp: string; // Original ISO8601 for reference
  type: "local" | "remote" | "total";
}

export function prepareChartData(
  data: AnalyticsDataPoint[],
  filterState: FilterState
): ChartDataPoint[];

export function formatDateForGranularity(
  timestamp: string,
  granularity: TimeGranularity
): string;
```

**Requirements**:
- Must format dates appropriately for each granularity
- Must handle timezone considerations (UTC display)
- Must prepare data in format expected by Recharts
- Must maintain referential integrity with original data

## Error Boundary Contracts

### Chart Error Boundary
```typescript
// components/ErrorBoundary.tsx
interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function ChartErrorBoundary(props: ChartErrorBoundaryProps): JSX.Element;
```

**Requirements**:
- Must catch and handle chart rendering errors
- Must provide accessible fallback UI (data table)
- Must log errors for monitoring
- Must allow recovery without full page reload

## Accessibility Contracts

### Screen Reader Support
```typescript
// hooks/useScreenReader.ts
export interface ScreenReaderAnnouncement {
  message: string;
  priority: "polite" | "assertive";
  delay?: number;
}

export function useScreenReader(): {
  announce: (announcement: ScreenReaderAnnouncement) => void;
  isScreenReaderActive: boolean;
};
```

**Requirements**:
- Must announce chart data changes to screen readers
- Must announce filter state changes
- Must provide alternative text for visual elements
- Must support keyboard navigation patterns

### Keyboard Navigation
```typescript
// hooks/useKeyboardNavigation.ts
export function useChartKeyboardNavigation(
  data: ChartDataPoint[],
  onDataPointFocus: (point: ChartDataPoint) => void
): {
  currentIndex: number;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  focusedDataPoint: ChartDataPoint | null;
};
```

**Requirements**:
- Must support arrow key navigation through chart data points
- Must announce focused data point values
- Must support Enter key for data point selection
- Must provide escape key to exit chart navigation mode

## Testing Contracts

### Component Test Requirements
Each component must have tests covering:
- **Props Validation**: All required props handled correctly
- **User Interactions**: Click, keyboard, touch events
- **Edge Cases**: Empty data, loading states, error states
- **Accessibility**: Screen reader announcements, keyboard navigation
- **Responsive Behavior**: Layout changes at different screen sizes

### Integration Test Scenarios
- **Filter Changes**: Verify chart updates when filters change
- **Data Loading**: Test build-time data loading and display
- **Navigation**: Test routing between dashboard and about pages
- **Error Recovery**: Test error boundaries and fallback states