# MCP Configuration Summary

> **Last Updated**: 2026-01-13
> **Status**: Configuration Complete

---

## Overview

This document explains the MCP (Model Context Protocol) server configuration in `.mcp.json` and clarifies which tools are MCP servers vs. built-in Claude Code features.

## Configured MCP Servers

The following external MCP servers are configured in `.mcp.json`:

### 1. WorkOS (Documentation)
- **Package**: `@workos/mcp-docs-server`
- **Purpose**: WorkOS SDK documentation and API reference
- **Required Credentials**: None (public docs)
- **Used By**: `workos-config-agent`

### 2. WorkOS CLI (Local Server)
- **Path**: `.workos-cli/mcp-server.js`
- **Purpose**: WorkOS API operations (users, orgs, SSO, etc.)
- **Required Credentials**: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`
- **Used By**: `workos-config-agent`

### 3. Perplexity AI
- **Package**: `@perplexity-ai/mcp-server`
- **Purpose**: Web search with AI reasoning
- **Required Credentials**: `PERPLEXITY_API_KEY` (in `.env.mcp`)
- **Used By**: `deep-research-agent`, `web-search-agent`

### 4. Context7
- **Package**: `@upstash/context7-mcp@latest`
- **Purpose**: Library documentation lookup (React, TypeScript, etc.)
- **Required Credentials**: None (public docs)
- **Used By**: `research-agent`, `deep-research-agent`, `web-search-agent`

### 5. Brave Search
- **Package**: `@anthropic/mcp-server-brave-search`
- **Purpose**: Web search (alternative to Perplexity)
- **Required Credentials**: `BRAVE_API_KEY` (in `.env.mcp`)
- **Used By**: `web-search-agent`, `research-agent`

### 6. Firecrawl
- **Package**: `firecrawl-mcp`
- **Purpose**: Web page scraping and content extraction
- **Required Credentials**: `FIRECRAWL_API_KEY` (in `.env.mcp`)
- **Used By**: `research-agent`, `deep-research-agent`

---

## NOT MCP Servers (Built-in Features)

These tools are referenced in `tool-allocation-matrix.json` but are **NOT** external MCP servers:

### Claude Code Built-in Tools
- **Read, Write, Edit** - File manipulation tools (core Claude Code)
- **Grep, Glob** - Search and pattern matching (core Claude Code)
- **Bash** - Command execution (core Claude Code)
- **WebSearch, WebFetch** - Built-in web access (Claude Code)
- **LSP** - Language Server Protocol (Claude Code)

### Claude Code Plugins (Configured in `.claude/skills/`)
- **neon_manager** - Neon PostgreSQL operations (skill-based)
- **serena_memory** - Semantic code intelligence (skill-based)
- **cloud_run_manager** - Google Cloud Run management (skill-based)
- **deep_analysis** - Extended thinking for complex problems (skill-based)

### External Services (Not MCP Protocol)
- **Cognee** - Memory/knowledge graph system (FastAPI HTTP service at `http://localhost:8000`)
- **Langfuse** - AI observability (HTTP API)
- **Supabase** - PostgreSQL database (HTTP API)

### Development Tools (Local CLI Commands)
- **ESLint** - JavaScript/TypeScript linting (npm package, CLI)
- **TypeScript** - Type checking (npm package, CLI)
- **Prettier** - Code formatting (npm package, CLI)
- **Vitest** - Unit testing (npm package, CLI)
- **Playwright** - Browser automation (npm package, CLI)
- **Semgrep** - Security scanning (CLI)
- **OSVScanner** - Vulnerability scanning (CLI)
- **ChromeDevTools** - Browser DevTools (Playwright/CDP)
- **Lighthouse** - Performance auditing (npm package, CLI)
- **Axe** - Accessibility testing (npm package)

---

## Required Environment Variables

Ensure these are set in `.env.mcp` (see `.claude/mcp-credentials-reference.md`):

```bash
# Required for Perplexity MCP
PERPLEXITY_API_KEY=pplx-xxx...

# Required for Brave Search MCP
BRAVE_API_KEY=BSA...

# Required for Firecrawl MCP
FIRECRAWL_API_KEY=fc-xxx...

# Required for WorkOS CLI MCP
WORKOS_API_KEY=sk_live_xxx...
WORKOS_CLIENT_ID=client_xxx...
```

---

## Verification Commands

### Test MCP Server Connectivity

```bash
# Test Perplexity
claude mcp test perplexity

# Test Context7
claude mcp test context7

# Test Brave Search
claude mcp test brave-search

# Test Firecrawl
claude mcp test firecrawl

# Test WorkOS
claude mcp test workos

# Test WorkOS CLI
claude mcp test workos-cli
```

### View Active MCP Servers

```bash
claude mcp list
```

---

## Adding New MCP Servers

To add a new MCP server:

1. **Update `.mcp.json`**:
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

2. **Add credentials to `.env.mcp`**:
   ```bash
   API_KEY=your_key_here
   ```

3. **Update `tool-allocation-matrix.json`** to assign the server to agents:
   ```json
   {
     "skill_tool_map": {
       "research-agent": {
         "mcp_servers": ["serena", "context7", "new-server"]
       }
     }
   }
   ```

4. **Test the configuration**:
   ```bash
   claude mcp test new-server
   ```

---

## Troubleshooting

### MCP Server Not Connecting

1. **Check credentials**:
   ```bash
   grep API_KEY .env.mcp
   ```

2. **Test MCP command manually**:
   ```bash
   npx -y @perplexity-ai/mcp-server
   ```

3. **Check Claude Code MCP status**:
   ```bash
   claude mcp list
   claude mcp logs <server-name>
   ```

### Environment Variable Not Loaded

Ensure `.env.mcp` is in the root directory and variables use `${VAR_NAME}` syntax in `.mcp.json`.

### Cognee Not Responding

Cognee is an HTTP service, not an MCP server:

```bash
# Start Cognee service
cd cognee_agents
python -m uvicorn main:app --reload --port 8000

# Test health
curl http://localhost:8000/health
```

---

## Architecture Notes

### Why Not Everything Is an MCP Server

- **MCP Protocol**: Designed for external services providing tools/resources to Claude
- **Built-in Tools**: File operations, search, bash commands are core Claude Code features
- **Skills**: Complex multi-step operations implemented as Claude Code plugins
- **HTTP Services**: Some services (Cognee, Langfuse) use REST APIs instead of MCP

### MCP vs Skills

| Aspect | MCP Server | Claude Code Skill |
|--------|-----------|-------------------|
| Protocol | MCP (stdio/HTTP) | Native Claude Code |
| Isolation | External process | Subagent/subprocess |
| State | Stateful service | Ephemeral execution |
| Configuration | `.mcp.json` | `.claude/skills/*/SKILL.md` |
| Examples | Perplexity, Context7 | neon_manager, serena_memory |

---

## References

- **MCP Specification**: https://modelcontextprotocol.io/
- **Claude Code MCP Docs**: https://docs.anthropic.com/claude-code/mcp
- **Credentials Reference**: `.claude/mcp-credentials-reference.md`
- **Tool Allocation Matrix**: `.claude/tool-allocation-matrix.json`
