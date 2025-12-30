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
| - | No queued tasks | - | - | - |

---

## Blocked / Needs Approval

| ID | Title | Blocked By | Resolution Needed |
|----|-------|------------|-------------------|
| - | No blocked tasks | - | - |

---

## Completed Tasks

| ID | Title | Completed | PR/Commit | Implementer | Reviewer |
|----|-------|-----------|-----------|-------------|----------|
| T002 | Route audit and canonical alignment | 2025-12-31 | docs/ops/ROUTES.md | UI Route Detective (Sonnet) | Pending Opus Review |
| T003 | Design system extraction | 2025-12-31 | docs/design/LIFE_OS_DESIGN_SYSTEM.md | Depth UI Engineer (Sonnet) | Depth UI Engineer (Opus) |
| T004 | Fix IDOR vulnerabilities in chat routes | 2025-12-31 | Direct commit | Security Warden (Sonnet) | Security Warden (Opus) |
| T005 | Remove API key from request body | 2025-12-31 | Direct commit | Security Warden (Sonnet) | Security Warden (Opus) |
| T006 | Add rate limiting to auth/AI routes | 2025-12-31 | Direct commit | Security Warden (Sonnet) | Security Warden (Opus) |
| T007 | Replace `any` types (AUDIT REPORT) | 2025-12-31 | Audit report | Code Standards Auditor (Sonnet) | Code Standards Auditor (Opus) |
| T008 | Add React.memo and React.lazy | 2025-12-31 | Direct commit | Frontend Architect (Sonnet) | Frontend Architect (Opus) |
| T009 | Add hook tests (0% coverage) | 2025-12-31 | Direct commit | QA Engineer (Sonnet) | QA Engineer (Opus) |
| T010 | Add password strength validation | 2025-12-31 | Direct commit | Security Warden (Sonnet) | Security Warden (Opus) |
| T011 | Fix import violations (wildcards, ordering) | 2025-12-31 | Direct commit | Code Standards Auditor (Sonnet) | Code Standards Auditor (Opus) |
| T012 | Add VoiceAgentContext cleanup hooks | 2025-12-31 | Direct commit | Frontend Architect (Sonnet) | Frontend Architect (Opus) |
| T013 | Split CanvasContext into focused contexts | 2025-12-31 | Direct commit | Frontend Architect (Sonnet) | Frontend Architect (Opus) |
| T014 | Add CSRF protection | 2025-12-31 | Direct commit | Security Warden (Sonnet) | Security Warden (Opus) |
| T015 | Add tests for GenerativeSidebar | 2025-12-31 | Direct commit | QA Engineer (Sonnet) | QA Engineer (Opus) |
| T001 | Fix white screen / restore navigation | 2025-12-31 | Direct commit | White Screen Triage (Sonnet) | Lead Architect (Opus) |

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
- [x] All routes documented in `docs/ops/ROUTES.md`
- [x] Inconsistencies identified (R001-R003, N001-N002)
- [x] Migration plan proposed (not implemented)
- [x] Route guard requirements documented

**Key Findings**:
- Application uses tab-based state management, NOT URL routing
- No react-router installed - all navigation via `setActiveTab(Tab.X)`
- Auth-first flow blocks unauthenticated users (modal cannot close)
- Three "virtual routes": Studio, Gallery, Partner (Brainstorm)
- External links properly use `target="_blank"`
- Naming inconsistency: "Partner" in UI vs "BRAINSTORM" in code

**Deliverables**:
- `docs/ops/ROUTES.md` - Comprehensive 319-line audit document
- Visual verification via Claude-in-Chrome browser tooling
- Screenshots captured: ss_9610redls, ss_5087va33b, ss_1020t4h2q

**Suspected Areas**:
- `src/App.tsx` - Route definitions
- `src/constants.ts` - Tab enum

**Assigned Agents**:
- Implementer: UI Route Detective (Sonnet)
- Reviewer: Frontend Architect (Opus)

**Test Plan**:
- Manual: Visit each route - DONE
- Visual: Browser screenshot verification - DONE
- JavaScript: URL state verification - DONE

**Status**: COMPLETED
**Created**: 2025-12-20
**Completed**: 2025-12-31

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

### T004: Fix IDOR Vulnerabilities in Chat Routes

**Description**: CRITICAL SECURITY - Chat routes allow any authenticated user to read/modify/delete ANY user's conversations. Add ownership verification to all chat endpoints.

**Acceptance Criteria**:
- [ ] GET /conversations/:id verifies user ownership
- [ ] PATCH /conversations/:id verifies user ownership
- [ ] DELETE /conversations/:id verifies user ownership
- [ ] GET /conversations/:id/messages verifies user ownership
- [ ] POST /conversations/:id/messages verifies user ownership
- [ ] Returns 404 for non-owned resources (not 403 to prevent enumeration)
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `server/src/routes/chat.ts` (lines 46-79)

**Assigned Agents**:
- Implementer: Security Warden (Sonnet)
- Reviewer: Security Warden (Opus)

