# Route Map

> Canonical route documentation for the application.
> All route changes must be documented here first.

---

## Current Routes (Discovered)

| Route | Component | Access | Source |
|-------|-----------|--------|--------|
| `/` | Landing Page | Public | `App.tsx` |
| `/studio` | Tab.STUDIO | Authenticated | `App.tsx` (inferred) |
| `/gallery` | Tab.GALLERY | Authenticated | `App.tsx` (inferred) |
| `/brainstorm` | Tab.BRAINSTORM | Authenticated | `App.tsx` (inferred) |

**Note**: Routes are managed via tab state in `App.tsx`. Actual URL routing may differ.

---

## Canonical Naming Scheme (Target)

### Pattern

```
/member/{module}/{feature}/{action}
```

### Examples

| Current | Canonical Target | Notes |
|---------|------------------|-------|
| `/studio` | `/member/studio/canvas` | Main canvas editor |
| `/gallery` | `/member/gallery/designs` | Saved designs |
| `/brainstorm` | `/member/brainstorm/chat` | AI chat interface |
| N/A | `/member/settings/api-keys` | API key management |
| N/A | `/member/settings/preferences` | User preferences |

---

## Route Guard Rules

### Access Levels

| Level | Description | Example Routes |
|-------|-------------|----------------|
| Public | No auth required | `/`, `/login`, `/signup` |
| Member | Base authenticated | `/member/*` |
| Module | Specific capability | Depends on subscription |

### Guard Implementation

```typescript
// Conceptual - not implemented yet
interface RouteGuard {
  requiresAuth: boolean;
  requiredCapabilities?: string[];
  redirectTo?: string;
}

const routeGuards: Record<string, RouteGuard> = {
  '/': { requiresAuth: false },
  '/member/studio': { requiresAuth: true },
  '/member/gallery': { requiresAuth: true },
};
```

---

## Identified Inconsistencies

| Issue | Current State | Target State | Priority |
|-------|---------------|--------------|----------|
| Tab-based routing | State-driven, no URL sync | URL-based with state sync | P2 |
| No /member prefix | Direct paths | Namespaced paths | P3 |
| Missing settings routes | Modal-based | Route-based | P3 |

---

## Migration Plan (NOT APPROVED)

### Phase 1: Document Current State
- [x] List all current routes
- [x] Document access patterns
- [ ] Identify all navigation triggers

### Phase 2: Implement URL Sync (Requires Task)
- [ ] Add react-router or Next.js routing
- [ ] Sync tab state with URL
- [ ] Handle deep links

### Phase 3: Canonical Migration (Requires Task)
- [ ] Add /member namespace
- [ ] Update all navigation calls
- [ ] Implement redirects for old URLs

**Status**: Phase 1 in progress. Phase 2-3 require explicit task approval.

---

## Protected Routes

These routes/areas must NOT be modified without explicit user approval:

1. **Landing Page (`/`)** - Visual baseline
2. **Auth Flow** - Security critical

---

## Navigation Components

| Component | Purpose | File |
|-----------|---------|------|
| Tab Navigation | Main nav bar | `App.tsx` |
| Settings Modal | Settings access | `SettingsModal.tsx` |

---

*Last Updated: 2025-12-20*
*Status: Initial Discovery*
