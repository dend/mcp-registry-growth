# GitHub Actions Workflow Contract

**Purpose**: Define the contract for automated MCP server data collection  
**Trigger**: Hourly cron schedule + manual dispatch  
**Runner**: `windows-latest` for PowerShell script execution

## Workflow Definition

### Workflow Inputs
```yaml
name: Collect MCP Data
on:
  schedule:
    - cron: '0 * * * *'  # Every hour at minute 0
  workflow_dispatch:      # Manual trigger for testing
    inputs:
      force_update:
        description: 'Force update even if no changes detected'
        required: false
        default: 'false'
        type: boolean

env:
  CSV_FILE_PATH: 'data/mcp-servers.csv'
  API_BASE_URL: 'https://registry.modelcontextprotocol.io/v0/servers'
```

### Job Contract
```yaml
jobs:
  collect-data:
    runs-on: windows-latest
    permissions:
      contents: write  # Required for git commits
    
    outputs:
      servers_collected: ${{ steps.collect.outputs.servers_collected }}
      csv_updated: ${{ steps.collect.outputs.csv_updated }}
      collection_time: ${{ steps.collect.outputs.collection_time }}
      
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 1

      - name: Run Data Collection Script
        id: collect
        run: |
          .\scripts\Collect-MCPData.ps1 -OutputPath "${{ env.CSV_FILE_PATH }}" -Verbose
        shell: powershell

      - name: Commit and Push Changes
        if: steps.collect.outputs.csv_updated == 'true'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add ${{ env.CSV_FILE_PATH }}
          git commit -m "Update MCP server data - ${{ steps.collect.outputs.servers_collected }} servers"
          git push
        shell: powershell
```

## PowerShell Script Contract

### Script Interface
```powershell
# scripts/Collect-MCPData.ps1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$OutputPath,
    
    [Parameter(Mandatory = $false)]
    [string]$ApiBaseUrl = "https://registry.modelcontextprotocol.io/v0/servers",
    
    [Parameter(Mandatory = $false)]
    [switch]$ForceUpdate,
    
    [Parameter(Mandatory = $false)]
    [switch]$Verbose
)
```

### Expected Outputs
The script must set GitHub Actions outputs:
```powershell
# At end of script execution
Write-Output "servers_collected=$totalServers" >> $env:GITHUB_OUTPUT
Write-Output "csv_updated=$csvWasUpdated" >> $env:GITHUB_OUTPUT  
Write-Output "collection_time=$collectionTime" >> $env:GITHUB_OUTPUT
```

### Error Handling Contract
```powershell
# Required error handling patterns
try {
    # API call logic
    $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 30
}
catch [System.Net.WebException] {
    Write-Error "Network error calling MCP API: $_"
    exit 1
}
catch [System.TimeoutException] {
    Write-Error "Timeout calling MCP API after 30 seconds"
    exit 1
}
catch {
    Write-Error "Unexpected error: $_"
    exit 1
}
```

### Data Processing Contract
```powershell
# Server classification logic
function Get-ServerType {
    param([PSCustomObject]$Server)
    
    $hasRemotes = $Server.remotes -and $Server.remotes.Count -gt 0
    $hasPackages = $Server.packages -and $Server.packages.Count -gt 0
    
    if ($hasRemotes -and $hasPackages) {
        return "both"
    }
    elseif ($hasRemotes) {
        return "remote"
    }
    else {
        return "local"
    }
}

# CSV output format
function Export-AnalyticsData {
    param(
        [array]$Servers,
        [string]$OutputPath,
        [datetime]$CollectionTime
    )
    
    $timestamp = $CollectionTime.ToString("yyyy-MM-ddTHH:00:00.000Z")
    $collectionTimeFormatted = $CollectionTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    
    # Count servers by type
    $localServers = $Servers | Where-Object { (Get-ServerType $_) -in @("local", "both") }
    $remoteServers = $Servers | Where-Object { (Get-ServerType $_) -in @("remote", "both") }
    $bothServers = $Servers | Where-Object { (Get-ServerType $_) -eq "both" }
    
    $csvRow = [PSCustomObject]@{
        timestamp = $timestamp
        local_count = ($localServers | Measure-Object).Count
        remote_count = ($remoteServers | Measure-Object).Count
        total_count = ($localServers | Measure-Object).Count + ($remoteServers | Measure-Object).Count
        unique_count = ($Servers | Measure-Object).Count
        collection_time = $collectionTimeFormatted
    }
    
    # Append to CSV file
    $csvRow | Export-Csv -Path $OutputPath -Append -NoTypeInformation
}
```

## API Integration Contract

