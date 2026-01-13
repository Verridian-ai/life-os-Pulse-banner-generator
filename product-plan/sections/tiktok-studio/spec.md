# TikTok Studio Section

## Overview
Specialized content creation studio for TikTok with trend integration, video thumbnail generation, caption optimization, and viral potential scoring for maximum discoverability on the For You Page.

## User Stories
- As a creator, I want thumbnails that stop the scroll
- As a creator, I want to leverage trending sounds and hashtags
- As a creator, I want captions optimized for TikTok's algorithm
- As a creator, I want to understand my viral potential
- As a creator, I want ideas based on current trends

## Screens

### Main Studio View
- **Left Panel**: Video thumbnail/cover designer
- **Center**: Caption and hashtag editor
- **Right Panel**: Viral score and trend integration

### Thumbnail/Cover Canvas
- Format: 1080x1920 (9:16 vertical)
- Video frame selector
- Custom cover upload
- Text overlay optimization
- Face/emotion detection

### Caption Editor
- Caption text (limited, concise)
- Hashtag integration
- Mention autocomplete
- Emoji suggestions
- CTA prompts

### Trend Integration Panel
- Trending sounds browser
- Trending hashtags
- Challenge participation suggestions
- Duet/stitch opportunities
- Trend timing analysis

### Viral Score Card
- For You Page potential (0-100)
- Factor breakdown:
  - Hook strength (first 3 seconds)
  - Trend alignment
  - Watch time prediction
  - Engagement drivers
  - Posting time
- Improvement suggestions

### Content Ideas Panel
- AI-generated content ideas
- Based on trending topics
- Niche-specific suggestions
- Format recommendations (tutorial, POV, etc.)

## Components

### TikTokStudio
Main container for TikTok tools

**Props:**
- `userId: string`
- `accountId?: string`
- `brandProfile?: BrandProfile`
- `videoUrl?: string`

### VideoCoverDesigner
Thumbnail/cover creator

**Props:**
- `videoFrames: VideoFrame[]`
- `selectedFrame: number`
- `customCover?: string`
- `textOverlay: TextOverlay`
- `onFrameSelect: (index: number) => void`
- `onCustomUpload: (file: File) => void`

### TrendBrowser
Trending content discovery

**Props:**
- `trendingSounds: TrendingSound[]`
- `trendingHashtags: TrendingHashtag[]`
- `challenges: Challenge[]`
- `onSoundSelect: (sound: TrendingSound) => void`
- `onHashtagSelect: (tag: string) => void`

### ViralScoreCard
FYP potential prediction

**Props:**
- `score: number`
- `factors: ViralFactor[]`
- `suggestions: string[]`
- `optimalPostTime: Date`

### ContentIdeaGenerator
AI-powered content suggestions

**Props:**
- `niche: string`
- `trends: Trend[]`
- `ideas: ContentIdea[]`
- `onIdeaSelect: (idea: ContentIdea) => void`
- `onRegenerate: () => void`

### HashtagMixer
TikTok hashtag optimization

**Props:**
- `selectedHashtags: string[]`
- `trendingHashtags: string[]`
- `nicheHashtags: string[]`
- `onHashtagToggle: (tag: string) => void`
- `reachEstimate: number`

## Data Model

```typescript
interface TikTokContent {
  id: string;
  userId: string;
  videoUrl?: string;
  coverUrl: string;
  caption: string;
  hashtags: string[];
  soundId?: string;
  soundName?: string;
  viralScore: ViralScore;
  scheduledAt?: Date;
  status: 'draft' | 'ready' | 'published';
}

interface ViralScore {
  overall: number; // 0-100
  fypPotential: number;
  factors: ViralFactor[];
  suggestions: string[];
  optimalPostTime: Date;
}

interface ViralFactor {
  id: string;
  name: string;
  score: number;
  weight: number;
  suggestion?: string;
}

interface TrendingSound {
  id: string;
  name: string;
  artist: string;
  usageCount: number;
  trend: 'rising' | 'peak' | 'declining';
  previewUrl: string;
}

interface TrendingHashtag {
  tag: string;
  views: number;
  trend: 'rising' | 'peak' | 'declining';
  category: string;
}

interface ContentIdea {
  id: string;
  title: string;
  format: TikTokFormat;
  hook: string;
  structure: string[];
  relatedTrend?: string;
}

type TikTokFormat =
  | 'tutorial'
  | 'pov'
  | 'storytime'
  | 'transition'
  | 'duet'
  | 'stitch'
  | 'greenscreen'
  | 'challenge';
```

## TikTok-Specific Features

### Hook Optimization (First 3 Seconds)
- Pattern interrupt suggestions
- Text hook overlay
- Visual hook analysis
- Sound sync recommendations
- Retention prediction

### Trend Timing
- Trend lifecycle detection (rising/peak/declining)
- Optimal participation window
- Trend saturation warning
- Niche trend identification

### Hashtag Strategy
- Mix: 1-2 broad, 2-3 niche, 1-2 trending
- FYP optimization
- Shadowban detection
- Performance tracking

### Sound Selection
- Trending sound browser
- Sound-to-content matching
- Original sound suggestions
- Viral sound predictions

### Caption Best Practices
- Ultra-concise (50-100 chars)
- Hook continuation
- CTA for engagement
- Emoji usage

## Mobile Considerations
- Vertical-first design
- Swipe through trends
- Sound preview player
- Quick hashtag copy
- Native video picker
