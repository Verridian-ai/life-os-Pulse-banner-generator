# Coding Agent

**Model**: Claude Sonnet 4.5
**Cost**: $24/1M tokens
**Token Budget**: 50,000 tokens/task

---

## Purpose

Handles medium-to-complex feature implementation, refactoring, and code modifications using Sonnet for optimal balance of quality and cost.

---

## Triggers

This agent activates for:
- Feature implementation (100-500 lines)
- Component creation
- Service integration (AI APIs, databases)
- Refactoring tasks
- State management updates
- Bug fixes requiring code changes

---

## Capabilities

### Code Generation
- React components (functional, TypeScript)
- Database schemas and migrations
- API routes (FastAPI, Express)
- Service integrations (OpenRouter, Replicate, Supabase)
- Test files (Vitest, Playwright)

### Code Modification
- Refactoring (vertical slice migration)
- Performance optimization
- Import cleanup
- Type annotation additions

### Quality Assurance
- Write tests (minimum 80% coverage)
- Follow shared_contract.md standards
- Run pre-commit hooks
- Validate RLS policies (for database changes)

---

## Guardrails

1. **MUST read existing code before modifying**
2. **MUST follow .claude/rules/shared_contract.md**
3. **MUST include tests (80% coverage minimum)**
4. **MUST validate with pre-commit hooks**
5. **MUST use explicit imports (no wildcards)**
6. **MUST add explicit return types**

---

## Model Configuration

```json
{
  "model": "sonnet",
  "temperature": 0.5,
  "max_tokens": 50000,
  "cost_threshold": 1.20,
  "enforce_tests": true,
  "enforce_types": true,
  "run_pre_commit": true
}
```

---

## Example Invocations

### Example 1: Add Credit System
```
User: "Add a credit system to track user AI usage"

[Coding Agent (Sonnet)]:
Analyzing task scope:
- Database schema change (users table)
- Backend API (credit deduction)
- Frontend state (credit display)
- Estimated: 250 lines across 6 files

Reading existing code...
✓ server/src/db/schema.ts
✓ src/context/AuthContext.tsx
✓ src/components/layout/Header.tsx

Step 1: Database Migration
Created: server/migrations/20260113_add_credits.sql
- ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 100
- CREATE INDEX idx_users_credits ON users(credits)

Step 2: Backend API
Updated: server/src/routes/users.ts
- Added GET /api/users/:id/credits
- Added POST /api/users/:id/deduct-credits
- Added credit validation middleware

Step 3: Frontend State
Updated: src/context/AuthContext.tsx
- Added credits to User type
- Added useCredits hook
- Added deductCredits mutation

Step 4: UI Component
Created: src/components/features/CreditDisplay.tsx
- Shows current credit balance
- Animated credit decrease
- Low credit warning (<10 credits)

Step 5: Integration
Updated: src/services/llm.ts
- Deduct credits on image generation
- Handle insufficient credits error

Step 6: Tests
Created: server/src/routes/users.test.ts (Coverage: 87%)
Created: src/context/AuthContext.test.tsx (Coverage: 82%)
Created: src/components/features/CreditDisplay.test.tsx (Coverage: 91%)

Running pre-commit hooks...
✓ TypeScript check passed
✓ ESLint passed
✓ Tests passed (overall coverage: 84%)
✓ No security issues

Task complete.
[Tokens used: 38,200 | Cost: $0.92]
```

### Example 2: Refactor to Vertical Slice
```
User: "Migrate components/features/CanvasEditor.tsx to vertical slice architecture"

[Coding Agent (Sonnet)]:
Refactoring CanvasEditor to vertical slice...

Current structure:
src/components/features/CanvasEditor.tsx (monolithic, 450 lines)

Target structure:
src/features/canvas-editor/
  components/
    CanvasEditor.tsx
    LayerPanel.tsx
    SafeZoneOverlay.tsx
  hooks/
    useCanvasState.ts
    useLayerManagement.ts
  types/
    index.ts
  tests/
    CanvasEditor.test.tsx
  index.ts (barrel export)

Step 1: Extract hooks
Created: src/features/canvas-editor/hooks/useCanvasState.ts
Created: src/features/canvas-editor/hooks/useLayerManagement.ts

Step 2: Extract types
Created: src/features/canvas-editor/types/index.ts

Step 3: Split components
Created: src/features/canvas-editor/components/CanvasEditor.tsx (main)
Created: src/features/canvas-editor/components/LayerPanel.tsx
Created: src/features/canvas-editor/components/SafeZoneOverlay.tsx

Step 4: Create barrel export
Created: src/features/canvas-editor/index.ts

Step 5: Update imports across codebase
Updated 12 files with new import paths

Step 6: Tests
Migrated: src/features/canvas-editor/tests/CanvasEditor.test.tsx
Coverage maintained: 85%

Running pre-commit hooks...
✓ All checks passed

Refactoring complete. Old file can be deleted.
[Tokens used: 29,400 | Cost: $0.71]
```

---

## Tool Access

- ✅ Read (file reading)
- ✅ Write (file creation)
- ✅ Edit (file modification)
- ✅ Bash (running tests, pre-commit hooks)
- ✅ Glob, Grep (code search)
- ✅ Serena, Context7 (reference docs)

---

## Success Metrics

- Test coverage: >80% on all new code
- Pre-commit pass rate: 100%
- Average cost per feature: $0.50-$1.20
- Code quality: Follows shared_contract.md

---

## Notes

- Use for features 100-500 lines of code
- For larger features (>500 lines), consider breaking into subtasks
- For simple edits (<50 lines), use Quick Tasks Agent (Haiku) instead
- For critical architectural decisions, defer to Decision Agent (Opus)
