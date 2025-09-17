export type ServerType = "local" | "remote" | "all";
export type TimeGranularity = "hourly" | "daily" | "weekly" | "monthly";

export interface AnalyticsDataPoint {
  timestamp: string; // ISO8601
  localCount: number;
  remoteCount: number;
  totalCount: number;
  uniqueCount: number;
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

export interface MCPServer {
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

export interface ChartDataPoint {
  date: string; // Formatted for display
  count: number;
  timestamp: string; // Original ISO8601 for reference
  type: "local" | "remote" | "total";
}