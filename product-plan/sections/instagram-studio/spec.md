# Instagram Studio Section

## Overview
Specialized content creation studio for Instagram with caption generation, hashtag optimization, carousel planning, and engagement prediction across posts, stories, and reels.

## User Stories
- As a creator, I want AI to write engaging captions
- As a creator, I want optimized hashtags for reach
- As a creator, I want to plan carousel posts
- As a creator, I want to preview how my grid will look
- As a creator, I want story and reel templates

## Screens

### Main Studio View
- **Left Panel**: Content design canvas (post/story/reel)
- **Center**: Caption editor with hashtag suggestions
- **Right Panel**: Engagement score and grid preview

### Content Canvas
- Format selector:
  - Square Post (1080x1080)
  - Portrait Post (1080x1350)
  - Landscape (1080x566)
  - Story/Reel (1080x1920)
  - Carousel (multi-slide)
- Filter previews
- Sticker/GIF integration

### Caption Editor Panel
- Caption text area (2200 char limit)
- Emoji suggestions
- Mention autocomplete (@)
- Line break formatter
- CTA suggestions

### Hashtag Panel
- AI-generated hashtag sets
- Hashtag categories (niche, broad, trending)
- Saved hashtag groups
- Banned hashtag detection
- Hashtag performance predictions

### Carousel Planner
- Multi-slide canvas
- Slide reordering
- Consistent style across slides
- Story arc suggestions
- Swipe indicator preview

### Grid Preview
- 9-post grid visualization
- Color harmony check
- Visual flow analysis
- Post scheduling position

### Engagement Score Card
- Predicted engagement rate
- Factor breakdown:
  - Visual appeal
  - Caption quality
  - Hashtag reach
  - Posting time
  - Content type bonus
- Best time to post suggestion

## Components

### InstagramStudio
Main container for Instagram tools

**Props:**
- `userId: string`
- `accountId?: string`
- `brandProfile?: BrandProfile`
- `contentType: 'post' | 'story' | 'reel' | 'carousel'`

### CarouselEditor
Multi-slide content editor

**Props:**
- `slides: CarouselSlide[]`
- `onSlideAdd: () => void`
- `onSlideRemove: (index: number) => void`
- `onSlideReorder: (from: number, to: number) => void`
- `maxSlides: number` // Instagram limit: 10

### HashtagPanel
Hashtag generation and management

**Props:**
- `caption: string`
- `generatedHashtags: HashtagSet[]`
- `selectedHashtags: string[]`
- `onHashtagToggle: (tag: string) => void`
- `savedSets: HashtagSet[]`
- `onSaveSet: (name: string, tags: string[]) => void`

### GridPreview
Visual grid planning

**Props:**
- `existingPosts: GridPost[]`
- `newPost: GridPost`
- `onPositionChange: (position: number) => void`

### EngagementScoreCard
Engagement prediction display

**Props:**
- `score: number`
- `factors: EngagementFactor[]`
- `bestTime: Date`
- `suggestions: string[]`

### StoryTemplates
Pre-designed story layouts

**Props:**
- `templates: StoryTemplate[]`
- `onSelect: (template: StoryTemplate) => void`
- `category: string`

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

interface CarouselSlide {
  id: string;
  imageUrl: string;
  order: number;
  altText?: string;
}

interface HashtagSet {
  id: string;
  name: string;
  hashtags: string[];
  category: 'niche' | 'broad' | 'trending' | 'branded';
  avgReach?: number;
}

interface EngagementScore {
  overall: number; // percentage
  factors: EngagementFactor[];
  bestTimeToPost: Date;
  suggestions: string[];
}
```

## Instagram-Specific Features

### Caption Best Practices
- Hook in first line (before "...more")
- Line break formatting
- Emoji placement optimization
- CTA at the end
- Micro-story structure

### Hashtag Strategy
- Mix of sizes: 5 niche, 10 medium, 5 broad
- Banned hashtag detection
- Hashtag rotation suggestions
- Performance tracking
- Custom saved sets

### Carousel Best Practices
- Hook slide first
- Educational/value slides middle
- CTA slide last
- Consistent visual style
- Swipe motivation indicators

### Reel/Story Features
- Trending audio suggestions
- Text animation presets
- Sticker placement
- Poll/question templates
- Link sticker optimization

## Mobile Considerations
- Swipeable format selector
- Bottom sheet for hashtags
- Drag-and-drop carousel reorder
- Grid preview pinch-to-zoom
- Native share integration
