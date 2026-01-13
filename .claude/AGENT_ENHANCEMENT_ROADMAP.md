# Claude Code Agent Enhancement Roadmap

> **Comprehensive enhancement prompt for systematically improving the Claude Code agent ecosystem**
> **Based on deep analysis of existing `.claude/` architecture, skills, and patterns**

**Created**: 2026-01-13  
**Current Architecture**: Skills-First Orchestration v2.0.0  
**Total Agents**: 14 active + 4 infrastructure  
**Gap Detection Status**: Self-healing system active

---

## Executive Summary

This roadmap provides actionable recommendations to enhance the Claude Code agent system with a focus on:

1. **Code refactoring automation** - Systematic codebase modernization
2. **Architecture analysis** - Deep structural understanding
3. **Security & performance auditing** - Proactive quality gates
4. **Agent best practices** - Skills-based patterns and MCP integration

---

## Part 1: Current State Analysis

### Strengths ✅

| Area | Status | Notes |
|------|--------|-------|
| Skill Delegation Architecture | Excellent | Mandatory Task tool delegation enforced |
| Tool Allocation Matrix | Complete | 793 lines of granular permissions |
| Cost Optimization | Active | Haiku/Sonnet/Opus tiered model selection |
| Self-Healing System | Configured | Gap detection with threshold triggers |
| Cognee Memory Integration | Full | All 14 agents have memory access |
| Ralph Loop (Autonomous) | Production | Airlock validation gates in place |
| Infrastructure Agents | Full Control | WorkOS, Neon, Cloud Run, GCloud |

### Gaps Identified 🔴

| Gap | Priority | Impact | Current Coverage |
|-----|----------|--------|------------------|
| **Refactoring Agent** | HIGH | No automated large-scale refactoring | 0% |
| **Architecture Analyzer** | HIGH | Manual architecture discovery | 20% |
| **Security Scanner** | MEDIUM | Security agent defined but not implemented | 10% |
| **Performance Profiler** | MEDIUM | No automated performance analysis | 0% |
| **Test Generator** | MEDIUM | Tests written manually by coding-agent | 30% |
| **Dependency Analyzer** | LOW | No automated dependency auditing | 0% |
| **Migration Agent** | LOW | Manual framework/lib migrations | 0% |

---

## Part 2: Recommended New Agents

### Priority 1: Refactoring Agent 🔧

**Purpose**: Automated, safe, large-scale code refactoring with rollback capability

**Model**: Sonnet 4.5 | **Token Budget**: 60,000 | **Cost**: ~$1.44/task

```yaml
triggers:
  - "refactor", "modernize", "migrate pattern", "convert to", "upgrade syntax"
  - "apply codemod", "transform code", "rename across", "extract component"

capabilities:
  - AST-based refactoring (safe transformations)
  - Pattern-to-pattern migration (e.g., class → hooks, callback → async)
  - Bulk rename with reference updates
  - Extract/inline function automation
  - Dead code elimination with dependency analysis
  - Import path migration
  - TypeScript strict mode enforcement

tools:
  - Read, Edit, Grep, Glob, Serena (semantic analysis)
  - ESLint --fix, TypeScript compiler
  - Git (atomic commits per refactor)

guardrails:
  - MUST run tests after each transformation
  - MUST preserve public API unless explicitly changing
  - MUST create backup branch before large refactors
  - MUST generate rollback script for each operation

cognee_permissions:
  search: true
  add: true
  cognify: true
  dataset: agent_refactoring
```

**Integration with Ralph Loop**: Perfect candidate for autonomous multi-iteration refactoring.

---

### Priority 2: Architecture Analyzer Agent 🏗️

**Purpose**: Deep structural analysis, dependency graphing, and architecture recommendations

**Model**: Sonnet 4.5 | **Token Budget**: 50,000 | **Cost**: ~$1.20/task

