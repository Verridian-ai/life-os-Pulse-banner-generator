# CLAUDE.md - Advanced Skills-First Orchestration Manual

> **This is the operator manual for all Claude Code interactions with Nanobanna Pro.**
> **ALL agents MUST read this file and `.claude/rules/shared_contract.md` before any work.**
> **Skills-first, context-preserving, self-healing architecture**

**Last Updated**: 2026-01-13
**Architecture**: Advanced Skills System with MCP Tool Isolation
**Version**: 2.0.0

---

## 🎯 Core Philosophy

### The Skills-First Principle

**EVERYTHING is a skill. The orchestrator NEVER executes tasks directly.**

```
User Request
      ↓
Orchestrator (Minimal Context: <5k tokens)
   ├── Classify task
   ├── Select skill
   └── Delegate (isolated execution)
      ↓
Skill Agent (Isolated Context: 10k-50k tokens)
   ├── Execute with dedicated MCP tools
   ├── Preserve orchestrator context
   └── Return only result
      ↓
Orchestrator
   └── Synthesize & present to user
```

**Result**: 90% context reduction, infinite scalability, self-healing capability

---

## 📘 Project Overview

**Nanobanna Pro** is an AI-powered LinkedIn banner design tool for the Careersy Community.

- **Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS + Neon PostgreSQL
- **AI Services**: OpenRouter (Gemini, GPT, Claude), OpenAI Realtime, Replicate
- **Core Concept**: Multi-AI orchestration for image generation, editing, enhancement with voice-powered workflows
- **Architecture**: Skills-based with MCP tool isolation for maximum efficiency

---

## 1. HARD CONTRACT (Non-Negotiables)

These constraints CANNOT be overridden without explicit user approval:

| Rule | Description |
|------|-------------|
| **A** | **Orchestrator delegates EVERYTHING** - No direct task execution |
| **B** | **MCP tools run through skills** - Never in orchestrator context |
| **C** | **Skills operate in isolation** - No context leakage between skills/orchestrator |
| **D** | **Self-healing enabled** - System creates missing skills automatically |
| **E** | **Tool allocation enforced** - Skills only access allowed tools (see tool-allocation-matrix.json) |
| **F** | **Cost optimization** - Always use cheapest appropriate model (Haiku > Sonnet > Opus) |
| **G** | **Feature co-location mandatory** - Vertical slice architecture for all features |
| **H** | **Import hygiene strictly enforced** - React → External → @/ → ./ → Styles, no wildcards |
| **I** | **Accessibility REQUIRED** - All UI depth effects must include fallbacks |
| **J** | **Tests REQUIRED** - 80% coverage minimum for all new code |

Full details: `.claude/rules/shared_contract.md`

---

## 2. SKILLS-BASED ARCHITECTURE

### 2.1 Core Agent Skills (Context-Isolated)

| Skill | Model | Cost/1M | Purpose | Token Budget | Tools |
|-------|-------|---------|---------|--------------|-------|
| **Orchestrator** | Sonnet | $24 | Task routing only | 5,000 | TodoWrite, AskUserQuestion, Skill |
| **Research Agent** | Haiku | $0.80 | Code exploration, docs | 20,000 | Grep, Glob, Read, Serena, Context7 |
| **Quick Tasks Agent** | Haiku | $0.80 | Type fixes, imports, formatting | 10,000 | Read, Edit, ESLint, TypeScript |
| **Coding Agent** | Sonnet | $24 | Feature implementation | 50,000 | Read, Edit, Write, TypeScript |
| **Chrome UI Browser** | Haiku | $0.80 | **Visual verification (HIGH FREQ)** | 25,000 | ChromeDevTools, Read, Grep |
| **Debugging Agent** | Sonnet | $24 | Error investigation | 30,000 | Read, Bash(debug), Grep |
| **Decision Agent** | Opus | $120 | Architecture decisions | 20,000 | Read, Grep, Serena, WebSearch |
| **Codebase Org Agent** | Haiku | $0.80 | Code structure maintenance | 15,000 | Grep, Glob, Read, Edit, ESLint |
| **Skill Creator Agent** | Opus | $120 | Auto-generate missing skills | 30,000 | Read, Write, Grep, Glob |
| **Database Agent** | Sonnet | $24 | PostgreSQL operations | 25,000 | NeonManager, Supabase, Postgres |
| **QA Agent** | Sonnet | $24 | Testing automation | 40,000 | Bash(test), Vitest, Playwright |
| **Security Agent** | Sonnet | $24 | Security scanning | 20,000 | Semgrep, OSVScanner |
| **Release Agent** | Sonnet | $24 | Git operations, PRs | 15,000 | GitHub, ConventionalCommits |

