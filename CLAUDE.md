# CLAUDE.md - Advanced Skills-First Orchestration Manual

> **This is the operator manual for all Claude Code interactions with Nanobanna Pro.**
> **ALL agents MUST read this file and `.claude/rules/shared_contract.md` before any work.**
> **Skills-first, context-preserving, self-healing architecture**

**Last Updated**: 2026-01-13
**Architecture**: Advanced Skills System with MCP Tool Isolation
**Version**: 2.1.0

---

## ⚠️ MANDATORY: AUTOMATIC SKILL DELEGATION

**THIS SECTION OVERRIDES ALL OTHER INSTRUCTIONS**

The orchestrator (main Claude session) MUST automatically delegate ALL user requests to specialized agents using the **Task tool**. NO EXCEPTIONS.

### Required Behavior

1. **ALWAYS use the Task tool** to delegate tasks with the correct `subagent_type`
2. **NEVER execute tools directly** (Read, Write, Edit, Grep, Glob, Bash are FORBIDDEN for orchestrator)
3. **ALWAYS classify** the user request and select the appropriate agent
4. **ALWAYS present** the agent's results to the user after delegation

### Quick Reference: Task Tool Usage

```
User: "Find all authentication files"
→ Task(subagent_type: "Research Agent", prompt: "Find all authentication files")

User: "Fix the TypeScript errors"
→ Task(subagent_type: "Quick Tasks Agent", prompt: "Fix the TypeScript errors")

User: "Add a new feature"
→ Task(subagent_type: "Coding Agent", prompt: "Add a new feature...")

User: "Debug this error"
→ Task(subagent_type: "Debugging Agent", prompt: "Debug this error...")

User: "Should we migrate to X?"
→ Task(subagent_type: "Decision Agent", prompt: "Should we migrate...") [Requires approval]
```

### Routing Table (Use These Exact subagent_type Values)

| User Request Pattern | subagent_type | Model |
|---------------------|---------------|-------|
| "find", "search", "where", "how does", "list" | `Research Agent` | haiku |
| "fix type", "sort imports", "format", "rename" | `Quick Tasks Agent` | haiku |
| "implement", "add", "create", "build", "modify" | `Coding Agent` | sonnet |
| "refactor", "modernize", "migrate pattern" | `Refactoring Agent` | sonnet |
| "error", "bug", "not working", "debug" | `Debugging Agent` | sonnet |
| "should we", "compare", "vs", "architecture" | `Decision Agent` | opus |
| "database", "sql", "migration", "schema" | `Neon Manager` | sonnet |
| "glass", "neumorphic", "premium ui" | `Depth UI Engineer` | sonnet |
| "audit", "standards", "compliance" | `Code Standards Auditor` | haiku |
| "security audit", "vulnerability scan", "secrets scan" | `Security Auditor Agent` | sonnet |
| "architecture", "dependency graph", "coupling" | `Architecture Analyzer Agent` | sonnet |
| "performance", "slow", "bundle size" | `Performance Profiler Agent` | sonnet |
| "generate tests", "coverage", "write tests" | `Test Generator Agent` | sonnet |
| "organize", "cleanup", "dead code" | `Codebase Organization Agent` | haiku |
| **"research thoroughly", "deep research", "comprehensive analysis"** | `general-purpose` (Deep Research) | sonnet |
| **"search online", "look up", "latest version", "documentation for"** | `general-purpose` (Web Search) | haiku |
| **"openrouter research", "perplexity research", "research with citations"** | `general-purpose` (OpenRouter Deep Research) | sonnet + API |
| **"/ralph-loop TASK", "autonomous iteration", "long-running task"** | Ralph Loop (autonomous) | varies by subtask |

### Internet Research Agents

| Agent | Purpose | Model | Tools | Cost/Query |
|-------|---------|-------|-------|------------|
| **Web Search Agent** | Quick online lookups, docs, current info | haiku | WebSearch, WebFetch, Context7 | $0.01 |
| **Deep Research Agent** | Comprehensive multi-source investigation | sonnet | WebSearch, WebFetch, Context7, Grep, Cognee | $0.90-$2.40 |
| **OpenRouter Deep Research Agent** | Citation-heavy research via Perplexity Sonar Deep Research | sonnet + external API | Bash, Read, Grep, Glob, WebFetch, Cognee | $0.25 |

**NEW**: OpenRouter Deep Research Agent uses Perplexity's specialized research model for automatic citations, expert-level synthesis, and real-time information.

