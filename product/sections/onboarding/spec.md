# Onboarding Section Specification

## Overview
First-run experience guiding new users through brand setup, preferences, and first design creation.

## Section ID
`onboarding`

## Priority
Core

## User Stories
- As a new user, I want a welcoming first experience
- As a new user, I want to set up my brand quickly
- As a new user, I want to create my first design with guidance
- As a new user, I want to understand the app's key features

## Screens

### Welcome Screen
The first screen new users see.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         ✨                                   │
│                                                             │
│              Welcome to Signal                              │
│                                                             │
│         Create stunning designs with AI                     │
│         in seconds, not hours.                              │
│                                                             │
│                                                             │
│                    [Get Started →]                          │
│                                                             │
│                                                             │
│         ○ ○ ○ ○ ○  (progress dots)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Brand Colors Step
Quick brand color selection.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]                                      [Skip →]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              What are your brand colors?                    │
│              (You can change these later)                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PRIMARY COLOR                                       │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │   │
│  │  │ 🟠 │ │ 🔵 │ │ 🟢 │ │ 🟣 │ │ 🔴 │ │ ⚫ │ │ ➕  │ │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PREVIEW                                             │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │   Sample design with selected colors          │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│         ● ○ ○ ○ ○                       [Continue →]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### First Design Step
Guided first design creation.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              Create your first design!                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CHOOSE A TEMPLATE                                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │ LinkedIn │ │Instagram │ │  Custom  │             │   │
│  │  │  Banner  │ │   Post   │ │  Prompt  │             │   │
│  │  └──────────┘ └──────────┘ └──────────┘             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💡 Try this prompt:                                 │   │
│  │  "A professional banner announcing our new product"  │   │
│  │  [Use This Prompt]                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│         ○ ○ ● ○ ○                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Completion Screen
Success and next steps.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         🎉                                   │
│                                                             │
│              You're all set!                                │
│                                                             │
│         Your first design is ready.                         │
│         Here's what you can do next:                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ○ Explore Templates                                 │   │
│  │  ○ Set up your full Brand Kit                       │   │
│  │  ○ Create more designs                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                    [Go to Dashboard →]                      │
│                                                             │
│         ○ ○ ○ ○ ●                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Props

### OnboardingFlow
```typescript
interface OnboardingFlowProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  brandColors: {
    primary?: string;
    secondary?: string;
  };
  firstDesign?: Design;
  onSelectColor: (type: 'primary' | 'secondary', color: string) => void;
  onSelectTemplate: (templateType: string) => void;
  onGenerateDesign: (prompt: string) => void;
  onSkipStep: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'brand-colors' | 'first-design' | 'generating' | 'complete';
```

## States

### Welcome State
- Animated logo entrance
- Fade-in content
- Spring-animated CTA button

### Generating State
- Progress animation
- Encouraging messages
- Cancel option

### Complete State
- Celebration animation
- Confetti effect (subtle)
- Options for next steps

## Interactions

### Color Selection
- Click to select
- Real-time preview update
- Spring bounce on selection

### Step Navigation
- Swipe on mobile
- Keyboard arrows
- Progress dots clickable

### Skip Actions
- Available on non-critical steps
- Confirms skip action
- Records for later prompting

## Animation Specifications

### Step Transitions
- Slide left/right between steps
- Fade for skip actions
- Duration: 300ms
- Easing: luxuryOut

### Welcome Animation
- Logo scale-in: 0 → 1 over 500ms
- Text fade-in: delayed 200ms
- CTA bounce-in: delayed 400ms

### Celebration
- Subtle confetti particles
- Success checkmark animation
- Scale and fade

## Design Tokens Applied
- Primary: Orange throughout for warmth
- Neutral: Stone for backgrounds
- Motion: Bouncy spring for selections
- Semantic: Emerald for success/completion

## Accessibility
- Can skip animations
- Keyboard navigation
- Screen reader step announcements
- High contrast option
- Focus visible on all controls
