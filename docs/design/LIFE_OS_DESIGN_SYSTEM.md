# Life OS Design System

> Production-grade design system for Nanobanna Pro and Life OS family.
> Based on Combined_Documentation.md standards pack.

---

## 1. Design Philosophy

### 1.1 Style Foundation

- **Primary**: Neumorphism (Soft UI)
- **Secondary**: Glassmorphism (Frosted glass)
- **Approach**: Hybrid with accessibility fallbacks

### 1.2 Visual Baselines

- **Primary Reference**: Pulse page
- **Secondary Reference**: Landing page
- **These are PROTECTED** - do not modify without approval

---

## 2. Token Architecture (3-Tier Hierarchy)

> Industry-standard token hierarchy: Primitives → Semantic/Alias → Component

### 2.1 Tier 1: Primitive Tokens (Raw Values)

Primitive tokens are the foundational raw values. Never use directly in components.

```css
:root {
  /* ═══════════════════════════════════════════════════════════════
     TIER 1: PRIMITIVES (Raw values - DO NOT use directly)
     ═══════════════════════════════════════════════════════════════ */

  /* Color Primitives - Violet Scale */
  --primitive-violet-50: hsl(263, 70%, 96%);
  --primitive-violet-100: hsl(263, 70%, 90%);
  --primitive-violet-200: hsl(263, 70%, 80%);
  --primitive-violet-300: hsl(263, 70%, 70%);
  --primitive-violet-400: hsl(263, 70%, 60%);
  --primitive-violet-500: hsl(263, 70%, 50%);   /* #8B5CF6 */
  --primitive-violet-600: hsl(263, 70%, 45%);
  --primitive-violet-700: hsl(263, 70%, 38%);
  --primitive-violet-800: hsl(263, 70%, 28%);
  --primitive-violet-900: hsl(263, 70%, 18%);

  /* Color Primitives - Cyan Scale */
  --primitive-cyan-50: hsl(187, 85%, 96%);
  --primitive-cyan-100: hsl(187, 85%, 85%);
  --primitive-cyan-200: hsl(187, 85%, 70%);
  --primitive-cyan-300: hsl(187, 85%, 58%);
  --primitive-cyan-400: hsl(187, 85%, 50%);
  --primitive-cyan-500: hsl(187, 85%, 42%);     /* #06B6D4 */
  --primitive-cyan-600: hsl(187, 85%, 35%);
  --primitive-cyan-700: hsl(187, 85%, 28%);

  /* Color Primitives - Zinc Scale (Dark Mode) */
  --primitive-zinc-50: hsl(240, 5%, 96%);
  --primitive-zinc-100: hsl(240, 5%, 90%);
  --primitive-zinc-200: hsl(240, 5%, 80%);
  --primitive-zinc-300: hsl(240, 5%, 65%);
  --primitive-zinc-400: hsl(240, 5%, 50%);
  --primitive-zinc-500: hsl(240, 5%, 35%);
  --primitive-zinc-600: hsl(240, 5%, 25%);
  --primitive-zinc-700: hsl(240, 4%, 16%);
  --primitive-zinc-800: hsl(240, 6%, 10%);
  --primitive-zinc-900: hsl(240, 10%, 4%);      /* #09090b */

  /* Color Primitives - Feedback Colors */
  --primitive-emerald-500: hsl(160, 84%, 39%);
  --primitive-amber-500: hsl(38, 92%, 50%);
  --primitive-red-500: hsl(0, 84%, 60%);

  /* Color Primitives - Banana (Brand) */
  --primitive-banana-500: hsl(44, 77%, 46%);    /* #D4A017 */

  /* Spacing Primitives (4px base) */
  --primitive-space-0: 0;
  --primitive-space-1: 0.25rem;   /* 4px */
  --primitive-space-2: 0.5rem;    /* 8px */
  --primitive-space-3: 0.75rem;   /* 12px */
  --primitive-space-4: 1rem;      /* 16px */
  --primitive-space-5: 1.25rem;   /* 20px */
  --primitive-space-6: 1.5rem;    /* 24px */
  --primitive-space-8: 2rem;      /* 32px */
  --primitive-space-10: 2.5rem;   /* 40px */
  --primitive-space-12: 3rem;     /* 48px */
  --primitive-space-16: 4rem;     /* 64px */
  --primitive-space-20: 5rem;     /* 80px */
  --primitive-space-24: 6rem;     /* 96px */

  /* Sizing Primitives */
  --primitive-size-4: 1rem;       /* 16px */
  --primitive-size-6: 1.5rem;     /* 24px */
  --primitive-size-8: 2rem;       /* 32px */
  --primitive-size-10: 2.5rem;    /* 40px */
  --primitive-size-11: 2.75rem;   /* 44px - WCAG touch target */
  --primitive-size-12: 3rem;      /* 48px */
  --primitive-size-14: 3.5rem;    /* 56px */
  --primitive-size-16: 4rem;      /* 64px */

  /* Radius Primitives */
  --primitive-radius-sm: 0.5rem;   /* 8px */
  --primitive-radius-md: 0.75rem;  /* 12px */
  --primitive-radius-lg: 1rem;     /* 16px */
  --primitive-radius-xl: 1.25rem;  /* 20px */
  --primitive-radius-2xl: 1.5rem;  /* 24px */
  --primitive-radius-3xl: 2rem;    /* 32px */
  --primitive-radius-full: 9999px;

  /* Opacity Primitives */
  --primitive-opacity-5: 0.05;
  --primitive-opacity-10: 0.10;
  --primitive-opacity-20: 0.20;
  --primitive-opacity-40: 0.40;
  --primitive-opacity-60: 0.60;
  --primitive-opacity-80: 0.80;
}
```

