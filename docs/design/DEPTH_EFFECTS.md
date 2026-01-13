# Depth Effects (Neumorphism & Glassmorphism)

This document specifies the depth, shadow, and translucency systems used to achieve the "Life OS" aesthetic defined in `lifeos-complete-concept Original.html`.

## 1. Glassmorphism System

Glassmorphism is used for floating layers (FABs, Bottom Nav, Drawers) to establish hierarchy over the background content.

### CSS Classes / Utility Tokens

| Element | Class / Style | Backdrop Blur | Opacity/Fill | Border |
| :--- | :--- | :--- | :--- | :--- |
| **Bottom Nav** | `.bg-zinc-900\/95` | `backdrop-blur?` (Implicit in Concept) | 95% Black | `border-t border-zinc-800/50` |
| **FAB (Standard)** | `.fab` | `blur(16px)` | `var(--bg-surface)` | `1px solid var(--border-color)` |
| **FAB (AI)** | `.fab-ai` | N/A (Solid Gradient) | N/A | None |
| **Drawer** | `.drawer` | `blur(24px)` | `var(--bg-card)` | `border slate-700/50` |
| **Format Panel** | `.bg-slate-900\/95` | N/A | 95% Slate 900 | `border slate-700/50` |

### Code Implementation (Tailwind)

```tsx
// Standard Glass Panel (Drawer/Nav)
<div className="bg-zinc-900/95 backdrop-blur-xl border border-white/5 shadow-2xl">
  {/* Content */}
</div>

// High-Glass FAB
<div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 shadow-lg">
  {/* Icon */}
</div>
```

---

## 2. Neumorphism System (Depth)

While "True Neumorphism" (soft extruded shapes) is less prominent in the "Original" HTML than in some design trends, the system uses **Shadow Depth** and **Glows** to simulate volume.

### Shadow Layers

The concept file defines a specific "Device Frame" shadow:
`box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);`

This is a heavy, grounding shadow used to lift the "Phone" or "Desktop Panel" off the background.

### Inner Glows / Gradients

- **Primary Buttons:** `linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)`
- **AI Glow:** `box-shadow: 0 8px 32px rgba(139, 92, 246, 0.35);` (Violet glow under AI buttons)
- **Nano Banana Badge:** `background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%);`

---

## 3. Z-Index Strategy

To manage these floating glass layers effectively:

```css
/* Base */
--z-canvas: 0;

/* Floating Controls */
--z-fab: 10;
--z-bottom-nav: 20;

/* Overlays */
--z-drawer: 30;
--z-modal: 40;
--z-toast: 50;
--z-cursor: 9999; /* If custom cursor used */
```

## 4. Performance Guidelines

- **Limit Blurs:** Use `backdrop-filter: blur()` sparingly on mobile. The "Original" concept uses it on FABs and Drawers, which are small or modal areas. Avoid full-screen blurs on low-end devices.
- **Opacity:** Prefer high opacity (90-95%) with subtle blurs over low opacity (50%) with heavy blurs for better legibility and contrast.
