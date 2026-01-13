# Instagram Studio Section Specification

## Overview
Specialized design interface optimized for Instagram content. Understands Instagram's visual-first requirements and various format types.

## Section ID
`instagram-studio`

## Priority
Enhancement (Platform Studios)

## User Stories
- As a user, I want to create Instagram posts, stories, and reels covers
- As a user, I want templates designed for visual impact
- As a user, I want to preview how content will look in Instagram's grid
- As a user, I want to create carousel posts

## Supported Formats

| Format | Dimensions | Aspect Ratio | Use Case |
|--------|------------|--------------|----------|
| Square Post | 1080 x 1080 | 1:1 | Standard feed posts |
| Portrait Post | 1080 x 1350 | 4:5 | Optimal feed engagement |
| Landscape Post | 1080 x 566 | 1.91:1 | Wide shots |
| Story | 1080 x 1920 | 9:16 | Stories and Reels |
| Carousel | 1080 x 1080 | 1:1 | Multi-image posts |
| Profile Picture | 320 x 320 | 1:1 | Profile avatar |

## Screens

### Instagram Studio Home
Format selection with grid preview.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Studios]        Instagram Studio           [Templates]  │
├─────────────────────────────────────────────────────────────┤
│  CREATE NEW                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │    ▢     │ │    ▯     │ │  ▭      │ │    ▯     │       │
│  │ Square   │ │ Portrait │ │Landscape│ │  Story   │       │
│  │ 1:1      │ │ 4:5      │ │ 1.91:1  │ │ 9:16     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐                                               │
│  │ ▢ ▢ ▢    │                                               │
│  │ Carousel │                                               │
│  │ Up to 10 │                                               │
│  └──────────┘                                               │
├─────────────────────────────────────────────────────────────┤
│  GRID PREVIEW                              [View Full Grid] │
│  ┌──────┐ ┌──────┐ ┌──────┐                                │
│  │      │ │      │ │      │                                │
│  │ New  │ │      │ │      │                                │
│  │      │ │      │ │      │                                │
│  └──────┘ └──────┘ └──────┘                                │
│  ┌──────┐ ┌──────┐ ┌──────┐                                │
│  │      │ │      │ │      │                                │
│  └──────┘ └──────┘ └──────┘                                │
└─────────────────────────────────────────────────────────────┘
```

### Carousel Editor
Multi-slide design interface.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]        Carousel (3 slides)       [Preview] [Export]│
├─────────────────────────────────────────────────────────────┤
│  SLIDES                                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                               │
│  │ 1  │ │ 2  │ │ 3  │ │ +  │                               │
│  │●   │ │    │ │    │ │Add │                               │
│  └────┘ └────┘ └────┘ └────┘                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │              CURRENT SLIDE                           │   │
│  │              (1:1 aspect)                            │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Describe this slide...]                    [Generate ✨]  │
└─────────────────────────────────────────────────────────────┘
```

## Component Props

```typescript
interface InstagramStudioViewProps {
  selectedFormat: InstagramFormat;
  designs: Design[];
  gridPreview: Design[];
  carouselSlides?: CarouselSlide[];
  isGenerating: boolean;
  onSelectFormat: (format: InstagramFormat) => void;
  onGenerate: (prompt: string, format: InstagramFormat) => void;
  onAddCarouselSlide: () => void;
  onRemoveCarouselSlide: (index: number) => void;
  onReorderCarouselSlides: (from: number, to: number) => void;
  onPreviewGrid: () => void;
  onExport: (design: Design | CarouselSlide[]) => void;
}

type InstagramFormat =
  | 'square'
  | 'portrait'
  | 'landscape'
  | 'story'
  | 'carousel';

interface CarouselSlide {
  id: string;
  imageUrl: string;
  prompt?: string;
}
```

## Instagram-Specific Features

### Grid Preview
- 3x3 grid simulation
- Drag to reorder posts
- Visual consistency check

### Carousel Features
- Up to 10 slides
- Consistent style across slides
- Swipe preview simulation
- Slide reordering

### Story/Reels Features
- Tap zone overlays
- Sticker placement guides
- Link sticker areas

### Visual Templates
- Quote posts
- Product showcases
- Before/after
- Testimonials
- Behind the scenes
- Tutorial steps

## Design Tokens Applied
- Primary: Orange for accents
- Neutral: Stone backgrounds
- Motion: Bouncy for slide interactions

## Accessibility
- Keyboard carousel navigation
- Alt text for all slides
- High contrast text options
