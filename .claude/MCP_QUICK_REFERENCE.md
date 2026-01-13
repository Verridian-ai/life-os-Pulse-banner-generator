# MCP Quick Reference Card

> **Fast lookup for MCP server configuration and usage**

---

## Configured MCP Servers

| Server | Package | Credentials | Purpose |
|--------|---------|-------------|---------|
| **workos** | `@workos/mcp-docs-server` | None | WorkOS docs |
| **workos-cli** | `.workos-cli/mcp-server.js` | `WORKOS_API_KEY` | WorkOS API ops |
| **perplexity** | `@perplexity-ai/mcp-server` | `PERPLEXITY_API_KEY` | AI web search |
| **context7** | `@upstash/context7-mcp` | None | Library docs |
| **brave-search** | `@anthropic/mcp-server-brave-search` | `BRAVE_API_KEY` | Web search |
| **firecrawl** | `firecrawl-mcp` | `FIRECRAWL_API_KEY` | Web scraping |

---

## Quick Commands

```bash
# List all MCP servers
claude mcp list

# Test a specific server
claude mcp test perplexity

# View server logs
claude mcp logs perplexity

# Reload MCP configuration
claude mcp reload

# View MCP server status
claude mcp status
```

---

## Environment Variables Required

Add to `.env.mcp`:

```bash
# Required
PERPLEXITY_API_KEY=pplx-xxx...
BRAVE_API_KEY=BSA...
FIRECRAWL_API_KEY=fc-xxx...
WORKOS_API_KEY=sk_live_xxx...
WORKOS_CLIENT_ID=client_xxx...

# Optional (for Cognee and other services)
OPENAI_API_KEY=sk-xxx...
ANTHROPIC_API_KEY=sk-ant-xxx...
```

---

## Verification

```bash
# Bash/Linux/Mac
./scripts/verify_mcp_config.sh

# PowerShell/Windows
.\scripts\verify_mcp_config.ps1
```

---

## Agent → MCP Server Mapping

| Agent | MCP Servers Used |
|-------|------------------|
| **research-agent** | `context7`, `brave-search`, `firecrawl` |
| **deep-research-agent** | `context7`, `perplexity`, `brave-search`, `firecrawl` |
| **web-search-agent** | `context7`, `perplexity`, `brave-search` |
| **workos-config-agent** | `workos`, `workos-cli` |

---

## Troubleshooting

### Server Not Connecting

```bash
# 1. Check if server is configured
cat .mcp.json | grep "server-name"

# 2. Test server connection
claude mcp test server-name

# 3. View error logs
claude mcp logs server-name

# 4. Check credentials
grep API_KEY .env.mcp
```

### API Key Invalid

1. Verify key in `.env.mcp`
2. Check key expiration on provider dashboard
3. Ensure no extra whitespace in `.env.mcp`
4. Reload Claude Code to pick up changes

### Server Timeout

```bash
# Increase timeout in .mcp.json
{
  "mcpServers": {
    "server-name": {
      "timeout": 30000  // 30 seconds
    }
  }
}
```

---

## Adding a New MCP Server

1. **Install package** (if needed):
   ```bash
   npm install -g @company/mcp-server-package
   ```

2. **Add to `.mcp.json`**:
   ```json
   {
     "mcpServers": {
       "new-server": {
         "command": "npx",
         "args": ["-y", "@company/mcp-server-package"],
         "env": {
           "API_KEY": "${API_KEY}"
         }
       }
     }
   }
   ```

3. **Add credentials to `.env.mcp`**:
   ```bash
   API_KEY=your_key_here
   ```

4. **Update tool allocation** in `.claude/tool-allocation-matrix.json`

5. **Test**:
   ```bash
   claude mcp test new-server
   ```

---

## Common Issues

### "MCP server not found"
- Check spelling in `.mcp.json`
- Ensure package is installed: `npm list -g @company/mcp-server-package`

### "Authentication failed"
- Verify API key in `.env.mcp`
- Check key format matches provider requirements
- Ensure no quotes around values in `.env.mcp`

### "Connection timeout"
- Increase timeout in `.mcp.json`
- Check network connectivity
- Verify service is running (for local servers)

### "Command not found"
- Ensure `npx` is installed: `npm install -g npx`
- Check Node.js version: `node --version` (should be ≥18)

---

## Related Documentation

- **Full Configuration**: `.claude/MCP_CONFIGURATION_SUMMARY.md`
- **Credentials Reference**: `.claude/mcp-credentials-reference.md`
- **Tool Allocation**: `.claude/tool-allocation-matrix.json`
- **MCP Specification**: https://modelcontextprotocol.io/
