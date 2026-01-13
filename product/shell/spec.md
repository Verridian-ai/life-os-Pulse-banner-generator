# Signal — Application Shell Specification

## Overview

The Application Shell provides the persistent navigation and layout that wraps all sections of Signal. It implements the Anti-Slop design philosophy with Luxury Lag physics and Good Friction interactions.

## Design Philosophy

- **Anti-Slop**: Orange/Emerald palette (no teal/purple)
- **Luxury Lag**: Spring physics on all interactive elements
- **Visual Weight**: Pinball Pattern gaze hierarchy
- **Good Friction**: Intentional resistance creating engagement

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (fixed, glassmorphic, h-16)                         │
│  ┌─────────┬──────────────────────────────┬──────────────┐  │
│  │ Logo    │     Search (desktop)          │  User Menu  │  │
│  └─────────┴──────────────────────────────┴──────────────┘  │
├───────────────┬─────────────────────────────────────────────┤
│ SIDEBAR       │                                             │
│ (desktop)     │                                             │
│ w-64          │           MAIN CONTENT                      │
│               │                                             │
│ Nav Items     │           (scrollable)                      │
│ ───────────   │                                             │
│ ───────────   │                                             │
│ ───────────   │                                             │
│               │                                             │
│ ┌───────────┐ │                                             │
│ │ Upgrade   │ │                                             │
│ │ CTA       │ │                                             │
│ └───────────┘ │                                             │
├───────────────┴─────────────────────────────────────────────┤
│  BOTTOM NAV (mobile only, fixed)                            │
│  ┌────┬────┬─────────┬────┬────┐                           │
│  │ ◯  │ ◯  │   (+)   │ ◯  │ ◯  │                           │
│  └────┴────┴─────────┴────┴────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. AppShell

The main wrapper component that orchestrates all shell elements.

**Props:**
```typescript
interface AppShellProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  activeItemId: string;
  onNavigate: (id: string) => void;
  onCreateNew?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  // Voice Agent
  showVoiceAgent?: boolean;
  isVoiceActive?: boolean;
  voiceConnectionState?: ConnectionState;
  onToggleVoice?: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';
```

**Features:**
- Responsive layout (sidebar → bottom nav at `lg` breakpoint)
- Glassmorphic header with blur and subtle border
- Mobile menu drawer with smooth transitions
- Voice agent button with Spring physics

### 2. Header

Fixed header with glassmorphic styling.

**Styling:**
```css
background: rgba(12, 10, 9, 0.8);
backdrop-filter: blur(20px) saturate(180%);
border-bottom: 1px solid rgba(255, 255, 255, 0.04);
```

**Elements:**
- **Logo**: Orange gradient with Sparkles icon
- **Search**: Centered input with focus states (desktop only)
- **Settings Button**: Stone button with hover states (md+ only)
- **User Menu**: Avatar or sign-in button

### 3. MainNav (Desktop Sidebar)

Fixed sidebar with navigation items and upgrade CTA.

**Dimensions:**
- Width: 256px (w-64)
- Position: Fixed, top-16 (below header)

**Navigation Items:**
- Active: Orange gradient background, animated indicator bar
- Hover: Subtle white background, icon shift
- Press: Scale 0.98

**Upgrade CTA:**
- Crown badge with rotation on hover
- Orange gradient button
- Glow effect on hover

### 4. BottomNav (Mobile)

Fixed bottom navigation with FAB.

**Layout:**
- 4 nav items maximum (2 left, 2 right of FAB)
- Central FAB for primary action
- Safe area padding for notched devices

**FAB Styling:**
```css
background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
box-shadow: 0 8px 32px rgba(249, 115, 22, 0.4);
border: 2px solid rgba(255, 255, 255, 0.1);
```

**Interactions:**
- Press: Spring scale to 0.9
- Click: Bounce sequence (0.85 → 1.05 → 1)

### 5. Voice Agent Button

Floating action button for voice activation.

**Position:**
- Mobile: bottom-24 right-4
- Desktop: bottom-8 right-8

**States:**
| State | Color | Shadow |
|-------|-------|--------|
| Disconnected | Orange | Orange glow |
| Connecting | Amber | Amber glow + spinner |
| Connected | Emerald | Emerald glow + ping animation |
| Error | Red | Red glow |

**Interactions:**
- Press: Spring scale with 'bouncy' preset
- Connected: Continuous ping animation

### 6. UserMenu

Avatar dropdown with user actions.

**States:**
- Authenticated: Avatar with dropdown (profile, settings, sign out)
- Unauthenticated: "Sign In" button

## Responsive Behavior

| Breakpoint | Sidebar | Bottom Nav | FAB Position |
|------------|---------|------------|--------------|
| < lg | Hidden | Visible | bottom-24 |
| >= lg | Visible | Hidden | bottom-8 |

## Animation Specifications

### Spring Presets Used
- **bouncy**: FAB press/release
- **smooth**: Indicator bar animation
- **snappy**: Icon transitions

### Easing Curves
- **luxuryOut**: Menu transitions, hover states
- **magnetic**: Icon hover shifts

### Durations
- Button press: 100ms
- Hover transitions: 200ms
- Menu drawer: 300ms
- Indicator bar: 300ms

## Color Specifications

### Surfaces
| Element | Light | Dark |
|---------|-------|------|
| Background | - | stone-950 |
| Header | - | rgba(12, 10, 9, 0.8) |
| Sidebar | - | rgba(12, 10, 9, 0.6) |
| Bottom Nav | - | stone-950/90 |
| Card | - | rgba(28, 25, 23, 0.8) |

### Accents
| Purpose | Color |
|---------|-------|
| Primary action | orange-500 (#f97316) |
| Active indicator | orange-500 → orange-600 gradient |
| Success/Connected | emerald-500 (#10b981) |
| Warning/Connecting | amber-500 (#f59e0b) |
| Error | red-500 (#ef4444) |

### Text
| Level | Color |
|-------|-------|
| Primary | stone-50 |
| Secondary | stone-300 |
| Tertiary | stone-400 |
| Muted | stone-500 |

## Accessibility

- All interactive elements have minimum 44px touch target
- Focus-visible rings on all buttons
- ARIA labels for icon-only buttons
- Semantic heading structure
- Keyboard navigation support
- Screen reader announcements for state changes

## Files

```
src/components/shell/
├── AppShell.tsx      # Main shell wrapper
├── MainNav.tsx       # Desktop sidebar
├── BottomNav.tsx     # Mobile bottom nav with FAB
├── UserMenu.tsx      # User avatar dropdown
└── index.ts          # Barrel export

src/hooks/
└── useSpring.ts      # Spring physics hook
```
