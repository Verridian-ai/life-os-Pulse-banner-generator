# Refactoring Agent - Quick Start

> Safe, AST-based code refactoring with automatic validation and rollback

---

## 🚀 Quick Examples

### 1. Modernize Component to Hooks
```
User: "Refactor CanvasEditor.tsx to use hooks"

→ Agent creates backup branch
→ Converts class → functional with hooks
→ Runs validation gates (TypeScript, ESLint, Tests, Build)
→ Generates rollback script
✅ Done in ~2 minutes, $0.40-$0.60
```

### 2. Simplify Callback Hell
```
User: "Refactor imageUpload.ts to async/await"

→ Detects nested callbacks (4 levels)
→ Converts to linear async/await
→ Updates error handling (callbacks → try/catch)
→ Updates all call sites (12 locations)
✅ Done in ~1 minute, $0.30-$0.50
```

### 3. TypeScript Strict Mode
```
User: "Enable TypeScript strict mode"

→ Analyzes violations (247 across 42 files)
→ Uses Ralph Loop (16 iterations)
→ Fixes incrementally (atomic commits)
→ Enables strict mode in tsconfig.json
✅ Done in ~25 minutes, $5.00-$15.00
```

### 4. Bulk Rename
```
User: "Rename useAIContext to useAIGenerator everywhere"

→ Finds all references (23 across 8 files)
→ Uses TypeScript Language Service (safe)
→ Renames in dependency order
→ Validates no dangling references
✅ Done in ~30 seconds, $0.20-$0.40
```

### 5. Dead Code Cleanup
```
User: "Remove dead code from features/"

→ Analyzes exports/imports
→ Detects unused functions (3 files, 153 lines)
→ Removes safely with validation
→ Reduces bundle size (-8 KB)
✅ Done in ~1 minute, $0.30-$0.80
```

---

## 🎯 Common Patterns

| Pattern | Before | After | Cost |
|---------|--------|-------|------|
| Class → Hooks | 342 lines class | 310 lines functional | $0.40 |
| Callbacks → Async | 82 lines nested | 45 lines linear | $0.30 |
| Implicit any | 247 violations | 0 violations | $5.00 |
| Relative imports | `../../../utils` | `@/utils` | $0.20 |
| Redux → React Query | 150 lines boilerplate | 30 lines hooks | $1.00 |

---

## 🛡️ Safety Guarantees

✅ **Backup branch** created for every refactoring
✅ **Rollback script** auto-generated
✅ **AST-based** transformations (not regex)
✅ **Behavior preserved** (no functional changes)
✅ **Tests required** to pass (100%)
✅ **Build validated** after refactoring
✅ **TypeScript checked** continuously

---

## 🔄 Ralph Loop (For Large Refactorings)

Automatically activates for >10 files:

```
Example: "Convert all class components to hooks"

→ Ralph Loop: 15 iterations
→ Each iteration:
   1. Refactor 1 component
   2. Run tests
   3. Commit if pass
   4. Skip if fail
→ Result: 15 atomic commits (easy rollback)
```

**Benefits**:
- Atomic commits (one per file)
- Failure isolation
- Progress tracking
- Cost control

---

## 📋 Airlock Validation Gates

Every refactoring passes through:

```
Gate 1: TypeScript Compilation (tsc --noEmit)
   ↓
Gate 2: ESLint (npx eslint .)
   ↓
Gate 3: Tests (npm test)
   ↓
Gate 4: Build (npm run build)
   ↓
✅ All gates passed
```

If any gate fails → Auto-revert → Retry (max 3)

---

## 🔧 How to Use

Just ask naturally:

```
✅ "Refactor [component] to use hooks"
✅ "Convert [file] to async/await"
✅ "Rename [symbol] across codebase"
✅ "Enable TypeScript strict mode"
✅ "Clean up dead code in [directory]"
✅ "Extract [logic] into separate component"
✅ "Update import paths to use @/"
```

Orchestrator automatically:
1. Detects trigger keyword ("refactor", "convert", etc.)
2. Delegates to Refactoring Agent
3. Presents results when done

---

## 💰 Cost Estimates

| Refactoring Type | Cost |
|-----------------|------|
| Single component | $0.40-$0.60 |
| Callback pattern | $0.30-$0.50 |
| Bulk rename | $0.20-$0.40 |
| Strict mode (40 files) | $5.00-$15.00 |
| Dead code removal | $0.30-$0.80 |

---

## 🆘 Rollback

If you need to undo:

```bash
# Use auto-generated script
./.claude/rollback-T042.sh

# Or manual rollback
git checkout refactoring-backup-branch
```

---

## 📚 Full Documentation

- **SKILL.md** - Complete methodology + examples
- **README.md** - Usage guide + troubleshooting
- **PATTERNS.md** - 8 refactoring patterns with before/after
- **refactoring-agent.md** - Agent documentation

---

## 🎉 Ready to Use!

Just ask for a refactoring and the agent handles everything:
- Backup creation
- AST-based transformation
- Validation gates
- Rollback script generation
- Safety guarantees

**Status**: ✅ Production Ready