**Test Plan**:
- Unit tests: Verify ownership checks
- Integration: Test cross-user access is blocked
- Manual: Attempt to access other user's conversation

**Status**: In Progress
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T005: Remove API Key Acceptance from Request Body

**Description**: CRITICAL SECURITY - Replicate routes accept API keys from request body, enabling key injection. Remove bodyKey acceptance and use only server-side keys.

**Acceptance Criteria**:
- [ ] Remove `replicateKey: bodyKey` from all replicate routes
- [ ] Use database user keys or environment keys only
- [ ] Update all 7 affected endpoints
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `server/src/routes/replicate.ts` (lines 96, 120, 155, 188, 215, 244, 274)

**Assigned Agents**:
- Implementer: Security Warden (Sonnet)
- Reviewer: Security Warden (Opus)

**Test Plan**:
- Unit tests: Verify body key is ignored
- Integration: Test that user DB keys are used
- Manual: Verify Replicate operations still work

**Status**: In Progress
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T006: Add Rate Limiting to Auth/AI Routes

**Description**: No rate limiting exists - enables brute force attacks on login and API cost abuse. Implement rate limiting middleware.

**Acceptance Criteria**:
- [ ] Rate limit login: 5 attempts per minute
- [ ] Rate limit signup: 3 attempts per minute
- [ ] Rate limit forgot-password: 3 attempts per minute
- [ ] Rate limit AI endpoints: 30 requests per minute
- [ ] Return 429 with retry-after header
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `server/src/index.ts`
- `server/src/routes/auth.ts`
- `server/src/routes/ai.ts`

**Assigned Agents**:
- Implementer: Security Warden (Sonnet)
- Reviewer: Security Warden (Opus)

**Test Plan**:
- Unit tests: Verify rate limit triggers
- Integration: Test limit reset after window
- Manual: Rapid requests trigger 429

**Status**: In Progress
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T007: Replace `any` Types with Proper Interfaces

**Description**: 47+ `any` types found across codebase violating TypeScript strict mode. Replace with proper type definitions.

**Acceptance Criteria**:
- [ ] Create proper interfaces for API request/response bodies
- [ ] Replace all `any` in services (api.ts, auth.ts, llm.ts, database.ts)
- [ ] Replace all `any` in server routes
- [ ] No `any` types remain (except documented exceptions)
- [ ] ESLint no-explicit-any passes
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `src/services/api.ts`
- `src/services/auth.ts`
- `src/services/chatPersistence.ts`
- `src/services/llm.ts`
- `server/src/routes/ai.ts`
- `server/src/routes/user.ts`
- `server/src/routes/replicate.ts`

**Assigned Agents**:
- Implementer: Code Standards Auditor (Sonnet)
- Reviewer: Code Standards Auditor (Opus)

**Test Plan**:
- Static: ESLint no-explicit-any check
- Unit: Existing tests pass with new types
- Build: TypeScript compilation succeeds

**Status**: In Progress
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T008: Add React.memo and React.lazy for Performance

**Description**: No memoization or code splitting in use. Add React.memo to heavy components and React.lazy for tab components/modals.

**Acceptance Criteria**:
- [ ] Add React.memo to BannerCanvas, ImageGallery, GenerativeSidebar
- [ ] Add React.lazy to ChatInterface, ImageGallery (tab components)
- [ ] Add React.lazy to SettingsModal, AuthModal (modals)
- [ ] Add Suspense boundaries with loading fallbacks
- [ ] Fix duplicate useCanvas() call in CanvasEditor.tsx
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `src/App.tsx`
- `src/components/BannerCanvas.tsx`
- `src/components/features/GenerativeSidebar.tsx`
- `src/components/features/ImageGallery.tsx`
- `src/components/features/CanvasEditor.tsx`

**Assigned Agents**:
- Implementer: Frontend Architect (Sonnet)
- Reviewer: Frontend Architect (Opus)

**Test Plan**:
- Unit: Components render correctly with memo
- Integration: Lazy loading works on tab switch
- Manual: Verify bundle is code-split

**Status**: In Progress
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T009: Add Hook Tests (0% Coverage)

**Description**: Hooks have 0% test coverage - critical gap for keyboard shortcuts and prompt enhancement.

**Acceptance Criteria**:
- [ ] Add tests for useKeyboardShortcuts hook
- [ ] Add tests for usePromptEnhance hook
- [ ] Coverage reaches minimum 80% for hooks
- [ ] Tests use @testing-library/react-hooks patterns
- [ ] All tests pass

**Affected Areas**:
- `src/hooks/useKeyboardShortcuts.ts`
- `src/hooks/usePromptEnhance.ts`
- `src/hooks/useKeyboardShortcuts.test.ts` (new)
- `src/hooks/usePromptEnhance.test.ts` (new)

**Assigned Agents**:
- Implementer: QA Engineer (Sonnet)
- Reviewer: QA Engineer (Opus)

**Test Plan**:
- Unit: Test all keyboard shortcut handlers
- Unit: Test prompt enhancement logic
- Coverage: Vitest coverage report

**Status**: Completed
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T010: Add Password Strength Validation

