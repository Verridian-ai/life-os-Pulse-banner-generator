# LinkedIn Studio Section Specification

## Overview
Specialized design interface optimized for LinkedIn content. Understands LinkedIn's unique requirements for professional networking content.

## Section ID
`linkedin-studio`

## Priority
Enhancement (Platform Studios)

## User Stories
- As a user, I want to create LinkedIn-optimized banners and posts
- As a user, I want templates designed for professional content
- As a user, I want to preview how my content will look on LinkedIn
- As a user, I want to export in LinkedIn's recommended formats

## Supported Formats

| Format | Dimensions | Aspect Ratio | Use Case |
|--------|------------|--------------|----------|
| Profile Banner | 1584 x 396 | 4:1 | Personal profile background |
| Company Banner | 1128 x 191 | 6:1 | Company page background |
| Post Image | 1200 x 1200 | 1:1 | Feed posts |
| Article Cover | 1200 x 644 | 1.86:1 | Article headers |
| Event Cover | 1776 x 444 | 4:1 | Event banners |

## Screens

### LinkedIn Studio Home
Format selection and recent LinkedIn designs.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Studios]          LinkedIn Studio           [Templates] │
├─────────────────────────────────────────────────────────────┤
│  CREATE NEW                                                  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │ ═══════════    │ │ ▢              │ │ ═══════        │   │
│  │ Profile Banner │ │ Post Image     │ │ Company Banner │   │
│  │ 1584 x 396     │ │ 1200 x 1200    │ │ 1128 x 191     │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
│  ┌────────────────┐ ┌────────────────┐                      │
│  │ ═══════════    │ │ ═══════════    │                      │
│  │ Article Cover  │ │ Event Cover    │                      │
│  │ 1200 x 644     │ │ 1776 x 444     │                      │
│  └────────────────┘ └────────────────┘                      │
├─────────────────────────────────────────────────────────────┤
│  RECENT LINKEDIN DESIGNS                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │          │ │          │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Design Canvas
LinkedIn-specific design interface.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]        Profile Banner           [Preview] [Export]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │           CANVAS (4:1 aspect ratio)                  │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  LINKEDIN TIPS                                              │
│  💡 Keep important content away from the left edge          │
│     (profile photo overlaps on desktop)                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Describe your banner...]                    [Generate ✨] │
└─────────────────────────────────────────────────────────────┘
```

## Component Props

```typescript
interface LinkedInStudioViewProps {
  selectedFormat: LinkedInFormat;
  designs: Design[];
  templates: Template[];
  isGenerating: boolean;
  onSelectFormat: (format: LinkedInFormat) => void;
  onGenerate: (prompt: string, format: LinkedInFormat) => void;
  onOpenDesign: (designId: string) => void;
  onPreview: (design: Design) => void;
  onExport: (design: Design, format: ExportFormat) => void;
  onViewTemplates: () => void;
}

type LinkedInFormat =
  | 'profile-banner'
  | 'company-banner'
  | 'post-image'
  | 'article-cover'
  | 'event-cover';
```

## LinkedIn-Specific Features

### Safe Zones
- Profile banner: Left 200px reserved for profile photo overlap
- Post images: Text-safe area guidance
- Article covers: Title overlay zones

### Professional Templates
- Corporate announcement
- Job posting
- Achievement celebration
- Thought leadership quote
- Event promotion
- Company culture

### LinkedIn Preview Mode
- Desktop feed simulation
- Mobile feed simulation
- Profile page preview
- Article page preview

## Design Tokens Applied
- Primary: Orange (Signal brand, not LinkedIn blue)
- Neutral: Stone backgrounds
- Motion: Smooth spring for canvas interactions

## Accessibility
- Color contrast checker for text on backgrounds
- Alt text suggestions for images
- Keyboard navigation for all tools
