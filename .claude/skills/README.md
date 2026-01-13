# Claude Skills Directory

> Active skills for Nanobanna Pro development workflow

**Last Updated**: 2026-01-13

---

## 📁 Directory Structure

```
.claude/skills/
├── orchestrator/              # Main coordination skill (Sonnet)
├── research-agent/            # Code exploration (Haiku)
├── coding-agent/              # Feature implementation (Sonnet)
├── debugging-agent/           # Error investigation (Sonnet)
├── decision-agent/            # Architecture decisions (Opus)
├── quick-tasks-agent/         # Simple fixes (Haiku)
├── neon_manager/              # Neon PostgreSQL integration
├── serena_memory/             # Semantic code intelligence
├── workos_manager/            # WorkOS authentication
├── cloud_run_manager/         # Google Cloud Run deployment
├── deep_analysis/             # Deep reasoning for complex problems
└── powershell_build/          # PowerShell build tools (Windows)
```

---

## 🤖 Agent Skills (Cost-Optimized)

### Orchestrator
**Model**: Sonnet 4.5
**Cost**: $24/1M tokens
**Purpose**: Routes tasks to optimal agent
**File**: `orchestrator/SKILL.md`

### Research Agent
**Model**: Haiku 4.5
**Cost**: $0.80/1M tokens (cheapest!)
**Purpose**: Code exploration, documentation lookup, pattern finding
**File**: `research-agent/SKILL.md`

**Triggers**:
- "How does X work?"
- "Find all usages of Y"
- "Where is Z defined?"

### Quick Tasks Agent
**Model**: Haiku 4.5
**Cost**: $0.80/1M tokens
**Purpose**: Type fixes, import sorting, simple edits
**File**: `quick-tasks-agent/SKILL.md`

**Triggers**:
- "Fix TypeScript errors"
- "Sort imports"
- "Add missing types"

### Coding Agent
**Model**: Sonnet 4.5
**Cost**: $24/1M tokens
**Purpose**: Feature implementation, refactoring (50-500 lines)
**File**: `coding-agent/SKILL.md`

**Triggers**:
- "Implement X feature"
- "Add Y component"
- "Refactor Z"

### Debugging Agent
**Model**: Sonnet 4.5
**Cost**: $24/1M tokens
**Purpose**: Error investigation, performance profiling
**File**: `debugging-agent/SKILL.md`

**Triggers**:
- "Fix bug in X"
- "Debug Y error"
- "Performance issue in Z"

### Decision Agent
**Model**: Opus 4.5
**Cost**: $120/1M tokens (most expensive - use sparingly!)
**Purpose**: Critical architecture decisions, trade-off analysis
**File**: `decision-agent/SKILL.md`

**Triggers**:
- "Should we migrate to X?"
- "Compare Y vs Z"
- "Architecture decision for W"

---

## 🛠️ Infrastructure Skills

### Neon Manager
**Purpose**: Neon PostgreSQL database operations
**Capabilities**: Schema inspection, query execution, migration management
**File**: `neon_manager/SKILL.md`

### Serena Memory
**Purpose**: Semantic code navigation and project context
**Capabilities**: Symbol search, dependency analysis, refactoring suggestions
**File**: `serena_memory/SKILL.md`

### WorkOS Manager
**Purpose**: WorkOS authentication integration
**Capabilities**: OAuth, SSO, user management
**File**: `workos_manager/SKILL.md`

### Cloud Run Manager
**Purpose**: Google Cloud Run deployment
**Capabilities**: Service deployment, logging, configuration
**File**: `cloud_run_manager/SKILL.md`

### Deep Analysis
**Purpose**: Complex problem-solving with sequential thinking
**Capabilities**: Architecture decisions, debugging hard problems, planning
**File**: `deep_analysis/SKILL.md`

### PowerShell Build (Windows Only)
**Purpose**: PowerShell Core build automation
**File**: `powershell_build/SKILL.md`

---

## 📊 Cost Comparison

| Task Type | Old (All Opus) | New (Smart Routing) | Savings |
|-----------|----------------|---------------------|---------|
| Research | $120/1M | $0.80/1M | **99.3%** |
| Quick Fixes | $120/1M | $0.80/1M | **99.3%** |
| Coding | $120/1M | $24/1M | **80%** |
| Debugging | $120/1M | $24/1M | **80%** |
| Decisions | $120/1M | $120/1M | 0% (already optimal) |

**Average Savings**: **87.5%**

---

## 🚀 How to Use

### Automatic (Recommended)
Just ask naturally - the orchestrator routes automatically:

```
"Find all authentication code" → research-agent (Haiku) - $0.01
"Fix type errors" → quick-tasks-agent (Haiku) - $0.003
"Add credit system" → coding-agent (Sonnet) - $0.90
"Debug WebSocket issue" → debugging-agent (Sonnet) - $0.60
"Should we use Redux?" → decision-agent (Opus) - $2.20
```

### Manual Activation
```bash
/skill activate research-agent
/skill activate coding-agent
```

### Check Available Skills
```bash
/skills list
```

---

## 📈 Success Metrics

Track these KPIs:
- **Cost per task**: Target <$0.50 average
- **Token efficiency**: 87% reduction vs Opus-only
- **Task completion rate**: >95%
- **Escalation rate**: <10%

---

## 🔧 Installation

### Install Community Skills
See: `docs/RECOMMENDED_SKILLS_FOR_NANOBANNA.md`

```bash
cd ~/skills-library
git clone https://github.com/karanb192/awesome-claude-skills.git
cp -r awesome-claude-skills/test-driven-development .claude/skills/
```

### Install MCP Tools
See: `docs/MCP_SKILLS_MIGRATION_PLAN.md`

```bash
npm install @modelcontextprotocol/server-supabase
npm install @playwright/mcp-server
npm install @vitest/mcp-server
```

---

## 📚 Documentation

- **Orchestration System**: `docs/AGENT_ORCHESTRATION_SYSTEM.md`
- **Migration Plan**: `docs/MCP_SKILLS_MIGRATION_PLAN.md`
- **Setup Guide**: `docs/COMPLETE_SETUP_GUIDE.md`
- **Skills Registry**: `docs/CLAUDE_AGENT_SKILLS_REGISTRY.md`

---

## ⚠️ Notes

- **Decision Agent (Opus)**: Ask for user approval before using (expensive)
- **Token Budgets**: Enforced per skill to prevent cost overruns
- **Automatic Delegation**: Orchestrator decides based on task complexity
- **Cost Tracking**: Check daily usage with "Show me today's cost breakdown"

---

*Skills-based architecture implemented: 2026-01-13*
