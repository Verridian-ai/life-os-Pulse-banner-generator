# Milestone 16: X (Twitter) Studio

Build X/Twitter content creation tools with thread building and engagement optimization.

## Prerequisites
- Foundation complete
- Platform Studio complete
- LinkedIn Studio complete (text-focused reference)

## Deliverables

### Components
1. **XStudio** — Main studio container
2. **ThreadBuilder** — Multi-tweet composer with reordering
3. **EngagementScoreCard** — Engagement prediction display
4. **CharacterCounter** — 280-char limit tracker
5. **NumberingStyleSelector** — Thread numbering options
6. **BestTimePanel** — Optimal posting time display
7. **QuoteTweetGenerator** — AI quote angle suggestions
8. **TweetPreview** — X post mockup
9. **MediaFormatSelector** — Header, profile, tweet images

### Services
1. **xService** — X API v2 integration
2. **engagementService** — Engagement calculation
3. **threadAnalysisService** — Thread structure analysis
4. **quoteSuggestionService** — Quote angle generation

## Data Model

```typescript
interface XContent {
  id: string;
  userId: string;
  contentType: 'tweet' | 'thread' | 'quote' | 'reply';
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

interface ThreadAnalysis {
  tweetCount: number;
  totalChars: number;
  hasHook: boolean;
  hasCTA: boolean;
  hasVisualBreaks: boolean;
  readingTime: number;
  suggestions: string[];
}
```

## Implementation Notes

### Engagement Score Algorithm
Calculate score based on:
- **Hook Strength** (30%) — First tweet engagement potential
- **Thread Structure** (25%) — Formatting, flow, numbering
- **Post Timing** (20%) — Audience activity alignment
- **Engagement Potential** (25%) — Reply and share drivers

### Thread Builder
- Add/remove tweets
- Drag-drop reordering
- Numbering styles: None, Simple (1/), Total (1/10), Emoji (🧵1/)
- Per-tweet character count
- Visual break suggestions (add images)

### Character Optimization
- 280 character limit
- Link shortening (23 chars per link)
- Mention and hashtag tracking
- Optimal length: 71-100 chars for single tweets

### Quote Tweet Generator
6 angles: Agree & Expand, Disagree, Add Context, Ask Question, Humor, Summarize

### Thread Best Practices
- Strong hook (credibility + promise)
- One idea per tweet
- Visual breaks every 3-4 tweets
- End with CTA (follow, retweet, reply)
- Post at 8-9am or 12pm audience timezone

## Mobile Considerations
- Thread preview matching X mobile layout
- Swipe between tweets in thread
- Bottom sheet for numbering style selection
- Touch-friendly tweet reordering (drag-drop)
