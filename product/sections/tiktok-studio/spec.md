# TikTok Studio Section Specification

## Overview
Specialized design interface for TikTok content. Optimized for vertical video covers and profile assets.

## Section ID
`tiktok-studio`

## Priority
Enhancement (Platform Studios)

## Supported Formats

| Format | Dimensions | Aspect Ratio | Use Case |
|--------|------------|--------------|----------|
| Video Cover | 1080 x 1920 | 9:16 | Video thumbnail |
| Profile Picture | 200 x 200 | 1:1 | Profile avatar |
| Playlist Cover | 1080 x 1920 | 9:16 | Playlist thumbnails |

## TikTok-Specific Features

### Video Cover Design
- Text-safe zones (away from UI elements)
- Trending aesthetic templates
- Bold, attention-grabbing styles

### Engagement-Optimized Templates
- Curiosity hooks
- Before/after reveals
- Numbered lists
- Reaction bait
- Tutorial previews

## Component Props

```typescript
interface TikTokStudioViewProps {
  selectedFormat: TikTokFormat;
  designs: Design[];
  templates: Template[];
  isGenerating: boolean;
  onSelectFormat: (format: TikTokFormat) => void;
  onGenerate: (prompt: string, format: TikTokFormat) => void;
  onOpenDesign: (designId: string) => void;
  onExport: (design: Design) => void;
}

type TikTokFormat = 'video-cover' | 'profile-picture' | 'playlist-cover';
```

## Design Tokens Applied
- Primary: Orange for energy
- Neutral: Stone backgrounds
- Motion: Bouncy, energetic animations
