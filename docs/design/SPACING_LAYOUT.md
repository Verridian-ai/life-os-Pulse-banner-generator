# Spacing & Layout System

This document documents the spatial relationships and layout patterns defined in `lifeos-complete-concept Original.html`.

## 1. Mobile-First Layout Patterns

The application uses a strict mobile-first stacking layer system.

### Z-Index Layers

1. **Canvas/Content:** `z-0` (Base layer)
2. **Floating Action Buttons (FABs):** `z-10` (Above content)
3. **Bottom Navigation:** `z-20` (Fixed bottom)
4. **Drawers/Sheets:** `z-30` (Slide over content)
5. **Modals/Overlays:** `z-40` (Full screen)

### Bottom Navigation Area

- **Position:** Fixed at bottom (`absolute bottom-0`).
- **Height:** Auto (approx 50-60px) with `py-2.5` padding.
- **Background:** `bg-zinc-900/95` with `backdrop-blur`.
- **Border:** Top border `border-t border-zinc-800/50`.

### Floating Action Buttons (FABs)

- **Vertical Position:** `bottom-20` (80px) to clear the bottom navigation.
- **Horizontal Position:**
  - Left Cluster: `left-4` (Start) - "Palette" & "Layers"
  - Right Cluster: `right-4` (End) - "AI Studio" (Primary)
- **Size:** `w-11 h-11` (44px) standard touch target.
- **Border Radius:** `rounded-2xl` (Squircle).

---

## 2. Container & Component Spacing

### Device/Card Frames

- **Border Radius:** `rounded-[24px]` (3xl) - Mimics modern smartphone corners.
- **Shadow:** `shadow-2xl` or `box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7)`.
- **Border:** `border border-slate-700/50`.

### Drawers (Sheet)

- **Mobile Shape:** `rounded-t-3xl` (Top corners only).
- **Desktop Shape:** `rounded-2xl` (All corners).
- **Drag Handle:** `w-10 h-1` pill, centered, `bg-slate-600`.

### Aspect Ratios (Canvas)

The system relies on functional aspect ratios for the "Canvas Preview":

- **LinkedIn Banner:** `aspect-[4/1]` (4:1)
- **LinkedIn Post:** `1.91:1`
- **Facebook Cover:** `2.28:1`

---

## 3. Safe Zones

Precision layout tools use specific dimensions.

- **Profile Safe Zone:** `w-10 h-10` (Mobile) / `w-12 h-12` (Desktop).
- **Style:** `border-2 dashed rgba(255,255,255,0.4)` `rounded-full`.
- **Position:** Absolute positioning (e.g., `left-2 top-1/2 -translate-y-1/2`).

---

## 4. Spacing Scale (Tailwind)

Commonly used spacing tokens in the concept:

- `gap-0.5` (2px): Tight grouping (Title + Banana smile).
- `gap-1.5` (6px): Button icon + text.
- `p-2.5` (10px): Common padding for buttons/inputs.
- `px-3 py-1` (12px x 4px): Badges.
- `mb-4` / `mb-6` (16px / 24px): Section gaps.
