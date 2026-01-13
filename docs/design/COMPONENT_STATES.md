# Component States & Variants

This document specifies the interactive states for Nanobanna Pro components, derived from `lifeos-complete-concept Original.html`.

## 1. Interactive Element States

### Buttons & Clickables

| State | Visual Change | CSS Example |
| :--- | :--- | :--- |
| **Default** | Base opacity/color | `bg-zinc-800 text-zinc-400` |
| **Hover** | Lighten background or increase opacity | `hover:bg-zinc-700 hover:text-white` |
| **Active/Pressed** | Scale down slightly (Tactile feel) | `active:scale-95` (Standard Tailwind pattern) |
| **Selected** | Primary color tint + border indicator | `bg-violet-500/10 border-l-2 border-violet-500` |
| **Disabled** | Reduced opacity, grayscale | `opacity-50 grayscale cursor-not-allowed` |

### Format Selection Items

The "Format Selector" uses a specific selection pattern:

- **Default:** Transparent background.
- **Hover:** `bg-white/5`.
- **Selected:**
  - Background: `bg-violet-500/12` (Purple tint)
  - Indicator: `border-l-2 border-violet-500`
  - Icon: `text-white` (vs `text-zinc-500`)
  - Checkmark: Visible `btn-primary-solid` badge.

---

## 2. Input Fields (Prompt Area)

- **Default:** `bg-slate-800/80 border border-slate-700`.
- **Focus:** Border color changes to Primary (`border-violet-500`).
- **Filled:** Text becomes `text-white`. Placeholder is `text-slate-500`.

---

## 3. Toggle States

### Platform Badges (LinkedIn, X, etc.)

- **Active:** Corporate color background (e.g., `#0A66C2` for LinkedIn).
- **Inactive/Selected Format:** The list items inside the panel show the active state.

---

## 4. Animation States

The concept uses CSS animations for state transitions:

- **Drawers:** `animate-slide-up` (`slideUp` keyframe).
  - *Start:* `transform: translateY(100%)`
  - *End:* `transform: translateY(0)`
  - *Duration:* `0.5s ease-out`

- **Hovers:** Smooth transitions on background and text colors.
  - `transition-colors duration-200` (Implicit best practice).
