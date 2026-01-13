# Facebook Studio Section Specification

## Overview
Specialized design interface for Facebook content. Optimized for posts, covers, and ads.

## Section ID
`facebook-studio`

## Priority
Enhancement (Platform Studios)

## Supported Formats

| Format | Dimensions | Aspect Ratio | Use Case |
|--------|------------|--------------|----------|
| Post Image | 1200 x 630 | 1.91:1 | Feed posts |
| Cover Photo | 820 x 312 | 2.63:1 | Profile/page cover |
| Profile Picture | 170 x 170 | 1:1 | Profile avatar |
| Event Cover | 1920 x 1005 | 1.91:1 | Event headers |
| Group Cover | 1640 x 856 | 1.91:1 | Group headers |
| Story | 1080 x 1920 | 9:16 | Facebook stories |
| Ad (Square) | 1080 x 1080 | 1:1 | Square ads |
| Ad (Landscape) | 1200 x 628 | 1.91:1 | Landscape ads |

## Facebook-Specific Features

### Cover Safe Zones
- Profile photo overlap area
- Mobile vs desktop cropping
- CTA button placement

### Ad Templates
- Carousel ads
- Collection ads
- Lead gen ads
- Event promotion

### Business Templates
- Product announcements
- Sale promotions
- Testimonials
- Behind the scenes
- Team spotlights

## Component Props

```typescript
interface FacebookStudioViewProps {
  selectedFormat: FacebookFormat;
  designs: Design[];
  templates: Template[];
  isGenerating: boolean;
  onSelectFormat: (format: FacebookFormat) => void;
  onGenerate: (prompt: string, format: FacebookFormat) => void;
  onOpenDesign: (designId: string) => void;
  onExport: (design: Design) => void;
}

type FacebookFormat =
  | 'post-image'
  | 'cover-photo'
  | 'profile-picture'
  | 'event-cover'
  | 'group-cover'
  | 'story'
  | 'ad-square'
  | 'ad-landscape';
```

## Design Tokens Applied
- Primary: Orange accents
- Neutral: Stone backgrounds
- Motion: Smooth spring for canvas
