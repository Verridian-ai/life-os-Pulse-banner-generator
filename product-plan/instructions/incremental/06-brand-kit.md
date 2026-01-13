# Brand Kit — Implementation Instructions

Brand profile management for consistent design output.

---

## Overview

Brand Kit provides:
- Multiple brand profile management
- Active brand selection for AI
- Color and font customization
- Brand extraction from images

---

## Components to Create

### BrandKitPage

Main page component.

```typescript
interface BrandKitPageProps {
  onCreateBrand: () => void;
}
```

**Structure:**
```tsx
<AppShell activeItemId="brand">
  <BrandKitPanel onCreateBrand={onCreateBrand} />
</AppShell>
```

---

### BrandKitPanel

Full brand management experience.

```typescript
interface BrandKitPanelProps {
  onCreateBrand: () => void;
}
```

**Structure:**
```tsx
<div className="space-y-6">
  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
          <Palette className="w-5 h-5 text-sky-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Brand Kit</h1>
      </div>
      <p className="text-zinc-400 text-sm">Manage your brand colors, fonts, and visual identity</p>
    </div>
    <NewBrandButton onClick={onCreateBrand} />
  </div>

  {/* Loading State */}
  {isLoading && <BrandCardsSkeleton />}

  {/* Brand Profiles Grid */}
  {!isLoading && brands.length > 0 && (
    <BrandProfilesGrid
      brands={brands}
      activeBrandId={activeBrandId}
      onSetActive={handleSetActive}
      onDelete={handleDelete}
    />
  )}

  {/* Empty State */}
  {!isLoading && brands.length === 0 && (
    <EmptyState onCreateBrand={onCreateBrand} />
  )}

  {/* Pro Tip Card */}
  {brands.length > 0 && <ProTipCard />}
</div>
```

---

### NewBrandButton

Primary CTA button.

```tsx
<button
  onClick={onClick}
  className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-bold text-sm hover:brightness-110 hover:shadow-lg hover:shadow-sky-900/30 transition-all"
>
  <Plus className="w-4 h-4" />
  New Brand
  <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
</button>
```

---

### BrandCard

Individual brand profile display.

```typescript
interface BrandCardProps {
  brand: BrandProfile;
  isActive: boolean;
  onSetActive: () => void;
  onDelete: () => void;
}
```

```tsx
<div
  className={`group relative bg-zinc-900/80 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 ${
    isActive
      ? 'border-sky-500/50 ring-2 ring-sky-500/20 shadow-lg shadow-sky-900/10'
      : 'border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/20'
  }`}
>
  {/* Active Badge */}
  {isActive && (
    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 rounded-full">
      <Check className="w-3.5 h-3.5 text-sky-400" />
      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide">Active</span>
    </div>
  )}

  {/* Menu (when not active) */}
  {!isActive && <BrandCardMenu onSetActive={onSetActive} onDelete={onDelete} />}

  {/* Brand Name */}
  <h3 className="font-bold text-white text-lg mb-5 pr-16">{brand.name}</h3>

  {/* Color Swatches */}
  <ColorSwatches colors={brand.colors} />

  {/* Meta Tags */}
  <div className="flex flex-wrap items-center gap-2 text-xs mt-4">
    {brand.industry && (
      <span className="px-2.5 py-1 bg-white/5 rounded-lg text-zinc-400">{brand.industry}</span>
    )}
    {brand.fonts?.[0] && (
      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg text-zinc-400">
        <Type className="w-3 h-3" />
        {brand.fonts[0].name}
      </span>
    )}
  </div>

  {/* Set Active Button */}
  {!isActive && (
    <button
      onClick={onSetActive}
      className="mt-5 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-all"
    >
      Use This Brand
    </button>
  )}
</div>
```

---

### ColorSwatches

Display brand colors.