### Pagination Handling
```powershell
function Get-AllMCPServers {
    param(
        [string]$BaseUrl,
        [string]$Cursor = $null
    )
    
    $allServers = @()
    $url = $BaseUrl
    
    do {
        if ($Cursor) {
            $url = "$BaseUrl?cursor=$Cursor"
        }
        
        Write-Verbose "Fetching: $url"
        
        try {
            $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 30
        }
        catch {
            Write-Error "Failed to fetch data from $url : $_"
            throw
        }
        
        if ($response.servers) {
            $allServers += $response.servers
            Write-Verbose "Collected $($response.servers.Count) servers from this page"
        }
        
        $Cursor = $response.metadata.next_cursor
        
        # Rate limiting - be respectful to the API
        if ($Cursor) {
            Start-Sleep -Milliseconds 100
        }
        
    } while ($Cursor)
    
    Write-Verbose "Total servers collected: $($allServers.Count)"
    return $allServers
}
```

### Response Validation
```powershell
function Test-APIResponse {
    param([PSCustomObject]$Response)
    
    # Validate response structure
    if (-not $Response.servers) {
        throw "Invalid API response: missing 'servers' array"
    }
    
    if (-not $Response.metadata) {
        throw "Invalid API response: missing 'metadata' object"
    }
    
    if (-not $Response.metadata.count) {
        throw "Invalid API response: missing 'metadata.count'"
    }
    
    # Validate server objects
    foreach ($server in $Response.servers) {
        if (-not $server.name) {
            Write-Warning "Server missing name field: $($server | ConvertTo-Json -Compress)"
        }
        
        if (-not $server._meta) {
            Write-Warning "Server missing _meta field: $server.name"
        }
    }
    
    return $true
}
```

## File Management Contract

### CSV File Handling
```powershell
function Initialize-CSVFile {
    param([string]$FilePath)
    
    $directory = Split-Path -Parent $FilePath
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    
    # Create header if file doesn't exist
    if (-not (Test-Path $FilePath)) {
        "timestamp,local_count,remote_count,total_count,unique_count,collection_time" | 
            Out-File -FilePath $FilePath -Encoding UTF8
        Write-Verbose "Created new CSV file: $FilePath"
    }
}

function Test-CSVIntegrity {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        return $false
    }
    
    try {
        $content = Get-Content $FilePath -First 2
        $header = $content[0]
        $expectedHeader = "timestamp,local_count,remote_count,total_count,unique_count,collection_time"
        
        if ($header -ne $expectedHeader) {
            Write-Warning "CSV header mismatch. Expected: $expectedHeader, Got: $header"
            return $false
        }
        
        return $true
    }
    catch {
        Write-Warning "Error reading CSV file: $_"
        return $false
    }
}
```

## Monitoring and Alerting Contract

### Success Metrics
The workflow must track and report:
- **Execution Time**: Total time from start to completion
- **Server Count**: Number of servers collected from API
- **API Calls**: Number of paginated requests made
- **CSV Size**: Size of resulting CSV file
- **Git Commit**: Whether changes were committed

### Failure Conditions
The workflow must fail and alert on:
- **API Timeout**: No response within 30 seconds
- **API Error**: HTTP error status codes (4xx, 5xx)
- **Invalid Response**: Malformed JSON or missing required fields
- **CSV Corruption**: Unable to write to or validate CSV file
- **Git Failure**: Unable to commit or push changes

### Logging Requirements
```powershell
# Required logging at key points
Write-Output "Starting MCP data collection at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')"
Write-Output "API Base URL: $ApiBaseUrl"
Write-Output "Output file: $OutputPath"

# During execution
Write-Verbose "Page $pageNumber`: Found $($response.servers.Count) servers"
Write-Verbose "Next cursor: $($response.metadata.next_cursor)"

# At completion
Write-Output "Collection complete: $totalServers servers processed"
Write-Output "CSV file size: $((Get-Item $OutputPath).Length) bytes"
Write-Output "Collection took: $($executionTime.TotalSeconds) seconds"
```

## Security Contract

### Permissions
- **Repository Access**: Read/write access to update CSV files
- **No Secrets Required**: All APIs are public, no authentication needed
- **Git Commits**: Use GitHub Actions token for commits

### Rate Limiting
- **API Respect**: 100ms delay between paginated requests
- **Error Backoff**: Exponential backoff on rate limit errors
- **Request Limits**: Maximum 1000 requests per execution (safety limit)

### Data Handling
- **No PII**: Only collect public server metadata
- **Public Data**: All collected data is publicly available
- **Retention**: CSV data retained indefinitely in git history