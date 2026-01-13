# Design Studio Section Specification

## Overview
The Design Studio is the main creative workspace where users generate and refine designs. It includes the AI generation interface, canvas preview, and editing tools.

## Section ID
`design-studio`

## Priority
Core

## User Stories
- As a user, I want to describe what I want and have AI generate it
- As a user, I want to see real-time previews of my design
- As a user, I want to adjust colors, typography, and effects
- As a user, I want to export my design in various formats and sizes

## Screens

### Generation View
The initial prompt-based generation interface.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]              Design Studio              [Export ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────────┐                      │
│                    │                 │                      │
│                    │                 │                      │
│                    │    CANVAS       │                      │
│                    │    PREVIEW      │                      │
│                    │                 │                      │
│                    │                 │                      │
│                    └─────────────────┘                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Platform: [LinkedIn ▼]    Aspect: [1:1 ▼]    Style: [▼]   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Describe your design...                         🎤  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                              [Generate ✨]   │
└─────────────────────────────────────────────────────────────┘
```

### Editor View
Post-generation editing interface.

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  [← Back]           Editing: Design Name           [Export ▼]│
├────────────┬─────────────────────────────────┬───────────────┤
│ LAYERS     │                                 │  PROPERTIES   │
│ ────────   │                                 │  ──────────   │
│ □ Text 1   │                                 │  Fill         │
│ □ Shape 1  │         CANVAS                  │  [#f97316] ▼  │
│ □ Image 1  │         PREVIEW                 │               │
│            │                                 │  Opacity      │
│            │                                 │  [━━━━━●━] 80%│
│            │                                 │               │
│ [+ Layer]  │                                 │  Effects      │
│            │                                 │  ☑ Shadow     │
├────────────┴─────────────────────────────────┴───────────────┤
│  [Undo] [Redo]  │  Zoom: [100%]  │  [Regenerate] [Save Draft]│
└──────────────────────────────────────────────────────────────┘
```

## Component Props

### DesignStudioView
```typescript
interface DesignStudioViewProps {
  mode: 'generate' | 'edit';
  design?: Design;
  platforms: Platform[];
  selectedPlatform: string;
  selectedAspectRatio: string;
  isGenerating: boolean;
  generationProgress?: number;
  onGenerate: (prompt: string, options: GenerationOptions) => void;
  onSave: (design: Design) => void;
  onExport: (format: ExportFormat) => void;
  onBack: () => void;
}

interface GenerationOptions {
  platform: string;
  aspectRatio: string;
  style?: string;
  brandKitId?: string;
}

type ExportFormat = 'png' | 'jpg' | 'webp' | 'svg' | 'pdf';
```

## States

### Empty State
- Welcoming prompt area
- Platform/aspect ratio selectors
- Example prompts for inspiration

### Generating State
- Animated progress indicator
- "Generating your design..." message
- Luxury Lag loading animation
- Cancel option

### Generated State
- Full canvas preview
- Switch to editor controls
- Save/export options visible

### Error State
- Clear error message
- "Try Again" action
- Suggestion for better prompts

## Interactions

### Prompt Input
- Voice input button with Spring animation
- Character count indicator
- Submit on Enter (with Shift+Enter for newline)

### Canvas Interactions
- Pan: Click and drag
- Zoom: Scroll wheel or pinch
- Select: Click elements
- Multi-select: Shift+click

### Generate Button
- Bouncy Spring animation on click
- Disabled during generation
- Orange gradient with glow

## Voice Integration
- Mic button activates voice input
- Visual feedback during listening
- Transcript appears in input field
- Uses voice agent connection state

## Design Tokens Applied
- Primary: Orange for generate button and focus states
- Accent: Emerald for success states
- Neutral: Stone for panels and controls
- Motion: Bouncy spring for main CTA, smooth for canvas

## Accessibility
- Voice input alternative
- Keyboard shortcuts for common actions
- High contrast mode for canvas
- Screen reader descriptions for generated content
