# MCP Skills Migration Plan: From .claude Agents to MCP Tools

> Migration strategy to replace `.claude/agents/` with MCP-powered skills and specialized tools for Nanobanna Pro

**Current State**: 22 `.claude/agents/` files
**Target State**: MCP-based skills with specialized tools + automation scripts
**Timeline**: 4-week phased migration

---

## 🎯 Why Migrate to MCP Skills?

### Current Limitations (.claude/agents/)
- ❌ Tightly coupled to Claude Code CLI
- ❌ Not reusable across projects
- ❌ No standard tool ecosystem
- ❌ Manual agent invocation required
- ❌ Limited automation capabilities

### MCP Skills Benefits
- ✅ **Portable**: Works across Claude Code, Claude.ai, and API
- ✅ **Tool-Powered**: Direct access to specialized MCP servers (databases, browsers, files, APIs)
- ✅ **Composable**: Chain multiple MCP tools in single skill
- ✅ **Automated**: Trigger-based execution (pre-commit, post-merge, etc.)
- ✅ **Community-Driven**: Reuse from 52,900+ skill registry
- ✅ **Testable**: MCP tools can be tested independently

---

## 📊 Agent → MCP Skill Mapping

### Your Current 22 Agents → MCP Skills Conversion

| Current Agent | New MCP Skill | Required MCP Tools | Priority |
|---------------|---------------|-------------------|----------|
| `01-lead-architect.md` | `orchestration-skill` | `serena_memory`, `task-manager-mcp` | P1 |
| `02-database-guardian.md` | `neon-postgres-skill` | `neon_manager`, `supabase-mcp` | P1 |
| `03-fastapi-sentinel.md` | `api-development-skill` | `openapi-mcp`, `http-client-mcp` | P2 |
| `04-frontend-architect.md` | `react-architecture-skill` | `typescript-mcp`, `vite-mcp` | P1 |
| `05-depth-ui-engineer.md` | `glassmorphism-skill` | `playwright-mcp`, `lighthouse-mcp` | P1 |
| `06-security-warden.md` | `security-audit-skill` | `semgrep-mcp`, `osv-scanner-mcp` | P1 |
| `07-qa-engineer.md` | `vitest-automation-skill` | `vitest-mcp`, `coverage-mcp` | P1 |
| `08-accessibility-officer.md` | `a11y-compliance-skill` | `axe-core-mcp`, `pa11y-mcp` | P2 |
| `09-sre-engineer.md` | `observability-skill` | `langfuse-mcp`, `sentry-mcp` | P2 |
| `10-release-governor.md` | `git-workflow-skill` | `github-mcp`, `conventional-commits-mcp` | P1 |
| `11-realtime-engineer.md` | `websocket-skill` | `livekit-mcp`, `openai-realtime-mcp` | P2 |
| `12-ai-safety-engineer.md` | `prompt-safety-skill` | `guardrails-mcp`, `llm-validator-mcp` | P2 |
| `13-ai-services-integrator.md` | `cognee-integration-skill` | `cognee-mcp`, `docling-mcp` | P3 |
| `14-code-standards-auditor.md` | `eslint-prettier-skill` | `eslint-mcp`, `prettier-mcp` | P1 |
| `15-ui-route-detective.md` | `route-testing-skill` | `playwright-mcp`, `chrome-devtools-mcp` | P2 |
| `16-ux-analytics-engineer.md` | `telemetry-skill` | `analytics-mcp`, `posthog-mcp` | P3 |
| `accessibility-officer.md` | *(duplicate - merge with 08)* | - | - |
| `ai-evals-benchmark-engineer.md` | `ai-quality-gates-skill` | `langfuse-mcp`, `ragas-mcp` | P3 |
| `ai-safety-engineer.md` | *(duplicate - merge with 12)* | - | - |
| `chrome-ui-path-detective.md` | `visual-regression-skill` | `playwright-mcp`, `percy-mcp` | P2 |
| `cognee-knowledge-engineer.md` | *(duplicate - merge with 13)* | - | - |
| `docling-ingestion-engineer.md` | `document-processing-skill` | `docling-mcp`, `unstructured-mcp` | P3 |
| `rag-retrieval-engineer.md` | `rag-optimization-skill` | `cognee-mcp`, `chroma-mcp` | P3 |
| `realtime-engineer.md` | *(duplicate - merge with 11)* | - | - |
| `release-governor.md` | *(duplicate - merge with 10)* | - | - |
| `repo-auditor-refactor-planner.md` | `codebase-analysis-skill` | `serena-mcp`, `ast-grep-mcp` | P2 |
| `research-standards-verifier.md` | `citation-checker-skill` | `scholar-mcp`, `arxiv-mcp` | P3 |
| `router-navigation-governor.md` | `route-manifest-skill` | `react-router-mcp`, `playwright-mcp` | P2 |
| `security-warden.md` | *(duplicate - merge with 06)* | - | - |
| `sre-engineer.md` | *(duplicate - merge with 09)* | - | - |
| `ux-telemetry-heatmap-architect.md` | *(duplicate - merge with 16)* | - | - |
| `white-screen-triage-engineer.md` | `error-debugging-skill` | `chrome-devtools-mcp`, `sentry-mcp` | P1 |

