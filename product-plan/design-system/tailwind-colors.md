# Tailwind Color Configuration

## Color Choices

- **Primary:** `sky` — Used for buttons, links, key accents, active states
- **Secondary:** `teal` — Used for gradients, hover states, secondary accents
- **Neutral:** `zinc` — Used for backgrounds, text, borders

## Usage Examples

### Buttons

```html
<!-- Primary button -->
<button class="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl">
  Create Design
</button>

<!-- Gradient button (primary action) -->
<button class="bg-gradient-to-r from-sky-500 to-teal-500 hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-bold">
  New Brand
</button>

<!-- Secondary/ghost button -->
<button class="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl">
  Cancel
</button>
```

### Text

```html
<!-- Primary text -->
<h1 class="text-white font-bold">Dashboard</h1>

<!-- Secondary text -->
<p class="text-zinc-400">Select a platform to begin</p>

<!-- Accent text -->
<span class="text-sky-400">View All</span>
```

### Backgrounds

```html
<!-- Page background -->
<div class="bg-zinc-950">

<!-- Card background -->
<div class="bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl">

<!-- Glass effect -->
<nav class="bg-zinc-900/50 backdrop-blur-xl border-white/5">
```

### Active/Selected States

```html
<!-- Active nav item -->
<a class="bg-sky-500/10 text-sky-400 border-l-2 border-sky-500">
  Dashboard
</a>

<!-- Active badge -->
<span class="bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-xs font-bold">
  Active
</span>
```

### Borders

```html
<!-- Subtle border -->
<div class="border border-white/10">

<!-- Hover border -->
<div class="border border-white/10 hover:border-sky-500/40">

<!-- Active border -->
<div class="border border-sky-500/50 ring-2 ring-sky-500/20">
```

## Dark Mode

Signal is dark-mode first. All colors above assume dark mode. For light mode support, use `dark:` variants:

```html
<div class="bg-white dark:bg-zinc-900">
<p class="text-zinc-800 dark:text-zinc-200">
```