```yaml
triggers:
  - "analyze architecture", "dependency graph", "coupling analysis"
  - "find circular dependencies", "module boundaries", "layering violations"
  - "architecture health", "technical debt map", "hotspot analysis"

capabilities:
  - Generate module dependency graphs
  - Detect circular dependencies
  - Identify high-coupling components
  - Map data flow paths
  - Calculate code complexity metrics (cyclomatic, cognitive)
  - Identify architecture drift from intended patterns
  - Suggest modularization opportunities

tools:
  - Read, Grep, Glob (analysis)
  - Serena (semantic code understanding)
  - Graphviz/Mermaid (visualization output)
  - No Edit/Write (read-only analysis)

output_formats:
  - Mermaid diagrams for visualization
  - JSON for tooling integration
  - Markdown report with recommendations

cognee_permissions:
  search: true
  add: true
  cognify: true
  dataset: agent_architecture
```

---

### Priority 3: Security Auditor Agent 🔒

**Purpose**: Comprehensive security scanning with OWASP/CWE mapping

**Model**: Sonnet 4.5 | **Token Budget**: 40,000 | **Cost**: ~$0.96/task

```yaml
triggers:
  - "security audit", "vulnerability scan", "OWASP check", "secrets scan"
  - "dependency vulnerabilities", "RLS audit", "injection risks"
  - "auth security review", "API security", "penetration test prep"

capabilities:
  - Static analysis for common vulnerabilities (XSS, SQLi, CSRF)
  - Secrets detection (API keys, passwords in code)
  - Dependency vulnerability scanning (npm audit, OSV)
  - Supabase RLS policy verification
  - Authentication flow analysis
  - Input validation coverage
  - CORS and CSP policy review

tools:
  - Read, Grep, Glob (scanning)
  - Semgrep MCP (rule-based analysis)
  - OSV-Scanner (dependency CVEs)
  - npm audit, pnpm audit
  - No Edit (report only, fixes go to coding-agent)

severity_levels:
  - CRITICAL: Immediate action (exposed secrets, auth bypass)
  - HIGH: Fix before next release (injection, XSS)
  - MEDIUM: Fix within sprint (weak validation)
  - LOW: Backlog (best practice improvements)

cognee_permissions:
  search: true
  add: true
  cognify: true
  dataset: agent_security
```

---

### Priority 4: Performance Profiler Agent ⚡

**Purpose**: Automated performance analysis, bottleneck detection, optimization recommendations

**Model**: Sonnet 4.5 | **Token Budget**: 35,000 | **Cost**: ~$0.84/task

```yaml
triggers:
  - "performance audit", "optimize", "slow", "latency", "memory usage"
  - "bundle size", "lighthouse", "core web vitals", "render performance"

capabilities:
  - Bundle size analysis (webpack-bundle-analyzer patterns)
  - React render optimization suggestions
  - Database query performance (N+1 detection)
  - Memory leak patterns
  - Lighthouse score extraction
  - Animation performance (blur budget enforcement)
  - Lazy loading opportunities

tools:
  - Read, Grep, Glob (code analysis)
  - Chrome DevTools MCP (runtime profiling)
  - Lighthouse (web vitals)
  - PostgreSQL EXPLAIN ANALYZE (via Neon Manager)

cognee_permissions:
  search: true
  add: true
  cognify: false
  dataset: agent_performance
```

---

### Priority 5: Test Generator Agent 🧪

**Purpose**: Automated test generation with coverage optimization

**Model**: Sonnet 4.5 | **Token Budget**: 45,000 | **Cost**: ~$1.08/task

```yaml
triggers:
  - "generate tests", "add test coverage", "write tests for", "missing tests"
  - "increase coverage", "unit tests", "integration tests", "e2e tests"

capabilities:
  - Generate unit tests from function signatures
  - Generate integration tests for API routes
  - Generate E2E tests from user flows
  - Mutation testing analysis
  - Edge case identification
  - Mock generation
  - Snapshot test creation

tools:
  - Read, Write, Edit (test file creation)
  - Vitest, Playwright (test runners)
  - Coverage tools (c8, istanbul)

test_patterns:
  - Arrange-Act-Assert structure
  - Given-When-Then for BDD
  - Property-based testing for utilities

cognee_permissions:
  search: true
  add: true
  cognify: false
  dataset: agent_qa
```

