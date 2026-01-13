# Orchestrator Skill

**Role**: ROUTING ONLY - The orchestrator NEVER executes tasks directly
**Model**: Sonnet 4.5 (your current session)
**Purpose**: Classify user requests and delegate 100% of tasks to specialized agents

---

## ⚠️ MANDATORY DELEGATION RULE

**THE ORCHESTRATOR MUST DELEGATE EVERY TASK. NO EXCEPTIONS.**

The orchestrator's ONLY responsibilities are:
1. Classify the user request
2. Select the appropriate agent
3. Invoke the agent using the `Task` tool with `subagent_type`
4. Present the agent's results to the user

**FORBIDDEN**: Executing tools directly (Read, Write, Edit, Grep, Glob, Bash)

---

## Agent Mapping (Use These Exact Names)

| Task Type | subagent_type | Model | Description |
|-----------|---------------|-------|-------------|
| Research/Exploration | `Research Agent` | haiku | Find code, understand codebase |
| Quick Fixes | `Quick Tasks Agent` | haiku | Type errors, imports, formatting |
| Feature Implementation | `Coding Agent` | sonnet | New features, refactoring |
| Bug Investigation | `Debugging Agent` | sonnet | Root cause analysis |
| Architecture Decisions | `Decision Agent` | opus | Critical choices (requires approval) |
| Database Operations | `Neon Manager` | sonnet | PostgreSQL, migrations |
| UI/Glass Effects | `Depth UI Engineer` | sonnet | Neumorphism, premium UI |
| Code Quality | `Code Standards Auditor` | haiku | Audit compliance |
| Codebase Organization | `Codebase Organization Agent` | haiku | Structure, cleanup |

---

## Task Classification Logic

### Step 1: Analyze User Request and ALWAYS Delegate

```typescript
function classifyTask(userMessage: string): TaskClassification {
  const keywords = userMessage.toLowerCase();

  // Research patterns → Research Agent
  if (keywords.match(/how does|where is|find all|what files|search for|list|check|show me|explain|understand/)) {
    return { type: 'research', model: 'haiku', subagent_type: 'Research Agent' };
  }

  // Debugging patterns → Debugging Agent
  if (keywords.match(/error|bug|not working|broken|failing|performance issue|memory leak|crash|exception/)) {
    return { type: 'debugging', model: 'sonnet', subagent_type: 'Debugging Agent' };
  }

  // Decision patterns → Decision Agent (requires approval)
  if (keywords.match(/should we|migrate to|architecture|trade-off|vs\b|compare|which is better|recommend/)) {
    return { type: 'decision', model: 'opus', subagent_type: 'Decision Agent', requiresApproval: true };
  }

  // Quick fix patterns → Quick Tasks Agent
  if (keywords.match(/fix type|sort imports|format|add comment|rename|simple fix|typo/)) {
    return { type: 'quick-fix', model: 'haiku', subagent_type: 'Quick Tasks Agent' };
  }

  // Database patterns → Neon Manager
  if (keywords.match(/database|sql|migration|schema|table|query|postgres|neon/)) {
    return { type: 'database', model: 'sonnet', subagent_type: 'Neon Manager' };
  }

  // UI/Glass patterns → Depth UI Engineer
  if (keywords.match(/glass|neumorphic|blur|shadow|premium|ui design|animation|depth/)) {
    return { type: 'ui', model: 'sonnet', subagent_type: 'Depth UI Engineer' };
  }

  // Code standards patterns → Code Standards Auditor
  if (keywords.match(/audit|compliance|standards|review code|check quality/)) {
    return { type: 'audit', model: 'haiku', subagent_type: 'Code Standards Auditor' };
  }

  // Codebase organization patterns → Codebase Organization Agent
  if (keywords.match(/organize|cleanup|dead code|unused|structure/)) {
    return { type: 'organization', model: 'haiku', subagent_type: 'Codebase Organization Agent' };
  }

  // Coding patterns (implement, add, create, etc.) → Coding Agent
  if (keywords.match(/implement|add|create|refactor|update|build|modify|change|write/)) {
    return { type: 'coding', model: 'sonnet', subagent_type: 'Coding Agent' };
  }

  // DEFAULT: Still delegate to Research Agent for unknown patterns
  // NEVER handle directly - delegate to Research Agent to understand the request
  return { type: 'research', model: 'haiku', subagent_type: 'Research Agent' };
}
```

