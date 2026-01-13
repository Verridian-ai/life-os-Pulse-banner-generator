# Install All MCP Servers for Nanobanna Pro
# Complete installation of 14 pending MCP servers with verification

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MCP Servers Installation Script" -ForegroundColor Cyan
Write-Host "Nanobanna Pro - Complete Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create logs directory
$LogDir = ".claude\logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

$LogFile = "$LogDir\mcp-installation-$(Get-Date -Format 'yyyy-MM-dd-HHmm').log"
$ErrorLog = "$LogDir\mcp-installation-errors-$(Get-Date -Format 'yyyy-MM-dd-HHmm').log"

function Write-Log {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - $Message"
}

function Write-ErrorLog {
    param($Message)
    Write-Host $Message -ForegroundColor Red
    Add-Content -Path $ErrorLog -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - $Message"
}

function Install-MCPServer {
    param(
        [string]$Name,
        [string]$Package,
        [string]$Priority
    )

    Write-Log "[$Priority] Installing $Name..." "Yellow"

    try {
        # Install globally
        npm install -g $Package 2>&1 | Out-Null

        # Verify installation
        $VerifyCmd = "npx $Package --version"
        $Version = Invoke-Expression $VerifyCmd 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Log "  ✓ $Name installed successfully (v$Version)" "Green"
            return $true
        } else {
            Write-ErrorLog "  ✗ $Name installation failed: $Version"
            return $false
        }
    } catch {
        Write-ErrorLog "  ✗ $Name installation error: $_"
        return $false
    }
}

# Track installation stats
$TotalServers = 14
$SuccessCount = 0
$FailureCount = 0

Write-Log "Starting installation of $TotalServers MCP servers..." "Cyan"
Write-Log ""

# ============================================
# PRIORITY 1: Critical Tools (Install First)
# ============================================

Write-Log "=== PRIORITY 1: Critical Development Tools ===" "Magenta"
Write-Log ""

$Priority1 = @(
    @{Name="Neon Manager"; Package="@neondatabase/mcp-server-neon"; Skill="database-agent"},
    @{Name="TypeScript MCP"; Package="@modelcontextprotocol/server-typescript"; Skill="quick-tasks, coding"},
    @{Name="ESLint MCP"; Package="@modelcontextprotocol/server-eslint"; Skill="quick-tasks, coding, codebase-org"},
    @{Name="Vitest MCP"; Package="@modelcontextprotocol/server-vitest"; Skill="qa-agent"}
)

foreach ($Server in $Priority1) {
    if (Install-MCPServer -Name $Server.Name -Package $Server.Package -Priority "P1") {
        $SuccessCount++
        Write-Log "    → Assigned to: $($Server.Skill)" "Gray"
    } else {
        $FailureCount++
    }
    Write-Log ""
}

# ============================================
# PRIORITY 2: Quality & Performance
# ============================================

Write-Log "=== PRIORITY 2: Quality & Performance Tools ===" "Magenta"
Write-Log ""

$Priority2 = @(
    @{Name="Lighthouse MCP"; Package="@modelcontextprotocol/server-lighthouse"; Skill="chrome-ui-browser, debugging"},
    @{Name="Axe Accessibility"; Package="@modelcontextprotocol/server-axe-core"; Skill="qa-agent, chrome-ui-browser"},
    @{Name="Postgres MCP"; Package="@modelcontextprotocol/server-postgres"; Skill="database-agent"},
    @{Name="Prettier MCP"; Package="@modelcontextprotocol/server-prettier"; Skill="quick-tasks, codebase-org"}
)

foreach ($Server in $Priority2) {
    if (Install-MCPServer -Name $Server.Name -Package $Server.Package -Priority "P2") {
        $SuccessCount++
        Write-Log "    → Assigned to: $($Server.Skill)" "Gray"
    } else {
        $FailureCount++
    }
    Write-Log ""
}

# ============================================
# PRIORITY 3: Advanced Tools
# ============================================

Write-Log "=== PRIORITY 3: Security and Observability Tools ===" "Magenta"
Write-Log ""

$Priority3 = @(
    @{Name="Semgrep Security"; Package="@modelcontextprotocol/server-semgrep"; Skill="security-agent"},
    @{Name="OSV Scanner"; Package="@modelcontextprotocol/server-osv-scanner"; Skill="security-agent"},
    @{Name="GitHub MCP"; Package="@modelcontextprotocol/server-github"; Skill="release-agent"},
    @{Name="Langfuse MCP"; Package="@modelcontextprotocol/server-langfuse"; Skill="observability-agent"},
    @{Name="Guardrails MCP"; Package="@modelcontextprotocol/server-guardrails"; Skill="safety-agent"},
    @{Name="ConventionalCommits"; Package="@modelcontextprotocol/server-conventional-commits"; Skill="release-agent"}
)

