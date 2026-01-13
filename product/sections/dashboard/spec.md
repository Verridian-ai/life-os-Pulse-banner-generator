# Dashboard Section Specification

## Overview
The Dashboard is the home view showing recent designs, quick actions, and usage statistics. It's the first screen users see after authentication.

## Section ID
`dashboard`

## Priority
Core

## User Stories
- As a user, I want to see my recent designs so I can quickly continue working
- As a user, I want quick access to create new designs
- As a user, I want to see my usage statistics and remaining credits
- As a free user, I want to understand the benefits of upgrading

## Screens

### Main Dashboard View
The primary dashboard layout with all key information.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Welcome, [Name]!                              [Quick Create]│
├─────────────────────────────────────────────────────────────┤
│  USAGE STATS                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Credits: 45  │ │ Designs: 23  │ │ Projects: 4  │         │
│  │ of 50/month  │ │ this month   │ │ active       │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS                                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│  │ New Design │ │ Templates  │ │ AI Chat    │ │ Brand Kit  ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘│
├─────────────────────────────────────────────────────────────┤
│  RECENT DESIGNS                                    [View All]│
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │      │ │      │ │      │ │      │ │      │              │
│  │  📷  │ │  📷  │ │  📷  │ │  📷  │ │  📷  │              │
│  │      │ │      │ │      │ │      │ │      │              │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- `WelcomeHeader` — Personalized greeting with quick create button
- `UsageStats` — Credit usage, design count, project count
- `QuickActions` — Grid of action cards
- `RecentDesigns` — Horizontal scroll of recent design thumbnails

## Component Props

### DashboardView
```typescript
interface DashboardViewProps {
  user: {
    name: string;
    avatarUrl?: string;
    subscriptionTier: 'free' | 'pro' | 'team';
  };
  stats: {
    creditsUsed: number;
    creditsTotal: number;
    designsThisMonth: number;
    activeProjects: number;
  };
  recentDesigns: Design[];
  onCreateNew: () => void;
  onNavigateToTemplates: () => void;
  onNavigateToAIChat: () => void;
  onNavigateToBrandKit: () => void;
  onOpenDesign: (designId: string) => void;
  onViewAllDesigns: () => void;
}
```

## States

### Empty State
When user has no designs yet.
- Show encouraging message
- Prominent "Create Your First Design" CTA
- Feature highlights for new users

### Free Tier State
- Show upgrade prompt when credits low
- Indicate which features are Pro-only
- Subtle upgrade nudge in usage stats

### Loading State
- Skeleton loaders for stats cards
- Skeleton loaders for design thumbnails
- No layout shift on load

## Interactions

### Design Card Hover
- Scale up slightly (1.02)
- Show design title overlay
- Quick action buttons appear (Edit, Delete, Duplicate)

### Quick Action Cards
- Press scale (0.98)
- Luxury Lag on hover
- Icon animation on active

## Design Tokens Applied
- Primary: Orange for CTAs and active states
- Neutral: Stone for cards and backgrounds
- Motion: Smooth spring for card interactions

## Accessibility
- Skip link to main content
- Keyboard navigation for all cards
- Screen reader announcements for stats
- Focus visible on all interactive elements
