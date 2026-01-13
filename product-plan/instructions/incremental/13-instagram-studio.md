# Milestone 13: Instagram Studio

Build Instagram-focused design tools with engagement prediction and hashtag optimization.

## Prerequisites
- Foundation complete
- Platform Studio complete
- YouTube Studio complete (reference implementation)

## Deliverables

### Components
1. **InstagramStudio** — Main studio container
2. **MultiFormatCanvas** — Post, Story, Reel, Carousel support
3. **EngagementScoreCard** — Engagement prediction display
4. **HashtagOptimizer** — Category-based hashtag selector
5. **GridPreview** — 9-post feed aesthetic preview
6. **StoryTemplates** — Pre-designed story templates
7. **CarouselBuilder** — Multi-slide carousel editor
8. **CaptionGenerator** — AI caption with emoji suggestions

### Services
1. **instagramService** — Instagram Graph API integration
2. **engagementScoreService** — Engagement calculation
3. **hashtagService** — Hashtag reach and suggestions
4. **gridAnalysisService** — Feed aesthetic analysis

## Data Model

```typescript
interface InstagramContent {
  id: string;
  userId: string;
  contentType: 'post' | 'story' | 'reel' | 'carousel';
  mediaUrls: string[];
  caption: string;
  hashtags: string[];
  mentions: string[];
  location?: string;
  engagementScore: EngagementScore;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
}

interface EngagementScore {
  overall: number;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  factors: EngagementFactor[];
  bestTimeToPost: Date;
  suggestions: string[];
}

interface HashtagSet {
  id: string;
  name: string;
  hashtags: string[];
  category: 'branded' | 'community' | 'niche' | 'broad' | 'trending';
  avgReach?: number;
}
```

## Implementation Notes

### Engagement Score Algorithm
Calculate score based on:
- **Visual Quality** (30%) — Composition, colors, faces
- **Caption Quality** (25%) — Length, emojis, questions
- **Hashtag Effectiveness** (20%) — Mix and relevance
- **Timing** (15%) — Audience activity alignment
- **Content Type** (10%) — Carousel > Reel > Post > Story

### Hashtag Optimizer
- 5 categories: Branded, Community, Niche, Broad, Trending
- Combined reach estimate
- Max 30 hashtags validation
- Banned hashtag detection
- Mix recommendation (3 broad, 5 niche, 2 branded)

### Carousel Builder
- 2-10 slides support
- Consistent aspect ratio
- Swipe preview animation
- Per-slide editing

### Grid Preview
- Show 9-post grid
- New post placement preview
- Color consistency analysis
- Feed flow suggestions

## Mobile Considerations
- Native aspect ratio previews (Stories fill screen)
- Swipe navigation between carousel slides
- Bottom sheet for hashtag selection
- Touch-friendly sticker placement
