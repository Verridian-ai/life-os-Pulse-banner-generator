# Color Palette

This document defines the official color palette for Nanobanna Pro, extracted from the production codebase (`src/index.css` and `tailwind.config.js`).

## 1. Brand Colors

The brand identity is defined by a deep violet/purple primary color and a cyan/teal secondary color.

```css
/* Primary Brand (Violet/Purple) */
--color-brand-primary: hsl(220, 80%, 55%); /* #3b82f6 (approx, closer to blue-violet) */

/* Secondary Brand (Cyan/Teal) */
--color-brand-secondary: hsl(180, 60%, 45%); /* #2e8b8b (approx) */

/* Accent Variations (Tailwind Classes) */
.text-purple-600 { color: rgb(147, 51, 234); }
.text-pink-600 { color: rgb(219, 39, 119); }
.bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
```

### Usage Guidelines

- **Primary:** Main buttons (`cta`), active states, key branding elements.
- **Secondary:** Success indicators, safe zones, secondary tools.
- **Gradients:** Heavy use of `purple-600` to `pink-600` or `blue-600` gradients for "AI Magic" actions.

---

## 2. Neutral Colors (Dark Mode Layout)

Nanobanna Pro is a dark-mode-first application.

```css
:root {
  /* Dark Mode Surfaces */
  --color-bg-base: hsl(220, 20%, 12%);      /* #181d24 - App Background */
  --color-bg-elevated: hsl(220, 20%, 16%);  /* #202730 - Cards/Panels */

  /* Text Colors */
  --color-text-primary: hsl(220, 10%, 92%);   /* #e9ebf0 - Headings */
  --color-text-secondary: hsl(220, 10%, 65%); /* #9ca3af - Body/Labels */
}
```

### Zinc Scale (Tailwind)

The application relies heavily on the `zinc` scale for neutrals:

- `bg-zinc-950` / `bg-black`: Main backgrounds.
- `bg-zinc-900`: Surface layers.
- `bg-zinc-800`: Hover states / secondary surfaces.
- `border-zinc-800` / `border-white/10`: Dividers and borders.

---

## 3. Neumorphism & Glassmorphism System

The design system combines glassmorphism (translucency) with neumorphism (depth).

### Shadow Colors (Neumorphism)

```css
/* Dark Mode Shadows */
--neu-shadow-dark: rgba(0, 0, 0, 0.4);
--neu-shadow-light: rgba(255, 255, 255, 0.05);

/* Depth Values */
--neu-depth-xs: 2px;
--neu-depth-sm: 3px;
--neu-depth-md: 6px;
--neu-depth-lg: 12px;

/* Blur Values (2x Depth) */
--neu-blur-xs: 4px;
--neu-blur-sm: 6px;
--neu-blur-md: 12px;
--neu-blur-lg: 24px;
```

### Glass Effects (Glassmorphism)

```css
/* Glass Bases */
--glass-fill: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);

/* Backdrop Blur Budget (Tailwind config) */
.backdrop-blur-xs { backdrop-filter: blur(4px); }
.backdrop-blur-mobile { backdrop-filter: blur(12px); }
.backdrop-blur-desktop { backdrop-filter: blur(20px); }
.backdrop-blur-max { backdrop-filter: blur(40px); }
```

---

## 4. Semantic Colors

Standard semantic colors for feedback states.

```css
/* Success (Green/Emerald) */
.text-emerald-400 { color: rgb(52, 211, 153); }
.bg-emerald-500 { background-color: rgb(16, 185, 129); }

/* Warning (Amber/Yellow) */
.text-amber-400 { color: rgb(251, 191, 36); }
.text-yellow-500 { color: rgb(234, 179, 8); }

/* Error (Red/Rose) */
.text-red-400 { color: rgb(248, 113, 113); }
.bg-red-500 { background-color: rgb(239, 68, 68); }

/* Info (Blue/Sky) */
.text-blue-400 { color: rgb(96, 165, 250); }
.bg-blue-500 { background-color: rgb(59, 130, 246); }
```

### Usage Usage

- **Success:** Connection stability, save confirmation (`hapticConnected`).
- **Error:** Validation failure, API errors (`hapticError`).
- **Warning:** Action timeouts (e.g., Idle Warning).

---

## 5. Gradients & Special Effects

The app uses "AI Magic" gradients significantly:

1. **"Magic" Gradient:** `from-pink-600 via-purple-600 to-indigo-600`
    - Used for Generate buttons, AI loaders, and premium features.

2. **"Active" Gradient:** `from-purple-600 to-blue-600`
    - Used for Profile avatars and active navigation states.

3. **"Golden" Gradient:** `from-yellow-600 to-amber-700`
    - Used for "Edit" modes or premium/pro indicators.
