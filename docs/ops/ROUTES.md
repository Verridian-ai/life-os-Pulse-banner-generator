# Route Map

> Canonical route documentation for the Nanobanna Pro application.
> All route changes must be documented here first.
> **Last Audited**: 2025-12-31 by UI Route Detective (T002)

---

## Executive Summary

**Current State**: The application uses **tab-based state management** with NO URL routing.
- All views render at the root URL (`/`)
- Navigation is controlled by React state (`activeTab: Tab`)
- No react-router or similar routing library is installed
- Auth-first flow blocks unauthenticated users with a mandatory modal

**Production URL**: https://life-os-banner.verridian.ai

---

## 1. Current Navigation Architecture

### 1.1 Tab State Management

| Source File | State Variable | Type | Default |
|-------------|----------------|------|---------|
| `src/App.tsx:30` | `activeTab` | `Tab` enum | `Tab.STUDIO` |
| `src/constants.ts:76-80` | `Tab` enum | `'studio' \| 'brainstorm' \| 'gallery'` | N/A |

### 1.2 Tab Enum Definition

```typescript
// src/constants.ts:76-80
export enum Tab {
  STUDIO = 'studio',
  BRAINSTORM = 'brainstorm',
  GALLERY = 'gallery',
}
```

### 1.3 Navigation Trigger Locations

| Component | File | Line | Action |
|-----------|------|------|--------|
| Header - Studio Tab | `src/components/layout/Header.tsx` | 83 | `setActiveTab(Tab.STUDIO)` |
| Header - Gallery Tab | `src/components/layout/Header.tsx` | 90 | `setActiveTab(Tab.GALLERY)` |
| Header - Partner Tab | `src/components/layout/Header.tsx` | 99 | `setActiveTab(Tab.BRAINSTORM)` |

---

## 2. Current Routes (Discovered)

### 2.1 URL-Based Routes

| URL | Behavior | Notes |
|-----|----------|-------|
| `/` | Renders entire SPA | Only URL that exists |
| `/studio` | **404 / Falls back to `/`** | No URL routing implemented |
| `/gallery` | **404 / Falls back to `/`** | No URL routing implemented |
| `/brainstorm` | **404 / Falls back to `/`** | No URL routing implemented |
| `/*` | Falls back to `/` | Vite SPA fallback |

### 2.2 State-Based "Virtual Routes"

These are rendered based on `activeTab` state, NOT URL:

| Virtual Route | Component | State Condition | Access |
|---------------|-----------|-----------------|--------|
| Studio | `CanvasEditor` + `GenerativeSidebar` | `activeTab === Tab.STUDIO` | Authenticated |
| Gallery | `ImageGallery` | `activeTab === Tab.GALLERY` | Authenticated |
| Partner (Brainstorm) | `ChatInterface` | `activeTab === Tab.BRAINSTORM` | Authenticated |

### 2.3 Modal-Based Views (No URL)

| Modal | Trigger | File | Access |
|-------|---------|------|--------|
| Auth Modal | Auto-open for unauthenticated | `App.tsx:357-363` | Public |
| Settings Modal | Settings button click | `App.tsx:417` | Any |
| API Key Instructions | Help button click | `App.tsx:435-438` | Any |

---

## 3. Authentication & Route Guards

### 3.1 Current Implementation

**Auth-First Flow** (App.tsx:357-363):
```typescript
useEffect(() => {
  // Only trigger after auth loading completes
  if (!isLoading && !isAuthenticated) {
    setShowAuthModal(true);
  }
}, [isAuthenticated, isLoading]);
```

**Modal Cannot Close for Unauthenticated Users** (App.tsx:421-427):
```typescript
onClose={() => {
  // Only allow closing if user is authenticated
  if (isAuthenticated) {
    setShowAuthModal(false);
  }
}}
```

### 3.2 Access Control Matrix

| View/Action | Unauthenticated | Authenticated |
|-------------|-----------------|---------------|
| See App UI (blurred behind modal) | Yes | Yes |
| Close Auth Modal | **NO** | Yes |
| Switch Tabs | Technically yes (buttons visible) | Yes |
| Generate Images | No (API requires auth) | Yes |
| Save to Gallery | No | Yes |
| Access Settings | Yes | Yes |

### 3.3 Missing Route Guards

| Issue | Current Behavior | Risk |
|-------|------------------|------|
| No URL-based auth check | Users can see UI behind modal | Low (modal blocks interaction) |
| No deep link protection | Deep links not supported | N/A (no deep links exist) |
| No capability-based guards | All authenticated users see all tabs | Medium (no feature gating) |

---

## 4. External Links Audit

### 4.1 Outbound Links (href attributes)

| Component | URL | Purpose | Target |
|-----------|-----|---------|--------|
| APIKeyInstructionsModal | `https://openrouter.ai` | Get API key | `_blank` |
| APIKeyInstructionsModal | `https://replicate.com` | Get API key | `_blank` |
| APIKeyInstructionsModal | `https://replicate.com/account/api-tokens` | API tokens | `_blank` |
| SettingsModal | `https://openrouter.ai/keys` | Manage keys | `_blank` |
| SettingsModal | `https://platform.openai.com/api-keys` | OpenAI keys | `_blank` |
| SettingsModal | `https://replicate.com/account/api-tokens` | Replicate tokens | `_blank` |
| ChatInterface | Dynamic gallery URLs | View image sources | `_blank` |

### 4.2 No Internal Navigation Links

The application contains **NO internal navigation links** (`<a href="/path">`).
All internal navigation uses state-based tab switching.

---

## 5. Canonical Naming Scheme (Target)

### 5.1 Proposed Pattern

```
/member/{module}/{feature}/{action}
```

### 5.2 Migration Mapping

