# Codebase Organization Agent

**Model**: Claude Haiku 4.5
**Cost**: $0.80/1M tokens
**Token Budget**: 15,000 tokens/execution
**Execution**: Scheduled (daily 2 AM) + on-demand (pre-commit)

---

## Purpose

Maintain pristine codebase structure through automated organization, ensuring consistent file placement, import ordering, and code hygiene across the entire project.

---

## Responsibilities

### 1. Import Organization
- **Enforce import order**: React → Third-party → Internal (@/) → Relative (./) → Styles
- **Remove unused imports**: Detect and eliminate imports not referenced in file
- **Consolidate duplicates**: Merge multiple imports from same module
- **Fix wildcard imports**: Convert `import * as X` to explicit imports

**Example**:
```typescript
// BEFORE (violations)
import './styles.css';
import { useState } from 'react';
import * as utils from '@/utils';
import { Button } from './Button';
import axios from 'axios';

// AFTER (organized)
import { useState } from 'react';
import axios from 'axios';
import { formatDate, parseError } from '@/utils';
import { Button } from './Button';
import './styles.css';
```

---

### 2. File Structure Maintenance

**Vertical Slice Compliance**:
```
✅ CORRECT:
src/features/canvas-editor/
  components/
  hooks/
  types/
  tests/
  index.ts

❌ INCORRECT:
src/components/CanvasEditor.tsx
src/hooks/useCanvas.ts
src/types/canvas.ts
```

**Actions**:
- Scan for files in wrong locations (`src/components/`, `src/hooks/`)
- Propose vertical slice migrations
- Create missing `index.ts` barrel files
- Ensure feature co-location

---

### 3. Dead Code Removal

**Detection Patterns**:
- Unused functions/components (no references)
- Unreachable code (after return statements)
- Commented-out code blocks (>10 lines)
- Unused type definitions
- Unused constants/enums

**Example**:
```typescript
// BEFORE
export function oldLogin() { /* ... */ }  // ← Unused, no references
export function newLogin() { /* ... */ }  // ← Used

// After 5 minutes of analysis...
// function processData() {  ← 50 lines commented out
//   ...
// }

// AFTER
export function newLogin() { /* ... */ }
```

---

### 4. Naming Convention Enforcement

**Rules**:
- Components: `PascalCase` (CanvasEditor, Button)
- Functions: `camelCase` (handleClick, formatDate)
- Constants: `UPPER_SNAKE_CASE` (API_URL, MAX_RETRIES)
- Types/Interfaces: `PascalCase` (User, ApiResponse)
- Files: Match export name (CanvasEditor.tsx, useCanvas.ts)

**Violations Detected**:
```typescript
// component_name.tsx ← Wrong file naming
export function component_name() {} ← Wrong component naming

// CORRECTED TO:
// ComponentName.tsx
export function ComponentName() {}
```

---

### 5. Documentation Hygiene

**Requirements**:
- All exported functions have JSDoc
- README.md in each feature folder
- Type definitions have descriptions
- Complex logic has inline comments

**Example**:
```typescript
// BEFORE
export function calculateCredits(usage: number): number {
  return Math.max(0, 100 - usage);
}

// AFTER
/**
 * Calculates remaining credits based on AI usage
 * @param usage - Number of AI API calls made this month
 * @returns Remaining credits (0-100)
 */
export function calculateCredits(usage: number): number {
  return Math.max(0, 100 - usage);
}
```

---

### 6. Vertical Slice Migration Assistant (NEW)

**Purpose**: Automated migration of legacy code to vertical slice architecture

**Capabilities**:
- Detect misplaced files in legacy folders (`src/components/`, `src/hooks/`, `src/utils/`)
- Analyze dependencies and suggest target feature folder
- Generate migration plan with impact analysis
- Execute migrations with automatic import updates across codebase

**Workflow**:
```typescript
// 1. Detection
Found misplaced files:
  - src/components/CreditDisplay.tsx (references: 5 files)
  - src/hooks/useCredits.ts (references: 3 files)

// 2. Analysis
Suggested migration:
  Target: src/features/billing/
  Files to create:
    - components/CreditDisplay.tsx
    - hooks/useCredits.ts
    - index.ts (barrel export)
  Import updates needed: 5 files

// 3. Execution
✓ Created feature structure
✓ Moved files
✓ Updated imports in 5 files
✓ Validated build passes
```

---

### 7. Automated Barrel File Generation (NEW)

**Purpose**: Auto-generate `index.ts` barrel exports for all features

**Rules**:
- Create barrel file if missing from feature folder
- Export all public components, hooks, types
- Exclude test files and internal utilities
- Use named exports only (no default exports)