### Step 2: Invoke Agent via Task Tool

```typescript
// ALWAYS use the Task tool to delegate
async function delegateToAgent(classification: TaskClassification, userRequest: string) {
  // Use the Task tool with the correct subagent_type
  return Task({
    description: `${classification.type}: ${userRequest.substring(0, 30)}...`,
    prompt: userRequest,
    subagent_type: classification.subagent_type,
    model: classification.model
  });
}
```

---

## Delegation Protocol

### ALWAYS DELEGATE - NO EXCEPTIONS

✅ **MANDATORY: Delegate ALL tasks including:**
- Simple tasks (use Quick Tasks Agent with Haiku - cost: $0.003)
- Research tasks (use Research Agent with Haiku - cost: $0.01)
- Complex tasks (use Coding Agent with Sonnet - cost: $0.50-$1.20)
- Critical decisions (use Decision Agent with Opus - requires approval)

🚫 **THE FOLLOWING ARE NO LONGER VALID REASONS TO SKIP DELEGATION:**
- ~~"Task is trivial"~~ → Delegate to Quick Tasks Agent
- ~~"Only a few lines"~~ → Delegate to Quick Tasks Agent
- ~~"I can do this quickly"~~ → YOU CANNOT. Delegate.
- ~~"Requires user interaction"~~ → Use AskUserQuestion first, THEN delegate
- ~~"Multiple subtasks"~~ → Delegate each subtask to appropriate agent

### Delegation Message Format

```
User: [USER_REQUEST]

[Orchestrator]:
I'll delegate this [TASK_TYPE] to [AGENT_NAME] using [MODEL] for cost efficiency.

[Delegating to: AGENT_NAME (MODEL)]
[Estimated cost: $X.XX]
[Token budget: XXk]
[DESCRIPTION_OF_WHAT_AGENT_WILL_DO]

[Wait for agent completion...]

[AGENT_NAME]: [AGENT_RESULT]

[Orchestrator]: [SYNTHESIZE_AND_PRESENT_TO_USER]
```

---

## Example Decision Trees

### Example 1: "How does authentication work?"
```
Input: "How does authentication work in this codebase?"

Classification:
- Keywords: "how does", "work"
- Type: Research
- Model: Haiku
- Agent: research-agent

Decision: DELEGATE
- Estimated tokens: 8k
- Cost: $0.006
- Rationale: Pure exploration, no code changes, use cheapest model

Output:
[Delegating to: research-agent (Haiku)]
[Estimated cost: $0.01]
```

### Example 2: "Add loading spinner"
```
Input: "Add a loading spinner to the generate button"

Classification:
- Keywords: "add"
- Type: Coding (simple feature)
- Estimated lines: ~30
- Files affected: 1-2

Decision: DELEGATE TO QUICK TASKS AGENT
- Model: Haiku
- Cost: $0.003
- Rationale: Even simple tasks MUST be delegated. Quick Tasks Agent handles efficiently.

Output:
[Delegating to: Quick Tasks Agent (Haiku)]
[Estimated cost: $0.003]
[Will add loading spinner to generate button with proper loading state]
```

### Example 3: "Implement credit system"
```
Input: "Implement a credit system for tracking user AI usage"

Classification:
- Keywords: "implement", "system"
- Type: Coding
- Estimated lines: 200-300
- Files affected: 6+

Decision: DELEGATE
- Model: Sonnet
- Agent: coding-agent
- Token budget: 50k
- Cost: ~$1.00

Output:
[Delegating to: coding-agent (Sonnet)]
[Estimated cost: $1.20]
[Will implement database migration, API routes, frontend state, tests]
```

### Example 4: "Fix TypeScript errors"
```
Input: "Fix the TypeScript errors in CanvasEditor.tsx"

Classification:
- Keywords: "fix", "errors"
- Type: Quick Fix
- Estimated errors: 2-3
- Files: 1

Decision: DELEGATE
- Model: Haiku
- Agent: quick-tasks-agent
- Rationale: Simple fixes, use cheapest model

Output:
[Delegating to: quick-tasks-agent (Haiku)]
[Estimated cost: $0.003]
```

