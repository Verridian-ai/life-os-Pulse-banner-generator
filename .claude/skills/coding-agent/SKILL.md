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

## NEW Capabilities (Phase 4 Enhancements)

### 1. Pre-Implementation Architecture Review

**Automatic Activation**: Before any feature implementation

**Process**:
1. **Load Cognee Context**: Search for similar implementations in codebase
2. **Pattern Analysis**: Identify existing patterns for the requested feature
3. **Vertical Slice Check**: Validate target location follows architecture
4. **Dependency Review**: Check for conflicts or missing dependencies
5. **Generate Plan**: Create implementation plan with estimated LOC

**Example**:
```
User: "Add image upload feature"

[Pre-Implementation Review]:
Searching Cognee for similar features...
✓ Found: src/features/profile/components/AvatarUpload.tsx (similar pattern)
✓ Reusable pattern: useFileUpload hook exists
✓ Target location: src/features/image-upload/ (vertical slice compliant)
✓ Dependencies: Already have @uppy/core installed

Implementation Plan:
1. Reuse useFileUpload hook pattern from profile feature
2. Create new vertical slice at src/features/image-upload/
3. Estimated: 150 LOC across 4 files
4. Test coverage target: 85%

Proceed with implementation? (y/n)
```

---

### 2. Automatic Type Inference and Annotation

**Purpose**: Enforce explicit return types on all public functions

**Process**:
1. Scan all new/modified functions
2. Infer return type from implementation
3. Add explicit annotation if missing
4. Validate with TypeScript compiler

**Example**:
```typescript
// BEFORE (implicit)
export function fetchUserProfile(id: string) {
  return fetch(`/api/users/${id}`).then(r => r.json());
}

// AFTER (explicit, auto-inferred)
export function fetchUserProfile(id: string): Promise<UserProfile> {
  return fetch(`/api/users/${id}`).then(r => r.json());
}
```

**Auto-generated Types**:
- Return types for functions
- Event handler types for React components
- Generic constraints for utility functions

---

### 3. Accessibility (a11y) Requirement Enforcement

**WCAG 2.1 Compliance (Mandatory)**

**Automatic Checks**:
1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Contrast Ratios**: 4.5:1 for text, 3:1 for UI components
3. **Keyboard Navigation**: All interactive elements focusable
4. **Screen Reader**: Proper ARIA labels and roles
5. **Reduced Motion**: Animation fallbacks required

**Example Output**:
```typescript
// GENERATED CODE includes a11y by default
export function SubmitButton({ onClick, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="min-w-[44px] min-h-[44px] p-3" // Touch target enforcement
      aria-label="Submit form" // Screen reader support
    >
      {children}
    </button>
  );
}

// CSS includes reduced motion fallback
const styles = `
  @media (prefers-reduced-motion: reduce) {
    .submit-button {
      animation: none !important;
    }
  }
`;
```

**Validation**: Run Axe accessibility audit before marking complete

---

### 4. Mobile-First Responsive Implementation

**Mandatory Approach**: Start at 320px, enhance with `min-width` media queries

**Auto-Generated Patterns**:
```css
/* Generated styles are ALWAYS mobile-first */
.component {
  padding: 1rem; /* Mobile default */
  font-size: clamp(1rem, 0.875rem + 0.625vw, 1.25rem); /* Fluid typography */
}

@media (min-width: 768px) {
  .component { padding: 2rem; } /* Tablet enhancement */
}

@media (min-width: 1024px) {
  .component { padding: 3rem; } /* Desktop enhancement */
}
```

**Container Queries (Preferred)**:
```css
.card-container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { flex-direction: row; }
}
```

---

### 5. Component Documentation Generation

**Auto-Generated JSDoc**:
```typescript
/**
 * Credit display component showing user's remaining AI credits
 *
 * @example
 * ```tsx
 * <CreditDisplay credits={user.credits} onRefresh={handleRefresh} />
 * ```
 *
 * @component
 * @category Billing
 * @accessibility
 * - Screen reader announces credit count
 * - Low credit warning has ARIA alert role
 *
 * @performance
 * - Uses React.memo for render optimization
 * - Animations use GPU-accelerated properties
 */
export const CreditDisplay = React.memo<CreditDisplayProps>(({ credits, onRefresh }) => {
  // Implementation
});
```

**Documentation Includes**:
- Component purpose and usage
- Example code
- Accessibility notes
- Performance considerations
- Related components/hooks

---

## Guardrails

1. **MUST read existing code before modifying**
2. **MUST follow .claude/rules/shared_contract.md**
3. **MUST include tests (80% coverage minimum)**
4. **MUST validate with pre-commit hooks**
5. **MUST use explicit imports (no wildcards)**
6. **MUST add explicit return types**

---

## Pre-Task Hooks (NEW)

**Execute BEFORE implementation starts**:

1. **Load Cognee Context**:
   ```
   Search dataset: agent_coding
   Query: "Similar implementations for {feature_name}"
   Purpose: Find reusable patterns and avoid reinventing
   ```

2. **Check Existing Patterns**:
   ```
   - Search for similar components/hooks/services
   - Identify reusable utilities
   - Validate naming consistency
   ```

3. **Verify Vertical Slice Location**:
   ```
   - Confirm target directory follows src/features/{name}/ structure
   - Ensure no legacy folder usage (src/components/, src/hooks/)
   - Create feature directory if missing
   ```

**Output**:
```
[Pre-Task Hooks Complete]
✓ Cognee context loaded (3 similar patterns found)
✓ Reusable pattern identified: useAsync hook
✓ Vertical slice validated: src/features/image-upload/
✓ Ready to implement
```

---

## Post-Task Hooks (NEW)

**Execute AFTER implementation completes**:

1. **Run Airlock Validation**:
   ```bash
   # Validation gates (must pass)
   - TypeScript: npx tsc --noEmit
   - ESLint: npx eslint --fix .
   - Tests: npm run test
   - Build: npm run build
   ```

2. **Store New Patterns in Cognee**:
   ```
   Dataset: agent_coding
   Store:
     - New component patterns
     - Hook implementations
     - Service integrations
     - Accessibility patterns used
     - Performance optimizations applied
   ```

3. **Generate Conventional Commit Message**:
   ```
   Format: <type>(<scope>): <description>

   Example:
   feat(image-upload): Add drag-and-drop image upload component

   - Implement useFileUpload hook with progress tracking
   - Add ImageUploadZone component with a11y support
   - Include 85% test coverage
   - Mobile-first responsive design (320px+)

   Refs: T042
   ```

**Output**:
```
[Post-Task Hooks Complete]
✓ Airlock validation passed (all gates green)
✓ Pattern stored in Cognee (4 new entries)
✓ Commit message generated:

  feat(image-upload): Add drag-and-drop image upload component

  - Implement useFileUpload hook with progress tracking
  - Add ImageUploadZone component with a11y support
  - Include 85% test coverage
  - Mobile-first responsive design (320px+)

  Refs: T042

Ready to commit? (y/n)
```

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
- ✅ Cognee (pattern storage and retrieval)

**Cognee Integration**:
- Dataset: `agent_coding`
- Permissions: `search: true, add: true, cognify: true`
- Usage:
  - **Pre-task**: Search for similar implementations
  - **During**: Access reusable patterns
  - **Post-task**: Store new patterns for future reference

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
