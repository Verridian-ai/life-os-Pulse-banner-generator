# Ralph Loop Quick Reference Card

**Version**: 1.0.0 | **Last Updated**: 2026-01-13

---

## Quick Start

```bash
/ralph-loop "TASK. Output <promise>COMPLETE</promise> when done." --max-iterations 30 --completion-promise "COMPLETE"
```

---

## Essential Parameters

| Parameter | Required | Example | Purpose |
|-----------|----------|---------|---------|
| Prompt | ✅ Yes | "Migrate auth to WorkOS..." | Task description with success criteria |
| `--max-iterations` | ✅ Yes | `30` | Safety limit (prevents infinite loops) |
| `--completion-promise` | ✅ Yes | `"COMPLETE"` | Exit signal (unique string) |

---

## Prompt Template (Copy & Modify)

```markdown
Task: [SPECIFIC MEASURABLE TASK]

Step-by-step approach:
1. [Step with verification command]
2. [Step with verification command]
3. [Continue...]

Success criteria (ALL must be true):
- [Criterion 1: Tests passing]
- [Criterion 2: ESLint clean]
- [Criterion 3: Build succeeds]

Verification commands:
- npm test
- npx eslint .
- npm run build

When ALL criteria met:
Output: <promise>COMPLETE</promise>

Escape hatch:
If after [N] iterations not complete:
- Document blockers in BLOCKED.md
- Output: <promise>BLOCKED</promise>
```

---

## Iteration Estimates

| Task Complexity | Max Iterations | Avg Cost/Iter | Total Cost |
|----------------|---------------|---------------|------------|
| Simple fixes | 10-20 | $0.50 | $5-$10 |
| Medium features | 30-50 | $1.00 | $30-$50 |
| Complex migrations | 50-100 | $1.50 | $75-$150 |

---

## Good Use Cases

✅ Codebase-wide refactoring
✅ Fix all failing tests (test-driven)
✅ Systematic migrations (auth, database, frameworks)
✅ Error elimination (TypeScript strict, ESLint)
✅ Import organization across all files

---

## Bad Use Cases

❌ Tasks requiring user design decisions
❌ One-shot operations ("create a login page")
❌ Exploratory work ("how does auth work?")
❌ Production debugging (use Debugging Agent)
❌ Tasks with unclear success criteria

---

## Monitoring Commands

```bash
# Check current iteration and status
cat .claude/ralph-loop.local.md

# View recent git commits (Ralph Loop commits after each iteration)
git log --oneline -20

# Monitor cost in real-time
tail -f docs/ops/.agent_usage_log.txt

# Check orchestrator context (should stay <5k tokens)
grep "Orchestrator context" docs/ops/.agent_usage_log.txt | tail -5
```

---

## Cancel Ralph Loop

```bash
/cancel-ralph
```

All progress preserved in git commits.

---

## Safety Checklist

Before launching, ensure:

- [ ] Max iterations set (10-100 depending on task)
- [ ] Completion promise defined (unique string)
- [ ] Clear, measurable success criteria in prompt
- [ ] Escape hatch logic included ("if blocked after N iterations...")
- [ ] Budget approved (iterations × $0.50-$2.00)
- [ ] Automatic verification available (tests, lints, build)

---

## Example Commands

### Fix TypeScript Strict Errors
```bash
/ralph-loop "Enable TypeScript strict mode and fix all errors.

For each error category:
1. Run: npx tsc --noEmit
2. Fix errors
3. Commit when fewer errors

Success: npx tsc --noEmit shows 0 errors, npm test passes.
Output: <promise>STRICT_COMPLETE</promise>

Escape: After 25 iterations, document blockers." --max-iterations 30 --completion-promise "STRICT_COMPLETE"
```

### Organize All Imports
```bash
/ralph-loop "Organize all imports in src/ per shared_contract.md rules.

Order: React → External → @/ → ./ → Styles

For each file:
1. Reorder imports
2. Remove unused
3. Run ESLint
4. Commit if pass

Success: All files organized, npx eslint . shows 0 errors.
Output: <promise>IMPORTS_DONE</promise>" --max-iterations 35 --completion-promise "IMPORTS_DONE"
```

### Auth Migration
```bash
/ralph-loop "Migrate to WorkOS AuthKit.

Phase 1: Install deps
Phase 2: Backend (server/src/lib/workos.ts)
Phase 3: Frontend (src/context/AuthContext.tsx)
Phase 4: Tests and docs

Success: npm test passes, build succeeds, docs updated.
Output: <promise>AUTH_COMPLETE</promise>

Escape: After 20 iterations, document blockers in MIGRATION.md" --max-iterations 30 --completion-promise "AUTH_COMPLETE"
```

---

## Common Mistakes

### ❌ No max_iterations
```bash
# UNSAFE - can run forever
/ralph-loop "Fix bugs" --completion-promise "DONE"
```

