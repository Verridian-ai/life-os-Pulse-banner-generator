# Signal Application Shell

## Overview

Signal uses a hybrid navigation pattern optimized for both desktop productivity and mobile convenience. The shell provides persistent navigation to core sections while keeping platform-specific studios accessible from the Dashboard hub.

## Navigation Structure

- **Dashboard** — Platform hub (home) — shows 6 platform cards for quick studio access
- **Projects** — Design library with folders, drafts, and published work
- **Templates** — Pre-designed templates organized by platform and use case
- **Brand Kit** — Brand consistency engine for colors, fonts, and style guidelines

## Components

### AppShell.tsx
Main layout wrapper that coordinates header, sidebar, bottom nav, and content area.

**Props:**
- `children` — Main content to render
- `currentRoute` — Active route for nav highlighting
- `onNavigate` — Route change callback
- `onSearch` — Search input callback
- `onOpenAuth` — Authentication modal callback
- `showVoiceAgent` — Whether to show voice button
- `isVoiceActive` — Voice agent connection state
- `onToggleVoice` — Voice toggle callback

### MainNav.tsx
Desktop sidebar navigation with icons and labels.

**Props:**
- `currentRoute` — Active route
- `onNavigate` — Route change callback

### BottomNav.tsx
Mobile bottom navigation bar with 4 items and centered FAB.

**Props:**
- `currentRoute` — Active route
- `onNavigate` — Route change callback
- `onFabClick` — FAB action callback

### UserMenu.tsx
User avatar dropdown with settings and logout.

**Props:**
- `user` — User object (name, avatar)
- `onSignIn` — Open auth callback
- `onSignOut` — Logout callback
- `onSettings` — Settings callback
- `onUpgrade` — Upgrade to Pro callback

## Layout Pattern

- **Header:** Fixed 64px height, glass effect, logo left, search center (desktop), user menu right
- **Sidebar (desktop):** Fixed 256px width, glass effect, nav items with icons
- **Bottom Nav (mobile):** Fixed bottom bar with 4 nav items + centered FAB
- **Content Area:** Scrollable, max-width 1600px, responsive padding

## Responsive Behavior

- **Desktop (1024px+):** Full sidebar visible, header with search bar
- **Tablet (768-1023px):** Collapsed sidebar (icons only), expandable on hover
- **Mobile (<768px):** No sidebar, bottom navigation bar, hamburger menu

## Design Tokens Applied

- Glass effect: `bg-zinc-900/50 backdrop-blur-xl border-white/5`
- Active nav: `bg-sky-500/10 text-sky-400 border-sky-500/20`
- FAB gradient: `from-sky-500 to-teal-500`
- All touch targets minimum 44px for accessibility

## Integration Notes

1. Copy the components to your project
2. Wire up `onNavigate` to your router
3. Connect `onOpenAuth` to your auth modal
4. Pass user data from your auth context
5. Implement voice agent toggle if using voice features