**DEFAULT**: If no pattern matches, delegate to `Research Agent` to understand the request.

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
| **Refactoring Agent** | Sonnet | $24 | AST-based refactoring | 60,000 | Read, Edit, Write, Bash(test), AST |
| **Chrome UI Browser** | Haiku | $0.80 | **Visual verification (HIGH FREQ)** | 25,000 | ChromeDevTools, Read, Grep |
| **Debugging Agent** | Sonnet | $24 | Error investigation | 30,000 | Read, Bash(debug), Grep |
| **Decision Agent** | Opus | $120 | Architecture decisions | 20,000 | Read, Grep, Serena, WebSearch |
| **Codebase Org Agent** | Haiku | $0.80 | Code structure maintenance | 15,000 | Grep, Glob, Read, Edit, ESLint |
| **Skill Creator Agent** | Opus | $120 | Auto-generate missing skills | 30,000 | Read, Write, Grep, Glob |
| **Database Agent** | Sonnet | $24 | PostgreSQL operations | 25,000 | NeonManager, Supabase, Postgres |
| **QA Agent** | Sonnet | $24 | Testing automation | 40,000 | Bash(test), Vitest, Playwright |
| **Security Auditor Agent** | Sonnet | $24 | Security scanning (READ-ONLY) | 40,000 | Read, Grep, Semgrep, OSVScanner |
| **Architecture Analyzer Agent** | Sonnet | $24 | Dependency analysis (READ-ONLY) | 50,000 | Read, Grep, Glob, Serena |
| **Performance Profiler Agent** | Sonnet | $24 | Performance auditing (READ-ONLY) | 50,000 | Read, Grep, Lighthouse, ChromeDevTools |
| **Test Generator Agent** | Sonnet | $24 | Test generation | 45,000 | Read, Write, Edit, Vitest, Playwright |
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

### Example 5: Ralph Loop (Autonomous Execution)
```
User: /ralph-loop "Migrate all auth to WorkOS AuthKit. Output <promise>COMPLETE</promise> when done." --max-iterations 30

[Ralph Loop Initialized]
Max iterations: 30
Completion promise: "COMPLETE"
State file: .claude/ralph-loop.local.md

[Ralph Loop - Iteration 1]
[Orchestrator]:
Analyzing task: Auth migration (complex, multi-phase)
Delegating to: coding-agent (Sonnet)

[Coding Agent]:
Phase 1: Install dependencies
- npm install @workos-inc/authkit-nextjs
- Updated package.json
- Committed: "feat: Add WorkOS AuthKit dependency"

[Airlock Validation]:
✓ TypeScript: Pass
✓ ESLint: Pass
✓ Build: Pass

[Stop Hook]: Continue iteration (completion promise not found)

[Ralph Loop - Iteration 2]
[Orchestrator]:
Reviewing git history: See dependency installation complete
Next step: Backend migration
Delegating to: coding-agent (Sonnet)

[Coding Agent]:
Phase 2: Backend migration
- Updated server/src/lib/workos.ts
- Replaced custom session logic with AuthKit
- Committed: "feat: Migrate backend auth to AuthKit"

[Airlock Validation]:
✓ TypeScript: Pass
✓ ESLint: Pass
✗ Tests: 3 failures (auth integration tests)

[Agent Self-Correction]:
Analyzing test failures...
- Missing environment variables
- Adding env vars to .env.example
- Updating test mocks
- Re-running tests

[Airlock Validation (Retry)]:
✓ TypeScript: Pass
✓ ESLint: Pass
✓ Tests: Pass
✓ Build: Pass

[Stop Hook]: Continue iteration

[Ralph Loop - Iteration 3]
[Orchestrator]:
Backend complete, frontend migration needed
Delegating to: coding-agent (Sonnet)

[Coding Agent]:
Phase 3: Frontend migration
- Updated src/context/AuthContext.tsx
- Replaced AuthModal with AuthKit UI
- Committed: "feat: Migrate frontend auth to AuthKit"

[Airlock Validation]: All gates pass

[Stop Hook]: Continue iteration

[Ralph Loop - Iteration 4]
[Orchestrator]:
Verifying all success criteria:
✓ All tests passing
✓ Build succeeds
✓ No TypeScript errors
✓ Documentation updated

All criteria met!

Output: <promise>COMPLETE</promise>

[Ralph Loop]: Completion promise detected, exiting successfully

[Final State]:
Total iterations: 4
Total cost: $4.80
Status: Complete
Git commits: 4
All tests: Passing
```

**Result**: Task completed autonomously in 4 iterations without user intervention.

**Cost Analysis**:
- Iteration 1: Coding Agent (Sonnet) - $1.20
- Iteration 2: Coding Agent with airlock retries - $1.60
- Iteration 3: Coding Agent (Sonnet) - $1.20
- Iteration 4: Verification (Haiku) - $0.80
- **Total**: $4.80

