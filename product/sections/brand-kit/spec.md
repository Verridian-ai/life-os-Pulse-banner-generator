# Brand Kit Section Specification

## Overview
Brand asset management including logos, colors, fonts, and design guidelines. Ensures consistency across all generated designs.

## Section ID
`brand-kit`

## Priority
Enhancement

## User Stories
- As a user, I want to upload and manage my brand logos
- As a user, I want to define my brand color palette
- As a user, I want to select typography for my brand
- As a user, I want my brand applied automatically to designs

## Screens

### Brand Kit Overview
The main brand management dashboard.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Brand Kit                                    [Export Kit]   │
├─────────────────────────────────────────────────────────────┤
│  BRAND IDENTITY                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [Logo]     Brand Name: My Company                      │ │
│  │             Tagline: Innovation for everyone            │ │
│  │             [Edit Brand Info]                           │ │
│  └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  LOGOS                                           [+ Upload] │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  Primary │ │   Dark   │ │  Light   │                    │
│  │   Logo   │ │  Mode    │ │  Mode    │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
├─────────────────────────────────────────────────────────────┤
│  COLOR PALETTE                                    [+ Add]   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │ Primary│ │Second. │ │ Accent │ │Neutral │ │ Text   │   │
│  │#f97316 │ │#10b981 │ │#f59e0b │ │#292524 │ │#fafaf9 │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
├─────────────────────────────────────────────────────────────┤
│  TYPOGRAPHY                                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Heading: Space Grotesk                    [Change]     │ │
│  │  Body: System UI                           [Change]     │ │
│  └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  BRAND VOICE                                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tone: Professional, friendly                          │ │
│  │  Keywords: Innovative, reliable, modern                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Color Picker Modal
Interface for adding/editing colors.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [✕]                    Pick Color                           │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │               COLOR PICKER WHEEL                       │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  HEX: [#f97316]     RGB: [249] [115] [22]                  │
│                                                             │
│  Color Name: [Primary Orange          ]                     │
│  Usage: [Primary brand color          ]                     │
│                                                             │
│                                        [Cancel] [Save]      │
└─────────────────────────────────────────────────────────────┘
```

## Component Props

### BrandKitView
```typescript
interface BrandKitViewProps {
  brandKit: BrandKit;
  isLoading: boolean;
  isSaving: boolean;
  onUpdateBrandInfo: (info: BrandInfo) => void;
  onUploadLogo: (file: File, variant: LogoVariant) => void;
  onDeleteLogo: (variant: LogoVariant) => void;
  onAddColor: (color: BrandColor) => void;
  onUpdateColor: (colorId: string, color: BrandColor) => void;
  onDeleteColor: (colorId: string) => void;
  onUpdateTypography: (typography: BrandTypography) => void;
  onUpdateVoice: (voice: BrandVoice) => void;
  onExportKit: () => void;
}

interface BrandKit {
  id: string;
  name: string;
  tagline?: string;
  logos: {
    primary?: string;
    dark?: string;
    light?: string;
    icon?: string;
  };
  colors: BrandColor[];
  typography: BrandTypography;
  voice: BrandVoice;
}

interface BrandColor {
  id: string;
  name: string;
  hex: string;
  usage: string;
}

type LogoVariant = 'primary' | 'dark' | 'light' | 'icon';
```

## States

### Empty State
- Welcoming illustration
- "Set up your brand" message
- Step-by-step guide
- Quick start wizard option

### Incomplete State
- Progress indicator
- Highlight missing elements
- Suggestions for completion

### Loading State
- Skeleton loaders for each section
- Shimmer animation on cards

## Interactions

### Logo Upload
- Drag and drop support
- Click to browse
- Preview before confirm
- Crop/resize option

### Color Swatches
- Click to edit
- Hover shows color code
- Delete on hover (X button)
- Drag to reorder

### Export Kit
- Downloads brand kit package
- Includes all assets and specifications
- PDF + asset files

## Anti-Slop Integration
- Warn if user picks banned colors (teal, purple)
- Suggest alternatives from Anti-Slop palette
- Show comparison between slop and anti-slop choices

## Design Tokens Applied
- Primary: Orange for active states and CTAs
- Neutral: Stone for cards and sections
- Motion: Smooth spring for interactions
- Surface: Glass panels for modals

## Accessibility
- Color contrast checker built-in
- Alt text required for logos
- Keyboard navigation for color picker
- Screen reader color descriptions