### ✅ Always set max_iterations
```bash
# SAFE - stops after 30 iterations
/ralph-loop "Fix bugs" --max-iterations 30 --completion-promise "DONE"
```

---

### ❌ Ambiguous completion promise
```bash
# BAD - "DONE" might appear in normal output
--completion-promise "DONE"
```

### ✅ Unique completion promise
```bash
# GOOD - unlikely to appear accidentally
--completion-promise "BUG_FIXES_COMPLETE_2026_01_13"
```

---

### ❌ Vague success criteria
```bash
"Fix bugs. Output DONE when code looks good."
```

### ✅ Measurable success criteria
```bash
"Fix bugs. Success: npm test passes, ESLint shows 0 errors. Output <promise>DONE</promise>."
```

---

## Airlock Validation

Runs automatically between iterations:

| Gate | Command | Required | Purpose |
|------|---------|----------|---------|
| TypeScript | `npx tsc --noEmit` | Yes | Type safety |
| ESLint | `npx eslint .` | Yes | Code quality |
| Tests | `npm test` | No | Regression check |
| Build | `npm run build` | Yes | Production readiness |

If any gate fails:
1. Error shown to agent (NOT orchestrator)
2. Agent self-corrects
3. Retries validation (max 3 times)
4. Only passes if all gates succeed

**Result**: Orchestrator context never sees errors.

---

## Cost Tracking

Ralph Loop tracks costs automatically:

```json
{
  "warn_at_cost_usd": 25.0,   // Alert at $25
  "stop_at_cost_usd": 100.0   // Hard stop at $100
}
```

**Check cost during execution**:
```bash
grep "Ralph Loop cost" docs/ops/.agent_usage_log.txt | tail -1
```

---

## Troubleshooting

### Ralph Loop never exits
- **Check**: Completion promise unique and in prompt?
- **Check**: Success criteria realistic?
- **Fix**: Lower max_iterations, review prompt

### Airlock blocks every iteration
- **Check**: Tests flaky? ESLint config too strict?
- **Fix**: Make optional gates non-required, fix root issue

### Cost exceeding budget
- **Check**: Using Opus when Haiku/Sonnet would work?
- **Fix**: Specify agent in prompt, lower max_iterations

### Orchestrator context growing
- **Check**: Delegating properly via Task tool?
- **Fix**: Ensure all work goes through agents, not orchestrator

---

## Documentation

| Resource | Location | Use For |
|----------|----------|---------|
| **This Card** | `.claude/RALPH_LOOP_QUICK_REFERENCE.md` | Quick commands, templates |
| **Full Guide** | `.claude/skills/orchestrator/RALPH_LOOP_GUIDE.md` | Patterns, examples, troubleshooting |
| **Overview** | `CLAUDE.md` (Section 13) | Introduction, quick start |
| **Config** | `.claude/skills-config.json` | Airlock settings, cost limits |

---

## Tips

1. **Start small**: Use 10-20 max_iterations for first attempt, increase if needed
2. **Commit often**: Include "commit after each step" in prompt
3. **Monitor progress**: Check git log every 5-10 iterations
4. **Use escape hatches**: Include "after N iterations, document blockers"
5. **Verify automatically**: Use npm test, ESLint, build in success criteria
6. **Tag milestones**: Use `git tag` for important iterations
7. **Review and adjust**: Cancel after 10 iterations, refine prompt, restart
8. **Document learnings**: Create retrospective notes after completion

---

## State File

**Location**: `.claude/ralph-loop.local.md`

**Contains**:
- Current iteration number
- Max iterations limit
- Completion promise
- Started timestamp
- Current cost
- Status (active/complete/blocked)

**Auto-updated**: Every iteration

---

## Integration with Skills-First

Ralph Loop **enhances** delegation, doesn't replace it:

```
[Iteration 1]
  Orchestrator → Delegates to Coding Agent → Work → Commit
[Iteration 2]
  Orchestrator → Delegates to Debugging Agent → Fix → Commit
[Iteration 3]
  Orchestrator → Delegates to QA Agent → Verify → Output promise
```

Each iteration uses appropriate specialized agent based on task phase.

---

## Success Metrics

Ralph Loop is working correctly when:

- ✅ Orchestrator context stays <5k tokens across all iterations
- ✅ Each iteration commits to git (creating checkpoints)
- ✅ Airlock catches errors before reaching orchestrator
- ✅ Task completes autonomously without user intervention
- ✅ Cost stays within estimated budget
- ✅ Completion promise triggers exit automatically

---

**Ready to start?**

Copy the template above, fill in your task details, and run:

```bash
/ralph-loop "YOUR PROMPT HERE" --max-iterations 30 --completion-promise "UNIQUE_STRING"
```

**Need help?** See full guide: `.claude/skills/orchestrator/RALPH_LOOP_GUIDE.md`

---

*Quick Reference v1.0.0 | 2026-01-13*