---

## Part 3: Improvements to Existing Agents

### Codebase Organization Agent - Enhancements

**Current**: Import sorting, dead code removal, naming conventions

**Proposed Additions**:

```yaml
new_capabilities:
  - Vertical slice migration assistant
  - Automated barrel file (index.ts) generation
  - Feature flag cleanup (expired flags)
  - Stale branch detection and cleanup
  - License header enforcement
  - TODO/FIXME tracking and reporting

scheduling:
  - Run on PR creation (incremental)
  - Run weekly full scan (scheduled)
  - Integrate with CI/CD pipeline
```

### Coding Agent - Enhancements

**Current**: Feature implementation, refactoring, tests

**Proposed Additions**:

```yaml
new_capabilities:
  - Pre-implementation architecture review
  - Automatic type inference and annotation
  - Accessibility (a11y) requirement enforcement
  - Mobile-first responsive implementation
  - Component documentation generation

pre_task_hooks:
  - Load Cognee context for related patterns
  - Check for existing similar implementations
  - Verify vertical slice placement

post_task_hooks:
  - Run full Airlock validation
  - Store implementation patterns in Cognee
  - Generate conventional commit message
```

### Research Agent - Enhancements

**Current**: Codebase exploration, documentation lookup

**Proposed Additions**:

```yaml
new_capabilities:
  - Cross-reference multiple documentation sources
  - Generate implementation recommendations with examples
  - Track research history for recurring questions
  - Automatic Context7 + Serena hybrid search

output_formats:
  - Structured summary with code snippets
  - Comparison tables for options
  - Decision matrix with trade-offs
```

---

## Part 4: Skills-Based Architecture Best Practices

### Pattern 1: Strict Tool Isolation

```typescript
// Each skill MUST have explicit tool boundaries
const skillDefinition = {
  name: "refactoring-agent",
  allowed_tools: ["Read", "Edit", "Grep", "Glob", "Serena", "ESLint"],
  forbidden_tools: ["Write", "Bash(rm)", "Bash(deploy)"],
  context_budget: 60000,
  isolation_required: true
};

// Violation example - NEVER allow this:
// orchestrator using Grep directly → FORBIDDEN
```

### Pattern 2: Cognee Memory Tiers

```typescript
// Global context (permanent, shared)
const globalDataset = "nanobanna_global"; // Project knowledge

// Agent-specific (30-day retention)
const agentDatasets = {
  "agent_research": "Research findings and patterns",
  "agent_coding": "Implementation patterns and decisions",
  "agent_debugging": "Root causes and solutions",
  "agent_refactoring": "Transformation patterns and outcomes"
};

// Session context (conversation-scoped)
const sessionDataset = `session_${sessionId}`;
```

### Pattern 3: Cost-Optimized Delegation

```typescript
// Always use the cheapest model that can complete the task
const modelSelection = {
  haiku: [
    "research", "quick-fix", "organization", "audit", "visual-check"
  ],
  sonnet: [
    "implementation", "debugging", "refactoring", "security", "performance"
  ],
  opus: [
    "architecture-decisions", "skill-creation" // Requires approval
  ]
};

// Estimated savings: 87% vs Opus-only approach
```

### Pattern 4: Airlock Validation Gates

```typescript
// Every agent output MUST pass these gates before returning
const airlockGates = [
  { name: "TypeScript", command: "npx tsc --noEmit", required: true },
  { name: "ESLint", command: "npx eslint .", required: true },
  { name: "Tests", command: "npm test", required: false },
  { name: "Build", command: "npm run build", required: true }
];

// On failure: agent retries in isolation (max 3 attempts)
// Orchestrator context NEVER sees errors
```