### 2.2 Tier 2: Semantic/Alias Tokens (Purpose-Based)

Semantic tokens map primitives to their purpose. Use these in components.

```css
:root {
  /* ═══════════════════════════════════════════════════════════════
     TIER 2: SEMANTIC/ALIAS (Purpose-based - Use in components)
     ═══════════════════════════════════════════════════════════════ */

  /* Surface Colors */
  --color-surface-base: var(--primitive-zinc-900);
  --color-surface-elevated: var(--primitive-zinc-800);
  --color-surface-overlay: rgba(24, 24, 27, 0.6);

  /* Text Colors */
  --color-text-primary: var(--primitive-zinc-50);
  --color-text-secondary: var(--primitive-zinc-400);
  --color-text-muted: var(--primitive-zinc-500);
  --color-text-inverse: var(--primitive-zinc-900);

  /* Brand Colors */
  --color-brand-primary: var(--primitive-violet-500);
  --color-brand-secondary: var(--primitive-cyan-500);
  --color-brand-accent: var(--primitive-banana-500);

  /* Interactive Colors */
  --color-interactive-default: var(--primitive-violet-500);
  --color-interactive-hover: var(--primitive-violet-400);
  --color-interactive-active: var(--primitive-violet-600);
  --color-interactive-focus: var(--primitive-violet-400);

  /* Feedback Colors */
  --color-feedback-success: var(--primitive-emerald-500);
  --color-feedback-warning: var(--primitive-amber-500);
  --color-feedback-error: var(--primitive-red-500);
  --color-feedback-info: var(--primitive-cyan-500);

  /* Border Colors */
  --color-border-default: rgba(255, 255, 255, 0.05);
  --color-border-subtle: rgba(255, 255, 255, 0.02);
  --color-border-emphasis: rgba(255, 255, 255, 0.10);

  /* Shadow Colors (Neumorphism) */
  --neu-shadow-dark: rgba(0, 0, 0, 0.4);
  --neu-shadow-light: rgba(255, 255, 255, 0.05);

  /* Glass Colors (Glassmorphism) */
  --glass-fill: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.10);
  --glass-fill-hover: rgba(255, 255, 255, 0.08);

  /* Semantic Spacing */
  --spacing-component-xs: var(--primitive-space-1);
  --spacing-component-sm: var(--primitive-space-2);
  --spacing-component-md: var(--primitive-space-4);
  --spacing-component-lg: var(--primitive-space-6);
  --spacing-component-xl: var(--primitive-space-8);
  --spacing-section: var(--primitive-space-12);
  --spacing-page: var(--primitive-space-16);

  /* Semantic Sizing */
  --size-touch-target: var(--primitive-size-11);  /* 44px WCAG */
  --size-icon-sm: var(--primitive-size-4);
  --size-icon-md: var(--primitive-size-6);
  --size-icon-lg: var(--primitive-size-8);
}
```

