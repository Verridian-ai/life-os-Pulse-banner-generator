# Templates — Implementation Instructions

Professional template library organized by industry.

---

## Overview

Templates provides:
- Pre-designed starting points
- Industry-based filtering
- Search functionality
- One-click application to studio

---

## Components to Create

### TemplatesPage

Main page component (can also be embedded in Dashboard).

```typescript
interface TemplatesPageProps {
  onSelectTemplate: (template: Template) => void;
}
```

**Structure:**
```tsx
<AppShell activeItemId="templates">
  <TemplatesGrid onSelectTemplate={onSelectTemplate} />
</AppShell>
```

---

### TemplatesGrid

Full template browsing experience.

```typescript
interface TemplatesGridProps {
  onSelectTemplate: (template: Template) => void;
}
```

**Structure:**
```tsx
<div className="space-y-6">
  {/* Header */}
  <div className="flex items-center gap-3 mb-2">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
      <Layout className="w-5 h-5 text-sky-400" />
    </div>
    <div>
      <h1 className="text-2xl font-bold text-white">Templates</h1>
      <p className="text-zinc-400 text-sm">{filteredCount} professional templates</p>
    </div>
  </div>

  {/* Search */}
  <SearchInput value={search} onChange={setSearch} placeholder="Search templates..." />

  {/* Industry Filters */}
  <IndustryFilters
    industries={industries}
    selected={selectedIndustry}
    onSelect={setSelectedIndustry}
  />

  {/* Loading State */}
  {isLoading && <TemplatesSkeleton />}

  {/* Templates Grid */}
  {!isLoading && filteredTemplates.length > 0 && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {filteredTemplates.map(template => (
        <TemplateCard key={template.id} template={template} onSelect={onSelectTemplate} />
      ))}
    </div>
  )}

  {/* Empty State */}
  {!isLoading && filteredTemplates.length === 0 && (
    <EmptyState onClearFilters={() => { setSearch(''); setSelectedIndustry('all'); }} />
  )}
</div>
```

---

### SearchInput

Search field with icon.

```tsx
<div className="relative max-w-md">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
  />
  {value && (
    <button onClick={() => onChange('')} className="absolute right-4 top-1/2 -translate-y-1/2">
      <X className="w-4 h-4 text-zinc-500 hover:text-white" />
    </button>
  )}
</div>
```

---

### IndustryFilters

Horizontal scrollable filter pills.

```typescript
const industries = [
  'all',
  'technology',
  'finance',
  'healthcare',
  'marketing',
  'education',
  'real-estate',
  'creative',
  'e-commerce',
];
```

```tsx
<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
  {industries.map(industry => (
    <button
      key={industry}
      onClick={() => onSelect(industry)}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
        selected === industry
          ? 'bg-gradient-to-r from-sky-500 to-teal-500 text-white'
          : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/80'
      }`}
    >
      {industry === 'all' ? 'All' : capitalize(industry)}
    </button>
  ))}
</div>
```

---

### TemplateCard

Individual template display.

```typescript
interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}
```

```tsx
<div
  onClick={() => onSelect(template)}
  className="group cursor-pointer bg-zinc-900/80 border border-white/5 rounded-2xl overflow-hidden hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-900/10 transition-all"
>
  {/* Preview Image */}
  <div className="relative aspect-video overflow-hidden">
    <img
      src={template.backgroundUrl}
      alt={template.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
    {/* Hover Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
      <span className="px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 rounded-lg text-sm font-bold">
        Use Template
      </span>
    </div>
  </div>

  {/* Content */}
  <div className="p-4">
    <h3 className="font-bold text-white mb-1 group-hover:text-sky-100">{template.title}</h3>
    <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{template.description}</p>
    <span className="inline-block px-2.5 py-1 bg-white/5 rounded-lg text-xs text-zinc-500">
      {template.industry}
    </span>
  </div>
</div>
```

---

### TemplatesSkeleton

Loading placeholder.

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
    <div key={i} className="bg-zinc-900/80 border border-white/5 rounded-2xl overflow-hidden">
      <div className="aspect-video bg-zinc-800/50 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-zinc-800/50 rounded-lg w-3/4 animate-pulse" />
        <div className="h-4 bg-zinc-800/30 rounded-lg w-full animate-pulse" />
        <div className="h-6 bg-zinc-800/30 rounded-lg w-1/4 animate-pulse" />
      </div>
    </div>
  ))}
</div>
```

---

### EmptyState

No results message.

```tsx
<div className="text-center py-16">
  <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
    <Search className="w-8 h-8 text-zinc-600" />
  </div>
  <h3 className="text-lg font-bold text-white mb-2">No templates found</h3>
  <p className="text-zinc-400 mb-6">Try adjusting your search or filters</p>
  <button
    onClick={onClearFilters}
    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium"
  >
    Clear Filters
  </button>
</div>
```

---

## Template Data

```typescript
const templates: Template[] = [
  {
    id: 'tech-linkedin-1',
    title: 'Tech Leader Banner',
    description: 'Professional LinkedIn banner for technology executives and founders',
    industry: 'technology',
    backgroundUrl: '/templates/tech-leader.jpg',
    prompt: 'Professional tech executive banner with abstract geometric patterns',
    elements: [],
  },
  // ... more templates
];
```

---

## Filtering Logic

```typescript
const filteredTemplates = templates.filter(t => {
  const matchesSearch = search === '' ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase());

  const matchesIndustry = selectedIndustry === 'all' ||
    t.industry === selectedIndustry;

  return matchesSearch && matchesIndustry;
});
```

---

## Completion Checklist

- [ ] TemplatesPage/TemplatesGrid component
- [ ] SearchInput with clear button
- [ ] IndustryFilters with horizontal scroll
- [ ] TemplateCard with hover overlay
- [ ] TemplatesSkeleton for loading
- [ ] EmptyState with clear filters
- [ ] Template data structure
- [ ] Filter by search and industry
- [ ] Click to apply template

---

*Next: Milestone 6 — Brand Kit*