---

## Part 5: MCP Integration Enhancements

### Current MCP Servers (Active)

| Server | Status | Usage |
|--------|--------|-------|
| `workos` | ✅ Active | Authentication, SSO, SCIM |
| `neon_manager` | ✅ Active | PostgreSQL operations |
| `context7` | ✅ Active | Documentation lookup |
| `serena` | ✅ Active | Semantic code analysis |
| `cognee` | ✅ Active | Knowledge graph memory |
| `chrome-devtools` | ✅ Active | Visual verification |

### Recommended New MCP Servers

| Server | Purpose | Priority |
|--------|---------|----------|
| `semgrep` | Security rule scanning | HIGH |
| `osv-scanner` | Dependency CVE detection | HIGH |
| `graphviz` | Architecture diagram generation | MEDIUM |
| `lighthouse` | Performance auditing | MEDIUM |
| `playwright-mcp` | E2E testing automation | MEDIUM |
| `github-mcp` | PR/issue management | LOW |
| `linear-mcp` | Project management sync | LOW |

### MCP Tool Allocation Updates

```json
{
  "security-agent": {
    "allowed_tools": ["Read", "Grep", "Semgrep", "OSVScanner"],
    "mcp_servers": ["semgrep", "osv-scanner", "cognee"]
  },
  "architecture-agent": {
    "allowed_tools": ["Read", "Grep", "Glob", "Serena", "Graphviz"],
    "mcp_servers": ["serena", "graphviz", "cognee"]
  },
  "performance-agent": {
    "allowed_tools": ["Read", "Grep", "ChromeDevTools", "Lighthouse"],
    "mcp_servers": ["chrome-devtools", "lighthouse", "cognee"]
  }
}
```

---

## Part 6: Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

| Task | Agent Type | Files to Create | Priority |
|------|------------|-----------------|----------|
| Create Refactoring Agent SKILL.md | skill-creator-agent | `.claude/skills/refactoring-agent/SKILL.md` | P0 |
| Update tool-allocation-matrix.json | manual | `.claude/tool-allocation-matrix.json` | P0 |
| Update skills-config.json | manual | `.claude/skills-config.json` | P0 |
| Add refactoring triggers | manual | skills-config.json `auto_activate_on` | P0 |

**Deliverables**:

- Refactoring Agent fully operational
- Integration with Ralph Loop validated
- First automated refactoring completed

### Phase 2: Analysis Agents (Week 3-4)

| Task | Agent Type | Files to Create | Priority |
|------|------------|-----------------|----------|
| Create Architecture Analyzer | skill-creator-agent | `.claude/skills/architecture-agent/SKILL.md` | P1 |
| Create Security Auditor | skill-creator-agent | `.claude/skills/security-agent/SKILL.md` | P1 |
| Install Semgrep MCP | manual | `.mcp.json` update | P1 |
| Install OSV-Scanner MCP | manual | `.mcp.json` update | P1 |

**Deliverables**:

- Architecture dependency graph generation
- Security scanning with OWASP mapping
- Automated vulnerability reports

### Phase 3: Optimization Agents (Week 5-6)

| Task | Agent Type | Files to Create | Priority |
|------|------------|-----------------|----------|
| Create Performance Profiler | skill-creator-agent | `.claude/skills/performance-agent/SKILL.md` | P2 |
| Create Test Generator | skill-creator-agent | `.claude/skills/test-generator-agent/SKILL.md` | P2 |
| Install Lighthouse MCP | manual | `.mcp.json` update | P2 |
| Install Playwright MCP | manual | `.mcp.json` update | P2 |

**Deliverables**:

- Automated performance auditing
- Test coverage improvement automation
- E2E test generation from user flows

### Phase 4: Integration & Polish (Week 7-8)