| Current (State) | Canonical Target | Priority | Breaking Change |
|-----------------|------------------|----------|-----------------|
| `Tab.STUDIO` | `/member/studio/canvas` | P2 | No (additive) |
| `Tab.GALLERY` | `/member/gallery/designs` | P2 | No (additive) |
| `Tab.BRAINSTORM` | `/member/brainstorm/chat` | P2 | No (additive) |
| Settings Modal | `/member/settings/api-keys` | P3 | No (additive) |
| Auth Modal | `/auth/signin`, `/auth/signup` | P1 | No (additive) |

### 5.3 URL Structure Goals

```
/                           # Landing/marketing page (future)
/auth/signin                # Sign in page
/auth/signup                # Sign up page
/auth/reset-password        # Password reset
/member/studio/canvas       # Canvas editor (default after auth)
/member/gallery/designs     # Image gallery
/member/brainstorm/chat     # AI chat partner
/member/settings/api-keys   # API key management
/member/settings/profile    # User profile
```

---

## 6. Identified Inconsistencies

### 6.1 Critical Issues

| Issue ID | Description | Impact | Resolution |
|----------|-------------|--------|------------|
| R001 | No URL routing | Cannot share links to specific views | Implement react-router |
| R002 | No deep linking | Cannot bookmark tabs | Add URL sync with state |
| R003 | No browser history | Back button exits app | Integrate with history API |

### 6.2 Naming Inconsistencies

| Issue ID | Current | Expected | Location |
|----------|---------|----------|----------|
| N001 | "Partner" (UI label) | "Brainstorm" (code) | Header.tsx:103 |
| N002 | `Tab.BRAINSTORM` | Should match UI label | constants.ts:78 |

### 6.3 Missing Features

| Feature | Current State | Target State |
|---------|---------------|--------------|
| URL-based routing | Not implemented | react-router v6+ |
| Deep linking | Not supported | `/member/studio?canvas=abc` |
| OAuth callbacks | Modal-based | `/auth/callback` |
| 404 page | Vite SPA fallback | Custom 404 component |

---

## 7. Migration Plan (NOT APPROVED - REQUIRES TASK)

### Phase 1: Add URL Sync (No Breaking Changes)

**Goal**: Sync tab state with URL without changing existing behavior.

1. Install react-router-dom v6
2. Create route definitions matching current tabs
3. Sync `activeTab` state with URL via `useSearchParams` or path
4. Preserve modal-based auth flow

**Estimated Effort**: 4-6 hours
**Risk**: Low (additive only)

### Phase 2: Implement Canonical Routes

**Goal**: Move to `/member/{module}/{feature}` structure.

1. Create route hierarchy
2. Add redirect rules from `/studio` to `/member/studio/canvas`
3. Update all `setActiveTab` calls to `navigate()`
4. Add route guards with capability checks

**Estimated Effort**: 8-12 hours
**Risk**: Medium (navigation logic changes)

### Phase 3: Auth Routes

**Goal**: Replace modal-based auth with route-based.

1. Create `/auth/signin`, `/auth/signup` routes
2. Add route guards that redirect to `/auth/signin`
3. Handle OAuth callbacks at `/auth/callback`
4. Preserve existing Supabase auth logic

**Estimated Effort**: 6-8 hours
**Risk**: Medium (auth flow changes)

---

## 8. Protected Areas

**DO NOT MODIFY without explicit approval**:

1. **Landing Page Layout** - Visual baseline (when implemented)
2. **Auth Flow Logic** - Security critical (App.tsx:357-363, 421-427)
3. **Supabase Integration** - Data security (AuthContext.tsx)

---

## 9. Visual Verification Evidence

### 9.1 Browser Audit Performed

| Check | Result | Evidence |
|-------|--------|----------|
| URL at root | PASS | `window.location.pathname === '/'` |
| Auth modal blocks unauthenticated | PASS | Screenshot ss_1020t4h2q |
| Modal X button disabled when unauth | PASS | Click test - modal persisted |
| Tab buttons visible in header | PASS | Screenshot ss_5087va33b |
| Settings accessible | PASS | Button visible in UI |

### 9.2 Screenshots Captured

| ID | Description | Viewport |
|----|-------------|----------|
| ss_9610redls | Mobile auth modal | 532x1089 |
| ss_5087va33b | Desktop auth modal | 1384x719 |
| ss_1020t4h2q | Modal close attempt (blocked) | 1384x719 |

---

## 10. Navigation Components Reference

| Component | Purpose | File |
|-----------|---------|------|
| Header | Main navigation tabs | `src/components/layout/Header.tsx` |
| AuthModal | Sign in/up forms | `src/components/auth/AuthModal.tsx` |
| SettingsModal | API key configuration | `src/components/features/SettingsModal.tsx` |
| APIKeyInstructionsModal | Help documentation | `src/components/features/APIKeyInstructionsModal.tsx` |

---

## 11. Recommendations

### Immediate (Before Next Feature)

1. **Document current behavior** - DONE (this file)
2. **Add URL sync for tabs** - Allows sharing and bookmarking
3. **Standardize naming** - "Partner" vs "Brainstorm" inconsistency

### Short-term (Next Sprint)

1. **Implement react-router** - Foundation for proper routing
2. **Add route guards** - Formalize auth requirements
3. **Create 404 page** - Better UX for invalid URLs

### Long-term (Roadmap)

1. **Canonical route structure** - `/member/{module}/{feature}`
2. **Capability-based access** - Feature gating per subscription
3. **Route-based analytics** - Track page views properly

---

*Audit Completed: 2025-12-31*
*Auditor: UI Route Detective Agent (T002)*
*Status: Documentation Complete - Migration Requires Separate Task Approval*
