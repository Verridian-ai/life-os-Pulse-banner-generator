# Ralph Loop Workflow Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-13
**Purpose**: Comprehensive guide for using Ralph Loop with the skills-first orchestrator

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Integration](#architecture-integration)
3. [Step-by-Step Workflow](#step-by-step-workflow)
4. [Prompt Engineering](#prompt-engineering)
5. [Context Preservation](#context-preservation)
6. [Airlock Validation](#airlock-validation)
7. [Cost Management](#cost-management)
8. [Real-World Examples](#real-world-examples)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Overview

### What is Ralph Loop?

Ralph Loop is a **self-referential execution pattern** where Claude iteratively works on a task until completion. It uses a **Stop hook** that intercepts exit attempts and feeds the same prompt back, creating a continuous improvement cycle.

**Key Characteristics:**
- Prompt never changes between iterations
- Codebase evolves (files, git history)
- Each iteration sees previous work and learns from it
- Continues until completion promise or max iterations
- Works inside current session (no external bash loops)

### Why Use Ralph Loop with Skills-First Architecture?

Traditional Ralph Loop implementations lose context on each iteration. Our **skills-first + Ralph Loop** integration solves this:

```
Traditional Ralph Loop:
Iteration 1: Full context → Work → Exit → RESET → Start from scratch
Iteration 2: Full context → Work → Exit → RESET → Start from scratch
Result: Massive context waste, no learning between iterations

Skills-First Ralph Loop:
Iteration 1: Orchestrator (5k tokens) → Delegate to Agent → Work → Airlock → Return
Iteration 2: Orchestrator (5k tokens) → Delegate to Agent → Work → Airlock → Return
Result: 90% context savings, agents learn from previous iterations via git history
```

**Benefits:**
- Orchestrator context stays lean (<5k tokens)
- Agents execute in isolation with dedicated tools
- Progress persists via git commits
- Airlock prevents error propagation
- Cost-efficient (Haiku for simple, Sonnet for complex, Opus only when needed)

---

## Architecture Integration

### How Ralph Loop Fits with Mandatory Delegation

Ralph Loop **enhances** the orchestrator's delegation workflow:

```
WITHOUT Ralph Loop:
User: "Migrate all auth to WorkOS"
Orchestrator: Delegates to Coding Agent
Coding Agent: Makes changes, returns
User: Sees results, asks for fixes
Orchestrator: Delegates again
[Manual iteration loop]

WITH Ralph Loop:
User: /ralph-loop "Migrate all auth to WorkOS. Output <promise>COMPLETE</promise> when done."
[Ralph Loop Iteration 1]
  Orchestrator: Delegates to Coding Agent
  Coding Agent: Migrates routes, commits
  Airlock: Tests fail (expected)
  Stop Hook: Continue iteration

[Ralph Loop Iteration 2]
  Orchestrator: Reviews git history, sees test failures
  Orchestrator: Delegates to Debugging Agent
  Debugging Agent: Identifies issues, fixes
  Coding Agent: Updates code, commits
  Airlock: Tests pass
  Stop Hook: Continue iteration

[Ralph Loop Iteration 3]
  Orchestrator: Verifies all criteria met
  Orchestrator: Outputs <promise>COMPLETE</promise>
  Ralph Loop: Exits

[Autonomous completion without user intervention]
```

### Agent Coordination in Ralph Loop

Ralph Loop iterations automatically delegate to specialized agents based on task type:

| Iteration Phase | Agent | Trigger | Model |
|-----------------|-------|---------|-------|
| Initial exploration | Research Agent | "understand", "analyze" | Haiku |
| Implementation | Coding Agent | "implement", "create" | Sonnet |
| Bug fixing | Debugging Agent | "error", "failing" | Sonnet |
| Verification | QA Agent | "run tests", "verify" | Haiku |
| Cleanup | Codebase Org Agent | "organize", "cleanup" | Haiku |

**Orchestrator's Role in Ralph Loop:**
1. Read git log to see previous iterations
2. Classify next step needed
3. Delegate to appropriate agent
4. Wait for agent result
5. Check completion criteria
6. If not done → Stop hook triggers next iteration
7. If done → Output completion promise

---

## Step-by-Step Workflow

### Phase 1: Pre-Launch Checklist

Before starting Ralph Loop, ensure:

```bash
# 1. Task has clear success criteria
✅ "All tests passing" (measurable)
✅ "ESLint shows 0 errors" (verifiable)
✅ "Coverage > 80%" (quantifiable)
❌ "Code looks good" (subjective)

# 2. Max iterations set appropriately
✅ Simple task (10-20 iterations)
✅ Medium task (30-50 iterations)
✅ Complex task (50-100 iterations)

# 3. Budget approved
✅ Estimate: iterations × $0.50-$2.00 per iteration
✅ Example: 50 iterations × $1.00 = $50 budget

# 4. Escape hatch defined
✅ "After 20 iterations, if blocked, document in BLOCKED.md"

# 5. Automatic verification available
✅ Tests can run via `npm test`
✅ Linters can run via `npx eslint .`
✅ Build can run via `npm run build`
```

### Phase 2: Crafting the Prompt

Use the **CLEAR framework**:

**C - Completion criteria** (measurable)
**L - Loop escape hatch** (fallback logic)
**E - Explicit verification** (tests, lints, builds)
**A - Autonomous workflow** (step-by-step instructions)
**R - Result format** (completion promise)

**Template:**
```markdown
Task: [SPECIFIC, MEASURABLE TASK]

Step-by-step approach:
1. [First step with verification]
2. [Second step with verification]
3. [Continue until done]

Success criteria (ALL must be true):
- [Criterion 1: Tests passing]
- [Criterion 2: ESLint clean]
- [Criterion 3: Build succeeds]
- [Criterion 4: Coverage > X%]

Verification commands:
- npm test
- npx eslint .
- npm run build

When ALL criteria met:
Output: <promise>COMPLETE</promise>

Escape hatch:
If after [N] iterations not complete:
- Create BLOCKED.md with:
  - What was attempted
  - What's blocking progress
  - Suggested alternatives
- Output: <promise>BLOCKED</promise>
```

### Phase 3: Launch Ralph Loop

```bash
/ralph-loop "YOUR_PROMPT_HERE" --max-iterations 50 --completion-promise "COMPLETE"
```

**What happens next:**
1. Ralph Loop initializes
2. Creates state file (`.claude/ralph-loop.local.md`)
3. Starts iteration 1
4. Orchestrator classifies task
5. Delegates to appropriate agent
6. Agent works, commits changes
7. Airlock validates (if enabled)
8. Stop hook intercepts exit
9. Feeds same prompt back → Iteration 2
10. Repeat until completion promise or max iterations

### Phase 4: Monitoring Progress

While Ralph Loop runs:

```bash
# Check current iteration and status
cat .claude/ralph-loop.local.md

# View recent git commits (Ralph Loop commits after each iteration)
git log --oneline -10

# Check agent cost tracking
tail -20 docs/ops/.agent_usage_log.txt

# Monitor orchestrator context (should stay <5k tokens)
grep "Orchestrator context" docs/ops/.agent_usage_log.txt | tail -5
```

### Phase 5: Completion or Cancellation

**Successful completion:**
- Ralph Loop sees completion promise in output
- Exits automatically
- Final state saved to `.claude/ralph-loop.local.md`
- All work committed to git

**Manual cancellation:**
```bash
/cancel-ralph
```

**Max iterations reached:**
- Ralph Loop stops after N iterations
- State marked as `max_iterations_reached`
- Current progress preserved
- User can review and decide next steps

---

## Prompt Engineering

### Pattern 1: Incremental Milestones

Break large tasks into phases that Ralph Loop can verify:

```markdown
/ralph-loop "Migrate authentication system to WorkOS AuthKit.

Phase 1: Backend Migration
- Update server/src/routes/auth.ts to use AuthKit SDK
- Add environment variables for WorkOS
- Run: npm test -- auth.test.ts
- Commit if tests pass

Phase 2: Frontend Migration
- Update src/context/AuthContext.tsx
- Replace custom auth UI with AuthKit components
- Run: npm test -- AuthContext.test.tsx
- Commit if tests pass

Phase 3: Database Schema
- Create migration for new auth fields
- Run migration on dev database
- Verify: psql -c 'SELECT * FROM users LIMIT 1'
- Commit if schema correct

Phase 4: Integration Testing
- Run full test suite: npm test
- Check coverage: npm run coverage
- Verify coverage > 80%
- Build: npm run build

When ALL phases complete:
Output: <promise>AUTH_MIGRATED</promise>

If blocked after 30 iterations:
- Document blocker in MIGRATION_BLOCKED.md
- Output: <promise>BLOCKED</promise>" --max-iterations 40 --completion-promise "AUTH_MIGRATED"
```

### Pattern 2: Test-Driven Iteration

Let failing tests drive Ralph Loop:

```markdown
/ralph-loop "Fix all failing tests in src/features/admin.

Approach:
1. Run: npm test -- src/features/admin
2. Review failures (read test output)
3. For each failing test:
   - Identify root cause
   - Fix implementation
   - Re-run test
   - If passes, commit
4. Repeat until: npm test -- src/features/admin shows 0 failures

Success criteria:
- npm test -- src/features/admin → All tests pass
- npm run build → No errors
- Coverage report shows > 80% for admin feature

Output: <promise>ADMIN_TESTS_FIXED</promise>

If stuck on same test for 5 iterations:
- Add debugging output to test
- Document findings in DEBUG_ADMIN_TESTS.md
- Try alternative approach" --max-iterations 25 --completion-promise "ADMIN_TESTS_FIXED"
```

### Pattern 3: Codebase Refactoring

Use Ralph Loop for systematic refactoring:

```markdown
/ralph-loop "Refactor all components to use React 19 features.

For each component in src/components/:
1. Identify React 18 patterns:
   - useEffect dependencies
   - useState initializers
   - ref forwarding
2. Convert to React 19:
   - Use new useActionState
   - Use new use() hook
   - Update ref patterns
3. Verify:
   - Run: npm test -- ComponentName.test.tsx
   - Check: npx tsc --noEmit
4. If both pass, commit

Success criteria:
- All components use React 19 features
- npm test → All pass
- npx tsc --noEmit → 0 errors
- npm run build → Success

Output: <promise>REACT_19_MIGRATED</promise>

After 40 iterations, if not done:
- List remaining components in REACT_19_REMAINING.md
- Output: <promise>PARTIAL_COMPLETE</promise>" --max-iterations 50 --completion-promise "REACT_19_MIGRATED"
```

### Pattern 4: Error Elimination

Target specific error types:

```markdown
/ralph-loop "Eliminate all TypeScript strict mode errors.

Strategy:
1. Run: npx tsc --noEmit > ts-errors.txt
2. Count total errors: wc -l ts-errors.txt
3. Group errors by type:
   - Implicit any
   - Null/undefined
   - Missing return types
4. Fix one type at a time:
   - Pick error category
   - Fix all instances
   - Re-run tsc
   - Commit if fewer errors
5. Repeat until: npx tsc --noEmit shows 0 errors

Success criteria:
- npx tsc --noEmit → No errors
- npm test → All pass (ensure no regressions)
- npm run build → Success

Output: <promise>TYPESCRIPT_STRICT_COMPLETE</promise>

If error count plateaus for 5 iterations:
- Document problematic files in TYPESCRIPT_BLOCKERS.md
- Suggest workarounds or type any as last resort" --max-iterations 30 --completion-promise "TYPESCRIPT_STRICT_COMPLETE"
```

---

## Context Preservation

### How Context is Preserved Across Iterations

Ralph Loop + Skills-First architecture uses **git history as shared memory**:

```
Iteration 1:
  Orchestrator: "Let's migrate auth"
  → Delegates to Coding Agent
  Coding Agent: Modifies auth.ts, commits
  Git log: "feat: Initial auth migration"

Iteration 2:
  Orchestrator: Reads git log, sees previous work
  Orchestrator: "Tests are failing, need to debug"
  → Delegates to Debugging Agent
  Debugging Agent: Reviews commit, finds issue, fixes
  Git log: "fix: Handle missing env vars in auth"

Iteration 3:
  Orchestrator: Reads git log, sees both commits
  Orchestrator: "All tests passing, verify build"
  → Delegates to QA Agent
  QA Agent: Runs build, succeeds
  Outputs: <promise>COMPLETE</promise>
```

**Key Mechanisms:**

1. **Git Commits**: Each successful iteration commits changes
2. **Commit Messages**: Conventional commits document what changed
3. **File System**: Code changes persist
4. **State File**: `.claude/ralph-loop.local.md` tracks iteration count, cost, status
5. **Orchestrator Context**: Always <5k tokens, never polluted

### Orchestrator Context Budget in Ralph Loop

```typescript
// Each iteration starts fresh
function ralphLoopIteration(iteration: number) {
  // Orchestrator context: ~5k tokens
  const context = {
    current_iteration: iteration,
    max_iterations: 50,
    completion_promise: "COMPLETE",
    git_log: readLastNCommits(10), // Recent work
    task_description: readFromStateFile(),
    last_agent_result: readFromStateFile()
  };

  // Classify next step (uses <100 tokens)
  const nextAgent = classifyTask(context);

  // Delegate to agent (agent uses 10k-50k tokens in ISOLATED context)
  const result = delegateToAgent(nextAgent, context);

  // Orchestrator receives ONLY the result (not full agent context)
  // Result: ~500-2000 tokens

  // Check completion
  if (result.includes(completion_promise)) {
    exitRalphLoop("success");
  }

  // Stop hook triggers next iteration
  // Orchestrator context RESETS to ~5k tokens
  // Agent context DISCARDED
}
```

**Result:** Even after 50 iterations, orchestrator never exceeds 5k tokens.

### Progressive Disclosure

Ralph Loop uses **progressive disclosure** to keep context lean:

**Iteration 1:**
```
Orchestrator sees: Task description, no history
Tokens: 2,000
```

**Iteration 10:**
```
Orchestrator sees: Task description, last 5 commits (summary)
Tokens: 3,500
```

**Iteration 25:**
```
Orchestrator sees: Task description, last 5 commits, last error (if any)
Tokens: 4,200
```

**Iteration 50:**
```
Orchestrator sees: Task description, last 5 commits, progress summary
Tokens: 4,800
```

**Never exceeds 5k token budget.**

---

## Airlock Validation

### What is the Airlock Pattern?

The Airlock is a **quality gate** that validates agent work before returning to orchestrator:

```
Normal Flow (NO AIRLOCK):
Agent → Makes changes → Returns to Orchestrator
Problem: If agent introduced bugs, orchestrator context now polluted with errors

Airlock Flow:
Agent → Makes changes → AIRLOCK VALIDATION
  ↓ If validation fails:
  → Agent sees error
  → Agent self-corrects
  → Tries again (max 3 retries)
  ↓ If validation passes:
  → Returns to Orchestrator (orchestrator never sees errors)
```

### Airlock Gates

Configured in `skills-config.json`:

```json
{
  "airlock_validation": {
    "enabled": true,
    "gates": [
      {
        "name": "TypeScript",
        "command": "npx tsc --noEmit",
        "required": true
      },
      {
        "name": "ESLint",
        "command": "npx eslint .",
        "required": true
      },
      {
        "name": "Tests",
        "command": "npm test",
        "required": false
      },
      {
        "name": "Build",
        "command": "npm run build",
        "required": true
      }
    ],
    "on_failure": "retry_in_agent_context",
    "max_retries": 3
  }
}
```

### Airlock Execution Flow

**Step 1: Agent Completes Work**
```bash
# Coding Agent finishes implementation
git add .
git commit -m "feat: Add new feature"
```

**Step 2: Airlock Runs Gates**
```bash
# Gate 1: TypeScript check
npx tsc --noEmit
# ✅ Passes

# Gate 2: ESLint
npx eslint .
# ❌ Fails: 3 errors found

# Airlock blocks return to orchestrator
```

**Step 3: Agent Sees Error (In Agent Context)**
```
Airlock validation failed:
Gate: ESLint
Errors:
  - src/components/NewFeature.tsx:15 - Missing semicolon
  - src/components/NewFeature.tsx:23 - Unused variable
  - src/components/NewFeature.tsx:45 - Implicit any

Please fix these errors and try again.
```

**Step 4: Agent Self-Corrects**
```bash
# Agent fixes errors
# Re-commits
git add .
git commit --amend -m "feat: Add new feature (ESLint clean)"
```

**Step 5: Airlock Re-Runs**
```bash
npx tsc --noEmit  # ✅
npx eslint .      # ✅
npm run build     # ✅
# All gates pass
```

**Step 6: Return to Orchestrator**
```
Result: Feature implemented successfully
Airlock: All gates passed
Orchestrator: Never saw ESLint errors, receives clean result
```

### Benefits of Airlock in Ralph Loop

1. **No Error Propagation**: Orchestrator context stays clean
2. **Forced Quality**: Agents can't return broken code
3. **Self-Correction**: Agents learn to fix their own mistakes
4. **Faster Convergence**: Fewer iterations needed (no back-and-forth on obvious errors)
5. **Cost Savings**: Validate once in agent context vs. multiple iterations

---

## Cost Management

### Cost Tracking for Ralph Loop

Each Ralph Loop session tracks costs:

```typescript
interface RalphLoopCostTracking {
  session_id: string;
  task_description: string;
  started_at: Date;
  total_iterations: number;
  agents_used: {
    agent_name: string;
    model: string;
    invocations: number;
    tokens_input: number;
    tokens_output: number;
    cost_usd: number;
  }[];
  total_cost_usd: number;
  cost_per_iteration_avg: number;
  status: 'running' | 'complete' | 'max_iterations' | 'canceled';
}
```

### Cost Estimation Guidelines

| Task Complexity | Iterations | Avg Cost/Iter | Total Est. |
|----------------|-----------|---------------|------------|
| Simple (ESLint fixes) | 10-20 | $0.50 | $5-$10 |
| Medium (Feature add) | 30-50 | $1.00 | $30-$50 |
| Complex (Migration) | 50-100 | $1.50 | $75-$150 |

**Factors affecting cost:**
- **Agent mix**: Haiku ($0.80/1M) vs Sonnet ($24/1M) vs Opus ($120/1M)
- **Iteration length**: More tool calls = more tokens
- **Airlock retries**: Failed validations increase cost

### Cost Optimization Strategies

**1. Right-Size Max Iterations**
```bash
# DON'T: Set arbitrarily high
--max-iterations 200  # Wastes budget on impossible tasks

# DO: Set based on task estimate
--max-iterations 30   # Reasonable for medium task
```

**2. Use Cheapest Appropriate Model**
```markdown
# Simple tasks → Haiku agents
"Fix all import order violations" → Quick Tasks Agent (Haiku) → $0.003/iter

# Complex tasks → Sonnet agents
"Migrate to new auth system" → Coding Agent (Sonnet) → $1.20/iter

# Critical decisions → Opus agents (rare)
"Evaluate database migration strategy" → Decision Agent (Opus) → $2.40/iter
```

**3. Enable Airlock Validation**
```json
// Catch errors early, reduce wasted iterations
"airlock_validation": { "enabled": true }
```

**4. Commit Frequently**
```markdown
# In prompt:
"After each successful file, commit. This creates checkpoints."
```

**5. Set Cost Thresholds**
```json
{
  "cost_tracking": {
    "warn_at_cost_usd": 25.0,    // Alert user
    "stop_at_cost_usd": 100.0    // Hard stop
  }
}
```

### Cost Monitoring During Execution

```bash
# Check current cost
grep "Ralph Loop cost" docs/ops/.agent_usage_log.txt | tail -1

# Example output:
# Ralph Loop cost: $23.45 (iteration 18/50)

# If approaching budget, cancel and review
/cancel-ralph
```

---

## Real-World Examples

### Example 1: Migrate to WorkOS AuthKit

**Scenario**: Replace custom auth with WorkOS AuthKit

**Prompt:**
```bash
/ralph-loop "Migrate authentication to WorkOS AuthKit.

Step 1: Install dependencies
- npm install @workos-inc/authkit-nextjs
- Commit

Step 2: Backend migration
- Update server/src/lib/workos.ts
- Replace custom session logic with AuthKit
- Add environment variables to .env.example
- Run: npm test -- server/src/lib/workos.test.ts
- If passes, commit

Step 3: Frontend migration
- Update src/context/AuthContext.tsx
- Replace AuthModal with AuthKit UI
- Run: npm test -- src/context/AuthContext.test.tsx
- If passes, commit

Step 4: Update routes
- Modify src/App.tsx for AuthKit routing
- Test: npm test
- Build: npm run build
- If both pass, commit

Success criteria:
- All tests passing (npm test)
- Build succeeds (npm run build)
- No TypeScript errors (npx tsc --noEmit)
- Documentation updated in README.md

Output: <promise>AUTHKIT_MIGRATED</promise>

If blocked after 25 iterations:
- Document remaining tasks in AUTHKIT_MIGRATION.md
- Output: <promise>BLOCKED</promise>" --max-iterations 35 --completion-promise "AUTHKIT_MIGRATED"
```

**Expected Flow:**
- **Iterations 1-5**: Install deps, update backend (Coding Agent)
- **Iterations 6-10**: Migrate frontend (Coding Agent)
- **Iterations 11-15**: Fix test failures (Debugging Agent)
- **Iterations 16-20**: Update routes, verify build (Coding Agent)
- **Iterations 21-25**: Documentation, final verification (Quick Tasks Agent)
- **Iteration 26**: All criteria met, outputs `<promise>AUTHKIT_MIGRATED</promise>`

**Cost Estimate:**
- 26 iterations × $1.00 avg = **$26.00**

---

### Example 2: Fix All TypeScript Strict Errors

**Scenario**: Enable TypeScript strict mode and fix all errors

**Prompt:**
```bash
/ralph-loop "Enable TypeScript strict mode and eliminate all errors.

Step 1: Enable strict mode
- Update tsconfig.json: \"strict\": true
- Commit

Step 2: Catalog errors
- Run: npx tsc --noEmit > strict-errors.txt
- Count: wc -l strict-errors.txt
- Document in STRICT_MIGRATION.md

Step 3: Fix implicit any errors
- For each file with implicit any:
  - Add explicit types
  - Re-run: npx tsc --noEmit
  - Commit when fewer errors
- Continue until no implicit any errors

Step 4: Fix null/undefined errors
- Add null checks
- Use optional chaining (?.)
- Add type guards
- Commit per file

Step 5: Add missing return types
- All functions get explicit return types
- Run tsc after each file
- Commit

Step 6: Final verification
- npm test (ensure no regressions)
- npm run build
- Coverage check

Success criteria:
- npx tsc --noEmit → 0 errors
- npm test → All pass
- npm run build → Success
- strict: true in tsconfig.json

Output: <promise>STRICT_MODE_COMPLETE</promise>

If error count plateaus for 5 iterations:
- Document problematic patterns in STRICT_BLOCKERS.md
- Suggest any types as last resort with // @ts-expect-error" --max-iterations 40 --completion-promise "STRICT_MODE_COMPLETE"
```

**Expected Flow:**
- **Iterations 1-3**: Enable strict, catalog errors (Quick Tasks Agent)
- **Iterations 4-15**: Fix implicit any (Coding Agent)
- **Iterations 16-25**: Fix null/undefined (Coding Agent)
- **Iterations 26-30**: Add return types (Quick Tasks Agent)
- **Iterations 31-35**: Fix remaining edge cases (Debugging Agent)
- **Iteration 36**: All checks pass, outputs `<promise>STRICT_MODE_COMPLETE</promise>`

**Cost Estimate:**
- 36 iterations × $0.80 avg (mostly Haiku agents) = **$28.80**

---

### Example 3: Codebase Reorganization

**Scenario**: Organize all imports according to shared contract rules

**Prompt:**
```bash
/ralph-loop "Organize all imports in src/ according to shared_contract.md rules.

Import order rules (MANDATORY):
1. React and core framework
2. Third-party libraries (npm packages)
3. Internal modules (@/ imports)
4. Relative imports (./ and ../)
5. Styles and assets

For each file in src/:
1. Read current imports
2. Classify each import
3. Reorder according to rules
4. Remove unused imports
5. No wildcard imports (expand them)
6. Run: npx eslint [filename] --fix
7. If ESLint passes, commit

Process in batches:
- Batch 1: src/components/ (iterations 1-10)
- Batch 2: src/features/ (iterations 11-20)
- Batch 3: src/services/ (iterations 21-25)
- Batch 4: src/context/ (iterations 26-30)

Success criteria:
- All files follow import order
- npx eslint . → 0 errors
- npm test → All pass
- npm run build → Success

Output: <promise>IMPORTS_ORGANIZED</promise>

If stuck on a file for 3 iterations:
- Document problematic imports in IMPORT_ISSUES.md
- Skip file, continue with others" --max-iterations 35 --completion-promise "IMPORTS_ORGANIZED"
```

**Expected Flow:**
- **Iterations 1-10**: Organize components (Codebase Org Agent - Haiku)
- **Iterations 11-20**: Organize features (Codebase Org Agent - Haiku)
- **Iterations 21-25**: Organize services (Codebase Org Agent - Haiku)
- **Iterations 26-30**: Organize context (Codebase Org Agent - Haiku)
- **Iterations 31-33**: Final ESLint pass, build verification (Quick Tasks Agent - Haiku)
- **Iteration 34**: All criteria met, outputs `<promise>IMPORTS_ORGANIZED</promise>`

**Cost Estimate:**
- 34 iterations × $0.30 avg (Haiku agents, simple task) = **$10.20**

---

## Troubleshooting

### Problem 1: Ralph Loop Never Exits

**Symptoms:**
- Reaches max iterations
- Completion promise never appears
- Same issues persist across iterations

**Diagnosis:**
```bash
# Check if completion criteria are realistic
cat .claude/ralph-loop.local.md

# Review recent iterations
git log --oneline -20

# Look for patterns (same agent failing repeatedly?)
grep "Agent:" docs/ops/.agent_usage_log.txt | tail -20
```

**Solutions:**

1. **Unrealistic completion criteria**
   - Fix: Lower expectations or break into phases
   - Example: "All tests passing" → "90% of tests passing"

2. **Ambiguous completion promise**
   - Fix: Use unique, unambiguous string
   - ❌ `<promise>DONE</promise>` (too common)
   - ✅ `<promise>AUTH_MIGRATION_COMPLETE_2026</promise>`

3. **Escape hatch not triggering**
   - Fix: Add iteration count check in prompt
   - "After 20 iterations, if not complete, output <promise>BLOCKED</promise>"

### Problem 2: Airlock Blocks Every Iteration

**Symptoms:**
- Agent keeps failing same validation
- "Max retries reached" messages
- No progress in git log

**Diagnosis:**
```bash
# Check what's failing
npm test 2>&1 | tail -50
npx eslint . 2>&1 | tail -20
npx tsc --noEmit 2>&1 | tail -20
```

**Solutions:**

1. **Flaky tests**
   - Fix: Disable flaky tests temporarily
   - Add to prompt: "Skip flaky tests (marked with .skip)"

2. **Airlock too strict for task**
   - Fix: Adjust airlock config
   ```json
   {
     "gates": [
       { "name": "Tests", "required": false }  // Optional
     ]
   }
   ```

3. **Agent lacks context to fix issue**
   - Fix: Add more detail to prompt about common failures
   - "If tests fail with ECONNREFUSED, ensure dev server running"

### Problem 3: Cost Exceeding Budget

**Symptoms:**
- Cost climbing rapidly
- Using Opus agents unexpectedly
- Many tool calls per iteration

**Diagnosis:**
```bash
# Check agent mix
grep "Agent:" docs/ops/.agent_usage_log.txt | sort | uniq -c

# Check cost per iteration
grep "Iteration.*cost" docs/ops/.agent_usage_log.txt | tail -10
```

**Solutions:**

1. **Wrong agents being used**
   - Fix: Explicit agent selection in prompt
   - "Use Quick Tasks Agent (Haiku) for simple fixes"

2. **Too many context reads**
   - Fix: Tell agent to be selective
   - "Only read files that need changes, not entire codebase"

3. **No progress (wasted iterations)**
   - Fix: Lower max iterations, review approach
   - Better to stop at 20 iterations and reassess than waste 50

### Problem 4: Orchestrator Context Growing

**Symptoms:**
- Orchestrator using >10k tokens
- Slowdown in iteration speed
- Cost per iteration increasing

**Diagnosis:**
```bash
# Check orchestrator context usage
grep "Orchestrator context:" docs/ops/.agent_usage_log.txt | tail -10
```

**Solutions:**

1. **Not using proper delegation**
   - Fix: Ensure all work goes through Task tool
   - Orchestrator should NEVER use Read/Write/Edit directly

2. **State file too large**
   - Fix: Trim state file to last 10 commits only
   ```markdown
   # In .claude/ralph-loop.local.md
   # Keep only recent progress, not full history
   ```

3. **Agents returning too much context**
   - Fix: Agents should return summary, not full diffs
   - "Return: 'Fixed 3 files, tests passing' not full file contents"

---

## Best Practices

### 1. Start Small, Scale Up

❌ **DON'T**: Start with 100 max iterations on unclear task
✅ **DO**: Start with 10 iterations, assess, then increase

```bash
# First attempt
/ralph-loop "Refactor auth" --max-iterations 10

# Review results after 10
# If promising but incomplete, restart with more
/ralph-loop "Refactor auth (continue)" --max-iterations 30
```

### 2. Commit Frequently

❌ **DON'T**: Wait until end to commit
✅ **DO**: Commit after each small win

```markdown
# In prompt:
"After fixing each file, commit with message:
fix(auth): [description]

This creates rollback points."
```

### 3. Use Verification Commands

❌ **DON'T**: Assume code works
✅ **DO**: Verify after each change

```markdown
# In prompt:
"After each change:
1. npm test -- [file].test.ts
2. npx tsc --noEmit
3. Only commit if both pass"
```

### 4. Layer Escape Hatches

❌ **DON'T**: Single max-iterations hard stop
✅ **DO**: Progressive escape hatches

```markdown
# In prompt:
"After 10 iterations: Document progress in PROGRESS.md
After 20 iterations: If stuck, document blockers
After 30 iterations: Output <promise>BLOCKED</promise>"
```

### 5. Monitor Cost in Real-Time

❌ **DON'T**: Discover high cost after completion
✅ **DO**: Check cost every 5-10 iterations

```bash
# Set up cost alerts
{
  "cost_tracking": {
    "warn_at_cost_usd": 25.0,
    "alert_every_n_dollars": 10.0
  }
}
```

### 6. Use Git Tags for Milestones

❌ **DON'T**: Lose track of which iteration achieved what
✅ **DO**: Tag important milestones

```bash
# After major milestone in iteration 15
git tag ralph-loop-phase-1-complete
```

### 7. Review, Don't Just Run

❌ **DON'T**: Start Ralph Loop and walk away without plan
✅ **DO**: Review every 10 iterations, adjust prompt if needed

```bash
# After 10 iterations
/cancel-ralph
# Review git log
git log --oneline -10
# Adjust prompt based on learnings
/ralph-loop "IMPROVED_PROMPT" --max-iterations 20
```

### 8. Document Learnings

❌ **DON'T**: Lose insights from Ralph Loop runs
✅ **DO**: Create retrospective notes

```markdown
# After completion, create:
# .claude/ralph-loop-retrospectives/auth-migration-2026-01-13.md

## Task
Migrate auth to WorkOS AuthKit

## Iterations
32 / 40

## Cost
$28.50

## Learnings
- Tests failed 3x due to missing env vars (add check earlier)
- Coding Agent very efficient for backend (Sonnet worth it)
- Quick Tasks Agent perfect for docs updates (Haiku cheap)

## Prompt Improvements for Next Time
- Add "verify env vars exist" as step 1
- Specify conventional commit format explicitly
```

### 9. Use Meaningful Completion Promises

❌ **DON'T**: Use generic strings
✅ **DO**: Use specific, searchable phrases

```bash
# Bad
--completion-promise "DONE"

# Good
--completion-promise "AUTH_MIGRATION_COMPLETE_2026_01_13"
```

### 10. Combine with Cognee Memory

✅ **ADVANCED**: Let Cognee remember Ralph Loop patterns

```markdown
# In prompt:
"Before starting work, search Cognee for:
- Previous auth migrations
- Common pitfalls in WorkOS integration
- Test patterns that worked before

After completion, store learnings in Cognee:
- What worked well
- What to avoid next time"
```

---

## Summary

**Ralph Loop + Skills-First Architecture = Autonomous, Efficient, Cost-Effective Development**

### Key Takeaways

1. **Orchestrator delegates everything** - Ralph Loop enhances, doesn't replace delegation
2. **Git history is shared memory** - Iterations learn from previous work
3. **Airlock prevents error propagation** - Orchestrator context stays clean
4. **Cost scales with task complexity** - Use right agent for each phase
5. **Clear completion criteria are critical** - Measurable, verifiable, unambiguous
6. **Max iterations is a safety net** - Always set reasonable limit
7. **Escape hatches prevent waste** - Document blockers, fail gracefully

### When Ralph Loop Shines

- ✅ Codebase refactoring with clear rules
- ✅ Test-driven development (fix failing tests)
- ✅ Systematic migrations (auth, database, frameworks)
- ✅ Error elimination (TypeScript strict, ESLint)
- ✅ Tasks with automatic verification

### When to Use Single-Shot Delegation

- ✅ Tasks requiring design decisions
- ✅ One-time operations ("create login page")
- ✅ Exploratory work ("how does auth work?")
- ✅ Tasks needing user input between steps

---

**Ready to start?**

```bash
/ralph-loop "YOUR TASK WITH CLEAR SUCCESS CRITERIA. Output <promise>COMPLETE</promise> when done." --max-iterations 30 --completion-promise "COMPLETE"
```

**Questions? Check:**
- Orchestrator skill: `.claude/skills/orchestrator/SKILL.md`
- Skills config: `.claude/skills-config.json`
- Tool allocation: `.claude/tool-allocation-matrix.json`
- Ralph Loop plugin: `c:\Users\Danie\.claude\plugins\cache\claude-plugins-official\ralph-loop\README.md`

---

*Last Updated: 2026-01-13*
*Version: 1.0.0*
*Author: Claude Code Orchestrator*
