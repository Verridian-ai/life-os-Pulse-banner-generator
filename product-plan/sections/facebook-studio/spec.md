# Facebook Studio Section

## Overview
Specialized content creation studio for Facebook with post optimization, event covers, ad creative generation, and engagement prediction for personal profiles, pages, and groups.

## User Stories
- As a page admin, I want to create engaging posts
- As a marketer, I want to generate ad creatives
- As an event organizer, I want professional event covers
- As a group admin, I want discussion-starting content
- As a user, I want to schedule posts for optimal times

## Screens

### Main Studio View
- **Left Panel**: Content design canvas
- **Center**: Post composer with AI assistance
- **Right Panel**: Engagement prediction and scheduling

### Content Canvas
- Format presets:
  - Cover Photo (820x312)
  - Post Image (1200x630)
  - Event Cover (1920x1080)
  - Group Cover (1640x856)
  - Ad Creative (various)
  - Video Thumbnail (1280x720)

### Post Composer
- Rich text editor
- Link preview generator
- Poll creator
- Photo/video attachment
- Location tagging
- Audience selector

### Ad Creative Generator
- Ad format selector (single image, carousel, video)
- Headline and body text
- CTA button options
- Audience targeting preview
- A/B variant generation

### Event Cover Designer
- Event-specific templates
- Date/time overlay
- Location badge
- Ticket info integration

### Engagement Score Card
- Predicted reach and engagement
- Factor breakdown:
  - Content type bonus
  - Visual quality
  - Text engagement
  - Timing optimization
  - Audience match
- Boost recommendation
- Best posting times

## Components

### FacebookStudio
Main container for Facebook tools

**Props:**
- `userId: string`
- `pageId?: string`
- `groupId?: string`
- `contentType: 'post' | 'ad' | 'event' | 'cover'`
- `brandProfile?: BrandProfile`

### PostComposer
Rich post creation interface

**Props:**
- `content: string`
- `onChange: (content: string) => void`
- `attachments: Attachment[]`
- `onAttach: (file: File) => void`
- `linkPreview?: LinkPreview`
- `audience: AudienceType`

### AdCreativeGenerator
Ad content creation

**Props:**
- `format: AdFormat`
- `headline: string`
- `body: string`
- `cta: CTAType`
- `images: string[]`
- `onGenerate: (prompt: string) => void`
- `variants: AdVariant[]`

### EventCoverDesigner
Event-specific cover creator

**Props:**
- `eventDetails: EventDetails`
- `template: EventTemplate`
- `onTemplateChange: (template: EventTemplate) => void`
- `overlayOptions: OverlayOptions`

### AudienceSelector
Target audience picker

**Props:**
- `audience: AudienceConfig`
- `onChange: (audience: AudienceConfig) => void`
- `estimatedReach: number`

### SchedulePanel
Post scheduling interface

**Props:**
- `scheduledAt?: Date`
- `onSchedule: (date: Date) => void`
- `bestTimes: TimeSlot[]`
- `timezone: string`

## Data Model

```typescript
interface FacebookContent {
  id: string;
  userId: string;
  pageId?: string;
  groupId?: string;
  contentType: 'post' | 'ad' | 'event' | 'cover';
  text: string;
  mediaUrls: string[];
  linkUrl?: string;
  linkPreview?: LinkPreview;
  audience: AudienceConfig;
  engagementScore: EngagementScore;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
}

interface AdVariant {
  id: string;
  headline: string;
  body: string;
  imageUrl: string;
  cta: CTAType;
  predictedCTR: number;
}

interface EventDetails {
  name: string;
  date: Date;
  location: string;
  description: string;
  ticketUrl?: string;
}

interface AudienceConfig {
  type: 'public' | 'friends' | 'custom';
  targetingCriteria?: TargetingCriteria;
  estimatedReach: number;
}

type CTAType =
  | 'learn_more'
  | 'shop_now'
  | 'sign_up'
  | 'book_now'
  | 'contact_us'
  | 'download'
  | 'get_offer';
```

## Facebook-Specific Features

### Post Optimization
- Optimal length analysis (40-80 chars for engagement)
- Question prompts for comments
- Emoji usage guidelines
- Link placement strategy
- Native video preference indicator

### Ad Creative Best Practices
- 20% text rule checker (for images)
- Headline length optimization
- CTA effectiveness scoring
- Mobile preview
- Audience size estimation

### Event Promotion
- Cover image templates
- RSVP driving content
- Reminder post suggestions
- Cross-promotion to groups

### Group Engagement
- Discussion starter prompts
- Poll suggestions
- Community guideline alignment
- Peak activity times

## Mobile Considerations
- Full-screen composer
- Swipe between formats
- Bottom sheet for scheduling
- Native image picker
- Share sheet integration
