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

## Tools Available

| Tool | Purpose | Usage |
|------|---------|-------|
| **Grep** | Find pattern violations across codebase | Search for wildcard imports, commented code |
| **Glob** | Scan file structure | Find misplaced files, missing index.ts |
| **Read** | Analyze file contents | Detect unused imports, dead code |
| **Edit** | Fix violations | Reorder imports, rename files |
| **Serena** | Semantic code analysis | Find unused functions, dependency graphs |
| **ESLint MCP** | Linting enforcement | Validate naming conventions, code style |

**Forbidden Tools**: `Write`, `Bash` (organization only, no new files or command execution)

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
