# Dashboard — Test Instructions

Framework-agnostic test specifications for the dashboard.

---

## Unit Tests

### DashboardPage

**Rendering:**
- Renders welcome section
- Renders 6 platform cards
- Renders recent designs section
- Shows loading skeleton while fetching

**Authentication:**
- Guest: Shows "Welcome to Signal"
- Authenticated: Shows "Welcome back, {firstName}"
- Guest click platform: Opens auth modal
- Authenticated click platform: Opens studio

### PlatformCard

**Display:**
- Shows platform image
- Shows platform icon badge
- Shows platform name
- Has hover scale animation

**Interaction:**
- Click calls onClick handler
- Keyboard enter triggers click
- Focus ring visible on focus

### RecentDesigns

**States:**
- Loading: Shows skeleton cards
- Empty: Shows empty state message
- With data: Shows design cards

**Design Card:**
- Shows thumbnail
- Shows title (truncated if long)
- Shows last updated date
- Has actions menu

**Actions:**
- Delete: Calls onDelete with design
- Share: Opens share dialog (if implemented)

---

## Integration Tests

### Platform Navigation

**Guest Flow:**
1. View dashboard as guest
2. Click platform card
3. Verify auth modal opens
4. Sign in
5. Verify studio opens

**Authenticated Flow:**
1. Sign in
2. Click LinkedIn card
3. Verify navigates to `/studio/linkedin`
4. Verify studio header shows "LinkedIn Studio"

### Recent Designs

**Load Designs:**
1. Sign in
2. View dashboard
3. Verify designs load
4. Verify max 8 shown

**Delete Design:**
1. View dashboard with designs
2. Click delete on a design
3. Confirm deletion
4. Verify design removed from list
5. Verify toast notification shown

**Open Design:**
1. View dashboard with designs
2. Click on a design card
3. Verify studio opens with design

---

## Accessibility Tests

**Keyboard Navigation:**
- Tab navigates through platform cards
- Tab navigates through design cards
- Enter opens studio/design
- Actions menu accessible via keyboard

**Screen Reader:**
- Platform cards have labels
- Design cards announce title and date
- Loading state announced
- Empty state announced

**Focus Management:**
- Focus visible on all interactive elements
- Focus order logical (left-to-right, top-to-bottom)

---

## Edge Cases

**No Designs:**
- Show empty state
- CTA button works

**Many Designs:**
- Only show 8 most recent
- "View All" link shown

**Failed to Load:**
- Show error message
- Retry button works

**Platform Images Missing:**
- Fallback to icon-only card
- No broken images shown

---

## Responsive Tests

**Mobile (< 640px):**
- Platform grid: 2 columns
- Design grid: 1 column
- Bottom navigation visible

**Tablet (640px - 1024px):**
- Platform grid: 3 columns
- Design grid: 2 columns

**Desktop (> 1024px):**
- Platform grid: 6 columns
- Design grid: 3-4 columns
- Sidebar visible
