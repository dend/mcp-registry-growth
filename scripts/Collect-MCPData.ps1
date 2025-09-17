# Collect-MCPData.ps1
# PowerShell script to collect MCP server data from the official registry
# Version: 2.0
# Author: MCP Registry Analytics Team

param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "data/analytics.csv",
    
    [Parameter(Mandatory=$false)]
    [switch]$DebugMode = $false
)

# Ensure we're using the correct output path
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = "data/analytics.csv"
}

Write-Host "Output will be written to: $OutputPath" -ForegroundColor Magenta

# Configuration
$MCPRegistryAPI = "https://registry.modelcontextprotocol.io/v0/servers"
$UserAgent = "MCP-Registry-Analytics/2.0"

# Initialize data collection
$Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
$AllServers = @()
$LocalCount = 0
$RemoteCount = 0
$TotalCount = 0
$UniqueServerNames = @{}

Write-Host "Starting MCP Registry data collection..." -ForegroundColor Green
Write-Host "API Endpoint: $MCPRegistryAPI" -ForegroundColor Yellow
Write-Host "Timestamp: $Timestamp" -ForegroundColor Yellow

# Function to make HTTP requests with retry logic
function Invoke-HttpRequestWithRetry {
    param(
        [string]$Uri,
        [hashtable]$Headers = @{},
        [int]$MaxRetries = 3,
        [int]$DelaySeconds = 2
    )
    
    for ($i = 0; $i -lt $MaxRetries; $i++) {
        try {
            if ($DebugMode) {
                Write-Host "Making request to: $Uri" -ForegroundColor Cyan
            }
            $response = Invoke-RestMethod -Uri $Uri -Headers $Headers -UserAgent $UserAgent
            return $response
        }
        catch {
            Write-Warning "Attempt $($i + 1) failed: $($_.Exception.Message)"
            if ($i -eq $MaxRetries - 1) {
                throw $_
            }
            Start-Sleep -Seconds ($DelaySeconds * ($i + 1))
        }
    }
}

# Function to classify server type based on API response
function Get-ServerClassification {
    param([PSCustomObject]$Server)
    
    $hasPackages = $null -ne $Server.packages -and $Server.packages.Count -gt 0
    $hasRemotes = $null -ne $Server.remotes -and $Server.remotes.Count -gt 0
    
    $classifications = @()
    
    if ($hasPackages) {
        $classifications += "local"
    }
    
    if ($hasRemotes) {
        $classifications += "remote"
    }
    
    # If neither packages nor remotes, assume local (as per requirements)
    if (-not $hasPackages -and -not $hasRemotes) {
        $classifications += "local"
    }
    
    return $classifications
}

# Function to collect all servers from the paginated API
function Get-AllMCPServers {
    $cursor = $null
    $pageCount = 0
    $totalServersCollected = 0
    
    do {
        $pageCount++
        Write-Host "Fetching page $pageCount..." -ForegroundColor Blue
        
        # Build URL with cursor if available
        $uri = $MCPRegistryAPI
        if ($cursor) {
            $uri += "?cursor=$cursor"
        }
        
        try {
            $response = Invoke-HttpRequestWithRetry -Uri $uri
            
            if (-not $response.servers) {
                Write-Warning "No servers found in API response"
                break
            }
            
            $serversOnPage = $response.servers.Count
            $totalServersCollected += $serversOnPage
            
            Write-Host "Page $pageCount`: $serversOnPage servers" -ForegroundColor Green
            
            # Process each server
            foreach ($server in $response.servers) {
                $script:AllServers += $server
                
                # Track unique server names
                if (-not $script:UniqueServerNames.ContainsKey($server.name)) {
                    $script:UniqueServerNames[$server.name] = $true
                }
                
                # Classify server type(s)
                $classifications = Get-ServerClassification -Server $server
                
                foreach ($classification in $classifications) {
                    if ($classification -eq "local") {
                        $script:LocalCount++
                    } elseif ($classification -eq "remote") {
                        $script:RemoteCount++
                    }
                }
                
                $script:TotalCount++
                
                if ($DebugMode) {
                    Write-Host "  Server $($server.name): $($classifications -join ', ')" -ForegroundColor Gray
                }
            }
            
            # Get next cursor for pagination
            $cursor = $response.metadata.next_cursor
            
            if ($DebugMode) {
                Write-Host "Next cursor: $cursor" -ForegroundColor Gray
            }
            
        }
        catch {
            Write-Error "Failed to fetch page $pageCount`: $($_.Exception.Message)"
            break
        }
        
    } while ($cursor -and $cursor -ne "")
    
    Write-Host "Collection complete: $totalServersCollected servers across $pageCount pages" -ForegroundColor Green
}

