# Shared Contract: Non-Negotiable Standards

> This document is the single source of truth for all engineering standards in this repository.
> All agents MUST read this file before performing any work.
> If existing code conflicts with these standards, refactor toward the contract.

---

## 1. HARD CONTRACT (INVIOLABLE CONSTRAINTS)

### 1.1 Orchestrator Restrictions
- The PRIMARY ORCHESTRATOR **DOES NOT** write production code
- Orchestrator role: plan, delegate, review, merge (on approval only)
- All implementation happens via delegated subagents in worktrees

### 1.2 Worktree-Based Workflow
- Implementation happens **ONLY** in git worktrees under `.worktrees/`
- Every task uses **TWO** subagents:
  - **Lead Programmer**: Claude Sonnet (implementation)
  - **Reviewer**: Claude Opus (review + signoff)
- Research-only tasks may use Claude Haiku

### 1.3 Merge Requirements
No commits are merged/pushed without:
1. Reviewer sign-off with explicit "SIGN-OFF" section
2. Clean rebase on current mainline
3. Tests passing
4. Conflict check complete
5. User approval to merge

---

## 2. REPOSITORY STRUCTURE RULES

### 2.1 Feature Co-Location (Vertical Slice Architecture)
> Source: Meta React File Structure[^1], Combined_Documentation.md Section 3.2

All feature logic, UI, hooks, styles, tests, and types MUST live together:

```
src/features/
  NewsFeed/
    components/         # React components
    hooks/              # Custom hooks (useFeedData.ts)
    styles/             # Scoped styles
    tests/              # Jest/Vitest tests
    types/              # TypeScript definitions
    index.ts            # Public exports (barrel file)
```

**Anti-Pattern (FORBIDDEN):**
```
src/
  components/      # Global dumping ground
  hooks/           # Another dumping ground
  styles/          # CSS chaos
```

### 2.2 Current Structure Exceptions
For this codebase (nanobanna-pro), the existing structure is:
- `src/components/` - Legacy, to be migrated to feature folders
- `src/services/` - Backend services (acceptable as shared layer)
- `src/context/` - React contexts (acceptable as shared layer)
- `src/types/` - Shared type definitions (acceptable)

New features MUST use vertical slice organization.

---

## 3. FILE-LEVEL STANDARDS

### 3.1 Import Ordering (Mandatory)
> Source: LinkedIn/Google Style Guide[^2], Combined_Documentation.md Section 4.2.1

Imports MUST follow this exact order with blank lines between groups:

```typescript
// 1. React and core framework
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries (npm packages)
import { motion } from 'framer-motion';
import { z } from 'zod';

// 3. Internal modules (absolute imports with @/)
import { useAuth } from '@/context/AuthContext';
import { generateImage } from '@/services/llm';

// 4. Relative imports (local to feature)
import { FeedCard } from './components/FeedCard';
import type { FeedItem } from './types';

// 5. Styles and assets (last)
import './styles.css';
```

### 3.2 No Wildcard Imports (Enforced)
> Source: Effective Scala[^3], Combined_Documentation.md Section 5.1

```typescript
// FORBIDDEN
import * as utils from '@/utils';
import { everything } from './helpers/*';

// REQUIRED
import { formatDate, parseError } from '@/utils/formatters';
```

### 3.3 Named Exports Only
> Source: Meta React Standards[^4]

```typescript
// FORBIDDEN
export default function MyComponent() {}

// REQUIRED
export function MyComponent() {}
export const MyComponent = () => {};
```

Exception: Page components for Next.js/file-based routing may use default exports.

### 3.4 Explicit Return Types
> Source: X/Twitter Effective Scala[^3]

Public functions MUST have explicit return type annotations:

```typescript
// FORBIDDEN
export function fetchUser(id: string) {
  return fetch(`/api/users/${id}`);
}

// REQUIRED
export function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`);
}
```

---

## 4. TYPESCRIPT STANDARDS

### 4.1 Strict Mode (Non-Negotiable)
- `strict: true` in tsconfig.json
- No `any` types except in truly dynamic scenarios (documented)
- No `@ts-ignore` or `@ts-nocheck` without JIRA/issue reference

### 4.2 Interface vs Type
- Use `interface` for object shapes that may be extended
- Use `type` for unions, intersections, and utility types
- Use `type` for component props (convention for this repo)

### 4.3 Prop Types
```typescript
// Component props MUST be typed
type FeedCardProps = {
  item: FeedItem;
  onSelect: (id: string) => void;
  isLoading?: boolean;
};

