# Milestone 8: LinkedIn Content Studio

Build the specialized LinkedIn content creation tools.

## Prerequisites
- Foundation complete
- Platform Studio complete
- Chat & Brainstorm complete

## Deliverables

### Components
1. **LinkedInContentStudio** — Main studio container
2. **CopywritingPanel** — AI writing assistance interface
3. **ViralScoreCard** — Content performance prediction display
4. **LinkedInImageGenerator** — Image generation for posts
5. **PostPreview** — LinkedIn post mockup
6. **LinkedInPublishModal** — Publishing workflow
7. **ToneSelector** — Writing tone options

### Services
1. **linkedinService** — LinkedIn API integration
2. **viralScoreService** — Score calculation logic
3. **copywritingService** — AI rewrite functionality

## Data Model

```typescript
interface LinkedInPost {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  hashtags: string[];
  viralScore: ViralScore;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
}

interface ViralScore {
  overall: number;
  factors: ScoreFactor[];
  suggestions: string[];
}

interface ScoreFactor {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  suggestion?: string;
}
```

## Implementation Notes

### Viral Score Algorithm
Calculate score based on:
- **Hook strength** (25%) — First line engagement
- **Structure** (20%) — Formatting, whitespace, lists
- **Engagement potential** (25%) — Questions, CTAs
- **Hashtags** (15%) — Relevance and count
- **Length** (15%) — Optimal character count

### AI Copywriting
- Tone options: Professional, Casual, Inspiring, Educational, Storytelling
- Rewrite button generates alternative
- Hashtag suggestions based on content
- Character count with optimal range indicator

### Post Preview
- Accurate LinkedIn post mockup
- Profile picture and name
- Content with formatting
- Engagement buttons (visual only)

### Publishing
- OAuth integration with LinkedIn
- Schedule for later option
- Multiple account support
- Draft saving

## Mobile Considerations
- Tab navigation between panels
- Full-screen preview mode
- Bottom sheet for publish options
- Touch-optimized text editor
