# YouTube Studio

YouTube-optimized content creation tools with CTR scoring, thumbnail optimization, and SEO analysis.

## Core Features

- **Thumbnail Designer**: Canvas with YouTube safe zones and profile overlay preview
- **CTR Score**: Prediction algorithm (0-10%) analyzing 5 key factors
- **Title Analyzer**: Power words, emotional triggers, and length optimization
- **Description Generator**: SEO-optimized descriptions with timestamps
- **Tags & Keywords**: Suggestions with search volume estimates
- **Competitor Analysis**: Compare thumbnails with similar videos

## Files

- `spec.md` — Full section specification
- `types.ts` — TypeScript interfaces (YouTubeContent, CTRScore, ThumbnailAnalysis, etc.)
- `data.json` — Sample content and configuration data
- `tests.md` — Test scenarios and acceptance criteria

## Key Types

```typescript
interface CTRScore {
  overall: number;           // 0-10% predicted CTR
  factors: CTRFactor[];      // 5 scoring factors
  suggestions: string[];     // Improvement tips
  competitorComparison?: CompetitorAnalysis[];
}

interface ThumbnailAnalysis {
  faceDetected: boolean;
  textReadability: number;
  colorContrast: number;
  emotionScore: number;
  brandConsistency: number;
}
```

## Mobile Considerations

- Full-width thumbnail preview with pinch-to-zoom
- Bottom sheet for CTR factors and suggestions
- Swipe between thumbnail variants
- Touch-optimized text overlay positioning