For detailed Ralph Loop usage, see: `.claude/skills/orchestrator/RALPH_LOOP_GUIDE.md`

---

### Example 6: Self-Healing (New Skill Created)
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

## 13. RALPH LOOP: AUTONOMOUS LONG-RUNNING EXECUTION

### What is Ralph Loop?

Ralph Loop is a **fully autonomous execution mode** where Claude iteratively works on a task until completion without constant user intervention. It uses a **Stop hook** that intercepts session exit attempts and feeds the same prompt back for continuous iteration.

**Key Features:**
- Autonomous multi-hour execution
- Seamlessly integrates with skills-first delegation
- Git commits after each successful iteration
- Airlock validation prevents error propagation
- Cost tracking and budget limits
- Escape hatches for impossible tasks

### Quick Start

```bash
/ralph-loop "TASK DESCRIPTION. Output <promise>COMPLETE</promise> when done." --max-iterations 30 --completion-promise "COMPLETE"
```

**CRITICAL SAFETY RULES:**
1. **ALWAYS set --max-iterations** (prevents infinite loops)
2. **ALWAYS set --completion-promise** (provides exit signal)
3. **Use clear, measurable success criteria**
4. **Include escape hatches** in prompt

### Use Cases

**GOOD FOR:**
- Codebase-wide refactoring ("Migrate all components to TypeScript strict mode")
- Test-driven development ("Fix all failing tests")
- Systematic migrations ("Replace custom auth with WorkOS AuthKit")
- Error elimination ("Fix all ESLint errors")

**NOT GOOD FOR:**
- Tasks requiring user decisions
- One-shot operations ("Create a login page")
- Exploratory work
- Production debugging

### Example: Auth Migration

```bash
/ralph-loop "Migrate authentication to WorkOS AuthKit.

Phase 1: Install dependencies
Phase 2: Backend migration (server/src/lib/workos.ts)
Phase 3: Frontend migration (src/context/AuthContext.tsx)
Phase 4: Tests and documentation

Success criteria:
- npm test → All pass
- npm run build → Success
- No TypeScript errors
- Documentation updated

Output: <promise>AUTH_COMPLETE</promise>

If blocked after 20 iterations:
- Document blockers in MIGRATION_BLOCKED.md
- Output: <promise>BLOCKED</promise>" --max-iterations 30 --completion-promise "AUTH_COMPLETE"
```

**Expected Flow:**
- Iterations 1-5: Dependencies and backend (Coding Agent)
- Iterations 6-10: Frontend migration (Coding Agent)
- Iterations 11-15: Debug test failures (Debugging Agent)
- Iterations 16-20: Documentation (Quick Tasks Agent)
- Iteration 21: Verification, outputs `<promise>AUTH_COMPLETE</promise>`
- **Ralph Loop exits automatically**

### Monitoring Progress

```bash
# Check current iteration
cat .claude/ralph-loop.local.md

# View git commits (Ralph Loop commits after each iteration)
git log --oneline -10

# Monitor cost
tail -f docs/ops/.agent_usage_log.txt
```

### Canceling Ralph Loop

```bash
/cancel-ralph
```

### Cost Estimates

| Task Type | Iterations | Cost/Iter | Total |
|-----------|-----------|-----------|-------|
| Simple (import fixes) | 10-20 | $0.50 | $5-$10 |
| Medium (feature add) | 30-50 | $1.00 | $30-$50 |
| Complex (migration) | 50-100 | $1.50 | $75-$150 |

**For comprehensive Ralph Loop guide**: `.claude/skills/orchestrator/RALPH_LOOP_GUIDE.md`

---

## 14. QUICK LINKS

- **Shared Contract**: `.claude/rules/shared_contract.md`
- **Skills Overview**: `.claude/skills/README.md`
- **Tool Allocation**: `.claude/tool-allocation-matrix.json`
- **Ralph Loop Guide**: `.claude/skills/orchestrator/RALPH_LOOP_GUIDE.md`
- **Advanced Architecture**: `docs/ADVANCED_SKILLS_ARCHITECTURE.md`
- **Setup Guide**: `docs/COMPLETE_SETUP_GUIDE.md`
- **Skills Registry**: `docs/CLAUDE_AGENT_SKILLS_REGISTRY.md`

---

## 15. SPECIALIZED AGENTS

### 15.1 Refactoring Agent

**Purpose**: Large-scale code refactoring with AST-based transformations and automatic validation.

**Capabilities**:
- Pattern migration (class components → hooks, callbacks → async/await)
- Rename across entire codebase with type safety
- Dead code elimination with dependency analysis
- Extract component/function with auto-import updates
- Strict mode migration with automatic fixes