**Result**: 22 agents → **17 unique MCP skills** (5 duplicates removed)

---

## 🛠️ Required MCP Tools Inventory

### Category 1: Database & Backend (Priority 1)
| MCP Tool | Purpose | Installation | Status |
|----------|---------|--------------|--------|
| `neon_manager` | Neon PostgreSQL operations | ✅ Already installed | Active |
| `supabase-mcp` | Supabase client, RLS, migrations | `npx @modelcontextprotocol/create-server supabase` | Todo |
| `postgres-mcp` | Generic PostgreSQL queries | `npm install @modelcontextprotocol/server-postgres` | Todo |

### Category 2: Frontend & Testing (Priority 1)
| MCP Tool | Purpose | Installation | Status |
|----------|---------|--------------|--------|
| `playwright-mcp` | Browser automation, visual testing | `npm install @playwright/mcp-server` | Todo |
| `vitest-mcp` | Test runner integration | `npm install @vitest/mcp-server` | Todo |
| `typescript-mcp` | TypeScript language server | `npm install @modelcontextprotocol/server-typescript` | Todo |
| `eslint-mcp` | Linting integration | `npm install @modelcontextprotocol/server-eslint` | Todo |

### Category 3: Security & Quality (Priority 1)
| MCP Tool | Purpose | Installation | Status |
|----------|---------|--------------|--------|
| `semgrep-mcp` | Static analysis security | `npm install @semgrep/mcp-server` | Todo |
| `osv-scanner-mcp` | Vulnerability scanning | `npm install @google/osv-scanner-mcp` | Todo |
| `axe-core-mcp` | Accessibility auditing | `npm install @axe-core/mcp-server` | Todo |

### Category 4: Git & Deployment (Priority 1)
| MCP Tool | Purpose | Installation | Status |
|----------|---------|--------------|--------|
| `github-mcp` | GitHub API, PR management | `npm install @modelcontextprotocol/server-github` | Todo |
| `conventional-commits-mcp` | Commit message validation | `npm install @conventional-commits/mcp-server` | Todo |

### Category 5: AI Services (Priority 2)
| MCP Tool | Purpose | Installation | Status |
|----------|---------|--------------|--------|
| `openai-realtime-mcp` | OpenAI Realtime API | `npm install @openai/realtime-mcp` | Todo |
| `langfuse-mcp` | LLM observability, tracing | `npm install @langfuse/mcp-server` | Todo |
| `guardrails-mcp` | Prompt safety validation | `npm install @guardrails-ai/mcp-server` | Todo |

### Category 6: Performance & Observability (Priority 2)
| MCP Tool | Purpose | Installation | Status |
|----------|---------|--------------|--------|
| `lighthouse-mcp` | Performance auditing | `npm install @lighthouse/mcp-server` | Todo |
| `chrome-devtools-mcp` | Chrome DevTools Protocol | `npm install @chrome-devtools/mcp-server` | Todo |
| `sentry-mcp` | Error tracking integration | `npm install @sentry/mcp-server` | Todo |

### Category 7: Advanced (Priority 3)
| MCP Tool | Purpose | Installation | Status |
|----------|---------|--------------|--------|
| `cognee-mcp` | Knowledge graph operations | `npm install @cognee/mcp-server` | Todo |
| `docling-mcp` | Document ingestion | `npm install @docling/mcp-server` | Todo |
| `chroma-mcp` | Vector database operations | `npm install @chroma-ai/mcp-server` | Todo |
| `ragas-mcp` | RAG evaluation metrics | `npm install @ragas/mcp-server` | Todo |

**Total MCP Tools Required**: 22 (1 installed, 21 to install)

---

## 📁 New Project Structure

### Before (Current)
```
.claude/
  agents/
    01-lead-architect.md
    02-database-guardian.md
    ...22 agent files...
  skills/
    cloud_run_manager/
    deep_analysis/
    neon_manager/
    serena_memory/
    workos_manager/
    powershell_build/
```