### 2.3 Tier 3: Component Tokens (Scoped)

Component tokens are scoped to specific components. Override for theming.

```css
:root {
  /* ═══════════════════════════════════════════════════════════════
     TIER 3: COMPONENT (Scoped to component - For theming/overrides)
     ═══════════════════════════════════════════════════════════════ */

  /* Button Component */
  --button-bg-primary: var(--color-brand-primary);
  --button-bg-primary-hover: var(--color-interactive-hover);
  --button-bg-secondary: var(--color-surface-elevated);
  --button-bg-ghost: transparent;
  --button-text-primary: var(--color-text-primary);
  --button-text-secondary: var(--color-text-primary);
  --button-padding-x: var(--spacing-component-lg);
  --button-padding-y: var(--spacing-component-md);
  --button-radius: var(--primitive-radius-md);
  --button-size-sm: var(--primitive-size-8);     /* 32px */
  --button-size-md: var(--primitive-size-10);    /* 40px */
  --button-size-lg: var(--primitive-size-12);    /* 48px */

  /* Input Component */
  --input-bg: rgba(0, 0, 0, 0.4);
  --input-bg-focus: rgba(0, 0, 0, 0.5);
  --input-border: var(--color-border-emphasis);
  --input-border-focus: var(--color-brand-primary);
  --input-border-error: var(--color-feedback-error);
  --input-border-success: var(--color-feedback-success);
  --input-text: var(--color-text-primary);
  --input-text-placeholder: var(--color-text-muted);
  --input-padding-x: var(--spacing-component-md);
  --input-padding-y: var(--spacing-component-sm);
  --input-radius: var(--primitive-radius-md);

  /* Card Component */
  --card-bg-glass: var(--color-surface-overlay);
  --card-bg-solid: var(--color-surface-elevated);
  --card-border: var(--color-border-default);
  --card-border-hover: var(--color-border-emphasis);
  --card-padding: var(--spacing-component-lg);
  --card-radius: var(--primitive-radius-2xl);
  --card-radius-inner: var(--primitive-radius-lg);

  /* Panel Component */
  --panel-bg: var(--color-surface-overlay);
  --panel-border: var(--color-border-default);
  --panel-padding: var(--spacing-component-lg);
  --panel-radius: var(--primitive-radius-lg);

  /* Badge Component */
  --badge-padding-x: var(--spacing-component-sm);
  --badge-padding-y: var(--spacing-component-xs);
  --badge-radius: var(--primitive-radius-full);
  --badge-font-size: 10px;
}
```

### 2.4 Dark/Light Mode Override

