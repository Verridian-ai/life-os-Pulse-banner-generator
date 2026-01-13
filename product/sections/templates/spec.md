# Templates Gallery Section Specification

## Overview
Pre-designed templates organized by platform and use case. Users can browse, preview, and customize templates as starting points for their designs.

## Section ID
`templates`

## Priority
Core

## User Stories
- As a user, I want to browse templates by platform
- As a user, I want to filter templates by category and style
- As a user, I want to preview a template before using it
- As a user, I want to customize a template with my brand

## Screens

### Gallery View
The main template browsing interface.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Templates                                    [Search 🔍]    │
├─────────────────────────────────────────────────────────────┤
│  PLATFORMS                                                   │
│  [All] [LinkedIn] [Instagram] [TikTok] [YouTube] [X]        │
├─────────────────────────────────────────────────────────────┤
│  CATEGORIES                                                  │
│  [All] [Business] [Creative] [Minimal] [Bold] [Elegant]     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   PRO    │ │          │ │          │ │   PRO    │       │
│  │          │ │          │ │          │ │          │       │
│  │  Template│ │  Template│ │  Template│ │  Template│       │
│  │          │ │          │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │          │ │   PRO    │ │          │ │          │       │
│  │          │ │          │ │          │ │          │       │
│  │  Template│ │  Template│ │  Template│ │  Template│       │
│  │          │ │          │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Template Preview Modal
Detailed view of a selected template.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [✕]                  Template Name                          │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  DETAILS                  │
│                                  │  Platform: LinkedIn       │
│         LARGE PREVIEW            │  Category: Business       │
│                                  │  Aspect: 1:1              │
│                                  │                           │
│                                  │  DESCRIPTION              │
│                                  │  Perfect for professional │
│                                  │  announcements...         │
│                                  │                           │
│                                  │  [Use This Template]      │
│                                  │  [Add to Favorites ♡]     │
└──────────────────────────────────┴──────────────────────────┘
```

## Component Props

### TemplatesGalleryView
```typescript
interface TemplatesGalleryViewProps {
  templates: Template[];
  platforms: Platform[];
  categories: Category[];
  selectedPlatform: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  userTier: 'free' | 'pro' | 'team';
  onSearch: (query: string) => void;
  onFilterPlatform: (platformId: string | null) => void;
  onFilterCategory: (categoryId: string | null) => void;
  onSelectTemplate: (templateId: string) => void;
  onUseTemplate: (templateId: string) => void;
  onToggleFavorite: (templateId: string) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  previewUrl: string;
  platform: string;
  category: string;
  aspectRatio: string;
  isPremium: boolean;
  usageCount: number;
  isFavorite: boolean;
}
```

## States

### Loading State
- Skeleton grid for template cards
- Animated placeholder thumbnails
- No layout shift

### Empty State (No Results)
- Friendly illustration
- "No templates found" message
- Suggestions to adjust filters

### Premium Locked State
- Blur or overlay on premium templates
- "PRO" badge visible
- Click shows upgrade modal

## Interactions

### Template Card Hover
- Scale up (1.02)
- Shadow increase
- Quick preview button appears
- Platform badge highlight

### Filter Pills
- Active state with orange background
- Press scale (0.98)
- Instant filter application

### Template Preview Modal
- Smooth fade-in with scale
- Image zoom on click
- Escape to close

## Design Tokens Applied
- Primary: Orange for active filters and CTAs
- Neutral: Stone for cards and backgrounds
- Motion: Smooth spring for card interactions
- Surface: Glass effect for modal backdrop

## Accessibility
- Grid navigation with arrow keys
- Filter announcements for screen readers
- Modal focus trap
- Alt text for all template images
