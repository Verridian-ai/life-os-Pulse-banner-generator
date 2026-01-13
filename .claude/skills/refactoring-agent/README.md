# Refactoring Agent - Usage Guide

> Production-ready refactoring agent with AST-based transformations, safety guarantees, and rollback capabilities.

---

## Quick Start

### Simple Refactoring

```
User: "Refactor CanvasEditor to use hooks instead of class"

[Orchestrator]: Delegating to refactoring-agent (Sonnet)...
[Refactoring Agent]: Creating backup branch, analyzing component...
[Result]: Component refactored safely, all tests passing
```

### Bulk Refactoring with Ralph Loop

```
User: "Convert all class components in features/ to functional hooks"

[Orchestrator]: Large refactoring detected, using Ralph Loop...
[Ralph Loop]: Processing 15 components over 15 iterations...
[Result]: All components migrated, 15 atomic commits created
```

---

## Common Use Cases

### 1. Class Component → Functional Hooks

```
User: "Refactor src/components/ChatInterface.tsx to use hooks"
```

**What it does**:
- Converts class state to useState
- Converts lifecycle methods to useEffect
- Converts instance methods to useCallback
- Converts refs to useRef
- Preserves all behavior and tests

**Safety**:
- Creates backup branch
- Runs tests after refactoring
- Validates TypeScript compilation
- Generates rollback script

---

### 2. Callback Hell → Async/Await

```
User: "Refactor imageUpload.ts to use async/await"
```

**What it does**:
- Detects nested callback patterns
- Converts to linear async/await
- Replaces callback error handling with try/catch
- Updates all call sites
- Maintains execution order guarantees

**Benefits**:
- Reduces code complexity
- Improves readability
- Easier error handling
- Better stack traces

---

### 3. TypeScript Strict Mode Migration

```
User: "Enable TypeScript strict mode and fix all violations"
```

**What it does**:
- Analyzes violations with tsc --strict
- Uses Ralph Loop for iterative fixing
- Adds explicit type annotations
- Replaces 'any' with proper types
- Adds null checks and type guards
- Enables strict mode in tsconfig.json

**Result**:
- 100% type safety
- Better IDE autocomplete
- Catch more bugs at compile time
- Atomic commits for easy rollback

---

### 4. Bulk Rename Across Codebase

```
User: "Rename useAIContext to useAIGenerator everywhere"
```

**What it does**:
- Finds all references (imports, usages, exports)
- Uses TypeScript Language Service for safe rename
- Updates in dependency order
- Updates documentation references
- Validates no dangling references

**Safety**:
- AST-based (not regex)
- Checks all references
- Validates imports resolve
- Tests all affected code

---

### 5. Dead Code Elimination

```
User: "Find and remove dead code in features/"
```

**What it does**:
- Analyzes exports and imports
- Detects unused functions/variables
- Identifies unreachable code
- Finds unused parameters
- Removes dead code safely

**Result**:
- Reduced bundle size
- Cleaner codebase
- Easier maintenance
- No functional changes

---

### 6. Import Path Migration

```
User: "Convert all relative imports to absolute (@/) paths"
```

**What it does**:
- Finds all relative imports
- Converts to absolute paths using @/ alias
- Validates all imports resolve
- Runs tests to ensure no breakage

**Benefits**:
- Easier refactoring (file moves)
- More readable imports
- Consistent codebase style

---

### 7. Extract Component/Function

```
User: "Extract the image preview logic from CanvasEditor into a separate component"
```

**What it does**:
- Identifies code to extract
- Analyzes dependencies and scope
- Creates new component/function
- Passes required props/parameters
- Updates original component to use extracted code
- Maintains all behavior

---

### 8. Inline Function/Variable

```
User: "Inline the formatImageUrl helper function"
```

**What it does**:
- Finds all usages of function
- Replaces calls with function body
- Removes function definition
- Validates no side effects
- Tests all affected code

---

## Ralph Loop Integration

For large refactorings, the agent automatically uses Ralph Loop:

### Automatic Activation

Ralph Loop activates when:
- Refactoring affects >10 files
- Pattern migration across multiple components
- User explicitly requests iterative refactoring

### Configuration

```yaml
# Automatically configured by Refactoring Agent
task: "Migrate all components to hooks"
max_iterations: 50
commit_after_iteration: true
airlock_validation: true

gates:
  - TypeScript compilation
  - ESLint
  - Tests
  - Build
```