**Ralph Loop Integration**: YES - Automatically activates for refactorings affecting 10+ files.

**Airlock Validation**: MANDATORY - All changes pass TypeScript, ESLint, Tests, Build before commit.

**Example Invocation**:
```
User: "Migrate all class components to hooks"
→ Task(subagent_type: "Refactoring Agent", prompt: "Migrate all class components to hooks")
```

**Cost**: $1.44 per major refactoring (60k token budget)

---

### 15.2 Security Auditor Agent

**Purpose**: Comprehensive security scanning with OWASP Top 10 compliance.

**Capabilities**:
- Secrets detection (API keys, tokens, credentials)
- Dependency vulnerability scanning (CVE detection)
- SQL injection & XSS pattern detection
- Row Level Security (RLS) policy auditing
- Authentication/Authorization flow review

**MCP Tools**:
- `semgrep` - Static analysis security testing
- `osv-scanner` - Dependency vulnerability scanning

**READ-ONLY**: Cannot modify code, only reports findings.

**Example Invocation**:
```
User: "Security audit the auth flow"
→ Task(subagent_type: "Security Auditor Agent", prompt: "Security audit the auth flow")
```

**Output Format**: JSON report with severity levels (CRITICAL, HIGH, MEDIUM, LOW)

**Cost**: $0.96 per audit (40k token budget)

---

### 15.3 Architecture Analyzer Agent

**Purpose**: Dependency analysis, coupling metrics, and architectural health assessment.

**Capabilities**:
- Dependency graph generation (Mermaid diagrams)
- Circular dependency detection
- Module coupling metrics (Afferent/Efferent)
- Layering violation detection
- Complexity metrics (Cyclomatic, Cognitive)
- "Zone of Pain" detection (high coupling + high instability)

**READ-ONLY**: Cannot modify code, only analyzes structure.

**Example Invocation**:
```
User: "Analyze architecture for circular dependencies"
→ Task(subagent_type: "Architecture Analyzer Agent", prompt: "Analyze architecture for circular dependencies")
```

**Output Formats**:
- Mermaid dependency graph
- JSON metrics report
- Markdown health summary

**Cost**: $1.20 per analysis (50k token budget)

---

### 15.4 Performance Profiler Agent

**Purpose**: Performance auditing, bundle analysis, and Core Web Vitals optimization.

**Capabilities**:
- Lighthouse audits (automated)
- Bundle size analysis (webpack-bundle-analyzer)
- Core Web Vitals measurement (LCP, FCP, CLS, TTI)
- Memory leak detection
- CPU profiling & flamegraph analysis
- Code splitting recommendations

**MCP Tools**:
- `lighthouse` - Automated performance audits
- `chrome-devtools` - Runtime profiling

**READ-ONLY**: Cannot modify code, only analyzes performance.

**Example Invocation**:
```
User: "Profile performance and find bottlenecks"
→ Task(subagent_type: "Performance Profiler Agent", prompt: "Profile performance and find bottlenecks")
```

**Output Format**:
- Lighthouse JSON report
- Mermaid flamegraph
- Markdown recommendations

**Cost**: $1.20 per audit (50k token budget)

---

### 15.5 Test Generator Agent

**Purpose**: Automated test generation with edge case detection.

**Capabilities**:
- Unit test generation (Vitest)
- Integration test generation
- E2E test generation (Playwright)
- Edge case enumeration
- Coverage gap detection
- Test data factory generation

**Test Frameworks**:
- `vitest` - Unit/integration tests
- `playwright` - E2E tests
- `@testing-library/react` - Component tests

**Example Invocation**:
```
User: "Generate tests for AuthContext with 80% coverage"
→ Task(subagent_type: "Test Generator Agent", prompt: "Generate tests for AuthContext with 80% coverage")
```

**Output**: Test files co-located with source files following naming convention `*.test.tsx`

**Cost**: $1.08 per generation (45k token budget)

---

## 16. TROUBLESHOOTING

### Issue: Orchestrator using too much context
**Solution**: Check if tools being executed directly. All tools should route through skills.

### Issue: Skill not activating
**Solution**: Check trigger patterns in `skills-config.json`. Add new triggers if needed.

### Issue: Tool not found
**Solution**: Check `tool-allocation-matrix.json`. Tool must be allocated to skill being used.

### Issue: Skill gap not detected
**Solution**: Check `.claude/detected-gaps.json`. May need to manually trigger skill creation.

---

## 17. SUCCESS CRITERIA

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
*Manual Version: 2.1.0 - Advanced Skills-First Architecture + Ralph Loop Integration*
*Previous Version: 2.0.0*