export function FeedCard({ item, onSelect, isLoading = false }: FeedCardProps) {
  // ...
}
```

---

## 5. UI STANDARDS: NEUMORPHISM + GLASSMORPHISM

### 5.1 Depth Design System
> Source: Production-Grade UI Design Techniques Research[^5]

This codebase uses production-grade depth effects. All implementations MUST:

1. **Use CSS Variables for Depth Tokens:**
```css
:root {
  --neu-depth-sm: 3px;
  --neu-blur-sm: 6px;
  --neu-depth-md: 6px;
  --neu-blur-md: 12px;
  --neu-shadow-dark: rgba(0, 0, 0, 0.15);
  --neu-shadow-light: rgba(255, 255, 255, 0.7);
}
```

2. **Blur Budget Enforcement:**
   - Mobile: max blur radius 20px
   - Desktop: max blur radius 40px
   - Never animate `box-shadow` or `backdrop-filter`

3. **GPU Optimization:**
   - Use `transform: translateZ(0)` for glass elements
   - Use `will-change: transform` sparingly
   - Never use `will-change: box-shadow`

### 5.2 Accessibility Overrides (MANDATORY)
> Source: WCAG 2.1 Non-text Contrast[^6], Combined_Documentation.md Section 4.3

Neumorphic designs MUST include high-contrast fallbacks:

```css
/* Normal neumorphic styles */
.neu-card {
  box-shadow:
    var(--neu-depth-md) var(--neu-depth-md) var(--neu-blur-md) var(--neu-shadow-dark),
    calc(var(--neu-depth-md) * -1) calc(var(--neu-depth-md) * -1) var(--neu-blur-md) var(--neu-shadow-light);
}

/* MANDATORY: High contrast override */
@media (prefers-contrast: more) {
  .neu-card {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    border: 2px solid black;
    background: white;
  }
}

/* MANDATORY: Windows High Contrast Mode */
@media (forced-colors: active) {
  .neu-card {
    border: 2px solid ButtonText;
    background: Canvas;
    box-shadow: none;
  }
}
```

### 5.3 Hybrid Approach (Required)
Never rely on shadow-only affordances:
- Always include a subtle border (0.5-1px)
- Interactive elements MUST have visible state changes beyond shadow
- Use icon + text labels, not just icons

### 5.4 Glassmorphism Stack
Production glass components require four layers:
1. **Fill**: `rgba(255, 255, 255, 0.1)`
2. **Blur**: `backdrop-filter: blur(20px) saturate(180%)`
3. **Noise**: Subtle grain overlay (3-5% opacity)
4. **Border**: `border: 1px solid rgba(255, 255, 255, 0.2)`

---

## 6. TESTING RULES

### 6.1 Test Co-Location
Tests MUST live next to the code they test:
```
components/
  FeedCard.tsx
  FeedCard.test.tsx    # Co-located
```

### 6.2 Minimum Coverage
- New features: 80% coverage minimum
- Bug fixes: Must include regression test
- Utilities/Services: 90% coverage minimum

### 6.3 Test Naming
```typescript
describe('FeedCard', () => {
  it('renders the item title', () => {});
  it('calls onSelect when clicked', () => {});
  it('shows loading skeleton when isLoading is true', () => {});
});
```

---

## 7. SECURITY RULES

### 7.1 API Key Handling
- Never log full API keys (use `!!key` for presence check)
- Never commit API keys to version control
- Store in Supabase per-user (encrypted) or environment variables

### 7.2 Row Level Security (RLS)
- All Supabase tables MUST have RLS enabled
- Use `auth.uid()` policies for user data access
- Document RLS policies in schema comments

### 7.3 Input Sanitization
- Sanitize user input before sending to AI APIs
- Use Zod schemas for runtime validation
- Never trust client-side data on the server

---

## 8. ROUTING RULES (Life OS Family)

### 8.1 Member as Base Account
- "Member" is the base account type
- Modules/roles add capabilities on top
- Route guards check capabilities, not roles

### 8.2 Canonical Route Naming
See `docs/ops/ROUTES.md` for the full route map.

Pattern: `/member/{module}/{feature}/{action}`
Example: `/member/dashboard/pulse/sync`

### 8.3 Protected Routes
Do NOT touch the public landing page without explicit approval.

---

## 9. LANDING PAGE PROTECTION

The landing page (`/`) and its styling are PROTECTED:
- No changes without explicit user approval
- Visual baseline: Current landing page + Pulse page
- Any modifications require a dedicated task with approval

---

## 10. GIT WORKFLOW

### 10.1 Branch Naming
```
task/{TASK-ID}-{short-description}
feature/{TASK-ID}-{feature-name}
fix/{TASK-ID}-{bug-description}
```

### 10.2 Commit Messages
```
feat: Add image generation progress indicator

- Add progress bar component
- Integrate with Replicate polling
- Update AIContext with progress state

Refs: T001
```

### 10.3 Worktree Workflow
```bash
# Create implementation worktree
git worktree add .worktrees/T001-impl task/T001-impl

# Create review worktree
git worktree add .worktrees/T001-rev task/T001-rev

# After approval, merge
git checkout main
git merge task/T001-impl --no-ff
```

---

## References

[^1]: Meta React File Structure - https://legacy.reactjs.org/docs/faq-structure.html
[^2]: Google Java Style Guide - https://google.github.io/styleguide/javaguide.html
[^3]: Twitter Effective Scala - https://twitter.github.io/effectivescala/
[^4]: Meta React Component Standards - https://react.dev/reference/react
[^5]: CSS Neumorphism Performance - https://neumorphism.io/
[^6]: WCAG 2.1 Non-text Contrast - https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
[^7]: MDN forced-colors - https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors

---

*Last Updated: 2025-12-20*
*Contract Version: 1.0.0*
