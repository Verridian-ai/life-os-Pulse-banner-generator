# 🚀 Cognee Local Memory - Quick Start

**5-Minute Setup for Windows**

---

## ✅ Pre-Configured for You

Your local Cognee is **already configured** with:

| Setting | Value | Why |
|---------|-------|-----|
| **LLM Model** | GPT-5.2 | Latest OpenAI model (Jan 2026) - 400K context, 93.2% GPQA |
| **Embedding Model** | text-embedding-3-small | Best cost/performance balance (6.5x cheaper than large!) |
| **OpenAI API Key** | ✅ Set from .env.local | Ready to use |
| **Container Names** | `local-cognee-*` | Clear it's for local development |
| **Ports** | 8000 (API), 7474/7687 (Neo4j), 5433 (Postgres) | No conflicts |

---

## 🎯 Start It Now (3 Commands)

```powershell
# 1. Set passwords (only need to do this once)
cp .env.cognee .env.cognee.local
# Edit .env.cognee.local and change:
#   NEO4J_PASSWORD=your_password
#   POSTGRES_PASSWORD=your_password

# 2. Start everything
docker compose -f docker-compose.cognee.yml --env-file .env.cognee.local up -d

# 3. Validate it worked
.\scripts\validate-cognee-deployment.ps1
```

Expected output:
```
✅ Docker Desktop is running
✅ Cognee API is healthy and responding
✅ Neo4j browser is accessible
🎉 Your local Cognee memory system is up and running!
```

---

## 📊 What You Get

### Cognee API (http://localhost:8000)
- Add documents to memory
- Search with natural language
- Build knowledge graphs
- **Model**: GPT-5.2 (400K context window)
- **Embeddings**: text-embedding-3-small (1536 dimensions, 6.5x cheaper)

### Neo4j Browser (http://localhost:7474)
- Visualize knowledge graph
- Query relationships
- Explore entity connections
- **Login**: neo4j / (your password)

### PostgreSQL (localhost:5433)
- Metadata storage
- Session tracking
- Configuration

---

## 🧠 How Agents Will Use It

Once MCP is configured (Phase 2):

```typescript
// Before a task
const context = await cognee.search(
  "authentication patterns in nanobanna",
  "nanobanna_global"
);
// Returns: "Found auth in AuthContext.tsx using Supabase RLS..."

// After completing work
await cognee.add(
  "Implemented credit system with Neon + RLS",
  "agent_coding"
);
await cognee.cognify("agent_coding");
// Stored in knowledge graph forever!
```

---

## 💰 Costs (Minimal)

Using **text-embedding-3-small** (6.5x cheaper than large!):

| Operation | Cost | Example |
|-----------|------|---------|
| **Embed 1,000 docs** | **$0.01** | Preload all project docs |
| **Embed 10,000 docs** | **$0.10** | Large codebase |
| **Search query** | **$0.00002** | Every agent search |
| **Cognify 100 docs** | ~$0.05 | Build knowledge graph (GPT-5.2) |

**Monthly estimate**: $5-10 for heavy usage (10K+ docs)

**Why text-embedding-3-small?**
- 1536 dimensions (same as Ada-002)
- Excellent accuracy for code/docs
- 6.5x cheaper than text-embedding-3-large ($0.02 vs $0.13 per 1M tokens)

---

## 🔧 Useful Commands

```powershell
# View logs
docker compose -f docker-compose.cognee.yml logs -f cognee

# Restart everything
docker compose -f docker-compose.cognee.yml restart

# Stop (keeps data)
docker compose -f docker-compose.cognee.yml down

# Stop and DELETE ALL DATA (fresh start)
docker compose -f docker-compose.cognee.yml down -v

# Check what's running
docker compose -f docker-compose.cognee.yml ps
```

---

## 🎓 What Makes GPT-5.2 Special

From [OpenAI GPT-5.2 Announcement](https://openai.com/index/introducing-gpt-5-2/):

- **Context Window**: 400,000 tokens (vs 128K for GPT-4)
- **Benchmark**: 93.2% on GPQA Diamond (graduate-level questions)
- **Math**: 40.3% on FrontierMath (expert-level problems)
- **AGI**: First model >90% on ARC-AGI-1, achieving 100% on AIME 2025
- **Released**: January 2026

Perfect for building rich knowledge graphs from complex code!

---

## ⏭️ Next Steps

1. ✅ **Phase 1 Complete**: Docker running locally
2. **Phase 2**: Configure MCP in `.mcp.json` (connect Claude Code)
3. **Phase 3**: Create Cognee Memory skill
4. **Phase 4**: Preload CLAUDE.md, routes, design docs
5. **Phase 5**: Update all agents to use memory

**Important Architecture Decision**: Read `docs/COGNEE_MEMORY_ARCHITECTURE.md` to understand:
- Why we DON'T need a dedicated "memory capture agent"
- Batch cognify() pattern (add many, cognify once)
- Agent-driven memory via MCP tools
- Three-tier memory system (global, agent, session)

Full setup guide: `COGNEE_LOCAL_SETUP.md`

---

## 🆘 Having Issues?

```powershell
# Common fix: Restart Docker Desktop
# Then run validation:
.\scripts\validate-cognee-deployment.ps1
```

**Still stuck?** Check `COGNEE_LOCAL_SETUP.md` → Troubleshooting section

---

**Sources**:
- [OpenAI GPT-5.2 Release](https://openai.com/index/introducing-gpt-5-2/)
- [Cognee Documentation](https://docs.cognee.ai/)
- [Research Document](docs/COGNEE_PERSISTENT_MEMORY_RESEARCH.md)