```css
@media (prefers-color-scheme: light) {
  :root {
    /* Override surface colors for light mode */
    --color-surface-base: hsl(220, 15%, 95%);
    --color-surface-elevated: hsl(220, 15%, 98%);
    --color-surface-overlay: rgba(255, 255, 255, 0.8);

    /* Override text colors */
    --color-text-primary: hsl(220, 20%, 20%);
    --color-text-secondary: hsl(220, 15%, 45%);
    --color-text-muted: hsl(220, 10%, 55%);
    --color-text-inverse: hsl(220, 15%, 98%);

    /* Override neumorphism shadows */
    --neu-shadow-dark: rgba(0, 0, 0, 0.15);
    --neu-shadow-light: rgba(255, 255, 255, 0.7);

    /* Override glass fills */
    --glass-fill: rgba(255, 255, 255, 0.4);
    --glass-border: rgba(0, 0, 0, 0.08);

    /* Override border colors */
    --color-border-default: rgba(0, 0, 0, 0.08);
    --color-border-subtle: rgba(0, 0, 0, 0.04);
    --color-border-emphasis: rgba(0, 0, 0, 0.12);
  }
}

---

## 3. Elevation System (Neumorphism)

### 3.1 Depth Tokens

```css
:root {
  /* Depth distances */
  --neu-depth-xs: 2px;
  --neu-depth-sm: 3px;
  --neu-depth-md: 6px;
  --neu-depth-lg: 12px;

  /* Blur radii (2x depth) */
  --neu-blur-xs: 4px;
  --neu-blur-sm: 6px;
  --neu-blur-md: 12px;
  --neu-blur-lg: 24px;
}
```

### 3.2 Blur Budget (ENFORCED)

| Context | Max Blur | Rationale |
|---------|----------|-----------|
| Mobile | 20px | GPU performance |
| Desktop | 40px | Higher tolerance |
| Animation | 0px | NEVER animate blur |

### 3.3 Neumorphic Surface Classes

```css
/* Raised surface (convex) */
.neu-raised {
  background: var(--color-bg-elevated);
  border-radius: 16px;
  box-shadow:
    var(--neu-depth-md) var(--neu-depth-md) var(--neu-blur-md) var(--neu-shadow-dark),
    calc(var(--neu-depth-md) * -1) calc(var(--neu-depth-md) * -1) var(--neu-blur-md) var(--neu-shadow-light);

  /* Required: subtle border for accessibility */
  border: 0.5px solid rgba(0, 0, 0, 0.05);
}

/* Inset surface (concave) */
.neu-inset {
  background: var(--color-bg-base);
  border-radius: 12px;
  box-shadow:
    inset var(--neu-depth-sm) var(--neu-depth-sm) var(--neu-blur-sm) var(--neu-shadow-dark),
    inset calc(var(--neu-depth-sm) * -1) calc(var(--neu-depth-sm) * -1) var(--neu-blur-sm) var(--neu-shadow-light);
}
```

---

## 4. Glass Components (Glassmorphism)

### 4.1 Glass Stack Anatomy

Every glass component requires four layers:

1. **Fill**: Translucent background tint
2. **Blur**: Backdrop filter with saturation
3. **Noise**: Subtle grain for realism (optional)
4. **Border**: Refractive edge highlight

### 4.2 Glass Classes

```css
/* Standard frosted glass */
.glass-frosted {
  background: var(--glass-fill);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;

  /* GPU optimization */
  transform: translateZ(0);
  will-change: backdrop-filter;
}

/* Heavy blur (desktop only) */
@media (min-width: 768px) {
  .glass-heavy {
    backdrop-filter: blur(40px) saturate(200%);
    -webkit-backdrop-filter: blur(40px) saturate(200%);
  }
}