### After (Target)
```
.claude/
  skills/
    # Core workflow skills (Priority 1)
    neon-postgres-skill/
      SKILL.md
      tools/
        schema-validator.ts
        rls-generator.ts
    react-architecture-skill/
      SKILL.md
      tools/
        component-analyzer.ts
        import-sorter.ts
    security-audit-skill/
      SKILL.md
      tools/
        api-key-scanner.ts
        rls-policy-checker.ts
    vitest-automation-skill/
      SKILL.md
      tools/
        coverage-enforcer.ts
        test-generator.ts
    git-workflow-skill/
      SKILL.md
      tools/
        worktree-manager.ts
        conventional-commit-validator.ts
    glassmorphism-skill/
      SKILL.md
      tools/
        blur-budget-checker.ts
        a11y-fallback-generator.ts

    # Specialized skills (Priority 2-3)
    observability-skill/
    websocket-skill/
    route-testing-skill/
    ai-quality-gates-skill/
    document-processing-skill/

  mcp/
    # MCP server configurations
    config.json
    servers/
      neon.json
      supabase.json
      playwright.json
      github.json
      langfuse.json

  scripts/
    # Automation scripts
    install-mcp-tools.sh
    activate-skill.sh
    run-quality-gates.sh
```

---

## 🚀 Migration Phases

### Phase 1: Foundation (Week 1)
**Goal**: Migrate critical path agents to MCP skills

**Tasks**:
1. ✅ Install Priority 1 MCP tools
   ```bash
   npm install @modelcontextprotocol/server-supabase
   npm install @playwright/mcp-server
   npm install @vitest/mcp-server
   npm install @modelcontextprotocol/server-github
   npm install @semgrep/mcp-server
   ```

2. ✅ Create `neon-postgres-skill`
   - Convert `02-database-guardian.md` → MCP skill
   - Integrate `neon_manager` + `supabase-mcp`
   - Add RLS policy validator tool
   - Add migration generator tool

3. ✅ Create `security-audit-skill`
   - Convert `06-security-warden.md` → MCP skill
   - Integrate `semgrep-mcp` + `osv-scanner-mcp`
   - Add API key scanner tool
   - Add pre-commit hook

4. ✅ Create `vitest-automation-skill`
   - Convert `07-qa-engineer.md` → MCP skill
   - Integrate `vitest-mcp`
   - Add 80% coverage enforcer
   - Add test generator

5. ✅ Create `git-workflow-skill`
   - Convert `10-release-governor.md` → MCP skill
   - Integrate `github-mcp` + `conventional-commits-mcp`
   - Add worktree automation
   - Add stacked diff validator

**Deliverables**:
- 4 production-ready MCP skills
- 8 MCP tools installed
- Pre-commit hooks configured
- Documentation updated

**Success Criteria**:
- All Priority 1 workflows functional
- Zero regression in current development speed
- MCP skills pass integration tests

---

### Phase 2: Frontend & UI (Week 2)
**Goal**: Migrate frontend/UI agents to MCP skills

**Tasks**:
1. ✅ Install frontend MCP tools
   ```bash
   npm install @modelcontextprotocol/server-typescript
   npm install @modelcontextprotocol/server-eslint
   npm install @axe-core/mcp-server
   npm install @lighthouse/mcp-server
   ```

2. ✅ Create `react-architecture-skill`
   - Convert `04-frontend-architect.md` → MCP skill
   - Integrate `typescript-mcp` + `eslint-mcp`
   - Add import sorter tool
   - Add component analyzer tool

3. ✅ Create `glassmorphism-skill`
   - Convert `05-depth-ui-engineer.md` → MCP skill
   - Integrate `playwright-mcp` + `lighthouse-mcp`
   - Add blur budget checker
   - Add a11y fallback generator

4. ✅ Create `route-testing-skill`
   - Convert `15-ui-route-detective.md` → MCP skill
   - Integrate `playwright-mcp` + `chrome-devtools-mcp`
   - Add route manifest validator
   - Add visual regression tester

**Deliverables**:
- 3 frontend MCP skills
- 4 additional MCP tools
- Component library standards enforced
- A11y compliance automated

**Success Criteria**:
- Import hygiene 100% compliant
- Blur budget violations = 0
- Route tests pass on all tabs

---

### Phase 3: Observability & AI (Week 3)
**Goal**: Migrate AI/observability agents to MCP skills

**Tasks**:
1. ✅ Install AI/observability MCP tools
   ```bash
   npm install @langfuse/mcp-server
   npm install @openai/realtime-mcp
   npm install @guardrails-ai/mcp-server
   npm install @sentry/mcp-server
   ```

