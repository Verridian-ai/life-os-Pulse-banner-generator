# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Or in your CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
```

## Font Usage

### Space Grotesk (Headings & Body)

A clean, geometric sans-serif with excellent readability. Used for all UI text.

```css
font-family: 'Space Grotesk', sans-serif;
```

**Weights:**
- 400 (Regular) — Body text, descriptions
- 500 (Medium) — Labels, buttons, secondary headings
- 600 (SemiBold) — Emphasis, important labels
- 700 (Bold) — Headings, titles, prominent UI elements

### JetBrains Mono (Code/Technical)

A developer-friendly monospace font. Used for code snippets, API keys, technical data.

```css
font-family: 'JetBrains Mono', monospace;
```

**Weights:**
- 400 (Regular) — Code blocks
- 500 (Medium) — Inline code
- 600 (SemiBold) — Highlighted code

## Tailwind Configuration

If using Tailwind, extend your theme:

```js
// tailwind.config.js (v3) or CSS variables (v4)
fontFamily: {
  sans: ['Space Grotesk', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

## Typography Scale

| Element | Size | Weight | Class |
|---------|------|--------|-------|
| Page Title | 2xl (1.5rem) | Bold | `text-2xl font-bold` |
| Section Title | lg (1.125rem) | Bold | `text-lg font-bold` |
| Card Title | sm-base | Bold | `text-sm font-bold` |
| Body Text | sm (0.875rem) | Regular | `text-sm` |
| Small Text | xs (0.75rem) | Medium | `text-xs font-medium` |
| Badge/Tag | 10px | Bold/Medium | `text-[10px] font-bold` |
