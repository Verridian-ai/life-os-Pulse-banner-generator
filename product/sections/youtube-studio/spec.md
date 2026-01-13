# YouTube Studio Section Specification

## Overview
Specialized design interface for YouTube content. Optimized for thumbnails, channel art, and end screens.

## Section ID
`youtube-studio`

## Priority
Enhancement (Platform Studios)

## Supported Formats

| Format | Dimensions | Aspect Ratio | Use Case |
|--------|------------|--------------|----------|
| Thumbnail | 1280 x 720 | 16:9 | Video thumbnails |
| Channel Banner | 2560 x 1440 | 16:9 | Channel art |
| Profile Picture | 800 x 800 | 1:1 | Channel avatar |
| End Screen | 1920 x 1080 | 16:9 | Video end screens |

## YouTube-Specific Features

### Thumbnail Optimization
- Face detection zones
- Text readability at small sizes
- Clickbait-free quality templates
- A/B testing variants

### Safe Zones
- Channel banner: TV, desktop, mobile safe areas
- Thumbnail: Duration badge overlap area

### Templates
- Tutorial thumbnails
- Vlog thumbnails
- Gaming thumbnails
- Review thumbnails
- Podcast thumbnails
- Music video covers

## Component Props

```typescript
interface YouTubeStudioViewProps {
  selectedFormat: YouTubeFormat;
  designs: Design[];
  templates: Template[];
  isGenerating: boolean;
  onSelectFormat: (format: YouTubeFormat) => void;
  onGenerate: (prompt: string, format: YouTubeFormat) => void;
  onOpenDesign: (designId: string) => void;
  onExport: (design: Design) => void;
  onGenerateVariants: (designId: string, count: number) => void;
}

type YouTubeFormat = 'thumbnail' | 'channel-banner' | 'profile-picture' | 'end-screen';
```

## Design Tokens Applied
- Primary: Orange for CTAs
- Neutral: Stone backgrounds
- Motion: Smooth for canvas, bouncy for generate
