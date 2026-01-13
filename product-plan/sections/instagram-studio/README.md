# Instagram Studio

Instagram-focused design tools with engagement prediction, hashtag optimization, and carousel planning.

## Core Features

- **Multi-Format Support**: Post (1:1, 4:5), Story (9:16), Reel (9:16), Carousel
- **Engagement Score**: Prediction algorithm analyzing content, hashtags, timing
- **Hashtag Optimizer**: Category-based sets with reach estimates
- **Grid Preview**: Plan your feed aesthetic
- **Story Templates**: Pre-designed templates with stickers
- **Caption Generator**: AI-powered captions with emoji suggestions

## Files

- `spec.md` — Full section specification
- `types.ts` — TypeScript interfaces (InstagramContent, EngagementScore, HashtagSet, etc.)
- `data.json` — Sample content and configuration data
- `tests.md` — Test scenarios and acceptance criteria

## Key Types

```typescript
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
  category: HashtagCategory;
  avgReach?: number;
}
```

## Mobile Considerations

- Native aspect ratio previews (Stories fill screen)
- Swipe navigation between carousel slides
- Bottom sheet for hashtag selection
- Touch-friendly sticker placement
