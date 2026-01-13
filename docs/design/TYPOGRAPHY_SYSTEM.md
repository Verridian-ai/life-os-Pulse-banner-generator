# Typography System

This document defines the typography standards for Nanobanna Pro, derived directly from the `lifeos-complete-concept Original.html` design reference.

## 1. Font Family

**Primary Font:** `Inter` (Google Fonts)

- **Weights Used:**
  - 400 (Regular): Body text
  - 500 (Medium): Interactive elements, buttons
  - 600 (Semibold): Subheadings, badges
  - 700 (Bold): Section headers
  - 900 (Black): Brand logos ("LIFE OS")

```css
font-family: 'Inter', sans-serif;
```

---

## 2. Type Scale (Mobile-First)

The application uses an extended scale that includes micro-typography for high-density mobile interfaces.

| Token | Size | Line Height | Usage |
| :--- | :--- | :--- | :--- |
| `text-3xl` | 30px | 36px | Main Brand Logo ("LIFE OS") |
| `text-2xl` | 24px | 32px | Drawer/Modal Titles |
| `text-xl` | 20px | 28px | Section Headers |
| `text-lg` | 18px | 28px | Intro Text, Large Labels |
| `text-base` | 16px | 24px | Standard Body |
| `text-sm` | 14px | 20px | Secondary Text, Input Labels |
| `text-xs` | 12px | 16px | Metadata, Tooltips, Status Bars |
| `text-[10px]` | 10px | 14px | **Key Layout Elements**: Badges, Format dimensions, "Safe Zone" labels |
| `text-[9px]` | 9px | 12px | **Micro UI**: Bottom Navigation Labels, Keyboard shortcuts |

---

## 3. Usage Examples

### Brand Header

```html
<span class="text-3xl font-black text-white">LIFE</span>
<span class="text-3xl font-black text-white">OS</span>
```

### Mobile Bottom Navigation (Micro Type)

```html
<div class="flex flex-col items-center gap-0.5 text-zinc-500">
  <svg class="...">...</svg>
  <span class="text-[9px]">Templates</span>
</div>
```

### Badges & Metadata (Small Type)

```html
<span class="text-white text-xs font-medium">LinkedIn</span>
<span class="text-white/60 text-[10px]">▼</span>
```

### Canvas Overlay Labels

```html
<div class="text-[10px] font-bold">TEXT</div>
```

---

## 4. Text Utilities

- **Colors:**
  - Standard: `text-white`
  - Muted: `text-zinc-500` (or `#71717a`)
  - Accent: `text-violet-400`, `text-cyan-200`
  - Warning/Gold: `text-white` on `bg-orange-500/20` (Safe Zones)

- **Weights:**
  - `font-black` (900): Logo only.
  - `font-bold` (700): Overlay text.
  - `font-semibold` (600): Buttons, badges.
  - `font-medium` (500): Navigation links.
