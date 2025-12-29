# Comprehensive Desktop/Laptop Screen Sizes & Browser Viewport Research 2025

> Last Updated: 2025-12-29
> Research compiled for Nanobanna Pro responsive design implementation

---

## Table of Contents

1. [Desktop Monitor Resolutions](#desktop-monitor-resolutions)
2. [Laptop Screen Resolutions](#laptop-screen-resolutions)
3. [Browser Viewport Considerations](#browser-viewport-considerations)
4. [Device Pixel Ratio (DPR) & Retina Displays](#device-pixel-ratio-dpr--retina-displays)
5. [Recommended Responsive Breakpoints](#recommended-responsive-breakpoints)
6. [Browser Compatibility](#browser-compatibility)
7. [Implementation Guidelines](#implementation-guidelines)

---

## Desktop Monitor Resolutions

### Market Share & Common Resolutions (2025)

Based on global statistics, the following desktop monitor resolutions are most common:

| Resolution | Name | Aspect Ratio | Market Share | Use Case |
|------------|------|--------------|--------------|----------|
| 1920×1080 | Full HD (FHD) | 16:9 | ~35-40% | Most common desktop/laptop standard |
| 1366×768 | HD | 16:9 | ~15-20% (declining) | Budget laptops, education sector |
| 2560×1440 | Quad HD (QHD) | 16:9 | ~10-15% | High-end monitors, premium laptops |
| 3840×2160 | 4K UHD | 16:9 | ~5-10% (growing) | Premium monitors, content creation |
| 1600×900 | HD+ | 16:9 | ~5-8% | Mid-range laptops |
| 1536×864 | - | 16:9 | ~3-5% | Mid-range laptops |
| 1440×900 | WXGA+ | 16:10 | ~3-5% | Older displays, professional |

### High-End & Specialty Resolutions

| Resolution | Name | Aspect Ratio | Use Case |
|------------|------|--------------|----------|
| 3440×1440 | UltraWide QHD | 21:9 | Gaming, productivity, design work |
| 2560×1080 | UltraWide FHD | 21:9 | Gaming, multitasking |
| 5120×2880 | 5K | 16:9 | Apple iMac, professional design |
| 5120×2160 | 5K UltraWide | 21:9 | Premium ultrawide monitors |
| 6016×3384 | 6K | 16:9 | Apple Pro Display XDR |

### Key Trends for 2025

- **1920×1080 (Full HD)** remains the dominant desktop resolution
- **1366×768** is declining but still significant in budget/education sectors
- **4K (3840×2160)** adoption is growing but still represents a minority of users
- **Ultrawide monitors** (21:9 aspect ratio) represent a viable niche market
- Over **62% of global internet traffic** comes from mobile devices, with desktops at ~36%

**Recommendation**: Focus on 1920×1080 as the primary desktop target, with responsive support down to 1366×768 and enhancement for 2560×1440+.

---

## Laptop Screen Resolutions

### MacBook (Apple Silicon & Intel Generations)

#### Current MacBook Air (M4, 2025)

| Model | Native Resolution | Viewport (CSS Pixels) | PPI | DPR |
|-------|-------------------|----------------------|-----|-----|
| 13.6" MacBook Air | 2560×1664 | 1280×832 | 224 | 2.0 |
| 15.3" MacBook Air | 2880×1864 | 1440×932 | 224 | 2.0 |

#### Current MacBook Pro (M4, 2024/2025)

| Model | Native Resolution | Viewport (CSS Pixels) | PPI | DPR |
|-------|-------------------|----------------------|-----|-----|
| 14.2" MacBook Pro | 3024×1964 | 1512×982 | 254 | 2.0 |
| 16.2" MacBook Pro | 3456×2234 | 1728×1117 | 254 | 2.0 |

#### Legacy MacBooks (for reference)

| Model | Native Resolution | Viewport (CSS Pixels) | PPI | DPR |
|-------|-------------------|----------------------|-----|-----|
| 13.3" MacBook Air (pre-2018) | 1440×900 | 1440×900 | 128 | 1.0 |
| 13.3" MacBook Air (2018-2022) | 2560×1600 | 1280×800 | 227 | 2.0 |
| 15.4" MacBook Pro (Retina) | 2880×1800 | 1440×900 | 220 | 2.0 |
| 12" MacBook | 2304×1440 | 2304×1440 | 226 | 1.0 |

**Key Insight**: Apple uses **whole-number DPR values** (2.0), making CSS pixel calculations straightforward.

### Windows Laptops

#### Common Windows Laptop Resolutions

| Resolution | Screen Size | Category | Common Brands |
|------------|-------------|----------|---------------|
| 1920×1080 | 13"-17" | Standard | Dell, HP, Lenovo, ASUS |
| 1366×768 | 11"-15" | Budget/Entry | Budget models, education |
| 2560×1600 | 13"-15" | Premium | Dell XPS, HP Spectre |
| 2256×1504 | 13"-14" | Premium | Microsoft Surface |
| 2880×1800 | 15"-16" | High-End | Gaming, content creation |
| 1536×864 | 13"-15" | Mid-Range | Business laptops |
| 1440×900 | 13"-15" | Mid-Range | Older professional models |

#### Microsoft Surface Laptops

| Model | Resolution | Aspect Ratio | DPR | Notes |
|-------|------------|--------------|-----|-------|
| Surface Laptop (13") | 1920×1080 | 16:9 | 1.5-2.0 | Entry-level, $869 |
| Surface Laptop (13.5") | 2256×1504 | 3:2 | 2.0 | Premium productivity |
| Surface Laptop (15") | 2496×1664 | 3:2 | 2.0 | Large productivity |
| Surface Book 3 | 3000×2000 | 3:2 | 2.0 | Detachable tablet |

**Note**: Microsoft Surface uses a **3:2 aspect ratio** (2880×1920, 2256×1504), which provides more vertical space than traditional 16:9 displays.

### Chromebooks

#### Common Chromebook Resolutions

| Resolution | Screen Size | Category | Notes |
|------------|-------------|----------|-------|
| 1366×768 | 11"-14" | Standard | Most common, adequate for small screens |
| 1920×1080 | 13"-15" | Premium | Recommended for 13"+ displays |
| 2400×1600 | 12.3" | Premium | Google Pixelbook, Samsung Chromebook Pro (3:2 aspect ratio) |

**Recommendation**: For screens 13" and above, 1920×1080 (Full HD) is preferred. For smaller screens, 1366×768 is usually adequate.

### Laptop Trends for 2025

- Over **60% of laptops sold in 2025** have high-DPI displays (>150 PPI), compared to just 20% in 2020
- **Average laptop screen size** is 14.5 inches in 2025
- **16:10 aspect ratio** displays are gaining traction over traditional 16:9
- **3:2 aspect ratio** (Microsoft Surface, Google Pixelbook) offers more vertical space for productivity

---

## Browser Viewport Considerations

### Viewport vs. Screen Resolution

**Critical Distinction**:
- **Screen Resolution**: The physical pixel dimensions of the display (e.g., 1920×1080)
- **Viewport**: The visible area where web content renders (always smaller due to browser UI)

**Formula**:
```
Viewport Size = Screen Size - Browser Chrome (toolbars, tabs, scrollbars, etc.)
```

### Browser Chrome Overhead

| Browser Element | Typical Height (px) |
|-----------------|---------------------|
| Address bar | 35-50 |
| Tab bar | 30-40 |
| Bookmarks bar | 25-35 |
| DevTools (docked) | 200-400+ |
| **Total Chrome** | **90-125 (no DevTools)** |

**Scrollbar Width**: ~15-20px on Windows, varies by OS

**Example**: On a 1920×1080 display:
- **Screen**: 1920×1080 pixels
- **Viewport** (typical): ~1920×955 pixels (accounting for ~125px browser chrome)
- **Viewport with DevTools**: ~1920×655 pixels (if DevTools docked at bottom, 300px high)

### Browser-Specific Viewport Behavior

#### Chrome
- **DevTools Impact**: When DevTools is docked, viewport shrinks significantly
- **Device Mode**: Shows viewport dimensions in top-right corner when resizing
- **JavaScript Access**: `document.documentElement.clientWidth` (excludes scrollbar)

#### Firefox
- **Zoom Behavior**: Reports new CSS pixel size for `innerWidth` and `clientWidth` when zoomed
- **outerWidth/outerHeight**: Reports values in CSS pixels (differs from Chrome)

#### Safari (macOS)
- **Retina Displays**: Uses 2.0 DPR on all modern Macs
- **Viewport**: Similar chrome overhead to Chrome/Firefox

#### Microsoft Edge
- **Chromium-Based**: Behaves identically to Chrome for viewport calculations
- **Legacy Edge**: Deprecated, no longer relevant for 2025

### Measuring Viewport in JavaScript

```javascript
// Viewport width/height (includes scrollbar)
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

// Viewport width/height (excludes scrollbar) - RECOMMENDED
const viewportWidthNoScroll = document.documentElement.clientWidth;
const viewportHeightNoScroll = document.documentElement.clientHeight;

// Screen resolution (physical pixels)
const screenWidth = window.screen.width;
const screenHeight = window.screen.height;

// Usable screen space (excludes OS taskbar/dock)
const availWidth = window.screen.availWidth;
const availHeight = window.screen.availHeight;

// Device Pixel Ratio
const dpr = window.devicePixelRatio;
```

### Common Viewport Ranges (2025)

#### Desktop Viewports (CSS Pixels)

| Range | Description | Notes |
|-------|-------------|-------|
| 1024-1279px | Small Desktop | Old 1024×768 + some 1366×768 laptops |
| 1280-1439px | Medium Desktop | 1366×768, some 1440×900 |
| 1440-1919px | Large Desktop | 1440p monitors, high-res laptops |
| 1920px+ | Extra Large Desktop | Full HD+, 4K, ultrawide |

#### Mobile Viewports (CSS Pixels)

| Range | Description | Notes |
|-------|-------------|-------|
| 360-430px | Standard Mobile | 360×800, 390×844 most common |
| 768-834px | Tablet Portrait | iPad, Android tablets |
| 1024-1366px | Tablet Landscape | iPad Pro, large tablets |

**Key Insight**: Despite device fragmentation, mobile viewports have consolidated around **360-430px width** in portrait mode.

---

## Device Pixel Ratio (DPR) & Retina Displays

### Understanding DPR

**Device Pixel Ratio (DPR)** = Physical Pixels / CSS Pixels

**Example**:
- **MacBook Pro 14"**: 3024×1964 native resolution ÷ 2.0 DPR = **1512×982 CSS pixels**
- **iPhone 15 Pro**: 2556×1179 native resolution ÷ 3.0 DPR = **852×393 CSS pixels**

### Common DPR Values

| DPR | Description | Example Devices |
|-----|-------------|-----------------|
| 1.0 | Standard DPI (96 DPI) | Older laptops, budget monitors, non-Retina displays |
| 1.5 | Mid-Range Android | Many Android phones, some Windows laptops |
| 2.0 | Retina/HiDPI | MacBooks, iPhones, premium Windows laptops |
| 3.0 | High-End Mobile | iPhone 15 Pro, Samsung Galaxy S24, large iPads |
| 4.0+ | Ultra High-End | Professional 8K monitors, VR headsets |

### Browser Differences for DPR

#### Apple Devices
- **Whole-number DPR**: 1.0, 2.0, 3.0 (clean, predictable)
- **Consistent across browsers**: Safari, Chrome, Firefox report the same DPR

#### Android Devices
- **Fractional DPR**: 1.5, 2.625, 2.75 (varies widely)
- **Common ranges**: 1.5 (mid-range), 2.0 (standard), 3.0 (high-end)

### CSS Media Queries for DPR

#### Cross-Browser Retina Detection

```css
/* Target 2x (Retina) displays */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi),
       (min-resolution: 2dppx) {
  /* Retina-specific styles */
  background-image: url('image@2x.png');
}

/* Target 3x (iPhone 15 Pro, high-end Android) */
@media (-webkit-min-device-pixel-ratio: 3),
       (min-resolution: 288dpi),
       (min-resolution: 3dppx) {
  background-image: url('image@3x.png');
}

/* Target 1.5x (mid-range Android) */
@media (-webkit-min-device-pixel-ratio: 1.25),
       (min-resolution: 200dpi),
       (min-resolution: 1.25dppx) {
  /* Mid-DPI styles */
}
```

#### Vendor Prefixes (2025)

| Prefix | Browser | Status |
|--------|---------|--------|
| `-webkit-min-device-pixel-ratio` | Chrome, Safari, Edge | **Required** |
| `min--moz-device-pixel-ratio` | Firefox | Likely a bug, use as fallback |
| `-moz-min-device-pixel-ratio` | Firefox | Preferred for Firefox |
| `min-resolution` (dpi/dppx) | All modern browsers | **Standard, use always** |

**Recommendation**: Always use `min-resolution` with `dpi` or `dppx` units as the primary, with `-webkit-` prefix as fallback.

### Zoom Behavior

- **Page Zoom** (Ctrl/Cmd +): Increases `devicePixelRatio` and CSS pixel size
- **Pinch Zoom** (mobile): Does NOT affect `devicePixelRatio`
- **Both Firefox and Chrome**: Report new CSS pixel size when zoomed

---

## Recommended Responsive Breakpoints

### Tailwind CSS Default Breakpoints (Industry Standard)

| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets portrait |
| `lg` | 1024px | Tablets landscape, small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops, 4K |

### Nanobanna Pro Recommended Breakpoints (Desktop-First)

Based on 2025 research, here are the recommended breakpoints for Nanobanna Pro:

| Breakpoint | Min Width | Max Width | Target Devices | Design Notes |
|------------|-----------|-----------|----------------|--------------|
| **Mobile** | 360px | 767px | Phones | Single column, stacked UI |
| **Tablet** | 768px | 1023px | Tablets, small laptops | 2-column layouts, simplified nav |
| **Small Desktop** | 1024px | 1279px | 1366×768 laptops | Compact sidebar, optimized spacing |
| **Medium Desktop** | 1280px | 1439px | 1440×900, 1366×768 laptops | Standard layout, full features |
| **Large Desktop** | 1440px | 1919px | 1440p monitors, high-res laptops | Enhanced spacing, multi-panel |
| **Extra Large Desktop** | 1920px | ∞ | Full HD+, 4K, ultrawide | Max content width 1280-1440px (centered) |

### CSS Implementation

```css
/* Mobile-first approach */
:root {
  --max-content-width: 1280px; /* Max content width for readability */
}

/* Base styles (mobile) */
.container {
  width: 100%;
  padding: 0 1rem;
}

/* Small Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
    margin: 0 auto;
  }
}

/* Medium Desktop (1280px+) */
@media (min-width: 1280px) {
  .container {
    max-width: 1140px;
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .container {
    max-width: var(--max-content-width);
  }
}

/* Extra Large Desktop (1920px+) */
@media (min-width: 1920px) {
  .container {
    max-width: var(--max-content-width);
    /* Content stays centered, doesn't stretch infinitely */
  }
}
```

### Ultrawide Monitor Considerations

For ultrawide monitors (2560×1080, 3440×1440):
- **Max content width**: 1280-1440px (prevent text lines from becoming too wide)
- **Center content**: Use `margin: 0 auto` to center the main content
- **Utilize side space**: Consider fixed sidebars, split-screen layouts, or background elements

```css
/* Ultrawide optimization */
@media (min-width: 2560px) {
  .main-content {
    max-width: 1440px;
    margin: 0 auto;
  }

  .background-gradient {
    /* Full-width background effects */
    width: 100vw;
  }
}
```

---

## Browser Compatibility

### Modern CSS Features Support (2025)

#### Flexbox

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 29+ | ✅ Full | 98%+ global support |
| Firefox 28+ | ✅ Full | Excellent compatibility |
| Safari 9+ | ✅ Full | Full support on all modern Macs/iOS |
| Edge (Chromium) | ✅ Full | Identical to Chrome |
| IE 11 | ⚠️ Partial | Deprecated, minor inconsistencies |

**Status**: **Production-ready** with 98%+ browser support. Safe to use without fallbacks for modern browsers.

#### CSS Grid

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 57+ | ✅ Full | 96%+ global support |
| Firefox 52+ | ✅ Full | Excellent compatibility |
| Safari 10.1+ | ✅ Full | Full support on all modern devices |
| Edge (Chromium) | ✅ Full | Identical to Chrome |
| IE 11 | ❌ None | Use Flexbox fallback |

**Status**: **Production-ready** with 96%+ browser support. All modern browsers fully support CSS Grid.

**Fallback Strategy**:
```css
/* Flexbox fallback for very old browsers */
.grid-container {
  display: flex;
  flex-wrap: wrap;
}

/* Modern Grid (overrides Flexbox) */
@supports (display: grid) {
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}
```

#### backdrop-filter (Glassmorphism)

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 76+ | ✅ Full | 95%+ global support |
| Firefox 103+ | ✅ Full | Requires v103+ |
| Safari 9+ | ⚠️ Prefixed | **Requires `-webkit-` prefix** |
| Edge (Chromium) | ✅ Full | Identical to Chrome |
| Opera 63+ | ✅ Full | Excellent support |
| IE 11 | ❌ None | Use solid background fallback |

**Critical**: Always use `-webkit-backdrop-filter` for Safari support.

**Implementation**:
```css
.glass-card {
  /* Fallback for browsers without backdrop-filter */
  background: rgba(255, 255, 255, 0.9);
}

@supports (backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px); /* Safari */
  }
}
```

**Performance Notes**:
- `backdrop-filter: blur()` is **GPU-intensive**
- Keep blur values between **8-15px** (higher = exponentially more expensive)
- Avoid on large areas or many elements simultaneously
- Use `transform: translateZ(0)` for hardware acceleration
- Test on lower-end devices

#### CSS Custom Properties (Variables)

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 49+ | ✅ Full | 92/100 compatibility score |
| Firefox 31+ | ✅ Full | Excellent support |
| Safari 10+ | ✅ Full | Partial in v9.1, full in 10+ |
| Edge 16+ | ✅ Full | Partial in v15, full in 16+ |
| IE 11 | ❌ None | Use preprocessor variables (Sass/Less) |

**Status**: **Production-ready** since April 2017. No vendor prefixes required.

**Syntax**:
```css
:root {
  --primary-color: #007bff;
  --spacing-unit: 8px;
}

.button {
  background-color: var(--primary-color);
  padding: calc(var(--spacing-unit) * 2);
}
```

**Note**: The `--` prefix is part of the standard syntax, NOT a vendor prefix.

#### @property Rule (Advanced CSS Variables)

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 85+ | ✅ Full | Baseline since July 2024 |
| Firefox 128+ | ✅ Full | Recent support |
| Safari 16.4+ | ✅ Full | Full support |
| Edge (Chromium) | ✅ Full | Identical to Chrome |

**Status**: **Baseline Newly available** as of July 9, 2024. Allows typed custom properties and gradient animations.

```css
@property --gradient-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.animated-gradient {
  background: linear-gradient(var(--gradient-angle), red, blue);
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  to { --gradient-angle: 360deg; }
}
```

#### CSS Container Queries

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 105+ | ✅ Full | Size queries fully supported |
| Firefox 110+ | ✅ Full | Shipped Feb 2023 |
| Safari 16+ | ✅ Full | Shipped Sept 2022 |
| Edge (Chromium) | ✅ Full | Identical to Chrome |

**Status**: **Production-ready** since Feb 2023. Size queries widely available across all major browsers.

**Container Style Queries**: ⚠️ Limited support (only custom properties)

**Implementation**:
```css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-title {
    font-size: 2rem;
  }
}

/* Feature detection */
@supports (container-type: inline-size) {
  /* Container query styles */
}
```

#### :has() Selector (Parent Selector)

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 105+ | ✅ Full | Production-ready |
| Firefox 121+ | ✅ Full | Recent support |
| Safari 15.4+ | ✅ Full | Early adopter |
| Edge (Chromium) | ✅ Full | Identical to Chrome |

**Status**: **Production-ready** in 2025. Confidently use `:has()` for parent selection.

**Implementation**:
```css
/* Style parent based on child */
.card:has(img) {
  padding: 0;
}

/* Feature detection (for caution) */
@supports selector(:has(*)) {
  .card:has(.featured-badge) {
    border-color: gold;
  }
}
```

**Performance Note**: `:has()` can be computationally expensive. Use strategically and avoid overly complex selector chains.

---

## Implementation Guidelines

### 1. Mobile-First Responsive Design

**Principle**: Start with mobile styles, progressively enhance for larger screens.

```css
/* Base (mobile) */
.header {
  font-size: 1.5rem;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .header {
    font-size: 2rem;
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1280px) {
  .header {
    font-size: 2.5rem;
    padding: 2rem;
  }
}
```

### 2. Content Width Constraints

**Best Practice**: Limit content width for readability, even on large screens.

```css
.main-content {
  width: 100%;
  max-width: 1280px; /* Max content width */
  margin: 0 auto; /* Center content */
  padding: 0 1rem; /* Breathing room on mobile */
}

@media (min-width: 1920px) {
  .main-content {
    max-width: 1440px; /* Slightly larger for extra-large screens */
  }
}
```

**Typography**: Lines of text should be **45-75 characters** for optimal readability. Use `max-width: 65ch` for text-heavy content.

### 3. High-DPI Image Handling

**srcset for Responsive Images**:
```html
<img
  src="image.png"
  srcset="image.png 1x, image@2x.png 2x, image@3x.png 3x"
  alt="Description"
>
```

**CSS background-image**:
```css
.hero {
  background-image: url('hero.png');
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .hero {
    background-image: url('hero@2x.png');
  }
}
```

### 4. Viewport Meta Tag (CRITICAL)

**Always include** in `<head>`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

**Parameters**:
- `width=device-width`: Sets viewport width to device width
- `initial-scale=1.0`: Sets initial zoom level to 100%
- `viewport-fit=cover`: Handles iPhone notch (safe area insets)

### 5. Testing Across Devices

#### Browser DevTools (Simulation)
- **Chrome DevTools**: Device Mode (Ctrl/Cmd + Shift + M)
- **Firefox**: Responsive Design Mode (Ctrl/Cmd + Shift + M)
- **Safari**: Enter Responsive Design Mode (Develop > Enter Responsive Design Mode)

**Limitation**: DevTools only *simulate* devices. Always test on real hardware.

#### Real Device Testing
- **BrowserStack**: Cloud-based real device testing
- **Physical Devices**: Test on at least:
  - iPhone (iOS Safari)
  - Android phone (Chrome)
  - iPad (Safari)
  - MacBook (Safari, Chrome)
  - Windows laptop (Chrome, Edge)

#### Common Viewport Sizes to Test

| Device | Viewport (CSS Pixels) | Notes |
|--------|----------------------|-------|
| iPhone 15 Pro | 393×852 | Standard iPhone size |
| Samsung Galaxy S24 | 360×800 | Common Android size |
| iPad Pro 11" | 834×1194 (portrait) | Tablet |
| MacBook Pro 14" | 1512×982 | Laptop |
| Desktop FHD | ~1920×955 | Desktop (accounting for chrome) |

### 6. Accessibility Overrides for Neumorphism/Glassmorphism

**MANDATORY**: Always include high-contrast fallbacks.

```css
/* Normal neumorphic styles */
.neu-card {
  background: #e0e5ec;
  box-shadow:
    6px 6px 12px rgba(0, 0, 0, 0.15),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

/* High contrast override (MANDATORY) */
@media (prefers-contrast: more) {
  .neu-card {
    background: white;
    border: 2px solid black;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  }
}

/* Windows High Contrast Mode (MANDATORY) */
@media (forced-colors: active) {
  .neu-card {
    background: Canvas;
    border: 2px solid ButtonText;
    box-shadow: none;
  }
}
```

### 7. Performance Best Practices

#### Blur Budget (Glassmorphism)
- **Mobile**: Max blur radius **20px**
- **Desktop**: Max blur radius **40px**
- **Never animate**: `box-shadow` or `backdrop-filter` (use `transform` instead)

#### GPU Acceleration
```css
.glass-element {
  transform: translateZ(0); /* Force GPU layer */
  will-change: transform; /* Use sparingly, only on actively animating elements */
}

/* NEVER do this */
.bad-example {
  will-change: box-shadow; /* Expensive, avoid */
}
```

#### Lazy Loading Images
```html
<img src="image.png" loading="lazy" alt="Description">
```

### 8. Browser-Specific Prefixes Reference

| CSS Property | Chrome/Edge | Firefox | Safari | Standard |
|--------------|-------------|---------|--------|----------|
| `backdrop-filter` | ✅ Unprefixed | ✅ Unprefixed | ⚠️ `-webkit-` | ✅ Standard |
| `min-device-pixel-ratio` | `-webkit-` | `-moz-` | `-webkit-` | `min-resolution` (dpi/dppx) |
| `user-select` | `-webkit-` | `-moz-` | `-webkit-` | ✅ Standard (2023+) |
| `appearance` | `-webkit-` | `-moz-` | `-webkit-` | ✅ Standard (2023+) |
| Custom properties | ✅ Unprefixed | ✅ Unprefixed | ✅ Unprefixed | ✅ Standard |
| Flexbox | ✅ Unprefixed | ✅ Unprefixed | ✅ Unprefixed | ✅ Standard |
| Grid | ✅ Unprefixed | ✅ Unprefixed | ✅ Unprefixed | ✅ Standard |

**Recommendation**: Use **autoprefixer** (via PostCSS) to automatically add vendor prefixes based on browser support targets.

---

## Summary & Recommendations

### Target Breakpoints for Nanobanna Pro

1. **Mobile**: 360-767px (single column, stacked UI)
2. **Tablet**: 768-1023px (2-column, simplified nav)
3. **Small Desktop**: 1024-1279px (compact sidebar, 1366×768 laptops)
4. **Medium Desktop**: 1280-1439px (standard layout, full features)
5. **Large Desktop**: 1440-1919px (enhanced spacing, multi-panel)
6. **Extra Large Desktop**: 1920px+ (max content width 1280-1440px, centered)

### Browser Support Targets

- **Modern Browsers** (Chrome 100+, Firefox 100+, Safari 15+, Edge 100+): Full support for all features
- **Fallbacks**: Use `@supports` queries for `backdrop-filter`, `:has()`, and container queries
- **Deprecated**: IE 11 (no support needed in 2025)

### CSS Feature Adoption

| Feature | Status | Action |
|---------|--------|--------|
| Flexbox | ✅ Safe | Use freely |
| CSS Grid | ✅ Safe | Use freely |
| Custom Properties | ✅ Safe | Use freely |
| `backdrop-filter` | ⚠️ Prefix | Always include `-webkit-` for Safari |
| Container Queries | ✅ Safe | Use freely (size queries only) |
| `:has()` | ✅ Safe | Use freely |
| `@property` | ⚠️ Progressive | Use with `@supports` fallback |

### Performance Priorities

1. **Blur Budget**: 20px mobile, 40px desktop
2. **Image Optimization**: Use `srcset`, lazy loading, WebP/AVIF formats
3. **GPU Acceleration**: Use `transform: translateZ(0)` for glass elements
4. **Content Width**: Max 1280-1440px for readability
5. **Testing**: Always test on real devices, not just DevTools

---

## References & Sources

1. [2025 Screen Resolution Trends: 4K Dominance & Mobile Shifts Revealed](https://www.accio.com/business/screen_resolution_trends)
2. [Guide to Screen Resolutions: 2025 Standards & Best Practices](https://www.devzery.com/post/complete-guide-screen-resolutions-2025)
3. [Worldwide: Desktop screen resolutions 2024 | Statista](https://www.statista.com/statistics/1445439/leading-desktop-screen-resolutions-worldwide/)
4. [Common Screen Resolutions in 2025](https://testgrid.io/blog/common-screen-resolutions/)
5. [Most popular Screen Resolutions](https://testingbot.com/resources/articles/common-screen-resolutions)
6. [MacBook Pro - Tech Specs - Apple](https://www.apple.com/macbook-pro/specs/)
7. [MacBook Air 13- and 15-inch with M4 Chip - Tech Specs - Apple](https://www.apple.com/macbook-air/specs/)
8. [MacBook Air: viewport, screen size, CSS pixel ratio](https://blisk.io/devices/details/macbook-air)
9. [What are the best screen sizes for responsive web design?](https://www.hobo-web.co.uk/best-screen-size/)
10. [What is the Ideal Screen Size for Responsive Design | BrowserStack](https://www.browserstack.com/guide/ideal-screen-sizes-for-responsive-design)
11. [Viewport concepts - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts)
12. [Window: devicePixelRatio property - Web APIs | MDN](https://developer.mozilla.org/en-docs/Web/API/Window/devicePixelRatio)
13. [Retina Display Media Query | CSS-Tricks](https://css-tricks.com/snippets/css/retina-display-media-query/)
14. [How to Create Glassmorphic UI Effects with Pure CSS](https://blog.openreplay.com/create-glassmorphic-ui-css/)
15. [Next-level frosted glass with backdrop-filter](https://medium.com/@kaklotarrahul79/next-level-frosted-glass-with-backdrop-filter-456e0271ab9d)
16. [CSS Backdrop-Filter: Complete Guide to Background Blur](https://codelucky.com/css-backdrop-filter/)
17. [CSS Grid vs Flexbox: Which Layout Is Best in 2025?](https://yon.fun/css-grid-vs-flexbox/)
18. [The Quiet Revolution of CSS Grid](https://medium.com/@jefyjery10/the-quiet-revolution-of-css-grid-why-web-devs-are-ditching-flexbox-in-2025-77c149bfa0aa)
19. [CSS Container Queries in 2025](https://caisy.io/blog/css-container-queries)
20. [CSS in 2025: New Selectors, Container Queries](https://medium.com/@ignatovich.dm/css-in-2025-new-selectors-container-queries-and-ai-generated-styles-3ebf705f880f)
21. [Custom properties (--*): CSS variables - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
22. [@property: Next-gen CSS variables now with universal browser support](https://web.dev/blog/at-property-baseline)
23. [See the viewport size](https://devtoolstips.org/tips/en/see-viewport-size/)
24. [Chrome DevTools: Change Viewport Size](https://www.matthewedgar.net/blog/chrome-devtools-change-viewport-size/)

---

*Document created for Nanobanna Pro - LinkedIn Banner Design Tool*
*Research compiled by Claude Code on 2025-12-29*
