#!/bin/bash
# MCP Configuration Verification Script
# Tests all configured MCP servers and reports status

set -e

echo "=========================================="
echo "MCP Configuration Verification"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test MCP server
test_mcp_server() {
    local server_name=$1
    echo -n "Testing $server_name... "

    if claude mcp test "$server_name" &>/dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    local var_name=$1
    local required=$2

    if [ -f .env.mcp ] && grep -q "^${var_name}=" .env.mcp; then
        local value=$(grep "^${var_name}=" .env.mcp | cut -d= -f2)
        if [ -n "$value" ]; then
            echo -e "${GREEN}✓${NC} $var_name is set"
            return 0
        fi
    fi

    if [ "$required" = "true" ]; then
        echo -e "${RED}✗${NC} $var_name is MISSING (required)"
        return 1
    else
        echo -e "${YELLOW}⚠${NC} $var_name is not set (optional)"
        return 0
    fi
}

echo "Step 1: Checking .mcp.json configuration"
echo "------------------------------------------"
if [ -f .mcp.json ]; then
    echo -e "${GREEN}✓${NC} .mcp.json exists"

    # Count configured servers
    server_count=$(jq '.mcpServers | length' .mcp.json)
    echo "  Configured servers: $server_count"

    # List servers
    echo "  Servers:"
    jq -r '.mcpServers | keys[]' .mcp.json | while read server; do
        echo "    - $server"
    done
else
    echo -e "${RED}✗${NC} .mcp.json not found"
    exit 1
fi
echo ""

echo "Step 2: Checking environment variables"
echo "----------------------------------------"
if [ -f .env.mcp ]; then
    echo -e "${GREEN}✓${NC} .env.mcp exists"
    echo ""
    echo "  Required credentials:"
    check_env_var "PERPLEXITY_API_KEY" "true"
    check_env_var "BRAVE_API_KEY" "true"
    check_env_var "FIRECRAWL_API_KEY" "true"
    check_env_var "WORKOS_API_KEY" "true"
    check_env_var "WORKOS_CLIENT_ID" "true"
    echo ""
    echo "  Optional credentials:"
    check_env_var "OPENAI_API_KEY" "false"
    check_env_var "ANTHROPIC_API_KEY" "false"
else
    echo -e "${RED}✗${NC} .env.mcp not found"
    echo "  Create .env.mcp with required API keys"
    exit 1
fi
echo ""

echo "Step 3: Testing MCP server connectivity"
echo "----------------------------------------"
echo "Note: This requires Claude Code to be running"
echo ""

failed_servers=0

# Test each configured server
for server in workos workos-cli perplexity context7 brave-search firecrawl; do
    if ! test_mcp_server "$server"; then
        ((failed_servers++))
    fi
done

echo ""

echo "Step 4: Checking external services"
echo "-----------------------------------"
echo -n "Testing Cognee service (HTTP)... "
if curl -s -f http://localhost:8000/health &>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${YELLOW}⚠ NOT RUNNING${NC}"
    echo "  Start Cognee: cd cognee_agents && python -m uvicorn main:app --reload --port 8000"
fi
echo ""

echo "=========================================="
echo "Verification Summary"
echo "=========================================="
if [ $failed_servers -eq 0 ]; then
    echo -e "${GREEN}✓ All MCP servers passed${NC}"
    echo ""
    echo "Configuration is complete and working."
    exit 0
else
    echo -e "${RED}✗ $failed_servers MCP server(s) failed${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Ensure all required API keys are in .env.mcp"
    echo "2. Check API key validity"
    echo "3. Run: claude mcp list"
    echo "4. Run: claude mcp logs <server-name>"
    echo ""
    echo "See .claude/MCP_CONFIGURATION_SUMMARY.md for details"
    exit 1
fi
