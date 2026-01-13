# Milestone 12: YouTube Studio

Build YouTube-optimized content creation tools with CTR scoring and thumbnail optimization.

## Prerequisites
- Foundation complete
- Platform Studio complete
- LinkedIn Studio complete (reference implementation)

## Deliverables

### Components
1. **YouTubeStudio** — Main studio container
2. **ThumbnailDesigner** — Canvas with YouTube safe zones
3. **CTRScoreCard** — Click-through rate prediction display
4. **TitleAnalyzer** — Title optimization panel
5. **DescriptionGenerator** — SEO description builder
6. **KeywordSuggestions** — Search volume-based keyword panel
7. **ThumbnailVariants** — A/B testing thumbnail comparison
8. **CompetitorAnalysis** — Side-by-side thumbnail comparison

### Services
1. **youtubeService** — YouTube Data API integration
2. **ctrScoreService** — CTR calculation algorithm
3. **thumbnailAnalysisService** — Image analysis for thumbnails
4. **keywordService** — Search volume and suggestions

## Data Model

```typescript
interface YouTubeContent {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  format: YouTubeFormat;
  ctrScore: CTRScore;
  status: 'draft' | 'ready' | 'published';
}

interface CTRScore {
  overall: number;           // 0-10% predicted
  factors: CTRFactor[];
  suggestions: string[];
  competitorComparison?: CompetitorAnalysis[];
}

interface CTRFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  suggestion?: string;
}

interface ThumbnailAnalysis {
  faceDetected: boolean;
  facePosition?: { x: number; y: number };
  textReadability: number;
  colorContrast: number;
  emotionScore: number;
  brandConsistency: number;
}
```

## Implementation Notes

### CTR Score Algorithm
Calculate score based on:
- **Text Readability** (25%) — Clear, legible text overlay
- **Face Presence** (20%) — Human faces with emotion
- **Color Contrast** (20%) — Eye-catching saturation
- **Relevance** (20%) — Thumbnail matches title/content
- **Brand Consistency** (15%) — Channel style adherence

### Title Analyzer
- Power word detection (Ultimate, Secret, Proven, etc.)
- Emotional trigger identification
- Number pattern detection (Top 10, 7 Ways, etc.)
- Character count (50-60 optimal)
- Clickability score

### Safe Zones
- Profile picture overlay position
- Watch later button area
- Duration badge placement
- Mobile vs desktop preview

### A/B Testing
- Generate 3-5 thumbnail variants
- Side-by-side CTR comparison
- Track selection history

## Mobile Considerations
- Full-width thumbnail preview with pinch-to-zoom
- Bottom sheet for CTR factors
- Swipe between thumbnail variants
- Touch-optimized text positioning