# Function to create analytics CSV entry
function Export-AnalyticsData {
    param([string]$Path)
    
    Write-Host "Creating analytics data..." -ForegroundColor Blue
    
    # Calculate unique count
    $uniqueCount = $script:UniqueServerNames.Keys.Count
    
    # Create analytics entry
    $analyticsEntry = [PSCustomObject]@{
        timestamp = $Timestamp
        localCount = $script:LocalCount
        remoteCount = $script:RemoteCount
        totalCount = $script:TotalCount
        uniqueCount = $uniqueCount
    }
    
    # Check if file exists and has data
    $existingData = @()
    if (Test-Path $Path) {
        try {
            $existingData = @(Import-Csv $Path)
            Write-Host "Found existing data with $($existingData.Count) records" -ForegroundColor Yellow
        }
        catch {
            Write-Warning "Could not read existing data: $($_.Exception.Message)"
        }
    }
    
    # Add new entry to existing data
    $allData = @($existingData) + @($analyticsEntry)
    
    # Ensure output directory exists
    $outputDir = Split-Path $Path -Parent
    if ($outputDir -and !(Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    
    # Export to CSV without BOM
    $csvContent = $allData | ConvertTo-Csv -NoTypeInformation
    [System.IO.File]::WriteAllLines($Path, $csvContent, [System.Text.UTF8Encoding]::new($false))
    
    Write-Host "Analytics data exported to: $Path" -ForegroundColor Green
    
    # Display summary
    Write-Host ""
    Write-Host "Current Collection Summary:" -ForegroundColor Cyan
    Write-Host "  Timestamp: $Timestamp" -ForegroundColor White
    Write-Host "  Local Servers: $script:LocalCount" -ForegroundColor White
    Write-Host "  Remote Servers: $script:RemoteCount" -ForegroundColor White
    Write-Host "  Total Classifications: $script:TotalCount" -ForegroundColor White
    Write-Host "  Unique Servers: $uniqueCount" -ForegroundColor White
    Write-Host "  Total Records in File: $($allData.Count)" -ForegroundColor White
}

# Main execution
try {
    # Collect all servers from the API
    Get-AllMCPServers
    
    # Export analytics data
    Export-AnalyticsData -Path $OutputPath
    
    Write-Host ""
    Write-Host "MCP Registry data collection completed successfully!" -ForegroundColor Green
    Write-Host "Output file: $OutputPath" -ForegroundColor Yellow
    
    # Display some example servers for verification
    if ($AllServers.Count -gt 0 -and $DebugMode) {
        Write-Host ""
        Write-Host "Sample servers collected:" -ForegroundColor Cyan
        $AllServers | Select-Object -First 3 | ForEach-Object {
            $classifications = Get-ServerClassification -Server $_
            Write-Host "  • $($_.name) - $($classifications -join ', ')" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Error "Data collection failed: $($_.Exception.Message)"
    exit 1
}

# Output collection metadata for GitHub Actions
if ($env:GITHUB_ACTIONS) {
    Write-Host "::set-output name=servers-collected::$script:TotalCount"
    Write-Host "::set-output name=unique-servers::$($script:UniqueServerNames.Keys.Count)"
    Write-Host "::set-output name=local-count::$script:LocalCount"
    Write-Host "::set-output name=remote-count::$script:RemoteCount"
    Write-Host "::set-output name=output-file::$OutputPath"
    Write-Host "::set-output name=collection-timestamp::$Timestamp"
}