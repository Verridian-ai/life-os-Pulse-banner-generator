# X (Twitter) Studio

X/Twitter content creation tools with thread building, engagement timing, and character optimization.

## Core Features

- **Thread Builder**: Multi-tweet composer with numbering styles
- **Character Optimization**: 280-char limit with link shortening
- **Engagement Score**: Prediction based on hooks, structure, timing
- **Best Time Analysis**: Audience activity-based scheduling
- **Quote Tweet Generator**: AI-suggested angles for engagement
- **Media Formats**: Header (3:1), Profile (1:1), Tweet images

## Files

- `spec.md` — Full section specification
- `types.ts` — TypeScript interfaces (XContent, ThreadTweet, EngagementScore, etc.)
- `data.json` — Sample content and configuration data
- `tests.md` — Test scenarios and acceptance criteria

## Key Types

```typescript
interface XContent {
  id: string;
  userId: string;
  contentType: XContentType;
  tweets: ThreadTweet[];
  media: MediaAttachment[];
  poll?: PollConfig;
  engagementScore: EngagementScore;
  status: ContentStatus;
}

interface EngagementScore {
  overall: number;
  retweets: number;
  likes: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  factors: EngagementFactor[];
  bestTimes: TimeSlot[];
  viralPotential: number;
}
```

## Mobile Considerations

- Thread preview matching X mobile layout
- Swipe between tweets in thread
- Bottom sheet for numbering style selection
- Touch-friendly tweet reordering (drag-drop)