```tsx
<div className="flex gap-2">
  {colors.slice(0, 5).map((color, i) => (
    <div
      key={i}
      className="w-9 h-9 rounded-full border-2 border-zinc-800 shadow-lg ring-1 ring-white/10 hover:scale-110 transition-transform cursor-pointer"
      style={{ backgroundColor: color.hex }}
      title={`${color.name} (${color.usage})`}
    />
  ))}
  {colors.length > 5 && (
    <div className="w-9 h-9 rounded-full bg-zinc-800/80 border-2 border-zinc-700 flex items-center justify-center">
      <span className="text-[10px] text-zinc-400 font-medium">+{colors.length - 5}</span>
    </div>
  )}
  {colors.length === 0 && (
    <div className="flex items-center gap-2 text-zinc-500 text-xs">
      <Droplets className="w-4 h-4" />
      <span>No colors defined</span>
    </div>
  )}
</div>
```

---

### BrandCardMenu

Dropdown menu for actions.

```tsx
<div className="absolute top-4 right-4">
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    className="p-2 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
  >
    <MoreVertical className="w-4 h-4" />
  </button>

  {menuOpen && (
    <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
      <button
        onClick={() => { onSetActive(); setMenuOpen(false); }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5"
      >
        <Check className="w-4 h-4" />
        Set Active
      </button>
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  )}
</div>
```

---

### EmptyState

No brands message.

```tsx
<div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-10 text-center relative overflow-hidden">
  {/* Decorative gradients */}
  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/5 to-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

  <div className="relative z-10">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-5">
      <Sparkles className="w-10 h-10 text-sky-400" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">No Brand Profiles Yet</h3>
    <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto">
      Create a brand profile to maintain consistent colors, fonts, and style across all your designs.
    </p>
    <button
      onClick={onCreateBrand}
      className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-bold"
    >
      <Plus className="w-5 h-5" />
      Create Your First Brand
    </button>
  </div>
</div>
```

---

### ProTipCard

Helpful tip display.

```tsx
<div className="bg-gradient-to-r from-sky-500/10 to-teal-500/10 border border-sky-500/20 rounded-2xl p-6 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />
  <div className="flex items-start gap-4 relative z-10">
    <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
      <Upload className="w-6 h-6 text-sky-400" />
    </div>
    <div>
      <h4 className="font-bold text-white mb-1.5">Pro Tip: Extract Brand from Images</h4>
      <p className="text-sm text-zinc-400">
        Upload reference images in the Studio and use AI to automatically extract your brand colors and style.
      </p>
    </div>
  </div>
</div>
```

---

### BrandCardsSkeleton

Loading placeholder.

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
  {[1, 2, 3].map(i => (
    <div key={i} className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6">
      <div className="h-6 bg-zinc-800/50 rounded-lg w-1/2 mb-5 animate-pulse" />
      <div className="flex gap-2 mb-5">
        {[1, 2, 3, 4].map(j => (
          <div key={j} className="w-9 h-9 bg-zinc-800/50 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-zinc-800/30 rounded-lg w-3/4 animate-pulse" />
        <div className="h-4 bg-zinc-800/30 rounded-lg w-1/2 animate-pulse" />
      </div>
      <div className="h-10 bg-zinc-800/30 rounded-xl w-full mt-5 animate-pulse" />
    </div>
  ))}
</div>
```

---

## Brand Creation Flow

When "New Brand" is clicked, open a modal or drawer with:

1. **Brand Name** (required)
2. **Industry** (dropdown)
3. **Colors** (color picker, add multiple)
4. **Fonts** (Google Fonts selector)
5. **Logo Upload** (optional)

---

## Completion Checklist

- [ ] BrandKitPanel component
- [ ] NewBrandButton with arrow animation
- [ ] BrandCard with active state
- [ ] ColorSwatches component
- [ ] BrandCardMenu dropdown
- [ ] EmptyState with CTA
- [ ] ProTipCard
- [ ] BrandCardsSkeleton for loading
- [ ] Set active brand functionality
- [ ] Delete brand with confirmation
- [ ] Brand creation modal/flow

---

*Congratulations! You've completed all implementation milestones.*