### Benefits

1. **Atomic Commits**: Each iteration = 1 commit
2. **Easy Rollback**: Revert single component if needed
3. **Progress Tracking**: See completion percentage
4. **Failure Isolation**: One failure doesn't block others
5. **Cost Control**: Stop at budget limits

### Example Output

```
[Ralph Loop - Iteration 1/15]
Processing: src/features/canvas/CanvasEditor.tsx
✓ Refactored class → hooks
✓ Tests passed
✓ Committed: "refactor(canvas): Convert CanvasEditor to hooks"

[Ralph Loop - Iteration 2/15]
Processing: src/features/templates/TemplateSelector.tsx
✓ Refactored class → hooks
✓ Tests passed
✓ Committed: "refactor(templates): Convert TemplateSelector to hooks"

...

[Ralph Loop Complete]
Total iterations: 15
Files refactored: 15
Commits created: 15
Total cost: $12.40
```

---

## Airlock Validation Gates

Every refactoring passes through validation gates:

### Gate 1: TypeScript Compilation
```bash
npx tsc --noEmit
```
**Checks**: Type safety, no compilation errors

### Gate 2: ESLint
```bash
npx eslint .
```
**Checks**: Code quality, style violations

### Gate 3: Tests
```bash
npm test
```
**Checks**: All tests pass, behavior preserved

### Gate 4: Build
```bash
npm run build
```
**Checks**: Production build succeeds

### Failure Handling

If any gate fails:
1. **Revert** the specific change
2. **Retry** with alternative approach (max 3 attempts)
3. **Report** to user if unresolvable
4. **Continue** to next refactoring (in Ralph Loop)

---

## Safety Guarantees

### 1. Backup Branch Creation

Before every medium/high-risk refactoring:
```
Created backup branch: refactor/T042-canvas-editor-hooks
Current commit: a3b5c1d
Rollback script: .claude/rollback-T042.sh
```

### 2. Rollback Script Generation

For complex refactorings, auto-generated rollback script:
```bash
#!/bin/bash
# Rollback script for refactoring T042

git reset --hard a3b5c1d
npm test
npm run build
```

### 3. Behavior Preservation

**Guaranteed**:
- No functional changes (pure refactoring)
- Public API preserved
- Test coverage maintained or improved
- No performance regression

**Validated by**:
- Test suite (100% pass required)
- Manual verification checks
- Public API diff analysis

### 4. Incremental Changes

All refactorings are incremental:
- One pattern at a time
- Tests after each change
- Validation at each step
- Rollback if any step fails

---

## Pattern Library

See `PATTERNS.md` for detailed examples of:

1. **Class → Hooks Migration**
   - State conversion
   - Lifecycle methods
   - Instance methods
   - Refs

2. **Callback → Async/Await**
   - Nested callbacks
   - Error handling
   - Execution order

3. **CommonJS → ES Modules**
   - require() → import
   - module.exports → export

4. **Redux → React Query**
   - Actions → mutations
   - Reducers → server state

5. **TypeScript Strict Mode**
   - Type annotations
   - Null checks
   - Type guards

---

## Cost Estimates

| Refactoring Type | Files | Estimated Cost |
|-----------------|-------|----------------|
| Single component class→hooks | 1 | $0.40-$0.60 |
| Callback→async pattern | 1-3 | $0.30-$0.50 |
| Bulk rename | 5-10 | $0.20-$0.40 |
| TypeScript strict mode | 10-50 | $5.00-$15.00 |
| Dead code elimination | 5-20 | $0.30-$0.80 |
| Extract component | 1-2 | $0.25-$0.45 |

**Ralph Loop adds**:
- ~$0.80-$1.00 per iteration
- Progress tracking overhead
- Commit generation

---

## Best Practices

### 1. Start Small
Begin with low-risk refactorings to build confidence:
- Simple renames
- Import organization
- Dead code removal

### 2. Use Ralph Loop for Large Changes
If refactoring >10 files:
- Let Ralph Loop handle iteration
- Get atomic commits automatically
- Easier to review/rollback

### 3. Always Review Changes
Even with AST transformations:
- Review git diff before committing
- Verify behavior manually
- Check for edge cases