2. ✅ Create `observability-skill`
   - Convert `09-sre-engineer.md` → MCP skill
   - Integrate `langfuse-mcp` + `sentry-mcp`
   - Add error tracking automation
   - Add performance monitoring

3. ✅ Create `websocket-skill`
   - Convert `11-realtime-engineer.md` → MCP skill
   - Integrate `openai-realtime-mcp`
   - Add voice command tester
   - Add WebSocket health checker

4. ✅ Create `prompt-safety-skill`
   - Convert `12-ai-safety-engineer.md` → MCP skill
   - Integrate `guardrails-mcp`
   - Add prompt validator
   - Add output sanitizer

**Deliverables**:
- 3 observability/AI MCP skills
- 4 monitoring tools integrated
- Voice agent testing automated
- Prompt safety enforced

**Success Criteria**:
- All AI API calls traced in Langfuse
- Voice command tests pass
- Prompt injection attempts blocked

---

### Phase 4: Advanced & Cleanup (Week 4)
**Goal**: Migrate remaining agents, deprecate old structure

**Tasks**:
1. ✅ Install advanced MCP tools
   ```bash
   npm install @cognee/mcp-server
   npm install @docling/mcp-server
   npm install @chroma-ai/mcp-server
   ```

2. ✅ Create advanced skills
   - `cognee-integration-skill`
   - `document-processing-skill`
   - `rag-optimization-skill`
   - `ai-quality-gates-skill`

3. ✅ Deprecate `.claude/agents/`
   ```bash
   mkdir .claude/agents.deprecated
   mv .claude/agents/*.md .claude/agents.deprecated/
   ```

4. ✅ Update documentation
   - Rewrite `CLAUDE.md` to reference MCP skills
   - Update `shared_contract.md`
   - Create skill usage guides

5. ✅ Create automation scripts
   - `scripts/install-all-mcp-tools.sh`
   - `scripts/activate-skill-suite.sh`
   - `scripts/run-pre-commit-suite.sh`

**Deliverables**:
- 17 total MCP skills operational
- 22 MCP tools installed
- `.claude/agents/` deprecated
- Full documentation suite

**Success Criteria**:
- All 22 original agent capabilities covered by MCP skills
- Zero dependency on `.claude/agents/`
- Developer onboarding time reduced by 50%

---

## 🔧 Example MCP Skill Structure

### `neon-postgres-skill/SKILL.md`
```markdown
# Neon PostgreSQL Skill

Automated database schema management, RLS policy generation, and migration workflows for Neon PostgreSQL.

## Capabilities
- Schema validation against production
- RLS policy generation from access patterns
- Migration script generation with rollback
- Query performance analysis

## Required MCP Tools
- `neon_manager` (installed)
- `supabase-mcp`
- `postgres-mcp`

## Triggers
- Pre-commit: Validate migrations
- Pre-push: Check RLS policies
- On-demand: Generate schema diff

## Usage
```bash
/skill activate neon-postgres-skill
/skill run neon-postgres-skill validate-schema
/skill run neon-postgres-skill generate-rls --table users
```

## Configuration
```json
{
  "neon-postgres-skill": {
    "project_id": "nanobanna-pro-db",
    "enforce_rls": true,
    "auto_migrate": false,
    "coverage_threshold": 100
  }
}
```

## Tools

### 1. Schema Validator
**File**: `tools/schema-validator.ts`
**Purpose**: Compares local schema with production, detects drift
**MCP Calls**: `neon_manager.get_schema()`, `postgres-mcp.diff_schema()`

### 2. RLS Policy Generator
**File**: `tools/rls-generator.ts`
**Purpose**: Generates RLS policies from access patterns
**MCP Calls**: `supabase-mcp.create_policy()`, `postgres-mcp.validate_policy()`

### 3. Migration Generator
**File**: `tools/migration-generator.ts`
**Purpose**: Creates migration + rollback scripts
**MCP Calls**: `neon_manager.create_migration()`, `postgres-mcp.test_migration()`

## Tests
- `tests/schema-validator.test.ts`
- `tests/rls-generator.test.ts`
- `tests/migration-generator.test.ts`

## Success Metrics
- 100% of tables have RLS policies
- 0 schema drift detections in production
- <5 min migration generation time
```

---

## 📜 Automation Scripts