/* Mobile fallback */
@media (max-width: 767px) {
  .glass-heavy {
    backdrop-filter: blur(16px) saturate(150%);
    -webkit-backdrop-filter: blur(16px) saturate(150%);
  }
}
```

---

## 5. Accessibility Overrides (MANDATORY)

### 5.1 High Contrast Mode

```css
@media (prefers-contrast: more) {
  .neu-raised,
  .neu-inset {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    border: 2px solid black;
    background: white;
  }

  .glass-frosted,
  .glass-heavy {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgba(255, 255, 255, 0.95);
    border: 2px solid black;
  }
}
```

### 5.2 Windows High Contrast Mode

```css
@media (forced-colors: active) {
  .neu-raised,
  .neu-inset,
  .glass-frosted,
  .glass-heavy {
    border: 2px solid ButtonText;
    background: Canvas;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  /* Ensure visible focus */
  :focus {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
}
```

### 5.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Component Patterns

### 6.1 Card Component

```css
.card {
  /* Base structure */
  padding: 24px;
  border-radius: 20px;

  /* Neumorphic depth */
  background: var(--color-bg-elevated);
  box-shadow:
    var(--neu-depth-md) var(--neu-depth-md) var(--neu-blur-md) var(--neu-shadow-dark),
    calc(var(--neu-depth-md) * -1) calc(var(--neu-depth-md) * -1) var(--neu-blur-md) var(--neu-shadow-light);

  /* Accessibility: subtle border */
  border: 0.5px solid rgba(0, 0, 0, 0.05);
}
```

### 6.2 Button Component

```css
.btn {
  /* Base */
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;

  /* Neumorphic raised */
  background: var(--color-bg-elevated);
  box-shadow:
    var(--neu-depth-sm) var(--neu-depth-sm) var(--neu-blur-sm) var(--neu-shadow-dark),
    calc(var(--neu-depth-sm) * -1) calc(var(--neu-depth-sm) * -1) var(--neu-blur-sm) var(--neu-shadow-light);

  /* Accessibility: visible border */
  border: 1px solid rgba(0, 0, 0, 0.1);

  /* Performance: GPU layer */
  transform: translateZ(0);
  will-change: transform;
  transition: transform 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  /* Inset state */
  transform: translateY(0);
  box-shadow:
    inset var(--neu-depth-xs) var(--neu-depth-xs) var(--neu-blur-xs) var(--neu-shadow-dark),
    inset calc(var(--neu-depth-xs) * -1) calc(var(--neu-depth-xs) * -1) var(--neu-blur-xs) var(--neu-shadow-light);
}
```

### 6.3 Input Component

```css
.input {
  /* Base */
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 16px;

  /* Neumorphic inset */
  background: var(--color-bg-base);
  box-shadow:
    inset var(--neu-depth-sm) var(--neu-depth-sm) var(--neu-blur-sm) var(--neu-shadow-dark),
    inset calc(var(--neu-depth-sm) * -1) calc(var(--neu-depth-sm) * -1) var(--neu-blur-sm) var(--neu-shadow-light);

  /* Accessibility */
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.input:focus {
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
  border-color: var(--color-brand-primary);
}
```

### 6.4 Modal Component

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  /* Glass panel */
  background: var(--glass-fill);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 32px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;

  /* GPU optimization */
  transform: translateZ(0);
}
```

---

## 7. Performance Guidelines

### 7.1 Do's

- Use `transform` and `opacity` for animations
- Promote glass elements to GPU layers (`translateZ(0)`)
- Use `will-change` sparingly, only on interactive elements
- Cache blur textures for static backgrounds

### 7.2 Don'ts

- NEVER animate `box-shadow`
- NEVER animate `backdrop-filter`
- NEVER use `will-change: box-shadow`
- NEVER apply glass to full-screen overlays
- NEVER nest glass elements (double-blur cost)

### 7.3 Performance Fallbacks

```javascript
// Detect low-power mode
if (navigator.getBattery) {
  navigator.getBattery().then(battery => {
    if (battery.level < 0.2 || battery.charging === false) {
      document.body.classList.add('low-power');
    }
  });
}
```

```css
.low-power .glass-frosted,
.low-power .glass-heavy {
  backdrop-filter: none;
  background: rgba(255, 255, 255, 0.9);
}
```

---

## 8. Component Inventory

| Component | Type | Status | File |
|-----------|------|--------|------|
| CanvasEditor | Feature | Existing | `src/components/features/CanvasEditor.tsx` |
| GenerativeSidebar | Feature | Existing | `src/components/features/GenerativeSidebar.tsx` |
| SettingsModal | Modal | Existing | `src/components/features/SettingsModal.tsx` |
| LiveActionPanel | Feature | Existing | `src/components/features/LiveActionPanel.tsx` |

**Note**: Full component audit pending (T003)

---

## 9. Tailwind Integration

```javascript
// tailwind.config.js extension
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        'xs': '2px',
        '3xl': '64px',
      },
      boxShadow: {
        'neu-sm': '3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light)',
        'neu-md': '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
        'neu-inset': 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
      },
    },
  },
};
```

---

## 10. Naming Conventions (BEM Standard)

### 10.1 BEM Structure

All component classes follow **Block__Element--Modifier** convention for predictability and maintainability.

```text
.block           → Independent component (e.g., .card, .button, .input)
.block__element  → Child element of block (e.g., .card__header, .button__icon)
.block--modifier → Variant of block (e.g., .card--glass, .button--primary)
```

### 10.2 Migration Reference

| Legacy Class | BEM Class | Description |
| --- | --- | --- |
| `.glass-card` | `.card--glass` | Glass-style card variant |
| `.glass-panel` | `.panel--glass` | Glass-style panel variant |
| `.glass-frosted` | `.surface--frosted` | Frosted glass surface |
| `.glass-heavy` | `.surface--glass-heavy` | Heavy blur glass surface |
| `.neu-raised` | `.surface--raised` | Neumorphic raised surface |
| `.neu-inset` | `.surface--inset` | Neumorphic inset surface |

### 10.3 Component Class Pattern

```css
/* ═══════════════════════════════════════════════════════════════
   BEM PATTERN: .block--variant .block__element
   ═══════════════════════════════════════════════════════════════ */

/* BLOCK: Card */
.card {
  padding: var(--card-padding);
  border-radius: var(--card-radius);
  border: 1px solid var(--card-border);
}

/* MODIFIER: Glass variant */
.card--glass {
  background: var(--card-bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* MODIFIER: Solid variant */
.card--solid {
  background: var(--card-bg-solid);
}

/* MODIFIER: Outlined variant */
.card--outlined {
  background: transparent;
  border: 2px solid var(--color-border-emphasis);
}

/* ELEMENT: Card header */
.card__header {
  padding-bottom: var(--spacing-component-md);
  border-bottom: 1px solid var(--color-border-subtle);
}

/* ELEMENT: Card body */
.card__body {
  padding: var(--spacing-component-md) 0;
}

/* ELEMENT: Card footer */
.card__footer {
  padding-top: var(--spacing-component-md);
  border-top: 1px solid var(--color-border-subtle);
}
```

### 10.4 Button Classes

```css
/* BLOCK: Button */
.button { /* Base styles */ }

/* SIZE MODIFIERS */
.button--sm { height: var(--button-size-sm); padding: 0 var(--spacing-component-md); }
.button--md { height: var(--button-size-md); padding: 0 var(--spacing-component-lg); }
.button--lg { height: var(--button-size-lg); padding: 0 var(--spacing-component-xl); }

/* COLOR MODIFIERS */
.button--primary { background: var(--button-bg-primary); }
.button--secondary { background: var(--button-bg-secondary); }
.button--ghost { background: var(--button-bg-ghost); }
.button--danger { background: var(--color-feedback-error); }

/* STATE MODIFIERS */
.button--loading { /* Loading spinner state */ }
.button--disabled, .button:disabled { opacity: 0.5; cursor: not-allowed; }
```

### 10.5 Input Classes

```css
/* BLOCK: Input */
.input { /* Base styles */ }

/* SIZE MODIFIERS */
.input--sm { height: var(--button-size-sm); }
.input--md { height: var(--button-size-md); }
.input--lg { height: var(--button-size-lg); }

/* STATE MODIFIERS */
.input--error { border-color: var(--input-border-error); }
.input--success { border-color: var(--input-border-success); }
.input--disabled, .input:disabled { opacity: 0.5; cursor: not-allowed; }

/* ELEMENT: Input with icon */
.input-group { /* Container for input + icon */ }
.input-group__icon { /* Icon element */ }
.input-group__input { /* Input element */ }
```

### 10.6 Surface Classes

```css
/* BLOCK: Surface (base layer) */
.surface { /* Base styles */ }

/* MODIFIERS */
.surface--frosted { backdrop-filter: blur(20px) saturate(180%); }
.surface--glass-heavy { backdrop-filter: blur(40px) saturate(200%); }
.surface--raised { /* Neumorphic convex shadow */ }
.surface--inset { /* Neumorphic concave shadow */ }
```

---

## References

- [Neumorphism.io](https://neumorphism.io/) - Shadow generator
- [WCAG 2.1 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
- [MDN forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)
- [BEM Methodology](https://getbem.com/) - Block Element Modifier convention
- Combined_Documentation.md - Production UI standards

---

*Last Updated: 2026-01-08*
*Version: 2.0.0*