| Task | Description | Priority |
|------|-------------|----------|
| Enhance existing agents | Add pre/post hooks, Cognee integration | P1 |
| CI/CD integration | Add agent checks to GitHub Actions | P2 |
| Dashboard creation | Agent metrics and cost tracking UI | P3 |
| Documentation | Update CLAUDE.md with new agents | P1 |

---

## Part 7: Quick Start Commands

### Create New Agent Immediately

```bash
# Use Skill Creator Agent to generate a new skill
User: "Create a skill for automated code refactoring with AST transformations"

# The self-healing system will:
# 1. Generate SKILL.md
# 2. Update skills-config.json
# 3. Update tool-allocation-matrix.json
# 4. Test the new skill
```

### Invoke New Agents (After Creation)

```bash
# Refactoring
Task(subagent_type: "Refactoring Agent", prompt: "Migrate all class components to hooks")

# Architecture Analysis
Task(subagent_type: "Architecture Agent", prompt: "Generate dependency graph for src/features/")

# Security Audit
Task(subagent_type: "Security Agent", prompt: "Run full security audit with OWASP mapping")

# Performance Profiling
Task(subagent_type: "Performance Agent", prompt: "Analyze bundle size and suggest optimizations")
```

### Ralph Loop for Large Refactoring

```bash
/ralph-loop "Migrate all components from class to functional hooks.

For each class component:
1. Convert to functional component
2. Replace lifecycle methods with useEffect
3. Replace this.state with useState
4. Update tests
5. Run ESLint and TypeScript checks

Success criteria:
- No class components remain
- All tests pass
- Build succeeds
- Output: <promise>HOOKS_MIGRATION_COMPLETE</promise>

If blocked after 30 iterations:
- Document remaining classes in MIGRATION_BLOCKED.md
- Output: <promise>BLOCKED</promise>" --max-iterations 50 --completion-promise "HOOKS_MIGRATION_COMPLETE"
```

---

## Part 8: Success Metrics

### Agent Ecosystem Health

| Metric | Target | Measurement |
|--------|--------|-------------|
| Skill Coverage | 95% | % of user requests routed to specialized agent |
| Context Preservation | <5k tokens | Orchestrator context usage |
| Cost Efficiency | -87% | vs Opus-only baseline |
| Self-Healing Rate | >80% | Skills created from detected gaps |
| Airlock Pass Rate | >90% | First-attempt validation success |

### Quality Improvements Expected

| Area | Current | Target | Agent |
|------|---------|--------|-------|
| Dead Code | ~1000 lines | <100 lines | Codebase Organization |
| Security Issues | Unknown | 0 critical | Security Auditor |
| Performance Score | ~75 | >90 | Performance Profiler |
| Test Coverage | ~40% | >80% | Test Generator |
| Architecture Violations | Unknown | <5 | Architecture Analyzer |

---

## Appendix: Files Modified by This Plan

```
.claude/
├── skills/
│   ├── refactoring-agent/SKILL.md      # NEW
│   ├── architecture-agent/SKILL.md     # NEW
│   ├── security-agent/SKILL.md         # NEW
│   ├── performance-agent/SKILL.md      # NEW
│   ├── test-generator-agent/SKILL.md   # NEW
│   ├── codebase-organization-agent/SKILL.md  # UPDATED
│   ├── coding-agent/SKILL.md           # UPDATED
│   └── research-agent/SKILL.md         # UPDATED
├── skills-config.json                  # UPDATED (new agents)
├── tool-allocation-matrix.json         # UPDATED (new tools)
├── agents/README.md                    # UPDATED (registry)
└── rules/shared_contract.md            # UNCHANGED

.mcp.json                               # UPDATED (new MCP servers)
```

---

*Created: 2026-01-13*
*Based on analysis of: `.claude/Context/`, `.claude/skills/`, `.claude/rules/`*
*Architecture Version: 2.0.0 → 2.1.0 (proposed)*
