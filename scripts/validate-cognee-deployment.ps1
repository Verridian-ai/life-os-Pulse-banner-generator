# Local Cognee Deployment Validation Script
# This validates your LOCAL Windows Docker setup ONLY
# NOT for production deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Local Cognee Memory Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker Desktop is running
Write-Host "[1/7] Checking Docker Desktop..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Desktop is running: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker Desktop is not running or not installed" -ForegroundColor Red
        Write-Host "   Please start Docker Desktop and try again" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker command not found. Please install Docker Desktop" -ForegroundColor Red
    exit 1
}

# Check if .env.cognee.local exists
Write-Host ""
Write-Host "[2/7] Checking environment file..." -ForegroundColor Yellow
if (Test-Path ".env.cognee.local") {
    Write-Host "✅ Found .env.cognee.local" -ForegroundColor Green

    # Check if critical env vars are set
    $envContent = Get-Content ".env.cognee.local" -Raw
    if ($envContent -match "OPENAI_API_KEY=sk-") {
        Write-Host "✅ OPENAI_API_KEY is configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  OPENAI_API_KEY not set or invalid" -ForegroundColor Yellow
        Write-Host "   Please set your OpenAI API key in .env.cognee.local" -ForegroundColor Yellow
    }

    if ($envContent -match "NEO4J_PASSWORD=.+") {
        Write-Host "✅ NEO4J_PASSWORD is configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  NEO4J_PASSWORD not set" -ForegroundColor Yellow
    }

    if ($envContent -match "POSTGRES_PASSWORD=.+") {
        Write-Host "✅ POSTGRES_PASSWORD is configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  POSTGRES_PASSWORD not set" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env.cognee.local not found" -ForegroundColor Red
    Write-Host "   Run: cp .env.cognee .env.cognee.local" -ForegroundColor Red
    Write-Host "   Then edit .env.cognee.local with your keys" -ForegroundColor Red
    exit 1
}

# Check if docker-compose.cognee.yml exists
Write-Host ""
Write-Host "[3/7] Checking Docker Compose file..." -ForegroundColor Yellow
if (Test-Path "docker-compose.cognee.yml") {
    Write-Host "✅ Found docker-compose.cognee.yml" -ForegroundColor Green
} else {
    Write-Host "❌ docker-compose.cognee.yml not found" -ForegroundColor Red
    exit 1
}

# Check if containers are running
Write-Host ""
Write-Host "[4/7] Checking running containers..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" 2>&1
if ($containers -match "local-cognee-memory") {
    Write-Host "✅ Cognee container is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Cognee container not running" -ForegroundColor Yellow
    Write-Host "   Run: docker compose -f docker-compose.cognee.yml --env-file .env.cognee.local up -d" -ForegroundColor Yellow
}

if ($containers -match "local-cognee-neo4j") {
    Write-Host "✅ Neo4j container is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Neo4j container not running" -ForegroundColor Yellow
}

if ($containers -match "local-cognee-postgres") {
    Write-Host "✅ PostgreSQL container is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL container not running" -ForegroundColor Yellow
}

# Check if Cognee API is responding
Write-Host ""
Write-Host "[5/7] Checking Cognee API health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Cognee API is healthy and responding" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Cognee API returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot reach Cognee API at http://localhost:8000" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure containers are running and healthy" -ForegroundColor Red
}

# Check if Neo4j is accessible
Write-Host ""
Write-Host "[6/7] Checking Neo4j accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:7474" -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Neo4j browser is accessible at http://localhost:7474" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Neo4j browser not accessible yet" -ForegroundColor Yellow
    Write-Host "   It may still be starting up" -ForegroundColor Yellow
}

# Docker resource check
Write-Host ""
Write-Host "[7/7] Checking Docker resources..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info --format "{{.MemTotal}}" 2>&1
    if ($dockerInfo -match "\d+") {
        $memGB = [math]::Round([int64]$dockerInfo / 1GB, 2)
        if ($memGB -ge 8) {
            Write-Host "✅ Docker has $memGB GB memory allocated (recommended: 8GB+)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Docker has only $memGB GB memory allocated" -ForegroundColor Yellow
            Write-Host "   Recommended: At least 8GB for Cognee" -ForegroundColor Yellow
            Write-Host "   Go to Docker Desktop → Settings → Resources → Memory" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  Could not check Docker resources" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Validation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($containers -match "local-cognee-memory" -and $containers -match "local-cognee-neo4j") {
    Write-Host "🎉 Your local Cognee memory system is up and running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open Neo4j browser: http://localhost:7474" -ForegroundColor White
    Write-Host "2. Configure MCP in .mcp.json (Phase 2)" -ForegroundColor White
    Write-Host "3. Create Cognee Memory skill (Phase 3)" -ForegroundColor White
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "  View logs: docker compose -f docker-compose.cognee.yml logs -f" -ForegroundColor Gray
    Write-Host "  Stop: docker compose -f docker-compose.cognee.yml down" -ForegroundColor Gray
    Write-Host "  Restart: docker compose -f docker-compose.cognee.yml restart" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Setup incomplete. Please start the containers:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  docker compose -f docker-compose.cognee.yml --env-file .env.cognee.local up -d" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again to validate." -ForegroundColor White
}

Write-Host ""