**Example**:
```typescript
// Generated: src/features/canvas-editor/index.ts
export { CanvasEditor } from './components/CanvasEditor';
export { LayerPanel } from './components/LayerPanel';
export { useCanvasState } from './hooks/useCanvasState';
export type { CanvasLayer, CanvasConfig } from './types';
```

---

### 8. Feature Flag Cleanup (NEW)

**Purpose**: Detect and remove expired feature flags

**Detection**:
- Scan for feature flag usage patterns (`if (flags.newFeature)`)
- Check expiration dates in comments or config
- Identify flags enabled in all environments (always true)

**Actions**:
```typescript
// BEFORE
if (featureFlags.newCheckout) {
  return <NewCheckout />;
} else {
  return <OldCheckout />;
}

// AFTER (if flag expired and enabled)
return <NewCheckout />;

// Cleanup report:
✓ Removed expired flag: newCheckout (enabled since 2025-12-01)
✓ Deleted dead code path: OldCheckout component
```

---

### 9. Stale Branch Detection (NEW)

**Purpose**: Identify and report stale git branches

**Detection Criteria**:
- No commits in 30+ days
- Already merged to main
- Not protected (main, develop, staging)
- No open PRs

**Report Format**:
```bash
Stale branches detected:
  1. feature/old-experiment (merged, 45 days old)
  2. fix/temp-workaround (merged, 60 days old)
  3. task/T001-abandoned (unmerged, 90 days old)

Recommendation: Delete branches 1-2 (safe, already merged)
Warning: Branch 3 has unmerged commits - review before deletion
```

---

### 10. License Header Enforcement (NEW)

**Purpose**: Ensure all source files have consistent license headers

**Configuration**:
```typescript
// .claude/skills/codebase-organization-agent/license-header.txt
/**
 * Copyright (c) 2026 Nanobanna Pro
 * Licensed under MIT
 */
```

**Enforcement**:
- Scan all `.ts`, `.tsx`, `.js`, `.jsx` files
- Add missing headers
- Update outdated copyright years
- Skip third-party/vendor files

---

### 11. TODO/FIXME Tracking (NEW)

**Purpose**: Aggregate and report on code TODOs and FIXMEs

**Scan Patterns**:
```typescript
// TODO: Refactor this to use new API
// FIXME: Memory leak when unmounting
// HACK: Temporary workaround for Safari bug
// XXX: This breaks in production
```

**Report Output**:
```markdown
## TODO/FIXME Report (2026-01-13)

### Critical (FIXME/XXX): 3
1. src/services/llm.ts:45 - FIXME: Memory leak when unmounting
2. src/components/Canvas.tsx:123 - XXX: This breaks in production
3. server/src/routes/auth.ts:67 - FIXME: Race condition possible

### Medium (TODO): 12
1. src/features/billing/hooks/useCredits.ts:23 - TODO: Add error retry logic
...

### Low (HACK): 2
1. src/utils/browser.ts:12 - HACK: Safari-specific workaround
...

Total markers: 17
Oldest: 90 days (src/services/llm.ts:45)
```

---

## Tools Available

| Tool | Purpose | Usage |
|------|---------|-------|
| **Grep** | Find pattern violations across codebase | Search for wildcard imports, commented code |
| **Glob** | Scan file structure | Find misplaced files, missing index.ts |
| **Read** | Analyze file contents | Detect unused imports, dead code |
| **Edit** | Fix violations | Reorder imports, rename files |
| **Serena** | Semantic code analysis | Find unused functions, dependency graphs |
| **ESLint MCP** | Linting enforcement | Validate naming conventions, code style |
| **Cognee** | Pattern and violation tracking | Store organizational patterns, recall previous fixes |

**Forbidden Tools**: `Write`, `Bash` (organization only, no new files or command execution)

**Cognee Integration**:
- Dataset: `nanobanna_global` (read-only)
- Permissions: `search: true, add: false, cognify: false`
- Usage: Recall common violation patterns and successful fix strategies

---

## Execution Modes

### Mode 1: Full Scan (Daily Scheduled)

```bash
# Runs every day at 2 AM
# Scans entire codebase
0 2 * * * claude-skill --skill codebase-organization-agent --mode full-scan

# Output: Daily organization report
# - Import violations fixed: 47
# - Files moved to correct location: 3
# - Dead code removed: 1,234 lines
# - Documentation added: 12 functions
```

**Full Scan Workflow**:
1. Scan all `.ts` and `.tsx` files
2. Detect all violation categories
3. Create fix plan (no execution yet)
4. Present plan to user for approval
5. Execute approved fixes
6. Generate report

---

### Mode 2: Incremental (Pre-Commit)

```bash
# Runs on git pre-commit hook
# Only scans staged files
.git/hooks/pre-commit:
  claude-skill --skill codebase-organization-agent --mode incremental --files $(git diff --cached --name-only)
```

