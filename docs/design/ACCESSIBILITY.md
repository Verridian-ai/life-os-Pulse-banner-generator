# Accessibility Guidelines (a11y)

This document ensures the "Life OS" design system meets WCAG 2.1 AA standards, particularly for its dark-mode, glassmorphism-heavy aesthetic.

## 1. Color Contrast Strategy

The "Dark Mode First" design presents specific challenges for text contrast.

| Element | Background | Text Color | Ratio Goal | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Body Text** | `bg-zinc-950` (#09090b) | `text-slate-400` (#94a3b8) | **4.5:1** | Ensure muted text is not too dark. |
| **Headings** | `bg-zinc-950` | `text-white` (#ffffff) | **15:1** | Excellent contrast. |
| **Selected Item** | `bg-violet-500/12` | `text-white` | **4.5:1** | The tint bg must be dark enough or text bright enough. |
| **Glass Overlays** | `bg-zinc-900/95` | `text-white` | **Varies** | "95%" opacity ensures background noise doesn't break contrast. |

**Rule:** interactive text (links, buttons) must typically be `text-white` or `text-zinc-200` on dark surfaces. Avoid `text-zinc-500` for critical interactive labels unless they darken significantly on hover.

---

## 2. Keyboard Navigation

The "Format Selector" panel explicitly mentions keyboard support:
> `<kbd>↑↓</kbd> Navigate`  `<kbd>Enter</kbd> Select`

### Requirements

- **Focus Ring:** All interactive elements (Inputs, Buttons, Selector Items) must have a visible focus ring.
  - *Design:* `ring-2 ring-violet-500 ring-offset-2 ring-offset-zinc-900`.
- **Tab Order:** Logical flow (Top Nav -> Canvas -> Tools -> Bottom Nav).
- **Shortcuts:**
  - `Esc`: Close Drawers/Modals.
  - `Arrow Keys`: Navigate lists (Format Selector, Assets).

---

## 3. Touch Targets (Mobile)

The "Mobile-First" design requires strict adherence to touch sizes.

- **Minimum Size:** 44x44px for all tappable controls.
- **FABs:** The concept uses `w-11 h-11` (44px), which is exactly the minimum.
- **Bottom Nav:** The area for each icon (`flex-col`) must extend to the full height of the bar to ensure easy tapping.

---

## 4. Screen Reader Support (ARIA)

- **Icons:** All SVG icons (Mic, User, Sparkles) must have `aria-hidden="true"`.
- **Icon-Only Buttons:** Must include `aria-label="Description"`.
  - Example: `<button aria-label="AI Studio">...</button>`
- **Drawers:** Should use `role="dialog"` or `role="region"` with `aria-modal="true"` if blocking interaction.

---

## 5. Reduced Motion

The CSS animations (`animate-slide-up`) must respect user preferences.

```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-up, .transition-all {
    animation: none;
    transition: none;
    transform: none; /* Snap to final state */
  }
}
```
