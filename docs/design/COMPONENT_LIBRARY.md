# Life OS Component Library

**Last Updated:** 2026-01-08

This document defines the reusable UI components for the Life OS Design System. All components are built with **Tailwind CSS** and designed with a **Mobile-First** approach, ensuring usability across touch devices (Mobile) and precision pointers (Desktop).

---

## 1. Breakpoints & Sizing

Components adapt across three primary breakpoints:

| Device Type | Breakpoint | Prefix | Sizing Logic |
| :--- | :--- | :--- | :--- |
| **Mobile** | < 768px | `default` | **Min 44px** touch targets. Full-width layouts. |
| **Tablet** | ≥ 768px | `md:` | Reduced density. 40px targets. |
| **Desktop** | ≥ 1024px | `lg:` | High density. 36px targets. Hover states enabled. |

---

## 2. Typography

**Font Family:** `Inter`, sans-serif
**Weights:** Light (300) to Black (900)

### Headings

| Element | Mobile Class | Desktop Class | Usage |
| :--- | :--- | :--- | :--- |
| **H1** | `text-3xl font-black` | `lg:text-6xl` | Page Titles, Hero Text |
| **H2** | `text-xl font-bold` | `lg:text-3xl` | Section Headers, Modal Titles |
| **H3** | `text-lg font-bold` | `lg:text-xl` | Card Titles |

### UI Text

| Element | Mobile Class | Desktop Class | Usage |
| :--- | :--- | :--- | :--- |
| **Body** | `text-sm` | `text-sm` | Standard content |
| **Label** | `text-xs font-bold uppercase tracking-wider` | Same | Input labels, Section headers |
| **Tiny** | `text-[10px] font-medium` | Same | Meta data, timestamps, badges |

---

## 3. Buttons

All buttons support `transition` and `active:scale-95` (mobile click feedback).

### Primary Action

Used for the main call-to-action (Generate, Save, Submit).

```html
<button class="w-full md:w-auto py-3 md:py-2 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98] transition">
    Generate Background
</button>
```

### Secondary Action

Used for alternative actions (Cancel, Back, Edit).

```html
<button class="w-full md:w-auto py-3 md:py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition font-medium">
    Cancel
</button>
```

### Icon Button

Used for toolbars and compact actions.

```html
<button class="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition">
    <span class="material-icons text-xl md:text-lg">settings</span>
</button>
```

### Floating Action Button (FAB)

Primary mobile trigger, usually fixed at bottom center.

```html
<button class="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full text-white shadow-lg shadow-violet-500/30 transform active:scale-95 transition">
    <span class="material-icons text-xl">add</span>
</button>
```

---

## 4. Inputs & Forms

### Text Field / Textarea

Dark glassmorphic inputs with focus states.

```html
<div class="space-y-2">
    <label class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Prompt</label>
    <textarea 
        class="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 resize-none transition"
        placeholder="Describe your vision..."></textarea>
</div>
```

### Select Box (Custom)

Used for format selection or dropdowns.

```html
<button class="flex items-center justify-between w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white">
    <div class="flex items-center gap-3">
        <span class="material-icons text-blue-400">smart_display</span>
        <div class="text-left">
            <div class="text-[10px] text-zinc-500 font-bold uppercase">Format</div>
            <div class="text-sm font-semibold">LinkedIn Banner</div>
        </div>
    </div>
    <span class="material-icons text-zinc-500">expand_more</span>
</button>
```

### Range Slider

Used for opacity, size, or intensity controls.

```html
<input type="range" class="w-full h-1 bg-zinc-700/50 rounded-lg appearance-none cursor-pointer accent-violet-500">
```

---

## 5. Cards & Panels

### Glass Panel

The core container style for the application. Uses `backdrop-blur` and subtle borders.

```html
<div class="bg-zinc-900/40 backdrop-blur-xl p-5 rounded-3xl border border-white/5 shadow-2xl">
    <!-- Content -->
</div>
```

### Drawer / Sidebar

Responsive container that slides up on Mobile and sits as a sidebar on Desktop.

```html
<!-- Container -->
<div class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div> <!-- Backdrop -->
    
    <!-- Panel -->
    <div class="absolute bottom-0 md:right-0 md:top-0 md:h-full w-full md:w-[400px] bg-zinc-900 border-t md:border-l border-white/10 rounded-t-3xl md:rounded-l-3xl shadow-2xl transform transition-transform">
        <!-- Drawer Content -->
    </div>
</div>
```

---

## 6. Navigation components

### Tabs (Pill Style)

Used for switching contexts (e.g., Post vs Story).

```html
<div class="flex p-1 bg-zinc-800/80 rounded-xl">
    <!-- Active Tab -->
    <button class="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold shadow-lg">
        Post
    </button>
    <!-- Inactive Tab -->
    <button class="px-4 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-medium hover:bg-white/5 transition">
        Story
    </button>
</div>
```

### Back Button / Breadcrumb

Floating navigation aid.

```html
<a href="#" class="fixed bottom-6 left-6 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/5 shadow-lg group">
    <span class="material-icons">arrow_back</span>
    <!-- Tooltip on Desktop -->
    <span class="absolute left-full ml-3 px-2 py-1 bg-black/80 rounded text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
        Back to Home
    </span>
</a>
```

---

## 7. Status & Indicators

### Dimension Badge

Shows active canvas size.

```html
<div class="px-1.5 py-0.5 bg-black/80 backdrop-blur rounded text-zinc-400 font-mono text-[9px] font-medium border border-white/5">
    1584 x 396 px
</div>
```

### Notification / Status Dot

Indicates active state or updates.

```html
<div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
```