**Incremental Workflow**:
1. Analyze only staged files
2. Fix import order (auto-fix)
3. Validate file location (warn only)
4. Check for dead code in changes
5. Auto-format with Prettier
6. Allow commit if no critical violations

---

### Mode 3: On-Demand (Manual)

```bash
# User-triggered via command
claude-skill --skill codebase-organization-agent --mode on-demand --target src/features/canvas-editor/
```

---

### Mode 4: PR Creation (NEW - Weekly Incremental)

```bash
# Runs weekly to create organization PR
# Performs incremental improvements without breaking changes
0 2 * * 1 claude-skill --skill codebase-organization-agent --mode pr-incremental
```

**PR Creation Workflow**:
1. Create worktree: `org/weekly-cleanup-{date}`
2. Run incremental organization (safe changes only):
   - Import organization
   - Barrel file generation
   - Documentation additions
   - License header updates
3. Run tests to validate no breakage
4. Create PR with detailed summary
5. Tag reviewer

**Safety Guarantees**:
- No file moves (only organizational changes)
- No dead code removal (requires manual review)
- Tests must pass before PR creation
- Automatic rollback if validation fails

---

## Configuration

File: `.claude/skills/codebase-organization-agent/config.json`

```json
{
  "enabled": true,
  "auto_fix": true,
  "require_approval_for": ["file_moves", "dead_code_removal"],
  "import_order": ["react", "external", "@/", "./", "styles"],
  "naming_conventions": {
    "components": "PascalCase",
    "functions": "camelCase",
    "constants": "UPPER_SNAKE_CASE"
  },
  "vertical_slice_enforcement": true,
  "documentation_required": true,
  "scheduled_execution": {
    "enabled": true,
    "cron": "0 2 * * *",
    "mode": "full-scan"
  }
}
```

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Import order compliance | 100% | 94% | 🟡 |
| Vertical slice compliance | 100% | 87% | 🟡 |
| Dead code (lines) | 0 | 234 | 🔴 |
| Documentation coverage | 100% | 76% | 🟡 |
| Naming convention violations | 0 | 3 | 🟢 |

**Updated**: Every execution

---

## Example Execution

```bash
$ claude-skill --skill codebase-organization-agent --mode full-scan

🔍 Codebase Organization Agent - Full Scan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Scanning 847 files...

📦 Import Organization:
  ✓ Fixed import order in 23 files
  ✓ Removed 45 unused imports
  ✓ Converted 7 wildcard imports to explicit

📁 File Structure:
  ⚠️  Found 3 misplaced files:
    - src/components/CreditDisplay.tsx → src/features/billing/components/
    - src/hooks/useCredits.ts → src/features/billing/hooks/
    - src/types/billing.ts → src/features/billing/types/

  Approve moves? (y/n): y
  ✓ Moved 3 files to correct locations
  ✓ Created 1 missing index.ts

🗑️  Dead Code Removal:
  ⚠️  Found 234 lines of dead code:
    - src/services/oldAuth.ts (entire file, no references)
    - src/components/DeprecatedButton.tsx (entire file)
    - 3 commented-out blocks >10 lines

  Approve removal? (y/n): y
  ✓ Removed 234 lines of dead code

📝 Naming Conventions:
  ✓ Renamed component_name.tsx → ComponentName.tsx
  ✓ Fixed 2 function names to camelCase

📚 Documentation:
  ✓ Added JSDoc to 12 exported functions
  ✓ Created README.md in 2 feature folders

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Organization complete!

Summary:
  - Files fixed: 38
  - Lines removed: 234
  - Documentation added: 12 functions
  - Tokens used: 12,400 ($0.01)
  - Time: 2m 34s

Next scan: Tomorrow at 2:00 AM
```

---

## Integration

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running codebase organization checks..."

# Run incremental organization
claude-skill --skill codebase-organization-agent --mode incremental --files $(git diff --cached --name-only) || {
  echo "❌ Organization checks failed. Fix violations before committing."
  exit 1
}

echo "✅ Codebase organization passed"
```

### CI/CD Integration

```yaml
# .github/workflows/codebase-organization.yml
name: Codebase Organization Check
on: [pull_request]
jobs:
  organize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run organization check
        run: |
          claude-skill --skill codebase-organization-agent --mode full-scan --dry-run
      - name: Comment violations on PR
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.name,
              body: '⚠️ Codebase organization violations detected. Run `npm run organize` to fix.'
            })
```

---

## Notes

- **Non-destructive by default**: Requires approval for file moves and deletions
- **Cost-effective**: Uses Haiku for repetitive organizational tasks
- **Incremental mode**: Fast enough for pre-commit hooks (<5 seconds)
- **Customizable**: All rules configurable via `config.json`
- **Audit trail**: Logs all changes to `.claude/logs/organization-agent.log`

---

*Codebase Organization Agent - 2026-01-13*
*Version: 1.0.0*