foreach ($Server in $Priority3) {
    if (Install-MCPServer -Name $Server.Name -Package $Server.Package -Priority "P3") {
        $SuccessCount++
        Write-Log "    → Assigned to: $($Server.Skill)" "Gray"
    } else {
        $FailureCount++
    }
    Write-Log ""
}

# ============================================
# Installation Summary
# ============================================

Write-Log "========================================" "Cyan"
Write-Log "Installation Complete!" "Cyan"
Write-Log "========================================" "Cyan"
Write-Log ""
Write-Log "Total Servers: $TotalServers" "White"
Write-Log "✓ Successful: $SuccessCount" "Green"
Write-Log "✗ Failed: $FailureCount" "Red"
Write-Log ""

if ($FailureCount -gt 0) {
    Write-Log "⚠️  Some installations failed. Check error log:" "Yellow"
    Write-Log "   $ErrorLog" "Gray"
    Write-Log ""
}

# ============================================
# Create MCP Config File
# ============================================

Write-Log "Creating MCP configuration file..." "Yellow"

$MCPConfig = @{
    mcpServers = @{
        # Database
        neon = @{
            command = "npx"
            args = @("@neondatabase/mcp-server-neon")
            env = @{
                NEON_API_KEY = "`${NEON_API_KEY}"
            }
        }
        postgres = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-postgres")
            env = @{
                DATABASE_URL = "`${DATABASE_URL}"
            }
        }

        # Development Tools
        typescript = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-typescript")
        }
        eslint = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-eslint")
            cwd = "C:\Users\Danie\Desktop\nanobanna-pro"
        }
        prettier = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-prettier")
        }

        # Testing
        vitest = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-vitest")
        }

        # Performance & Accessibility
        lighthouse = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-lighthouse")
        }
        axe = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-axe-core")
        }

        # Security
        semgrep = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-semgrep")
        }
        "osv-scanner" = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-osv-scanner")
        }

        # Git & Release
        github = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-github")
            env = @{
                GITHUB_TOKEN = "`${GITHUB_TOKEN}"
            }
        }
        "conventional-commits" = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-conventional-commits")
        }

        # Observability
        langfuse = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-langfuse")
            env = @{
                LANGFUSE_PUBLIC_KEY = "`${LANGFUSE_PUBLIC_KEY}"
                LANGFUSE_SECRET_KEY = "`${LANGFUSE_SECRET_KEY}"
                LANGFUSE_HOST = "`${LANGFUSE_HOST}"
            }
        }
        guardrails = @{
            command = "npx"
            args = @("@modelcontextprotocol/server-guardrails")
        }
    }
}

$ConfigPath = ".claude\mcp-config.json"
$MCPConfig | ConvertTo-Json -Depth 10 | Set-Content -Path $ConfigPath

Write-Log "✓ MCP configuration saved to: $ConfigPath" "Green"
Write-Log ""

# ============================================
# Verification
# ============================================

Write-Log "Running verification tests..." "Yellow"
Write-Log ""

$VerifyCount = 0

Write-Log "Testing MCP servers:" "White"

$TestServers = @(
    "@neondatabase/mcp-server-neon",
    "@modelcontextprotocol/server-typescript",
    "@modelcontextprotocol/server-eslint",
    "@modelcontextprotocol/server-vitest"
)

foreach ($Package in $TestServers) {
    $TestResult = npx $Package --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Log "  ✓ $Package" "Green"
        $VerifyCount++
    } else {
        Write-Log "  ✗ $Package (not found)" "Red"
    }
}

Write-Log ""
Write-Log "Verification: $VerifyCount/$($TestServers.Count) servers responding" "Cyan"
Write-Log ""

# ============================================
# Next Steps
# ============================================

Write-Log "========================================" "Cyan"
Write-Log "Next Steps:" "Cyan"
Write-Log "========================================" "Cyan"
Write-Log ""
Write-Log "1. Configure environment variables:" "Yellow"
Write-Log "   - NEON_API_KEY (for Neon database)" "Gray"
Write-Log "   - GITHUB_TOKEN (for GitHub operations)" "Gray"
Write-Log "   - LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY (for observability)" "Gray"
Write-Log ""
Write-Log "2. Verify MCP config:" "Yellow"
Write-Log "   cat .claude\mcp-config.json" "Gray"
Write-Log ""
Write-Log "3. Test agent skills:" "Yellow"
Write-Log "   'Find all authentication code' → research-agent" "Gray"
Write-Log "   'Fix TypeScript errors' → quick-tasks-agent" "Gray"
Write-Log "   'Check the UI' → chrome-ui-browser-agent" "Gray"
Write-Log ""
Write-Log "4. Review logs:" "Yellow"
Write-Log "   Installation log: $LogFile" "Gray"
if ($FailureCount -gt 0) {
    Write-Log "   Error log: $ErrorLog" "Gray"
}
Write-Log ""

Write-Log "========================================" "Cyan"
Write-Log "Installation script complete!" "Green"
Write-Log "========================================" "Cyan"
