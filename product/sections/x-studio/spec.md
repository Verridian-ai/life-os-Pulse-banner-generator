# X (Twitter) Studio Section Specification

## Overview
Specialized design interface for X/Twitter content. Optimized for posts, headers, and profile assets.

## Section ID
`x-studio`

## Priority
Enhancement (Platform Studios)

## Supported Formats

| Format | Dimensions | Aspect Ratio | Use Case |
|--------|------------|--------------|----------|
| Post Image | 1200 x 675 | 16:9 | Tweet images |
| Header | 1500 x 500 | 3:1 | Profile banner |
| Profile Picture | 400 x 400 | 1:1 | Profile avatar |
| Card Image | 1200 x 628 | 1.91:1 | Link preview cards |

## X-Specific Features

### Post Optimization
- Image cropping preview
- Multi-image grid layouts
- Thread visual continuity

### Templates
- Quote cards
- Data visualizations
- Announcement posts
- Thread starters
- Meme formats
- News graphics

## Component Props

```typescript
interface XStudioViewProps {
  selectedFormat: XFormat;
  designs: Design[];
  templates: Template[];
  isGenerating: boolean;
  onSelectFormat: (format: XFormat) => void;
  onGenerate: (prompt: string, format: XFormat) => void;
  onOpenDesign: (designId: string) => void;
  onExport: (design: Design) => void;
}

type XFormat = 'post-image' | 'header' | 'profile-picture' | 'card-image';
```

## Design Tokens Applied
- Primary: Orange accents
- Neutral: Stone backgrounds
- Motion: Snappy interactions
