# MCP Configuration Verification Script (PowerShell)
# Tests all configured MCP servers and reports status

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MCP Configuration Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to test MCP server
function Test-McpServer {
    param([string]$ServerName)

    Write-Host "Testing $ServerName... " -NoNewline

    try {
        $null = claude mcp test $ServerName 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ PASS" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "✗ FAIL" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "✗ FAIL" -ForegroundColor Red
        return $false
    }
}

# Function to check environment variable
function Test-EnvVar {
    param(
        [string]$VarName,
        [bool]$Required
    )

    if (Test-Path .env.mcp) {
        $content = Get-Content .env.mcp -Raw
        if ($content -match "$VarName=(.+)") {
            $value = $matches[1].Trim()
            if ($value) {
                Write-Host "  ✓ $VarName is set" -ForegroundColor Green
                return $true
            }
        }
    }

    if ($Required) {
        Write-Host "  ✗ $VarName is MISSING (required)" -ForegroundColor Red
        return $false
    }
    else {
        Write-Host "  ⚠ $VarName is not set (optional)" -ForegroundColor Yellow
        return $true
    }
}

Write-Host "Step 1: Checking .mcp.json configuration" -ForegroundColor Yellow
Write-Host "------------------------------------------"
if (Test-Path .mcp.json) {
    Write-Host "✓ .mcp.json exists" -ForegroundColor Green

    $config = Get-Content .mcp.json | ConvertFrom-Json
    $serverCount = ($config.mcpServers | Get-Member -MemberType NoteProperty).Count
    Write-Host "  Configured servers: $serverCount"

    Write-Host "  Servers:"
    $config.mcpServers | Get-Member -MemberType NoteProperty | ForEach-Object {
        Write-Host "    - $($_.Name)"
    }
}
else {
    Write-Host "✗ .mcp.json not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Step 2: Checking environment variables" -ForegroundColor Yellow
Write-Host "----------------------------------------"
if (Test-Path .env.mcp) {
    Write-Host "✓ .env.mcp exists" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Required credentials:"
    $allPresent = $true
    $allPresent = (Test-EnvVar "PERPLEXITY_API_KEY" $true) -and $allPresent
    $allPresent = (Test-EnvVar "BRAVE_API_KEY" $true) -and $allPresent
    $allPresent = (Test-EnvVar "FIRECRAWL_API_KEY" $true) -and $allPresent
    $allPresent = (Test-EnvVar "WORKOS_API_KEY" $true) -and $allPresent
    $allPresent = (Test-EnvVar "WORKOS_CLIENT_ID" $true) -and $allPresent
    Write-Host ""
    Write-Host "  Optional credentials:"
    Test-EnvVar "OPENAI_API_KEY" $false | Out-Null
    Test-EnvVar "ANTHROPIC_API_KEY" $false | Out-Null

    if (-not $allPresent) {
        Write-Host ""
        Write-Host "✗ Missing required environment variables" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "✗ .env.mcp not found" -ForegroundColor Red
    Write-Host "  Create .env.mcp with required API keys"
    exit 1
}
Write-Host ""

Write-Host "Step 3: Testing MCP server connectivity" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "Note: This requires Claude Code to be running"
Write-Host ""

$failedServers = 0
$servers = @("workos", "workos-cli", "perplexity", "context7", "brave-search", "firecrawl")

foreach ($server in $servers) {
    if (-not (Test-McpServer $server)) {
        $failedServers++
    }
}

Write-Host ""

Write-Host "Step 4: Checking external services" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host "Testing Cognee service (HTTP)... " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ PASS" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ NOT RUNNING" -ForegroundColor Yellow
        Write-Host "  Start Cognee: cd cognee_agents; python -m uvicorn main:app --reload --port 8000"
    }
}
catch {
    Write-Host "⚠ NOT RUNNING" -ForegroundColor Yellow
    Write-Host "  Start Cognee: cd cognee_agents; python -m uvicorn main:app --reload --port 8000"
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
if ($failedServers -eq 0) {
    Write-Host "✓ All MCP servers passed" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configuration is complete and working."
    exit 0
}
else {
    Write-Host "✗ $failedServers MCP server(s) failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:"
    Write-Host "1. Ensure all required API keys are in .env.mcp"
    Write-Host "2. Check API key validity"
    Write-Host "3. Run: claude mcp list"
    Write-Host "4. Run: claude mcp logs <server-name>"
    Write-Host ""
    Write-Host "See .claude/MCP_CONFIGURATION_SUMMARY.md for details"
    exit 1
}
