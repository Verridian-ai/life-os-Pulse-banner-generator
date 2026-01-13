# Facebook Studio

Facebook content creation suite with ad creative generation, boost recommendations, and audience targeting.

## Core Features

- **Multi-Format Support**: Post (1.91:1), Cover (2.63:1), Event (16:9), Story (9:16)
- **Ad Creative Generator**: Multiple variants with CTA buttons
- **Boost Recommendations**: Budget estimates and reach predictions
- **Engagement Analysis**: 5-factor scoring system
- **CTA Selection**: 8 button options (Learn More, Shop Now, etc.)
- **Post Optimizer**: Length and formatting suggestions

## Files

- `spec.md` — Full section specification
- `types.ts` — TypeScript interfaces (FacebookContent, AdVariant, BoostRecommendation, etc.)
- `data.json` — Sample content and configuration data
- `tests.md` — Test scenarios and acceptance criteria

## Key Types

```typescript
interface FacebookEngagementScore {
  overall: number;
  reach: number;
  reactions: number;
  comments: number;
  shares: number;
  factors: EngagementFactor[];
  boostRecommendation: BoostRecommendation;
  bestTimes: TimeSlot[];
}

interface AdVariant {
  id: string;
  headline: string;
  body: string;
  imageUrl: string;
  cta: CTAType;
  predictedCTR: number;
  predictedCPC: number;
}
```

## Mobile Considerations

- Full-width post preview matching Facebook mobile
- Bottom sheet for CTA and boost options
- Swipe between ad variants
- Touch-friendly text editing
