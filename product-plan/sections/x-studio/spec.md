# X (Twitter) Studio Section

## Overview
Specialized content creation studio for X (formerly Twitter) with thread generation, character optimization, engagement timing, and viral potential analysis for tweets, threads, and visual content.

## User Stories
- As a creator, I want to write engaging tweets within character limits
- As a creator, I want to create viral threads
- As a creator, I want optimal posting times for my audience
- As a creator, I want to generate quote tweet content
- As a creator, I want header and profile image optimization

## Screens

### Main Studio View
- **Left Panel**: Header/visual content designer
- **Center**: Tweet/thread composer
- **Right Panel**: Engagement prediction and timing

### Visual Content Canvas
- Format presets:
  - Header (1500x500)
  - Profile (400x400)
  - Tweet Image (1200x675, 16:9)
  - Tweet Image (1200x1200, 1:1)
  - Card Image (800x418)

### Tweet Composer
- Character counter (280 limit)
- Thread builder (multi-tweet)
- Poll creator
- Media attachment
- Link card preview
- Quote tweet formatter

### Thread Builder
- Multi-tweet composer
- Numbering options (1/, 1/10, etc.)
- Thread hooks and endings
- Call-to-action tweets
- Visual break suggestions

### Engagement Score Card
- Predicted engagement
- Factor breakdown:
  - Hook strength
  - Thread quality
  - Visual appeal
  - Timing optimization
  - Hashtag/mention strategy
- Best posting times
- Quote tweet potential

### Trending Topics Panel
- Current trending topics
- Hashtag performance
- Conversation opportunities
- Newsjacking suggestions

## Components

### XStudio
Main container for X tools

**Props:**
- `userId: string`
- `accountId?: string`
- `brandProfile?: BrandProfile`
- `contentType: 'tweet' | 'thread' | 'header' | 'profile'`

### TweetComposer
Single tweet editor

**Props:**
- `content: string`
- `onChange: (content: string) => void`
- `charCount: number`
- `media: MediaAttachment[]`
- `onMediaAdd: (file: File) => void`
- `poll?: PollConfig`
- `replyTo?: string`

### ThreadBuilder
Multi-tweet thread creator

**Props:**
- `tweets: ThreadTweet[]`
- `onTweetAdd: () => void`
- `onTweetRemove: (index: number) => void`
- `onTweetReorder: (from: number, to: number) => void`
- `numberingStyle: NumberingStyle`
- `onNumberingChange: (style: NumberingStyle) => void`

### CharacterCounter
Visual character limit indicator

**Props:**
- `current: number`
- `limit: number` // 280
- `warningThreshold: number` // 260

### EngagementScoreCard
Engagement prediction

**Props:**
- `score: number`
- `factors: EngagementFactor[]`
- `bestTimes: TimeSlot[]`
- `suggestions: string[]`

### TrendingPanel
Trending topics and hashtags

**Props:**
- `trends: Trend[]`
- `location: string`
- `onTrendSelect: (trend: Trend) => void`
- `category?: string`

### QuoteTweetGenerator
Quote tweet content creator

**Props:**
- `originalTweet: Tweet`
- `generatedQuotes: string[]`
- `onGenerate: () => void`
- `onSelect: (quote: string) => void`

## Data Model

```typescript
interface XContent {
  id: string;
  userId: string;
  contentType: 'tweet' | 'thread';
  tweets: ThreadTweet[];
  media: MediaAttachment[];
  poll?: PollConfig;
  engagementScore: EngagementScore;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
}

interface ThreadTweet {
  id: string;
  content: string;
  charCount: number;
  media?: MediaAttachment;
  order: number;
}

interface PollConfig {
  question: string;
  options: string[]; // 2-4 options
  duration: PollDuration;
}

type PollDuration = '5m' | '1h' | '6h' | '12h' | '1d' | '3d' | '7d';

interface EngagementScore {
  overall: number;
  retweets: number;
  likes: number;
  replies: number;
  factors: EngagementFactor[];
  bestTimes: TimeSlot[];
}

interface Trend {
  name: string;
  tweetCount: number;
  category: string;
  isHashtag: boolean;
}

type NumberingStyle =
  | 'none'
  | 'simple' // 1/
  | 'total' // 1/10
  | 'emoji' // 🧵1/
  | 'custom';
```

## X-Specific Features

### Tweet Optimization
- Character count management
- Link shortening preview (t.co)
- Mention optimization
- Hashtag placement (end preferred)
- Emoji usage analysis

### Thread Best Practices
- Strong hook in first tweet
- One idea per tweet
- Visual breaks every 3-4 tweets
- Numbering for navigation
- Strong CTA in last tweet
- Self-reply structure

### Engagement Timing
- Audience activity analysis
- Time zone optimization
- Day-of-week patterns
- Event/news timing
- Thread posting intervals

### Hashtag Strategy
- 1-2 hashtags maximum
- Trending participation
- Branded hashtag tracking
- Hashtag performance history

### Visual Content
- Header templates with text safe zones
- Profile picture optimization
- Tweet image aspect ratios
- Card image preview
- GIF integration

### Quote Tweet Strategy
- Value-add commentary
- Question prompts
- Contrarian takes
- Thread summaries

## Mobile Considerations
- Character counter prominent
- Swipe between thread tweets
- Trend quick-add
- Schedule bottom sheet
- Native share integration
