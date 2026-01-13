# Mobile-First Design Guidelines

Signal follows a mobile-first approach where designs start with the smallest screen and progressively enhance for larger displays.

## Core Principles

### 1. Touch-First Interactions
- **Minimum touch target**: 48×48px (Apple HIG) / 48dp (Material)
- **Touch feedback**: Immediate visual response on press
- **Haptic feedback**: Use for confirmations and key actions
- **Gesture support**: Swipe, pinch-to-zoom, pull-to-refresh

### 2. Progressive Enhancement
Design for mobile first, then add features for larger screens:
```
Mobile (< 640px)  → Base experience
Tablet (640-1024px) → Enhanced layouts
Desktop (> 1024px) → Full feature set
```

### 3. Content Priority
- Most important content visible without scrolling
- Secondary actions in menus or bottom sheets
- Progressive disclosure for complex features

## Layout Patterns

### Navigation

**Mobile (< 1024px)**
- Bottom navigation bar with 4 items + center FAB
- Hamburger menu for additional items
- Sticky header with back button
- Full-screen modals for flows

**Desktop (≥ 1024px)**
- Left sidebar (256px width)
- Top header with search
- In-page modals and drawers

### Grids

| Screen Size | Columns | Gutter | Margin |
|-------------|---------|--------|--------|
| Mobile | 1-2 | 16px | 16px |
| Tablet | 2-3 | 24px | 24px |
| Desktop | 3-6 | 24px | 32px |

### Common Responsive Patterns

**Platform Cards (Dashboard)**
```
Mobile: 2 columns, full-width
Tablet: 3 columns
Desktop: 6 columns
```

**Template/Design Cards**
```
Mobile: 1 column (portrait), 2 columns (landscape)
Tablet: 2-3 columns
Desktop: 4 columns
```

**Forms**
```
Mobile: Single column, full-width inputs
Desktop: Multi-column where appropriate
```

## Component Adaptations

### Dropdowns → Bottom Sheets
On mobile, replace dropdown menus with bottom sheets for better touch interaction.

### Hover States → Tap States
Replace hover effects with:
- Press/active states
- Long-press for secondary actions
- Tap to reveal actions

### Sidebars → Full-Screen
Generative sidebar and panels become full-screen modals on mobile.

### Tooltips → In-Context Help
Replace tooltips with:
- Help icons that open modals
- Inline help text
- Onboarding overlays

## Touch Targets

### Minimum Sizes
- **Buttons**: 44×44px minimum
- **List items**: 48px height minimum
- **Form inputs**: 44px height minimum
- **Icons (tappable)**: 44×44px hit area

### Spacing
- **Between touch targets**: 8px minimum
- **Edge distance**: 16px from screen edge

## Gestures

### Standard Gestures
| Gesture | Action |
|---------|--------|
| Tap | Select/activate |
| Double-tap | Zoom/focus |
| Long-press | Context menu |
| Swipe left | Delete/archive |
| Swipe right | Primary action |
| Pull down | Refresh |
| Pinch | Zoom |
| Two-finger rotate | Rotate element |

### Canvas-Specific Gestures
| Gesture | Action |
|---------|--------|
| Single-finger drag | Pan canvas |
| Two-finger pinch | Zoom canvas |
| Tap element | Select |
| Drag element | Move |
| Two-finger on element | Rotate |

## Performance

### Mobile Optimizations
- Lazy load images below the fold
- Use skeleton screens during loading
- Prefetch likely next screens
- Compress images for mobile bandwidth
- Defer non-critical JavaScript

### Image Sizes
| Context | Max Width | Format |
|---------|-----------|--------|
| Thumbnails | 300px | WebP |
| Cards | 600px | WebP |
| Full preview | 1200px | WebP/JPEG |
| High-res export | Original | PNG/JPEG |

## Accessibility

### Mobile A11y Requirements
- VoiceOver (iOS) / TalkBack (Android) support
- Sufficient color contrast (4.5:1 text, 3:1 UI)
- Focus indicators visible
- Touch targets meet size requirements
- Screen reader announcements for state changes
- Reduced motion support

### Focus Management
- Logical focus order
- Focus trap in modals
- Return focus on modal close
- Skip navigation links

## Typography

### Responsive Type Scale
| Element | Mobile | Desktop |
|---------|--------|---------|
| H1 | 24px | 32px |
| H2 | 20px | 24px |
| H3 | 16px | 18px |
| Body | 14px | 14px |
| Caption | 12px | 12px |

### Line Length
- Maximum: 65-75 characters
- Mobile: Typically 40-50 characters

## Dark Mode

Signal uses dark mode by default:
- Background: zinc-950 (#09090b)
- Surface: zinc-900 (#18181b)
- Border: white/10 opacity
- Primary: sky-500 → teal-500 gradient
- Text: white / zinc-400

All UI must maintain contrast in both light and dark modes.

## Testing Checklist

### Device Testing
- [ ] iPhone SE (smallest supported)
- [ ] iPhone 14/15 Pro
- [ ] iPad Mini
- [ ] iPad Pro
- [ ] Android phone (various sizes)
- [ ] Android tablet

### Interaction Testing
- [ ] All touch targets are 48px+
- [ ] No hover-only interactions
- [ ] Gestures work as expected
- [ ] Keyboard navigation works
- [ ] Screen reader announces content

### Performance Testing
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] No layout shift after load
