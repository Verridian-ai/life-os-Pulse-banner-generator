# Nanobanna Pro Design System

**Version:** 2.0 (Mobile-First "Life OS" Concept)
**Last Updated:** 2026-01-08
**Reference:** `lifeos-complete-concept Original.html`

## 1. Introduction

This design system defines the visual language, interaction patterns, and component standards for Nanobanna Pro. It is built on a **Mobile-First** philosophy, utilizing a high-contrast dark theme with "Apple-grade" glassmorphism effects.

**Primary Design Principles:**

1. **Mobile Fidelity:** Layouts start as specific mobile views (320px+) and extend to desktop panels.
2. **Immersive Dark Mode:** Deep zinc backgrounds (`#09090B`) with high-contrast content.
3. **Tactile Depth:** Use of glassmorphism (blurs) and neumorphism (shadows/glows) to create hierarchy.
4. **Micro-Typography:** Information density controlled via precise type scales (9px/10px) for metadata.

---

## 2. Core Systems

### [Color Palette](./COLOR_PALETTE.md)

- **Primary:** Violet/Purple (`#8B5CF6`)
- **Secondary:** Cyan (`#06B6D4`)
- **Accent:** Banana Yellow (`#D4A017`)
- **Bg Base:** Zinc 950 (`#09090B`)

### [Typography](./TYPOGRAPHY_SYSTEM.md)

- **Font:** `Inter` (sans-serif)
- **Key Sizes:** `text-[9px]` (Nav), `text-[10px]` (Badges), `text-3xl` (Logo).

### [Spacing & Layout](./SPACING_LAYOUT.md)

- **Device Radius:** `24px`
- **Drawer Radius:** `rounded-t-3xl`
- **Touch Target:** 44px (FABs, Nav)

---

## 3. Experience Patterns

### [Responsive Components](./RESPONSIVE_COMPONENTS.md)

Defines the crucial splits between Mobile (Bottom Sheet) and Desktop (Side Panel) behaviors for key features like the **AI Studio** and **Canvas Editor**.

### [Depth Effects](./DEPTH_EFFECTS.md)

Specifications for the glassmorphism (`backdrop-blur-xl`) and neumorphic shadows that define the "floating" UI layers.

### [Component States](./COMPONENT_STATES.md)

Interaction guidelines for Hover, Active, and Selected states, particularly for the **Format Selector** dropdowns.

### [Accessibility](./ACCESSIBILITY.md)

Standards for ensuring this dark, glass-heavy interface remains usable via Keyboard and Screen Readers.

---

## 4. Component Inventory

A full list of React components (`src/components/`) implementing these standards can be found in the **[Component Inventory](./COMPONENT_INVENTORY.md)**.

---

## 5. Implementation Quick Reference

### Standard "Glass" Card

```tsx
<div className="bg-zinc-900/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl p-4">
  {/* Content */}
</div>
```

### Primary Action Button

```tsx
<button className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-violet-500/30 px-4 py-3 font-semibold">
  Generate
</button>
```

### Mobile Bottom Sheet Wrapper

```tsx
<div className="fixed bottom-0 inset-x-0 z-50 bg-zinc-900 border-t border-slate-700/50 rounded-t-3xl">
  <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto my-3" /> {/* Handle */}
  {/* Content */}
</div>
```