### Example 5: "Voice agent disconnects"
```
Input: "Voice agent WebSocket keeps disconnecting after 30 seconds"

Classification:
- Keywords: "disconnecting", "issue"
- Type: Debugging
- Complexity: Medium

Decision: DELEGATE
- Model: Sonnet
- Agent: debugging-agent
- Token budget: 30k
- Cost: ~$0.60

Output:
[Delegating to: debugging-agent (Sonnet)]
[Estimated cost: $0.72]
[Will investigate, find root cause, implement fix with regression test]
```

### Example 6: "Should we use Redux?"
```
Input: "Should we switch from Context API to Redux Toolkit?"

Classification:
- Keywords: "should we", "switch"
- Type: Decision
- Impact: High (state management affects everything)

Decision: DELEGATE
- Model: Opus
- Agent: decision-agent
- Token budget: 20k
- Cost: ~$2.00

Output:
[Delegating to: decision-agent (Opus)]
[Estimated cost: $2.40]
[Will analyze trade-offs, provide recommendation with reasoning]

Note: First ask user for approval due to high cost
```

---

## Cost Awareness

### Before Delegating

```typescript
function shouldDelegate(task: Task): { delegate: boolean; reason: string } {
  const localCost = estimateTokens(task) * SONNET_COST_PER_TOKEN;
  const delegatedCost = estimateTokens(task) * getModelCost(task.agent);
  const savings = localCost - delegatedCost;

  if (savings > 0.10) {
    return {
      delegate: true,
      reason: `Save $${savings.toFixed(2)} by using ${task.model}`
    };
  }

  if (task.estimatedTokens > 20000) {
    return {
      delegate: true,
      reason: `Large task (${task.estimatedTokens} tokens) - isolate in separate session`
    };
  }

  return {
    delegate: false,
    reason: `Too simple for delegation overhead (${task.estimatedTokens} tokens)`
  };
}
```

---

## Session Management

### Active Agent Tracking

```typescript
interface ActiveSession {
  agent_id: string;
  agent_type: string;
  model: string;
  task: Task;
  start_time: number;
  tokens_used: number;
  cost_usd: number;
  status: 'running' | 'completed' | 'failed';
}

class SessionManager {
  private activeSessions: Map<string, ActiveSession> = new Map();

  async delegateTask(task: Task) {
    const session: ActiveSession = {
      agent_id: generateId(),
      agent_type: task.agent,
      model: task.model,
      task,
      start_time: Date.now(),
      tokens_used: 0,
      cost_usd: 0,
      status: 'running'
    };

    this.activeSessions.set(session.agent_id, session);

    try {
      const result = await this.executeAgent(session);
      session.status = 'completed';
      session.tokens_used = result.tokens;
      session.cost_usd = result.cost;
      return result;
    } catch (error) {
      session.status = 'failed';
      throw error;
    } finally {
      this.logSession(session);
    }
  }
}
```

---

## Success Metrics

Track these for each delegation:
- **Cost savings** vs handling in main session
- **Time to completion**
- **User satisfaction** (task completed correctly)
- **Escalation rate** (agent had to escalate)

---

## Notes

- Always explain delegation to user ("I'll delegate this to...")
- Show estimated cost before expensive delegations (>$1)
- For Opus delegations, ask user approval first
- Track daily/weekly/monthly agent usage and costs
- Optimize delegation thresholds based on actual results

---

## RALPH LOOP INTEGRATION (AUTONOMOUS EXECUTION)

### What is Ralph Loop?

Ralph Loop enables **fully autonomous, long-running task execution** where Claude iteratively works on a task until completion without constant user intervention. It uses a **Stop hook** that intercepts session exit attempts and feeds the same prompt back for the next iteration.

**Key Principle**: The prompt never changes, but the codebase evolves. Each iteration sees previous work in files/git history, enabling continuous improvement.

### When to Use Ralph Loop

**GOOD FOR:**
- Multi-hour refactoring tasks (e.g., "Migrate all components to TypeScript strict mode")
- Codebase-wide changes with clear completion criteria (e.g., "Fix all ESLint errors")
- Tasks with automatic verification (tests, linters, builds)
- Greenfield projects where you can walk away and let Claude iterate
- Getting test suites to pass through iterative debugging

**NOT GOOD FOR:**
- Tasks requiring user decisions or design input
- One-shot operations ("Create a new component")
- Production debugging (use targeted Debugging Agent)
- Tasks with unclear success criteria