**Cost Savings**: 87% vs Opus-only approach
**Context Preservation**: Orchestrator uses <1% of previous tokens

---

### 2.2 Tool Allocation Matrix

**CRITICAL**: Tools are allocated to specific skills. See `.claude/tool-allocation-matrix.json`

**Key Principle**: Orchestrator has **ZERO** access to MCP tools. All tool execution happens through skills in isolated contexts.

**Example**:
```typescript
// ❌ WRONG - Orchestrator using tool directly
const files = await glob("**/*.ts"); // Pollutes orchestrator context

// ✅ CORRECT - Delegate to research agent
const result = await delegate("research-agent", "Find all TypeScript files");
```

---

### 2.3 Automatic Task Routing

The orchestrator automatically classifies and routes every user request:

**Routing Decision Tree**:
```
User Request
   │
   ├─ "How does X work?" → Research Agent (Haiku) - $0.01
   ├─ "Find all Y" → Research Agent (Haiku) - $0.01
   ├─ "Fix type errors" → Quick Tasks Agent (Haiku) - $0.003
   ├─ "Sort imports" → Codebase Org Agent (Haiku) - $0.002
   ├─ "Add feature X" → Coding Agent (Sonnet) - $0.90
   ├─ "Debug error Y" → Debugging Agent (Sonnet) - $0.60
   ├─ "Should we migrate?" → Decision Agent (Opus) - $2.20*
   └─ "No matching skill" → Skill Creator Agent (auto-generate skill)

* Requires user approval due to cost
```

**Orchestrator Message Format**:
```
[Orchestrator]:
I'll delegate this [TASK_TYPE] to [SKILL_NAME] using [MODEL] for cost efficiency.

[Delegating to: research-agent (Haiku)]
[Estimated cost: $0.01]
[Token budget: 20k]
[Finding all authentication code in codebase...]

[Research Agent]: <RESULT>

[Orchestrator]: <SYNTHESIZED_RESPONSE>
```

---

## 3. SELF-HEALING SYSTEM

### 3.1 Skill Gap Detection

**How It Works**:
1. User request doesn't match any existing skill triggers
2. Skill Creator Agent detects gap (logs to `.claude/detected-gaps.json`)
3. After 3 occurrences, system auto-generates skill (with approval)

**Example**:
```
User: "Validate Kubernetes manifests" (1st time)
[Orchestrator]: Handling manually... [Gap detected, frequency: 1]

User: "Check K8s deployment for issues" (2nd time)
[Orchestrator]: Handling manually... [Gap frequency: 2, user notified]

🔔 I've noticed you've asked about Kubernetes validation twice.
   Should I create a dedicated skill for this? (y/n)

User: y
[Skill Creator Agent]: Generating "k8s-validator-agent"...
✅ New skill created! Try: "Validate manifests in k8s/"
```

---

### 3.2 Automated Skill Generation

**Process**:
1. **Gap Analysis**: Identify missing capability from task patterns
2. **Spec Generation**: Use Decision Agent (Opus) to create SKILL.md
3. **Validation**: Verify structure, tools, triggers, budget
4. **Registration**: Add to `skills-config.json` and `tool-allocation-matrix.json`
5. **Testing**: Validate skill works with sample task
6. **Notification**: Inform user of new skill availability

**Generated Skills** are production-quality and follow all architectural patterns.

---

## 4. CONTEXT PRESERVATION MECHANISMS

### 4.1 Subprocess Execution (Primary Method)

Each skill runs in **completely isolated subprocess**:

```typescript
// skill-executor.ts
async function executeSkillIsolated(skillName: string, task: Task): Promise<Result> {
  // Spawn skill in isolated subprocess
  const skillProcess = spawn('claude-skill', [
    '--skill', skillName,
    '--task', JSON.stringify(task),
    '--context-limit', getContextLimit(skillName),
    '--tools', getAllowedTools(skillName).join(','),
    '--isolated', 'true'
  ]);

  // Capture output WITHOUT polluting parent context
  const result = await captureOutput(skillProcess);

  // Return ONLY final result
  return extractResult(result);
}
```