**Description**: Add password strength validation to signup and password reset flows. Enforce minimum requirements for secure passwords.

**Acceptance Criteria**:
- [ ] Minimum 8 characters required
- [ ] At least one uppercase letter
- [ ] At least one lowercase letter
- [ ] At least one number
- [ ] At least one special character
- [ ] Visual strength indicator on frontend
- [ ] Server-side validation
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `server/src/routes/auth.ts`
- `src/components/auth/AuthModal.tsx`

**Assigned Agents**:
- Implementer: Security Warden (Sonnet)
- Reviewer: Security Warden (Opus)

**Test Plan**:
- Unit tests: Password validation function
- Integration: Signup/reset with weak passwords rejected
- Manual: Visual strength indicator works

**Status**: Completed
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T011: Fix Import Violations (Wildcards, Ordering)

**Description**: Fix all wildcard imports and import ordering violations identified in the T007 audit. Follow shared_contract.md Section 3.1-3.2.

**Acceptance Criteria**:
- [ ] No wildcard imports (`import * as`)
- [ ] Import ordering follows 5-group pattern
- [ ] Blank lines between import groups
- [ ] ESLint import rules pass
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- Files identified in T007 audit report
- `src/services/*.ts`
- `src/components/**/*.tsx`

**Assigned Agents**:
- Implementer: Code Standards Auditor (Sonnet)
- Reviewer: Code Standards Auditor (Opus)

**Test Plan**:
- Static: ESLint import rules
- Build: TypeScript compilation
- Manual: Spot-check import ordering

**Status**: Completed
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T012: Add VoiceAgentContext Cleanup Hooks

**Description**: Add proper cleanup hooks to VoiceAgentContext to prevent memory leaks when voice sessions end or component unmounts.

**Acceptance Criteria**:
- [ ] Add cleanup function for WebSocket connections
- [ ] Add cleanup for audio streams
- [ ] Add cleanup for session state
- [ ] useEffect cleanup returns proper functions
- [ ] No memory leaks on repeated voice sessions
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `src/context/VoiceAgentContext.tsx`

**Assigned Agents**:
- Implementer: Frontend Architect (Sonnet)
- Reviewer: Frontend Architect (Opus)

**Test Plan**:
- Unit tests: Cleanup functions called on unmount
- Integration: No memory leaks after voice session
- Manual: DevTools memory profile

**Status**: Completed
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T013: Split CanvasContext into Focused Contexts

**Description**: The CanvasContext has grown too large (god component). Split into focused contexts: CanvasStateContext, CanvasElementsContext, ProfileContext.

**Acceptance Criteria**:
- [ ] CanvasStateContext: bgImage, canvasRef, showSafeZones
- [ ] CanvasElementsContext: elements, selectedElementId, setElements
- [ ] ProfileContext: profilePic, profileTransform
- [ ] All existing functionality preserved
- [ ] No breaking changes to consumers
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `src/context/CanvasContext.tsx`
- All components using useCanvas()

**Assigned Agents**:
- Implementer: Lead Architect (Sonnet)
- Reviewer: Lead Architect (Opus)

**Test Plan**:
- Unit tests: Each new context works independently
- Integration: Canvas editor functions correctly
- Manual: All canvas operations work

**Status**: Completed
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T014: Add CSRF Protection

**Description**: Add CSRF token generation and validation to protect state-changing endpoints from cross-site request forgery attacks.

**Acceptance Criteria**:
- [ ] CSRF token generated on session start
- [ ] Token included in all state-changing requests
- [ ] Server validates token on POST/PATCH/DELETE
- [ ] Token rotation on sensitive operations
- [ ] All tests pass
- [ ] Build succeeds

**Affected Areas**:
- `server/src/lib/csrf.ts` (new)
- `server/src/index.ts`
- `src/services/api.ts`

**Assigned Agents**:
- Implementer: Security Warden (Sonnet)
- Reviewer: Security Warden (Opus)

**Test Plan**:
- Unit tests: Token generation and validation
- Integration: Requests without token rejected
- Manual: CSRF attack simulation

**Status**: Completed
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

### T015: Add Tests for GenerativeSidebar

**Description**: GenerativeSidebar component has 0% test coverage. Add comprehensive tests for all functionality.

**Acceptance Criteria**:
- [ ] Test prompt input handling
- [ ] Test generation trigger
- [ ] Test size selection
- [ ] Test magic prompt button
- [ ] Test edit mode functionality
- [ ] Test suggestion chips
- [ ] Coverage reaches 80%+
- [ ] All tests pass

**Affected Areas**:
- `src/components/features/GenerativeSidebar.tsx`
- `src/components/features/GenerativeSidebar.test.tsx` (new)

**Assigned Agents**:
- Implementer: QA Engineer (Sonnet)
- Reviewer: QA Engineer (Opus)

**Test Plan**:
- Unit tests: All props and handlers
- Integration: Interaction with AIContext
- Coverage: Vitest coverage report

**Status**: Completed
**Created**: 2025-12-31
**Updated**: 2025-12-31

---

*Last Updated: 2025-12-31*