### `scripts/install-all-mcp-tools.sh`
```bash
#!/bin/bash
set -e

echo "Installing Priority 1 MCP Tools..."
npm install @modelcontextprotocol/server-supabase
npm install @playwright/mcp-server
npm install @vitest/mcp-server
npm install @modelcontextprotocol/server-github
npm install @semgrep/mcp-server
npm install @modelcontextprotocol/server-typescript
npm install @modelcontextprotocol/server-eslint

echo "Installing Priority 2 MCP Tools..."
npm install @axe-core/mcp-server
npm install @lighthouse/mcp-server
npm install @chrome-devtools/mcp-server
npm install @langfuse/mcp-server
npm install @openai/realtime-mcp
npm install @guardrails-ai/mcp-server
npm install @sentry/mcp-server

echo "Installing Priority 3 MCP Tools..."
npm install @cognee/mcp-server
npm install @docling/mcp-server
npm install @chroma-ai/mcp-server
npm install @ragas/mcp-server

echo "✅ All 21 MCP tools installed successfully!"
```

### `scripts/activate-skill-suite.sh`
```bash
#!/bin/bash
set -e

echo "Activating MCP Skills for Nanobanna Pro..."

# Priority 1
claude-skills activate neon-postgres-skill
claude-skills activate security-audit-skill
claude-skills activate vitest-automation-skill
claude-skills activate git-workflow-skill

# Priority 2
claude-skills activate react-architecture-skill
claude-skills activate glassmorphism-skill
claude-skills activate route-testing-skill

# Priority 3
claude-skills activate observability-skill
claude-skills activate websocket-skill
claude-skills activate prompt-safety-skill

echo "✅ 10 core skills activated!"
```

### `scripts/run-pre-commit-suite.sh`
```bash
#!/bin/bash
set -e

echo "Running pre-commit quality gates..."

# Security audit
claude-skills run security-audit-skill scan-api-keys
claude-skills run security-audit-skill validate-rls-policies

# Code quality
claude-skills run react-architecture-skill validate-imports
claude-skills run react-architecture-skill check-explicit-types

# Testing
claude-skills run vitest-automation-skill check-coverage

# Performance
claude-skills run glassmorphism-skill validate-blur-budget

echo "✅ All pre-commit gates passed!"
```

---

## 📊 Migration Tracking

### Week 1 Checklist
- [ ] Install 8 Priority 1 MCP tools
- [ ] Create `neon-postgres-skill`
- [ ] Create `security-audit-skill`
- [ ] Create `vitest-automation-skill`
- [ ] Create `git-workflow-skill`
- [ ] Configure pre-commit hooks
- [ ] Run integration tests
- [ ] Update CLAUDE.md

### Week 2 Checklist
- [ ] Install 4 frontend MCP tools
- [ ] Create `react-architecture-skill`
- [ ] Create `glassmorphism-skill`
- [ ] Create `route-testing-skill`
- [ ] Enforce import hygiene
- [ ] Validate a11y compliance
- [ ] Run visual regression tests

### Week 3 Checklist
- [ ] Install 4 observability MCP tools
- [ ] Create `observability-skill`
- [ ] Create `websocket-skill`
- [ ] Create `prompt-safety-skill`
- [ ] Integrate Langfuse tracing
- [ ] Test voice command suite
- [ ] Validate prompt safety

### Week 4 Checklist
- [ ] Install 5 advanced MCP tools
- [ ] Create 4 advanced skills
- [ ] Deprecate `.claude/agents/`
- [ ] Rewrite documentation
- [ ] Create automation scripts
- [ ] Run full regression suite
- [ ] Deploy to production

---

## 🎯 Success Criteria

### Technical
- ✅ 17 MCP skills operational (replaces 22 agents)
- ✅ 22 MCP tools installed and configured
- ✅ 100% feature parity with old agents
- ✅ Pre-commit automation working
- ✅ Zero regressions in development workflow

### Performance
- ✅ 50% faster skill activation (vs agent invocation)
- ✅ 90% reduction in manual tool switching
- ✅ 30% improvement in task completion time
- ✅ 100% test coverage maintained

### Developer Experience
- ✅ Single-command skill activation
- ✅ Automated quality gates
- ✅ Self-documenting skills
- ✅ Reusable across projects

---

## 🔗 Resources

- **MCP Specification**: https://modelcontextprotocol.io/
- **MCP Server Registry**: https://github.com/modelcontextprotocol/servers
- **Claude Skills Documentation**: https://code.claude.com/docs/en/skills
- **Skill Builder Tool**: https://github.com/metaskills/skill-builder
- **Community Skills**: https://github.com/karanb192/awesome-claude-skills

---

*Migration Plan for Nanobanna Pro - 2026-01-13*
*Plan Version: 1.0.0*
