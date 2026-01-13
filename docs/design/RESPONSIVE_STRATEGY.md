# Responsive Design Strategy - Nanobanna Pro

This document outlines the dual-track responsive strategy for the Life OS Design System (v4.1.1). By maintaining both mobile-first and desktop-first prototypes, we ensure maximum component reliability across all viewport paradigms.

## 1. The Approaches

### Mobile-First (`/mobile/`)

- **Philosophy**: Content and functionality are optimized for the smallest screens first. Complexity is added as screen size increases.
- **Implementation**: Uses Tailwind default classes for mobile (e.g., `flex-col`, `w-full`) and prefix modifiers (e.g., `md:flex-row`, `md:w-1/2`) for larger screens.
- **Key Features**:
  - Bottom navigation bars for primary actions.
  - Full-width touch-friendly buttons (min 44x44px target).
  - Vertical stacking of cards and forms.
  - Viewport-relative scaling.

### Desktop-First (`/desktop/`)

- **Philosophy**: Leverages the expansive real estate of desktop monitors for complex workflows. UI is collapsed or simplified as viewport shrinks.
- **Implementation**: Uses Tailwind default classes for desktop (e.g., `grid-cols-4`, `flex-row`) and `max-` modifiers (e.g., `max-md:flex-col`) for smaller screens.
- **Key Features**:
  - Persistent left/right sidebars for multi-tasking.
  - Hover-heavy interaction models.
  - Horizontal layouts and sub-windows.
  - Multi-column data displays.

---

## 2. Breakpoint Registry

| Breakpoint | Range | Paradigm | Use Case |
| :--- | :--- | :--- | :--- |
| **base** | < 640px | Portrait Mobile | Fast entry, simple viewing. |
| **sm** | 640px - 767px | Landscape Mobile | Detailed reading, basic editing. |
| **md** | 768px - 1023px | Tablets | Studio workflows, creation. |
| **lg** | 1024px - 1279px | Laptop | Full editor, complex AI chaining. |
| **xl** | 1280px+ | Desktop/Ultra-wide | Professional management, admin analytics. |

---

## 3. When to Use Which?

- **Use Mobile-First Research** when building features for high-frequency, "on-the-go" interactions (e.g., checking social metrics, quick text enhancements, viewing galleries).
- **Use Desktop-First Research** when designing complex, data-heavy "workstation" interfaces (e.g., the Canvas Editor, Tool Chain Builder, Admin Observability) where the interaction model fundamentally assumes a mouse and keyboard.

---

## 4. Accessibility & Cross-Paradigm Rules

Regardless of the starting point, all screens must:

1. Support `@media (prefers-contrast: more)` for high-visibility modes.
2. Implement `@media (prefers-reduced-motion: reduce)` to disable non-functional animations.
3. Maintain "Banana" accent accessibility (ensuring high enough contrast against Obsidian backgrounds).
4. Provide a "Back to Dashboard" anchor in the same semantic location.
