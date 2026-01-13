# YouTube Studio Section

## Overview
Specialized content creation studio for YouTube with thumbnail optimization, title/description generation, and SEO scoring for maximum discoverability.

## User Stories
- As a creator, I want AI to generate click-worthy thumbnails
- As a creator, I want optimized titles and descriptions for SEO
- As a creator, I want to see a click-through rate prediction
- As a creator, I want thumbnail A/B testing suggestions
- As a creator, I want to maintain visual consistency across my channel

## Screens

### Main Studio View
- **Left Panel**: Thumbnail design canvas
- **Center**: Title/description editor with SEO analysis
- **Right Panel**: CTR score and optimization suggestions

### Thumbnail Canvas
- Format presets: 1280x720 (standard), custom
- Face detection for optimal placement
- Text readability analyzer
- Emotion/expression suggestions
- Brand consistency checker

### Title & Description Panel
- Title editor with character count (100 max, 60 optimal)
- Description editor with timestamps support
- Keyword suggestions based on topic
- Tag generator
- Hashtag recommendations

### CTR Score Card
- Predicted click-through rate (0-10%)
- Factor breakdown:
  - Thumbnail appeal
  - Title curiosity gap
  - Keyword optimization
  - Trend alignment
- Competitor comparison
- Improvement suggestions

### Channel Consistency Panel
- Visual style matching
- Color palette consistency
- Font consistency
- Thumbnail series templates

## Components

### YouTubeStudio
Main container for YouTube-specific tools

**Props:**
- `userId: string`
- `channelId?: string`
- `brandProfile?: BrandProfile`
- `onPublish?: (content: YouTubeContent) => void`

### ThumbnailCanvas
Specialized canvas for thumbnails

**Props:**
- `format: ThumbnailFormat`
- `elements: CanvasElement[]`
- `onGenerate: (prompt: string) => void`
- `faceDetection: boolean`
- `onFaceDetectionToggle: () => void`

### TitleDescriptionEditor
SEO-optimized text editor

**Props:**
- `title: string`
- `description: string`
- `onTitleChange: (title: string) => void`
- `onDescriptionChange: (desc: string) => void`
- `keywords: string[]`
- `onKeywordAdd: (keyword: string) => void`

### CTRScoreCard
Click-through rate prediction

**Props:**
- `score: number`
- `factors: CTRFactor[]`
- `suggestions: string[]`
- `competitors?: CompetitorAnalysis[]`

### TagGenerator
AI-powered tag suggestions

**Props:**
- `topic: string`
- `generatedTags: string[]`
- `selectedTags: string[]`
- `onTagToggle: (tag: string) => void`
- `maxTags: number` // YouTube limit: 500 chars

## Data Model

```typescript
interface YouTubeContent {
  id: string;
  userId: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  ctrScore: CTRScore;
  status: 'draft' | 'ready' | 'published';
  videoId?: string;
  createdAt: Date;
}

interface CTRScore {
  overall: number; // 0-10%
  factors: CTRFactor[];
  suggestions: string[];
}

interface CTRFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  suggestion?: string;
}

interface ThumbnailFormat {
  width: 1280;
  height: 720;
  aspectRatio: '16:9';
}
```

## YouTube-Specific Features

### Thumbnail Best Practices
- Face prominence detection
- Text overlay readability (contrast check)
- Emotion recognition for expressions
- Rule of thirds alignment
- Brand color integration

### Title Optimization
- Curiosity gap analysis
- Power word detection
- Number/list format suggestions
- Length optimization (60 chars optimal)
- Keyword placement (front-loaded)

### Description Optimization
- First 150 chars (above fold) priority
- Timestamp generation from video topics
- Links and CTA placement
- Keyword density analysis
- Related video suggestions

### SEO Analysis
- Search volume for keywords
- Competition level
- Trend alignment score
- Suggested alternatives

## Mobile Considerations
- Tab-based navigation between panels
- Full-screen thumbnail preview
- Bottom sheet for tag selection
- Swipe between thumbnail variants
- Touch-optimized text editing
