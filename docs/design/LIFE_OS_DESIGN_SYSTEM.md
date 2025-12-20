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

## 2. Color Tokens

### 2.1 Primitive Tokens

```css
:root {
  /* Base Colors */
  --color-bg-base: hsl(220, 15%, 95%);
  --color-bg-elevated: hsl(220, 15%, 98%);
  --color-text-primary: hsl(220, 20%, 20%);
  --color-text-secondary: hsl(220, 15%, 45%);

  /* Brand Colors */
  --color-brand-primary: hsl(220, 80%, 55%);
  --color-brand-secondary: hsl(180, 60%, 45%);

  /* Shadow Colors (Neumorphism) */
  --neu-shadow-dark: rgba(0, 0, 0, 0.15);
  --neu-shadow-light: rgba(255, 255, 255, 0.7);

  /* Glass Colors (Glassmorphism) */
  --glass-fill: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```

### 2.2 Dark Mode Tokens

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-base: hsl(220, 20%, 12%);
    --color-bg-elevated: hsl(220, 20%, 16%);
    --color-text-primary: hsl(220, 10%, 92%);
    --color-text-secondary: hsl(220, 10%, 65%);

    --neu-shadow-dark: rgba(0, 0, 0, 0.4);
    --neu-shadow-light: rgba(255, 255, 255, 0.05);

    --glass-fill: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
  }
}
```

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

## References

- [Neumorphism.io](https://neumorphism.io/) - Shadow generator
- [WCAG 2.1 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
- [MDN forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)
- Combined_Documentation.md - Production UI standards

---

*Last Updated: 2025-12-20*
*Version: 1.0.0*