**Benefits**:
- **Zero context leakage** to orchestrator
- **Parallel execution** (5 skills can run simultaneously)
- **Independent token budgets**
- **Crash isolation** (skill crash doesn't affect orchestrator)

---

### 4.2 Tool Interception Layer

```typescript
// tool-interceptor.ts
async function interceptToolCall(toolName: string, params: any): Promise<any> {
  const skillAgent = TOOL_ROUTES.get(toolName);

  if (skillAgent) {
    // Route through skill (isolated context)
    return await routeToSkill(skillAgent, toolName, params);
  } else {
    throw new Error(`Tool ${toolName} not allocated to any skill`);
  }
}
```

**Result**: Orchestrator **NEVER** executes tools directly.

---

## 5. CODEBASE ORGANIZATION (Automated)

### 5.1 Codebase Organization Agent

Runs **daily at 2 AM** + **pre-commit** to maintain pristine structure:

**Responsibilities**:
1. **Import Organization**: Enforce order (React → External → @/ → ./ → Styles)
2. **File Structure**: Ensure vertical slice compliance
3. **Dead Code Removal**: Detect and remove unused code
4. **Naming Conventions**: Enforce PascalCase/camelCase/UPPER_SNAKE_CASE
5. **Documentation**: Ensure all exports have JSDoc

**Example Output**:
```bash
🔍 Codebase Organization Agent - Daily Scan

📦 Import Organization:
  ✓ Fixed import order in 23 files
  ✓ Removed 45 unused imports

📁 File Structure:
  ✓ Moved 3 files to correct vertical slice locations

🗑️  Dead Code:
  ✓ Removed 234 lines of unused code

✅ Codebase organized! (12,400 tokens, $0.01)
Next scan: Tomorrow at 2:00 AM
```

---

## 6. DEFINITION OF DONE

A task is DONE when:

1. ✅ **Correct Skill Used**: Routed to appropriate skill agent (not handled by orchestrator)
2. ✅ **Context Preserved**: Orchestrator context usage <100 tokens
3. ✅ **Tools Isolated**: All MCP tools executed through skills
4. ✅ **Tests Pass**: `npm run test` passes (80% coverage minimum)
5. ✅ **Build Clean**: `npm run build` succeeds with no errors
6. ✅ **Lint Clean**: `npm run lint` passes
7. ✅ **Security Clear**: Semgrep scan passes (via Security Agent)
8. ✅ **Imports Organized**: Import order enforced (via Codebase Org Agent)
9. ✅ **Documentation Added**: JSDoc for all new exports
10. ✅ **User Approved**: Human has approved the implementation

**Pre-Commit Automation**: Steps 3-8 run automatically via git hooks.

---

## 7. SKILL INVOCATION EXAMPLES

### Example 1: Research Task
```
User: "Find all components using useAIContext"

[Orchestrator]:
Delegating to: research-agent (Haiku)
Estimated cost: $0.01

[Research Agent]:
Searching for useAIContext usages...
Found 8 components:
1. src/components/features/GenerativeSidebar.tsx:15
2. src/components/features/CanvasEditor.tsx:23
3. src/components/features/ChatInterface.tsx:18
...

[Orchestrator]:
Found 8 components using useAIContext. Most frequently used in GenerativeSidebar.tsx (7 calls).

[Tokens: 4,200 | Cost: $0.003]
```

---

### Example 2: Quick Fix Task
```
User: "Fix TypeScript errors in CanvasEditor.tsx"

[Orchestrator]:
Delegating to: quick-tasks-agent (Haiku)
Estimated cost: $0.003

[Quick Tasks Agent]:
Running TypeScript check...
Found 3 errors:
1. Missing return type on handleSave()
2. Implicit 'any' on event parameter
3. Unused import 'React'

Fixing...
✓ All errors fixed

[Orchestrator]:
Fixed 3 TypeScript errors in CanvasEditor.tsx.

[Tokens: 3,200 | Cost: $0.003]
```

---

### Example 3: Feature Implementation
```
User: "Add credit tracking system"

[Orchestrator]:
Analyzing task scope:
- Database schema change
- Backend API
- Frontend state
- Estimated: 250 lines across 6 files

Delegating to: coding-agent (Sonnet)
Estimated cost: $0.90
Token budget: 50k

[Coding Agent]:
Step 1: Database migration
✓ Created: server/migrations/20260113_add_credits.sql

Step 2: Backend API
✓ Updated: server/src/routes/users.ts
✓ Added credit deduction logic

Step 3: Frontend state
✓ Updated: src/context/AuthContext.tsx
✓ Created: src/components/features/CreditDisplay.tsx

Step 4: Tests
✓ Created 3 test files (85% coverage)

All pre-commit hooks passed.

[Orchestrator]:
Credit tracking system implemented. Ready for review.

[Tokens: 38,200 | Cost: $0.92]
```

---

### Example 4: Architecture Decision
```
User: "Should we migrate from Vite to Next.js?"

[Orchestrator]:
This is a critical architectural decision with long-term impact.
I recommend delegating to decision-agent (Opus).

Estimated cost: $2.20
Proceed? (y/n)

User: y

[Orchestrator]:
Delegating to: decision-agent (Opus)
Token budget: 20k

[Decision Agent]:
Analyzing framework migration: Vite → Next.js

Evaluating across 7 dimensions:
1. Development Experience: Vite (+2)
2. Performance: Next.js (+1)
3. SEO: Next.js (+2), but minimal need for your app
4. Migration Cost: Vite (+3) - HIGH migration risk
5. Scalability: Neutral
6. Ecosystem: Neutral
7. TCO: Vite (+2)

Trade-off matrix score: Vite (1.55) vs Next.js (-0.6)

RECOMMENDATION: Stay with Vite
Reasoning: Your app is a dashboard/tool, not a marketing site.
Migration cost (3-4 weeks) too high for minimal ROI.

[Orchestrator]:
Decision: Stay with Vite. See detailed analysis above.

[Tokens: 18,500 | Cost: $2.22]
```

---

### Example 5: Self-Healing (New Skill Created)
```
User: "Validate the SQL query for performance issues" (3rd time asking)

[Orchestrator]:
Gap frequency threshold reached (3 occurrences).
Auto-generating skill: sql-optimizer-agent

[Skill Creator Agent]:
Analyzing requirements...
- Capability: SQL query optimization
- Complexity: Medium
- Suggested model: Sonnet
- Required tools: Read, Postgres MCP

Generating SKILL.md...
✓ Generated (2,847 tokens)
✓ Validation passed
✓ Registered in skills-config.json
✓ Added to tool-allocation-matrix.json

✅ New skill created: sql-optimizer-agent
Location: .claude/skills/sql-optimizer-agent/SKILL.md

[Orchestrator]:
New skill "sql-optimizer-agent" created and ready!
Now optimizing your query...

[SQL Optimizer Agent]:
Analyzing query...
Issues found:
1. Missing index on users.created_at
2. SELECT * inefficient
...
```

---

## 8. COST TRACKING & OPTIMIZATION

### 8.1 Daily Cost Dashboard

Ask anytime:
- "Show me today's cost breakdown"
- "Am I staying under budget?"
- "What were my most expensive tasks?"

**Example Output**:
```
📊 Daily Cost Report (2026-01-13)

Total spent: $9.57
Budget: $50/day
Remaining: $40.43 (81%)

Agent breakdown:
1. Decision Agent (Opus): $4.20 (44%) - 2 tasks
2. Coding Agent (Sonnet): $3.48 (36%) - 5 tasks
3. Debugging Agent (Sonnet): $1.80 (19%) - 3 tasks
4. Research Agent (Haiku): $0.06 (<1%) - 15 tasks
5. Quick Tasks (Haiku): $0.03 (<1%) - 12 tasks

Tasks completed: 37
Average cost/task: $0.26
Orchestrator context: 2,400 tokens (<$0.06)

Projected monthly: $287 (well under $1000 budget)
Savings vs Opus-only: $26.43/day (73%)
```

---

### 8.2 Cost Optimization Rules

1. **Always use cheapest appropriate model**:
   - Research, quick fixes → Haiku ($0.80/1M)
   - Implementation, debugging → Sonnet ($24/1M)
   - Critical decisions only → Opus ($120/1M)

2. **Tool execution through skills** (not orchestrator):
   - Saves orchestrator context
   - Enables parallel execution
   - Better token budget management

3. **Approval required for Opus** (>$1 estimated cost):
   - User sees cost estimate first
   - Can decline and use alternative
   - Prevents surprise expenses

---

## 9. SKILLS INDEX

### 9.1 Active Skills

| Skill | Status | Location |
|-------|--------|----------|
| orchestrator | ✅ Active | `.claude/skills/orchestrator/` |
| research-agent | ✅ Active | `.claude/skills/research-agent/` |
| quick-tasks-agent | ✅ Active | `.claude/skills/quick-tasks-agent/` |
| coding-agent | ✅ Active | `.claude/skills/coding-agent/` |
| debugging-agent | ✅ Active | `.claude/skills/debugging-agent/` |
| decision-agent | ✅ Active | `.claude/skills/decision-agent/` |
| codebase-organization-agent | ✅ Active | `.claude/skills/codebase-organization-agent/` |
| skill-creator-agent | ✅ Active | `.claude/skills/skill-creator-agent/` |
| neon_manager | ✅ Active | `.claude/skills/neon_manager/` |
| serena_memory | ✅ Active | `.claude/skills/serena_memory/` |
| workos_manager | ✅ Active | `.claude/skills/workos_manager/` |
| deep_analysis | ✅ Active | `.claude/skills/deep_analysis/` |

---

### 9.2 Skills to Install (Community)

See: `docs/RECOMMENDED_SKILLS_FOR_NANOBANNA.md`

**Priority 1**:
- test-driven-development
- security-review
- using-git-worktrees
- performance-profiling

**Install**:
```bash
git clone https://github.com/karanb192/awesome-claude-skills.git
cp -r awesome-claude-skills/test-driven-development .claude/skills/
```

---

## 10. CONFIGURATION FILES

| File | Purpose |
|------|---------|
| `.claude/skills-config.json` | Skill metadata, budgets, triggers |
| `.claude/tool-allocation-matrix.json` | Tool → skill mappings |
| `.claude/detected-gaps.json` | Skill gap tracking for self-healing |
| `.claude/rules/shared_contract.md` | Non-negotiable coding standards |

---

## 11. COMMANDS & HOOKS

### 11.1 Slash Commands

| Command | Description |
|---------|-------------|
| `/task-new` | Create new task in WORK_BOARD |
| `/task-start` | Create worktrees, assign agents |
| `/task-status` | Check task progress |
| `/task-ready` | Run tests, prepare for approval |
| `/skill activate [name]` | Manually activate skill |
| `/skills list` | List all available skills |

---

### 11.2 Pre-Commit Hooks

**Automated via Codebase Organization Agent**:

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running pre-commit quality gates..."

# 1. Organize imports
claude-skill --skill codebase-organization-agent --mode incremental

# 2. Type check
npx tsc --noEmit || exit 1

# 3. Lint
npx eslint --fix . || exit 1

# 4. Tests
npx vitest run || exit 1

# 5. Security scan
claude-skill --skill security-agent --mode incremental

echo "✅ All pre-commit gates passed!"
```

---

## 12. DEBUGGING & MONITORING

### 12.1 Context Usage Tracking

```bash
# Check orchestrator context usage
grep "Orchestrator context:" .claude/logs/*.log | tail -10

# Should always be <5k tokens
```

### 12.2 Skill Performance

```bash
# View skill execution times
cat .claude/logs/skill-performance.log

# Example output:
research-agent: 2.3s avg (20 executions)
coding-agent: 45.7s avg (5 executions)
quick-tasks-agent: 1.1s avg (12 executions)
```

---

## 13. QUICK LINKS

- **Shared Contract**: `.claude/rules/shared_contract.md`
- **Skills Overview**: `.claude/skills/README.md`
- **Tool Allocation**: `.claude/tool-allocation-matrix.json`
- **Advanced Architecture**: `docs/ADVANCED_SKILLS_ARCHITECTURE.md`
- **Setup Guide**: `docs/COMPLETE_SETUP_GUIDE.md`
- **Skills Registry**: `docs/CLAUDE_AGENT_SKILLS_REGISTRY.md`

---

## 14. TROUBLESHOOTING

### Issue: Orchestrator using too much context
**Solution**: Check if tools being executed directly. All tools should route through skills.

### Issue: Skill not activating
**Solution**: Check trigger patterns in `skills-config.json`. Add new triggers if needed.

### Issue: Tool not found
**Solution**: Check `tool-allocation-matrix.json`. Tool must be allocated to skill being used.

### Issue: Skill gap not detected
**Solution**: Check `.claude/detected-gaps.json`. May need to manually trigger skill creation.

---

## ✅ SUCCESS CRITERIA

This architecture is working correctly when:

1. ✅ **Orchestrator context usage**: <5,000 tokens/day
2. ✅ **Tool isolation**: 100% of tool calls route through skills
3. ✅ **Cost efficiency**: <$300/month (vs $1,080 with old approach)
4. ✅ **Self-healing**: New skills created within 2 hours of gap detection
5. ✅ **Codebase quality**: Organization agent runs daily with zero violations
6. ✅ **Parallel execution**: Multiple skills running simultaneously
7. ✅ **Zero context leakage**: Skills isolated, no cross-contamination

---

*Last Updated: 2026-01-13*
*Manual Version: 2.0.0 - Advanced Skills-First Architecture*
*Old Version Backup: CLAUDE.md.backup*
