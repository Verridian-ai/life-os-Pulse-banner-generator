# Work Board

> Central task tracking for all development work.
> This is an append-only board - do not delete completed tasks.

---

## Active Tasks

| ID | Title | Owner Agent | Impl Worktree | Review Worktree | Branch | Status | Started | Updated |
|----|-------|-------------|---------------|-----------------|--------|--------|---------|---------|
| - | No active tasks | - | - | - | - | - | - | - |

---

## Queue (Next Up)

| ID | Title | Priority | Dependencies | Assigned Agents |
|----|-------|----------|--------------|-----------------|
| T001 | Fix white screen / restore baseline navigation | P0 | None | Frontend Architect + QA |
| T002 | Route audit and canonical alignment | P1 | T001 | UI Route Detective |
| T003 | Design system extraction and token alignment | P1 | T001 | Depth UI Engineer |

---

## Blocked / Needs Approval

| ID | Title | Blocked By | Resolution Needed |
|----|-------|------------|-------------------|
| - | No blocked tasks | - | - |

---

## Completed Tasks

| ID | Title | Completed | PR/Commit | Implementer | Reviewer |
|----|-------|-----------|-----------|-------------|----------|
| - | No completed tasks yet | - | - | - | - |

---

## Task Templates

### New Task Template

```markdown
### T{ID}: {Title}

**Description**: {What needs to be done}

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `src/path/to/file.tsx`
- `src/path/to/related.ts`

**Assigned Agents**:
- Implementer: {Agent Name} (Sonnet)
- Reviewer: {Agent Name} (Opus)

**Test Plan**:
- Unit tests for: {components}
- Integration tests for: {flows}
- Manual verification: {steps}

**Status**: Pending | In Progress | Review | Done
**Created**: YYYY-MM-DD
**Updated**: YYYY-MM-DD
```

---

## Task Details

### T001: Fix White Screen / Restore Baseline Navigation

**Description**: Investigate and fix the "white screen" issue reported. Restore baseline navigation so users can access all tabs.

**Acceptance Criteria**:
- [ ] App loads without white screen
- [ ] All tabs accessible (Studio, Gallery, Brainstorm)
- [ ] Navigation works as expected
- [ ] No console errors on load
- [ ] Tests pass

**Suspected Areas**:
- `src/App.tsx` - Main component, context providers
- `src/context/*.tsx` - Context initialization
- `src/components/features/*.tsx` - Tab components

**Assigned Agents**:
- Implementer: Frontend Architect (Sonnet)
- Reviewer: Frontend Architect (Opus)

**Test Plan**:
- Manual: Load app, verify no white screen
- Manual: Navigate to each tab
- Unit: Context initialization tests
- Integration: Tab switching tests

**Status**: Queued
**Created**: 2025-12-20

---

### T002: Route Audit and Canonical Alignment

**Description**: Audit all current routes, document inconsistencies, propose canonical naming alignment. NO refactoring until approved.

**Acceptance Criteria**:
- [ ] All routes documented in `docs/ops/ROUTES.md`
- [ ] Inconsistencies identified
- [ ] Migration plan proposed (not implemented)
- [ ] Route guard requirements documented

**Suspected Areas**:
- `src/App.tsx` - Route definitions
- `src/constants.ts` - Tab enum

**Assigned Agents**:
- Implementer: UI Route Detective (Sonnet)
- Reviewer: Frontend Architect (Opus)

**Test Plan**:
- Manual: Visit each route
- Automated: Route existence tests

**Status**: Queued (Depends on T001)
**Created**: 2025-12-20

---

### T003: Design System Extraction and Token Alignment

**Description**: Extract design tokens from existing UI (Pulse page, landing page), document in design system doc. NO landing page modifications.

**Acceptance Criteria**:
- [ ] Color tokens extracted
- [ ] Elevation/shadow tokens defined
- [ ] Blur budget documented
- [ ] Accessibility overrides included
- [ ] Component inventory created

**Suspected Areas**:
- `src/styles.ts` - Style constants
- `src/index.css` - Global styles
- Existing component styles

**Assigned Agents**:
- Implementer: Depth UI Engineer (Sonnet)
- Reviewer: Accessibility Officer (Opus)

**Test Plan**:
- Manual: Visual verification against baselines
- Automated: Accessibility audit

**Status**: Queued (Depends on T001)
**Created**: 2025-12-20

---

*Last Updated: 2025-12-20*
