# Local Cognee Memory Setup (Windows PC)

> **IMPORTANT**: This is a **LOCAL DEVELOPMENT SETUP** for your Windows PC only!
> This runs Cognee as a memory system for your Claude Code agents.
> It is **NOT** related to the production Nanobanna Pro deployment.

---

## What This Is

A local Docker-based Cognee instance that provides persistent memory for all your Claude Code agents and skills. Think of it as a "brain" that runs on your PC and remembers everything across sessions.

**Where It Runs**: Your Windows PC via Docker Desktop
**What It's For**: Claude Code agent memory (Research Agent, Coding Agent, etc.)
**Not Related To**: Nanobanna Pro production backend (that's separate)

---

## Prerequisites

1. **Docker Desktop** installed and running on Windows
   - Download from: https://www.docker.com/products/docker-desktop/
   - Ensure WSL 2 backend is enabled
   - Allocate at least 8GB RAM to Docker

2. **OpenAI API Key** (for embeddings)
   - You already have this in `.env.local`

---

## Quick Start

### Step 1: Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.cognee .env.cognee.local
   ```

2. Edit `.env.cognee.local` and set:
   ```bash
   # ✅ OpenAI API key is already configured!
   # Uses GPT-5.2 (latest model as of January 2026)
   # 400K context window, 93.2% GPQA Diamond benchmark
   OPENAI_API_KEY=sk-proj-[YOUR_KEY_IS_ALREADY_SET]

   # Set local passwords (these stay on your PC only)
   NEO4J_PASSWORD=your_secure_password
   POSTGRES_PASSWORD=your_secure_password

   # Model Configuration (already set to latest)
   LLM_MODEL=gpt-5.2
   EMBEDDING_MODEL=text-embedding-3-large
   ```

   **Note**: Your OpenAI API key is already pre-filled in `.env.cognee`!

### Step 2: Start Cognee

```bash
# Start all containers (Cognee + Neo4j + PostgreSQL)
docker compose -f docker-compose.cognee.yml --env-file .env.cognee.local up -d

# Check if everything is running
docker compose -f docker-compose.cognee.yml ps

# View logs
docker compose -f docker-compose.cognee.yml logs -f cognee
```

### Step 3: Verify It's Working

1. **Check Cognee API**:
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy"}`

2. **Check Neo4j Browser**:
   - Open: http://localhost:7474
   - Login with:
     - Username: `neo4j`
     - Password: (whatever you set in `.env.cognee.local`)

3. **Test adding content**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/add \
     -H "Content-Type: multipart/form-data" \
     -F "data=@CLAUDE.md" \
     -F "datasetName=test"
   ```

---

## What's Running

| Container | Port | Purpose |
|-----------|------|---------|
| **local-cognee-memory** | 8000 | Cognee API - memory operations |
| **local-cognee-neo4j** | 7474, 7687 | Neo4j graph database - relationships |
| **local-cognee-postgres** | 5433 | PostgreSQL - metadata storage |

---

## Claude Code Integration (Phase 2)

After Phase 1 is complete, you'll configure Claude Code to use this local Cognee instance via MCP:

```json
// .mcp.json
{
  "mcpServers": {
    "cognee-memory": {
      "transport": "http",
      "url": "http://localhost:8000/mcp",
      "env": {
        "LLM_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

Then your agents will be able to:
- Store learnings across sessions
- Retrieve context without re-explaining
- Share knowledge between agents
- Build up a project knowledge graph over time

---

## Managing the System

### Stop Cognee
```bash
docker compose -f docker-compose.cognee.yml down
```

### Stop and Remove All Data (fresh start)
```bash
docker compose -f docker-compose.cognee.yml down -v
```

### View Logs
```bash
# All services
docker compose -f docker-compose.cognee.yml logs -f

# Just Cognee
docker compose -f docker-compose.cognee.yml logs -f cognee

# Just Neo4j
docker compose -f docker-compose.cognee.yml logs -f neo4j
```

### Backup Your Data
```bash
# Backup volumes to a tar file
docker run --rm \
  -v local_cognee_memory_data:/data \
  -v C:/Users/Danie/Desktop:/backup \
  alpine tar czf /backup/cognee-backup-$(date +%Y%m%d).tar.gz /data
```

---

## Troubleshooting

### Docker Desktop Not Running
**Error**: `Cannot connect to the Docker daemon`

**Fix**:
1. Start Docker Desktop
2. Wait for it to fully start (green icon in system tray)
3. Try again

### Port Already in Use
**Error**: `Port 8000 is already allocated`

**Fix**:
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change the port in docker-compose.cognee.yml:
# ports:
#   - "8001:8000"  # Use 8001 instead
```

### Neo4j Won't Start
**Error**: Healthcheck failing

**Fix**:
```bash
# Check Neo4j logs
docker logs local-cognee-neo4j

# Common issue: Password too short
# Set NEO4J_PASSWORD to at least 8 characters
```

### Low Memory
**Error**: `OOMKilled` or containers crashing

**Fix**:
1. Open Docker Desktop
2. Settings → Resources
3. Increase Memory to at least 8GB
4. Click "Apply & Restart"

---

## Next Steps

1. ✅ **Phase 1**: Docker setup (you're here!)
2. ⏭️ **Phase 2**: Configure MCP in `.mcp.json`
3. ⏭️ **Phase 3**: Create Cognee Memory skill
4. ⏭️ **Phase 4**: Preload global memory with project docs
5. ⏭️ **Phase 5**: Integrate agents with memory system

---

## Important Notes

- **This is LOCAL ONLY**: Everything runs on your PC
- **Separate from Production**: The Nanobanna Pro backend has its own Cognee instance (if/when deployed)
- **Data Privacy**: Your data stays on your machine
- **No Cloud Costs**: Only uses OpenAI API for embeddings (minimal cost: ~$0.10 per 1000 docs)

---

For the full research and implementation plan, see:
- `docs/COGNEE_PERSISTENT_MEMORY_RESEARCH.md`
- `docs/ops/WORK_BOARD.md` (Task T016)
