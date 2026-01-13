# TikTok Studio

TikTok viral content tools with FYP scoring, trend integration, and hook optimization.

## Core Features

- **Viral Score**: 0-100 prediction with FYP potential
- **Trending Sounds**: Browse and preview popular audio
- **Trending Hashtags**: Real-time trending tags with view counts
- **Hook Analyzer**: First 3 seconds optimization
- **Content Templates**: POV, Tutorial, Storytime, Challenge, etc.
- **Caption Generator**: Platform-optimized captions with emojis

## Files

- `spec.md` — Full section specification
- `types.ts` — TypeScript interfaces (TikTokContent, ViralScore, TrendingSound, etc.)
- `data.json` — Sample content and configuration data
- `tests.md` — Test scenarios and acceptance criteria

## Key Types

```typescript
interface ViralScore {
  overall: number;        // 0-100
  fypPotential: number;   // FYP likelihood
  factors: ViralFactor[]; // 4 scoring factors
  suggestions: string[];
  optimalPostTime: Date;
}

interface TrendingSound {
  id: string;
  name: string;
  artist: string;
  usageCount: number;
  trend: TrendStatus;
  previewUrl: string;
  duration: number;
}
```

## Mobile Considerations

- Vertical-first 9:16 canvas (native TikTok ratio)
- Sound preview with waveform visualization
- Swipe to browse trending sounds/hashtags
- Touch-friendly hook timing editor
