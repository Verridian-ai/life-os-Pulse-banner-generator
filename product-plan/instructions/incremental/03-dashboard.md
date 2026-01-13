# Dashboard — Implementation Instructions

The central hub showing platform studios and recent designs.

---

## Overview

Dashboard provides:
- Quick access to 6 platform studios
- Recent designs gallery
- Navigation to other sections

---

## Components to Create

### DashboardPage

Main page component.

```typescript
interface DashboardPageProps {
  onEnterStudio: (platform: PlatformType) => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
}

type PlatformType = 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';
```

**Structure:**
```tsx
<AppShell {...shellProps}>
  <div className="space-y-10">
    {/* Welcome Section */}
    <WelcomeSection userName={user?.first_name} />

    {/* Platform Cards */}
    <section>
      <SectionHeader title="Create for Platform" />
      <PlatformCardsGrid onSelect={handlePlatformClick} />
    </section>

    {/* Recent Designs */}
    <RecentDesigns
      designs={designs}
      onDesignClick={handleDesignClick}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  </div>
</AppShell>
```

---

### WelcomeSection

**Authenticated:**
```tsx
<h1 className="text-2xl md:text-3xl font-bold text-white">
  Welcome back, <span className="bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
    {firstName}
  </span>
</h1>
<p className="text-zinc-400">Create stunning content with AI-powered design tools</p>
```

**Guest:**
```tsx
<h1>Welcome to <span className="gradient-text">Signal</span></h1>
```

**Decorative:**
- Subtle gradient blur in background (sky-500/10 to teal-500/5)

---

### PlatformCard

Individual platform card component.

```typescript
interface PlatformCardProps {
  platform: PlatformType;
  onClick: () => void;
}
```

**Visual Structure:**
```tsx
<button className="group relative aspect-[4/3] rounded-2xl overflow-hidden">
  {/* Full-bleed 3D image */}
  <img
    src={platformImage}
    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
  />

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

  {/* Platform icon badge */}
  <div className="absolute bottom-3 left-3 w-8 h-8 rounded-lg bg-white/10 backdrop-blur">
    <PlatformIcon />
  </div>

  {/* Platform name */}
  <span className="absolute bottom-3 left-14 font-bold text-white">
    {platformName}
  </span>
</button>
```

**Grid Layout:**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
  {platforms.map(p => <PlatformCard key={p} platform={p} onClick={() => onSelect(p)} />)}
</div>
```

---

### RecentDesigns

Gallery of user's recent work.

```typescript
interface RecentDesignsProps {
  designs: Design[];
  onDesignClick: (design: Design) => void;
  onDeleteDesign: (design: Design) => void;
  isLoading: boolean;
}
```

**Structure:**
```tsx
<section>
  <div className="flex items-center justify-between mb-5">
    <SectionHeader title="Recent Designs" />
    {designs.length > 0 && <ViewAllLink />}
  </div>

  {isLoading ? (
    <DesignsSkeleton />
  ) : designs.length > 0 ? (
    <DesignsGrid designs={designs} />
  ) : (
    <EmptyState />
  )}
</section>
```

**Design Card:**
- Thumbnail with aspect-video
- Title (truncated)
- Last updated date
- Actions menu (share, delete)
- Hover: scale + shadow

**Empty State:**
```tsx
<div className="text-center py-16">
  <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
  <h3 className="text-lg font-bold text-white mb-2">No designs yet</h3>
  <p className="text-zinc-400 mb-6">Create your first design to get started</p>
  <Button onClick={onCreateNew}>Create Design</Button>
</div>
```

**Skeleton Loader:**
- 4 placeholder cards with shimmer animation
- Matches design card layout

---

### SectionHeader

Reusable header with accent bar.

```tsx
<div className="flex items-center gap-3 mb-5">
  <div className="w-1 h-6 bg-gradient-to-b from-sky-400 to-teal-400 rounded-full" />
  <h2 className="text-lg font-bold text-white">{title}</h2>
</div>
```

---

## Data Requirements

### Fetching
```typescript
// On mount
const designs = await getUserDesigns(); // Returns Design[]
const user = await getCurrentUser(); // Returns User | null
```

### Caching
- Cache designs in React Query or similar
- Invalidate on create/delete
- Show stale data while revalidating

---

## Responsive Behavior

| Breakpoint | Platform Grid | Design Grid |
|------------|--------------|-------------|
| Mobile | 2 columns | 1 column |
| sm | 3 columns | 2 columns |
| lg | 6 columns | 3-4 columns |

---

## Completion Checklist

- [ ] DashboardPage with layout
- [ ] WelcomeSection with user greeting
- [ ] PlatformCard with hover effects
- [ ] Platform cards grid (6 platforms)
- [ ] RecentDesigns gallery
- [ ] Design card with actions menu
- [ ] Empty state design
- [ ] Loading skeleton
- [ ] Responsive grid layouts
- [ ] Data fetching and caching

---

*Next: Milestone 4 — Platform Studio*