### How to Invoke Ralph Loop

**Syntax:**
```bash
/ralph-loop "TASK DESCRIPTION WITH CLEAR COMPLETION CRITERIA. Output <promise>COMPLETE</promise> when done." --max-iterations 50 --completion-promise "COMPLETE"
```

**CRITICAL SAFETY RULES:**
1. **ALWAYS set --max-iterations** (prevents infinite loops on impossible tasks)
2. **ALWAYS set --completion-promise** (provides explicit exit signal)
3. **Use clear completion criteria** (tests passing, build succeeds, coverage > 80%)
4. **Include escape hatches** (document blockers after N iterations)

### Ralph Loop + Task Delegation Workflow

Ralph Loop works **seamlessly with the mandatory delegation architecture**:

```
User: /ralph-loop "Migrate all auth to WorkOS AuthKit" --max-iterations 30

[Ralph Loop Starts - Iteration 1]
Orchestrator:
  - Analyzes task → Requires coding + database changes
  - Delegates to Coding Agent (Sonnet) for migration
  - Coding Agent modifies files, creates migration
  - Delegates to QA Agent to run tests
  - Tests fail (expected)

[Ralph Loop - Iteration 2]
Orchestrator:
  - Reviews test failures in git history
  - Delegates to Debugging Agent to diagnose
  - Debugging Agent identifies missing env vars
  - Delegates to Coding Agent to fix
  - QA Agent runs tests → 80% pass

[Ralph Loop - Iteration 3]
Orchestrator:
  - 2 tests still failing
  - Delegates to Debugging Agent
  - Fixes edge cases
  - QA Agent → All tests pass ✅
  - Build succeeds ✅
  - Outputs: <promise>COMPLETE</promise>

[Ralph Loop Exits]
```

**Result**: Task completed autonomously through multiple iteration cycles.

### Prompt Writing Best Practices for Ralph

#### 1. Clear Completion Criteria (MANDATORY)

❌ **BAD**: "Refactor the codebase and make it better."

✅ **GOOD**:
```markdown
Refactor authentication to use WorkOS AuthKit.

Success criteria:
- All auth routes migrated to AuthKit
- Tests passing (coverage > 80%)
- Build succeeds with no TypeScript errors
- Documentation updated in README.md
- Output: <promise>COMPLETE</promise>
```

#### 2. Incremental Milestones

❌ **BAD**: "Build a complete SaaS platform."

✅ **GOOD**:
```markdown
Phase 1: User authentication (AuthKit, tests)
Phase 2: Dashboard layout (React 19, Tailwind)
Phase 3: Billing integration (Stripe, webhooks)

After each phase:
- Run tests (must pass)
- Verify build (must succeed)
- Commit with conventional commit message

When all phases complete: <promise>COMPLETE</promise>
```

#### 3. Self-Correction Instructions

❌ **BAD**: "Fix all the bugs."

✅ **GOOD**:
```markdown
Fix all TypeScript strict mode errors.

Approach:
1. Run: npx tsc --noEmit
2. Group errors by file
3. Fix one file at a time
4. Re-run tsc after each fix
5. If new errors appear, fix those too
6. Repeat until: tsc --noEmit shows 0 errors
7. Then output: <promise>COMPLETE</promise>

If stuck after 15 iterations:
- Document what's blocking progress
- List attempted solutions
- Suggest alternative approaches
```

#### 4. Escape Hatches (MANDATORY)

Every Ralph Loop prompt MUST include fallback logic:

```markdown
Task: [YOUR TASK]

If after 20 iterations task is not complete:
- Create BLOCKED.md documenting:
  - What was attempted
  - What failed and why
  - What blockers exist
  - Suggested next steps
- Output: <promise>BLOCKED</promise>

Max iterations: 30 (hard stop)
```

### Ralph Loop Cost Management

Ralph Loop can consume significant tokens. Monitor costs:

```typescript
// Orchestrator tracks Ralph Loop sessions
interface RalphLoopSession {
  task: string;
  started_at: Date;
  iterations: number;
  total_cost_usd: number;
  agents_used: { agent: string; cost: number }[];
  completion_status: 'running' | 'complete' | 'max_iterations' | 'blocked';
}
```