### 4. Keep Tests Updated
- Refactor tests alongside code
- Maintain or improve coverage
- Add tests for edge cases discovered

### 5. Document Major Refactorings
For significant pattern migrations:
- Update architecture docs
- Add migration guide for team
- Document rationale in commit

---

## Troubleshooting

### Refactoring Failed at Validation Gate

**Problem**: Tests fail after refactoring

**Solution**:
```
1. Check the specific failing test
2. Agent auto-reverts the change
3. Agent retries with alternative approach
4. If still fails after 3 attempts, agent reports to user
```

### Rollback Needed

**Problem**: Need to undo a completed refactoring

**Solution**:
```bash
# Use auto-generated rollback script
./.claude/rollback-T042.sh

# Or manual rollback
git checkout refactor/T042-backup
```

### Behavior Changed After Refactoring

**Problem**: Code works differently after refactoring

**Solution**:
This should never happen (guarded against), but if it does:
```
1. Run rollback script immediately
2. Report issue to refactoring agent
3. Agent will analyze what went wrong
4. Add regression test for the specific case
5. Retry refactoring with fix
```

---

## Integration with Other Agents

### Refactoring Agent → QA Agent
After major refactorings, QA Agent validates:
- Test coverage maintained
- Performance benchmarks
- Accessibility not regressed

### Research Agent → Refactoring Agent
Research Agent finds code to refactor:
- Identifies outdated patterns
- Finds dead code candidates
- Detects tech debt

### Decision Agent → Refactoring Agent
Decision Agent recommends refactorings:
- Architecture improvements
- Pattern migrations
- Technology upgrades

Then Refactoring Agent executes the plan.

---

## Examples from Real Usage

### Example 1: Migrate Auth System to Hooks

```
User: "Our auth system uses class components. Migrate to hooks."

[Orchestrator]: Delegating to refactoring-agent with Ralph Loop...

[Ralph Loop - Planning]
Found 5 auth-related class components:
1. AuthModal.tsx
2. LoginForm.tsx
3. SignupForm.tsx
4. PasswordReset.tsx
5. ProfileSettings.tsx

Estimated: 5 iterations, ~$4.00 total

[Iteration 1/5]: AuthModal.tsx
✓ Refactored (3 useState, 2 useEffect, 1 useCallback)
✓ Tests passed
✓ Committed

[Iteration 2/5]: LoginForm.tsx
✓ Refactored
✓ Tests passed
✓ Committed

[Iterations 3-5]: ...

[Complete]
Total: 5 components migrated
Commits: 5 atomic commits
Cost: $3.85
All tests passing!
```

---

### Example 2: Clean Up Import Statements

```
User: "Organize all imports according to our style guide"

[Refactoring Agent]:
Scanning codebase for import violations...

Found 67 files with import order issues.
Using Ralph Loop for bulk cleanup...

[Processing 67 files over 67 iterations]
...

[Complete]
Files cleaned: 67
Imports reorganized: 342
Unused imports removed: 89
Cost: $2.20
```

---

## FAQs

**Q: Will refactoring break my code?**
A: No. The agent uses AST transformations and validates every change. If tests fail, changes are auto-reverted.

**Q: Can I review changes before they're committed?**
A: Yes. All changes are shown in git diff format. Use `--review` flag to pause before commit.

**Q: What if I need to rollback?**
A: Every major refactoring creates a backup branch and rollback script. Run `./.claude/rollback-TXXX.sh`.

**Q: How do I refactor just one file vs. the whole codebase?**
A: Specify the scope in your request:
- "Refactor CanvasEditor.tsx to hooks" (single file)
- "Refactor all components to hooks" (codebase-wide)

**Q: Can the agent handle custom refactoring patterns?**
A: Yes! Describe the pattern you want to apply, and the agent will use AST transformations to implement it safely.

---

## Summary

The Refactoring Agent provides:

✅ **Safe transformations** - AST-based, behavior-preserving
✅ **Automatic validation** - Tests, TypeScript, ESLint, Build
✅ **Rollback capability** - Backup branches and scripts
✅ **Ralph Loop integration** - For large-scale refactorings
✅ **Pattern library** - Common migration patterns built-in
✅ **Cost-effective** - $0.20-$1.40 per refactoring

Perfect for:
- Modernizing legacy code
- Enforcing style consistency
- Cleaning up tech debt
- Pattern migrations
- Codebase organization
