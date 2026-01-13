# Quick Generate Section Specification

## Overview
One-click generation for common design types. Minimal input, maximum output.

## Section ID
`quick-generate`

## Priority
Enhancement

## User Stories
- As a user, I want to create designs with minimal input
- As a user, I want pre-configured options for common use cases
- As a user, I want instant previews before committing
- As a user, I want to quickly iterate through variations

## Screens

### Quick Generate Home
The main quick generation interface.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Quick Generate                                              │
│  Create designs in one click                                 │
├─────────────────────────────────────────────────────────────┤
│  POPULAR                                                     │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │ 🔗             │ │ 📸             │ │ 📱             │   │
│  │ LinkedIn       │ │ Instagram      │ │ Story          │   │
│  │ Banner         │ │ Post           │ │ Template       │   │
│  │ [Generate →]   │ │ [Generate →]   │ │ [Generate →]   │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ALL QUICK ACTIONS                                           │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │ YouTube        │ │ Twitter/X      │ │ Facebook       │   │
│  │ Thumbnail      │ │ Header         │ │ Cover          │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │
│  │ TikTok         │ │ Email          │ │ Presentation   │   │
│  │ Cover          │ │ Header         │ │ Slide          │   │
│  └────────────────┘ └────────────────┘ └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Generation Options Modal
Quick customization before generation.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [✕]              LinkedIn Banner                            │
├─────────────────────────────────────────────────────────────┤
│  QUICK OPTIONS                                               │
│                                                             │
│  Style:  [○ Professional] [○ Creative] [○ Minimal]         │
│                                                             │
│  Mood:   [○ Bold] [○ Calm] [○ Energetic] [○ Elegant]       │
│                                                             │
│  Topic (optional):                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ New product launch                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ☑ Apply my brand colors                                    │
│  ☑ Include my logo                                          │
│                                                             │
│                              [Cancel]  [Generate ✨]        │
└─────────────────────────────────────────────────────────────┘
```

### Instant Preview
Generated result with variations.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]         Your LinkedIn Banner          [✓ Save]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │              MAIN PREVIEW                            │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  VARIATIONS                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Var 1   │ │  Var 2   │ │  Var 3   │ │  Var 4   │       │
│  │ ●Active  │ │          │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  [Regenerate All]  [Edit in Studio]  [Export]              │
└─────────────────────────────────────────────────────────────┘
```

## Component Props

### QuickGenerateView
```typescript
interface QuickGenerateViewProps {
  quickActions: QuickAction[];
  popularActions: QuickAction[];
  recentlyUsed: QuickAction[];
  brandKit?: BrandKit;
  onSelectAction: (actionId: string) => void;
  onGenerate: (actionId: string, options: QuickGenerateOptions) => void;
  onSaveDesign: (design: Design) => void;
  onOpenInStudio: (design: Design) => void;
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  platform: string;
  aspectRatio: string;
  defaultStyle: string;
  usageCount: number;
}

interface QuickGenerateOptions {
  style: 'professional' | 'creative' | 'minimal';
  mood: 'bold' | 'calm' | 'energetic' | 'elegant';
  topic?: string;
  applyBrandColors: boolean;
  includeLogo: boolean;
}
```

## States

### Loading State
- Action cards with skeleton
- Shimmer animation

### Generating State
- Full-screen overlay
- Animated progress
- Encouraging messages
- Cancel option

### Generated State
- Main preview displayed
- Variations visible
- Action buttons active

### Error State
- Friendly error message
- Retry action
- Alternative suggestions

## Interactions

### Action Card Click
- Opens options modal
- Spring scale on press
- Platform icon animation

### Style/Mood Selection
- Radio button groups
- Instant visual feedback
- Preview updates (if applicable)

### Variation Selection
- Click to select
- Active state highlight
- Smooth transition to main preview

### Generate Button
- Bouncy Spring animation
- Disabled during generation
- Orange gradient glow

## Animation Specifications

### Card Interactions
- Hover: Scale 1.02, shadow increase
- Press: Scale 0.98
- Duration: 200ms, luxuryOut

### Generation Progress
- Circular progress with Spring easing
- Pulsing glow effect
- Text fade transitions

### Variation Switch
- Crossfade between images
- Duration: 300ms
- Scale subtle bump

## Design Tokens Applied
- Primary: Orange for generate and active states
- Neutral: Stone for cards and backgrounds
- Motion: Bouncy for CTAs, smooth for transitions
- Surface: Glass for modal backdrop

## Accessibility
- Keyboard navigation for all actions
- Screen reader action descriptions
- Loading state announcements
- Focus visible on all controls
- Skip to main action shortcut