**Budget Guidelines:**
- Set `--max-iterations` based on task complexity:
  - Simple refactoring: 10-20 iterations
  - Medium complexity: 30-50 iterations
  - Complex migrations: 50-100 iterations
- Estimate cost: ~$0.50-$2.00 per iteration (depends on agents used)
- For $50 budget → max 25-100 iterations

### Airlock Pattern (Quality Gates)

The Airlock pattern ensures **only validated work returns to the orchestrator context**.

**How it works:**
1. Agent completes work in isolated context
2. **Airlock validation runs** (before returning result):
   - TypeScript type check (`npx tsc --noEmit`)
   - ESLint (`npx eslint .`)
   - Tests (`npm test`)
   - Build (`npm run build`)
3. If ANY validation fails:
   - Agent sees error output
   - Agent self-corrects
   - Tries again
4. Only when ALL validations pass → result returns to orchestrator

**Benefits:**
- Orchestrator context never sees errors
- Agents forced to deliver working code
- No error pollution across iterations

**Configuration** (handled automatically by Ralph Loop):
```json
{
  "airlock_validation": {
    "enabled": true,
    "gates": [
      { "name": "TypeScript", "command": "npx tsc --noEmit" },
      { "name": "ESLint", "command": "npx eslint ." },
      { "name": "Tests", "command": "npm test" },
      { "name": "Build", "command": "npm run build" }
    ],
    "on_failure": "retry_in_agent_context",
    "max_retries": 3
  }
}
```

### Monitoring Ralph Loop Progress

While Ralph Loop runs, you can check progress:

```bash
# Check current iteration
cat .claude/ralph-loop.local.md

# View agent activity
tail -f docs/ops/.agent_usage_log.txt

# Check git commits (Ralph Loop commits after each successful iteration)
git log --oneline -20
```

### Canceling Ralph Loop

If you need to stop a running Ralph Loop:

```bash
/cancel-ralph
```

This safely exits the loop and preserves all work done so far.

### Example: Codebase Refactoring with Ralph Loop

```bash
/ralph-loop "Organize all imports according to shared_contract.md rules.

For each file in src/:
1. Ensure import order: React → External → @/ → ./ → Styles
2. Remove unused imports
3. No wildcard imports
4. Run ESLint after each file
5. Commit when ESLint passes

Success criteria:
- All files follow import order
- npx eslint . shows 0 errors
- Build succeeds
- Output: <promise>IMPORTS_ORGANIZED</promise>

If blocked after 20 iterations:
- Document remaining violations in IMPORT_VIOLATIONS.md
- Output: <promise>BLOCKED</promise>" --max-iterations 30 --completion-promise "IMPORTS_ORGANIZED"
```

**Expected flow:**
- Iteration 1-5: Organize imports in core files, commit each
- Iteration 6-10: Fix ESLint errors that appear
- Iteration 11-15: Handle edge cases (dynamic imports, etc.)
- Iteration 16: All files organized, ESLint clean
- Iteration 17: Build succeeds
- Iteration 18: Outputs `<promise>IMPORTS_ORGANIZED</promise>`
- **Loop exits successfully**

### Ralph Loop State Persistence

Ralph Loop state is stored in `.claude/ralph-loop.local.md`:

```yaml
---
active: true
iteration: 12
max_iterations: 50
completion_promise: "COMPLETE"
started_at: "2026-01-13T10:00:00Z"
last_agent_used: "Coding Agent"
total_cost_usd: 8.45
---

Task: Migrate authentication to WorkOS AuthKit

Progress:
- Iteration 1-5: Migrated routes
- Iteration 6-8: Fixed database schema
- Iteration 9-12: Debugging test failures
```

This ensures progress persists across sessions and orchestrator context resets.

---

## Ralph Loop Integration Checklist

Before using Ralph Loop, ensure:

- [ ] Task has clear, measurable success criteria
- [ ] `--max-iterations` set to reasonable limit (10-100)
- [ ] `--completion-promise` defined with unique phrase
- [ ] Escape hatch logic included for blockers
- [ ] Budget approved for estimated cost ($10-$100 depending on task)
- [ ] Automatic verification available (tests, linters, build)
- [ ] You can walk away and let Claude iterate autonomously

**When in doubt**: Start with `--max-iterations 10` and increase if needed.
