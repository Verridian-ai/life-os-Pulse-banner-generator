# Comprehensive Device & Screen Size Reference Document

> Last Updated: 2026-01-08
> Reference guide for responsive design implementation in Nanobanna Pro

---

## Table of Contents

1. [Mobile Phones](#1-mobile-phones)
2. [Tablets](#2-tablets)
3. [Desktop & Laptop](#3-desktop--laptop)
4. [Tailwind CSS Breakpoints](#4-tailwind-css-breakpoints)
5. [Test Plan](#5-test-plan)
6. [Quick Reference](#6-quick-reference)

---

## 1. Mobile Phones

### 1.1 iPhone Models

#### iPhone 17 Series (Expected Fall 2025/2026)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| iPhone 17 Pro Max | 6.9" | 2868 × 1320 | 956 × 440 | 3 | 19.5:9 |
| iPhone 17 Pro | 6.3" | 2622 × 1206 | 874 × 402 | 3 | 19.5:9 |
| iPhone 17 | 6.3" | 2622 × 1206 | 874 × 402 | 3 | 19.5:9 |
| iPhone 17 Air | 6.6" | 2740 × 1260 | 913 × 420 | 3 | 19.5:9 |

#### iPhone 16 Series (2024)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| iPhone 16 Pro Max | 6.9" | 2868 × 1320 | 956 × 440 | 3 | 19.5:9 |
| iPhone 16 Pro | 6.3" | 2622 × 1206 | 874 × 402 | 3 | 19.5:9 |
| iPhone 16 Plus | 6.7" | 2796 × 1290 | 932 × 430 | 3 | 19.5:9 |
| iPhone 16 | 6.1" | 2556 × 1179 | 852 × 393 | 3 | 19.5:9 |

#### iPhone 15 Series (2023)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| iPhone 15 Pro Max | 6.7" | 2796 × 1290 | 932 × 430 | 3 | 19.5:9 |
| iPhone 15 Pro | 6.1" | 2556 × 1179 | 852 × 393 | 3 | 19.5:9 |
| iPhone 15 Plus | 6.7" | 2796 × 1290 | 932 × 430 | 3 | 19.5:9 |
| iPhone 15 | 6.1" | 2556 × 1179 | 852 × 393 | 3 | 19.5:9 |

#### iPhone 14 Series (2022)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| iPhone 14 Pro Max | 6.7" | 2796 × 1290 | 932 × 430 | 3 | 19.5:9 |
| iPhone 14 Pro | 6.1" | 2556 × 1179 | 852 × 393 | 3 | 19.5:9 |
| iPhone 14 Plus | 6.7" | 2778 × 1284 | 926 × 428 | 3 | 19.5:9 |
| iPhone 14 | 6.1" | 2532 × 1170 | 844 × 390 | 3 | 19.5:9 |

#### iPhone SE (3rd Gen, 2022)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| iPhone SE (3rd gen) | 4.7" | 1334 × 750 | 667 × 375 | 2 | 16:9 |

#### iPhone Viewport Orientations

| Model Category | Portrait (W × H) | Landscape (W × H) |
|----------------|------------------|-------------------|
| Pro Max (16/15/14) | 430 × 932 | 932 × 430 |
| Pro (16/15/14) | 393 × 852 | 852 × 393 |
| Plus (16/15/14) | 430 × 932 | 932 × 430 |
| Standard (16/15/14) | 390 × 844 | 844 × 390 |
| SE (3rd gen) | 375 × 667 | 667 × 375 |

---

### 1.2 Samsung Galaxy Models

#### Galaxy S24 Series (2024)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| Galaxy S24 Ultra | 6.8" | 3120 × 1440 | 824 × 384 | 3.75 | 19.5:9 |
| Galaxy S24+ | 6.7" | 3120 × 1440 | 780 × 360 | 4 | 19.5:9 |
| Galaxy S24 | 6.2" | 2340 × 1080 | 780 × 360 | 3 | 19.5:9 |

#### Galaxy S23 Series (2023)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| Galaxy S23 Ultra | 6.8" | 3088 × 1440 | 772 × 360 | 4 | 19.3:9 |
| Galaxy S23+ | 6.6" | 2340 × 1080 | 780 × 360 | 3 | 19.5:9 |
| Galaxy S23 | 6.1" | 2340 × 1080 | 780 × 360 | 3 | 19.5:9 |

#### Galaxy Z Series (Foldables)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Notes |
|-------|-------------|---------------------|----------------|-----|-------|
| Galaxy Z Fold 5 (Cover) | 6.2" | 2316 × 904 | 772 × 301 | 3 | External |
| Galaxy Z Fold 5 (Main) | 7.6" | 2176 × 1812 | 725 × 604 | 3 | Internal |
| Galaxy Z Flip 5 (Cover) | 3.4" | 720 × 748 | 360 × 374 | 2 | External |
| Galaxy Z Flip 5 (Main) | 6.7" | 2640 × 1080 | 880 × 360 | 3 | Unfolded |

#### Galaxy A Series (Mid-Range)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| Galaxy A54 | 6.4" | 2340 × 1080 | 780 × 360 | 3 | 19.5:9 |
| Galaxy A34 | 6.6" | 2340 × 1080 | 780 × 360 | 3 | 19.5:9 |

#### Samsung Galaxy Viewport Orientations

| Model Category | Portrait (W × H) | Landscape (W × H) |
|----------------|------------------|-------------------|
| S24 Ultra | 384 × 824 | 824 × 384 |
| S24/S24+ | 360 × 780 | 780 × 360 |
| S23 Series | 360 × 780 | 780 × 360 |
| Z Fold 5 Main | 604 × 725 | 725 × 604 |
| Z Fold 5 Cover | 301 × 772 | 772 × 301 |
| A54/A34 | 360 × 780 | 780 × 360 |

---

### 1.3 Google Pixel Models

#### Pixel 9 Series (2024)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| Pixel 9 Pro XL | 6.8" | 2992 × 1344 | 448 × 998 | 3 | 20:9 |
| Pixel 9 Pro | 6.3" | 2856 × 1280 | 412 × 952 | 3 | 20:9 |
| Pixel 9 | 6.3" | 2424 × 1080 | 412 × 808 | 2.625 | 20:9 |
| Pixel 9 Pro Fold (Main) | 8.0" | 2152 × 2076 | 717 × 692 | 3 | 1:1 |
| Pixel 9 Pro Fold (Cover) | 6.3" | 2424 × 1080 | 412 × 808 | 2.625 | 20:9 |

#### Pixel 8 Series (2023)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| Pixel 8 Pro | 6.7" | 2992 × 1344 | 448 × 998 | 3 | 20:9 |
| Pixel 8 | 6.2" | 2400 × 1080 | 412 × 823 | 2.625 | 20:9 |
| Pixel 8a | 6.1" | 2400 × 1080 | 412 × 823 | 2.625 | 20:9 |

#### Pixel 7 Series (2022)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| Pixel 7 Pro | 6.7" | 3120 × 1440 | 412 × 892 | 3.5 | 19.5:9 |
| Pixel 7 | 6.3" | 2400 × 1080 | 412 × 823 | 2.625 | 20:9 |
| Pixel 7a | 6.1" | 2400 × 1080 | 412 × 823 | 2.625 | 20:9 |

#### Pixel 6 Series (2021)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| Pixel 6 Pro | 6.7" | 3120 × 1440 | 412 × 892 | 3.5 | 19.5:9 |
| Pixel 6 | 6.4" | 2400 × 1080 | 412 × 823 | 2.625 | 20:9 |
| Pixel 6a | 6.1" | 2400 × 1080 | 412 × 823 | 2.625 | 20:9 |

#### Google Pixel Viewport Orientations

| Model Category | Portrait (W × H) | Landscape (W × H) |
|----------------|------------------|-------------------|
| Pixel 9 Pro XL | 448 × 998 | 998 × 448 |
| Pixel 9/8/7/6 Pro | 412 × 892 | 892 × 412 |
| Pixel 9/8/7/6 Standard | 412 × 823 | 823 × 412 |
| Pixel 9 Pro Fold Main | 692 × 717 | 717 × 692 |

---

### 1.4 Other Android Devices

#### OnePlus Models

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| OnePlus 12 | 6.82" | 3168 × 1440 | 412 × 906 | 3.5 | 20:9 |
| OnePlus 11 | 6.7" | 3216 × 1440 | 412 × 916 | 3.5 | 20:9 |
| OnePlus 12R | 6.78" | 2780 × 1264 | 412 × 892 | 3 | 20:9 |

#### Xiaomi Models

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| Xiaomi 14 Pro | 6.73" | 3200 × 1440 | 393 × 873 | 3.5 | 20:9 |
| Xiaomi 13 Pro | 6.73" | 3200 × 1440 | 393 × 873 | 3.5 | 20:9 |
| Xiaomi 14 | 6.36" | 2670 × 1200 | 393 × 851 | 3 | 20:9 |
| Xiaomi 13 | 6.36" | 2400 × 1080 | 393 × 851 | 2.75 | 20:9 |

---

## 2. Tablets

### 2.1 iPad Models

#### iPad Pro (2024)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| iPad Pro 13" (M4) | 13" | 2752 × 2064 | 1376 × 1032 | 2 | 264 |
| iPad Pro 11" (M4) | 11" | 2420 × 1668 | 1210 × 834 | 2 | 264 |

#### iPad Pro (6th Gen, 2022)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| iPad Pro 12.9" | 12.9" | 2732 × 2048 | 1366 × 1024 | 2 | 264 |
| iPad Pro 11" | 11" | 2388 × 1668 | 1194 × 834 | 2 | 264 |

#### iPad Air (5th Gen, 2022)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| iPad Air 10.9" | 10.9" | 2360 × 1640 | 1180 × 820 | 2 | 264 |

#### iPad (10th Gen, 2022)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| iPad 10.9" | 10.9" | 2360 × 1640 | 1180 × 820 | 2 | 264 |

#### iPad mini (6th Gen, 2021)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| iPad mini 8.3" | 8.3" | 2266 × 1488 | 1133 × 744 | 2 | 326 |

#### iPad Viewport Orientations

| Model | Portrait (W × H) | Landscape (W × H) |
|-------|------------------|-------------------|
| iPad Pro 13"/12.9" | 1024 × 1366 | 1366 × 1024 |
| iPad Pro 11" | 834 × 1194 | 1194 × 834 |
| iPad Air/iPad 10.9" | 820 × 1180 | 1180 × 820 |
| iPad mini 8.3" | 744 × 1133 | 1133 × 744 |

---

### 2.2 Samsung Galaxy Tab Models

#### Galaxy Tab S9 Series (2023)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| Galaxy Tab S9 Ultra | 14.6" | 2960 × 1848 | 1480 × 924 | 2 | 239 |
| Galaxy Tab S9+ | 12.4" | 2800 × 1752 | 1400 × 876 | 2 | 266 |
| Galaxy Tab S9 | 11" | 2560 × 1600 | 1280 × 800 | 2 | 274 |

#### Galaxy Tab S8 Series (2022)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| Galaxy Tab S8 Ultra | 14.6" | 2960 × 1848 | 1480 × 924 | 2 | 239 |
| Galaxy Tab S8+ | 12.4" | 2800 × 1752 | 1400 × 876 | 2 | 266 |
| Galaxy Tab S8 | 11" | 2560 × 1600 | 1280 × 800 | 2 | 274 |

#### Galaxy Tab A Series (Budget)

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| Galaxy Tab A9+ | 11" | 1920 × 1200 | 960 × 600 | 2 | 206 |
| Galaxy Tab A9 | 8.7" | 1340 × 800 | 670 × 400 | 2 | 179 |

#### Samsung Tab Viewport Orientations

| Model | Portrait (W × H) | Landscape (W × H) |
|-------|------------------|-------------------|
| Tab S9 Ultra | 924 × 1480 | 1480 × 924 |
| Tab S9+/S8+ | 876 × 1400 | 1400 × 876 |
| Tab S9/S8 | 800 × 1280 | 1280 × 800 |
| Tab A9+ | 600 × 960 | 960 × 600 |

---

### 2.3 Other Tablets

#### Microsoft Surface

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | Aspect Ratio |
|-------|-------------|---------------------|----------------|-----|--------------|
| Surface Go 3 | 10.5" | 1920 × 1280 | 960 × 640 | 2 | 3:2 |
| Surface Pro 9 | 13" | 2880 × 1920 | 1440 × 960 | 2 | 3:2 |

#### Amazon Fire

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| Fire HD 10 (2023) | 10.1" | 1920 × 1200 | 960 × 600 | 2 | 224 |
| Fire HD 8 (2022) | 8" | 1280 × 800 | 640 × 400 | 2 | 189 |

#### Lenovo Tab

| Model | Screen Size | Physical Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------|---------------------|----------------|-----|-----|
| Lenovo Tab P12 Pro | 12.6" | 2560 × 1600 | 1280 × 800 | 2 | 240 |
| Lenovo Tab P11 Pro | 11.5" | 2560 × 1600 | 1280 × 800 | 2 | 263 |

---

## 3. Desktop & Laptop

### 3.1 Common Desktop Resolutions

| Resolution | Name | Aspect Ratio | Market Share | Use Case |
|------------|------|--------------|--------------|----------|
| 1920 × 1080 | Full HD (FHD) | 16:9 | ~35-40% | Most common standard |
| 1366 × 768 | HD | 16:9 | ~15-20% | Budget laptops, education |
| 2560 × 1440 | Quad HD (QHD) | 16:9 | ~10-15% | High-end monitors |
| 3840 × 2160 | 4K UHD | 16:9 | ~5-10% | Premium displays |
| 1600 × 900 | HD+ | 16:9 | ~5-8% | Mid-range laptops |
| 1536 × 864 | - | 16:9 | ~3-5% | Mid-range laptops |
| 1440 × 900 | WXGA+ | 16:10 | ~3-5% | Older displays |

### 3.2 Ultrawide Monitors

| Resolution | Name | Aspect Ratio | Use Case |
|------------|------|--------------|----------|
| 2560 × 1080 | Ultrawide FHD | 21:9 | Gaming, productivity |
| 3440 × 1440 | Ultrawide QHD | 21:9 | Design, video editing |
| 5120 × 2160 | 5K Ultrawide | 21:9 | Professional content |
| 3840 × 1600 | UWQHD+ | 21:9 | Premium productivity |

### 3.3 MacBook Resolutions

#### MacBook Air (M4, 2025)

| Model | Native Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------------|----------------|-----|-----|
| MacBook Air 13.6" | 2560 × 1664 | 1280 × 832 | 2 | 224 |
| MacBook Air 15.3" | 2880 × 1864 | 1440 × 932 | 2 | 224 |

#### MacBook Pro (M4, 2024/2025)

| Model | Native Resolution | Viewport (CSS) | DPR | PPI |
|-------|-------------------|----------------|-----|-----|
| MacBook Pro 14.2" | 3024 × 1964 | 1512 × 982 | 2 | 254 |
| MacBook Pro 16.2" | 3456 × 2234 | 1728 × 1117 | 2 | 254 |

### 3.4 Windows Laptops

| Category | Resolution | Screen Size | DPR | Common Brands |
|----------|------------|-------------|-----|---------------|
| Standard | 1920 × 1080 | 13"-17" | 1.25-1.5 | Dell, HP, Lenovo |
| Budget | 1366 × 768 | 11"-15" | 1 | Budget models |
| Premium | 2560 × 1600 | 13"-15" | 2 | Dell XPS, HP Spectre |
| Surface | 2256 × 1504 | 13.5" | 2 | Microsoft Surface |
| High-End | 2880 × 1800 | 15"-16" | 2 | Gaming laptops |

### 3.5 Browser Viewport Considerations

**Critical**: Viewport ≠ Screen Resolution

```
Viewport Size = Screen Size - Browser Chrome (toolbars, tabs, scrollbars)
```

| Browser Element | Typical Height |
|-----------------|----------------|
| Address bar | 35-50px |
| Tab bar | 30-40px |
| Bookmarks bar | 25-35px |
| **Total Chrome** | **90-125px** |

**Example**: 1920×1080 display → ~1920×955 viewport (typical)

---

## 4. Tailwind CSS Breakpoints

### 4.1 Default Tailwind Breakpoints

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape), small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

### 4.2 Recommended Custom Breakpoints for Nanobanna Pro

```css
/* tailwind.config.js */
module.exports = {
  theme: {
    screens: {
      'xs': '360px',     /* Small phones */
      'sm': '640px',     /* Large phones */
      'md': '768px',     /* Tablets portrait */
      'lg': '1024px',    /* Tablets landscape / small desktop */
      'xl': '1280px',    /* Standard desktop */
      '2xl': '1536px',   /* Large desktop */
      '3xl': '1920px',   /* Full HD+ */
      '4xl': '2560px',   /* 2K/Ultrawide */
    },
  },
}
```

### 4.3 Breakpoint Usage Guide

| Breakpoint | Min Width | Max Width | Design Notes |
|------------|-----------|-----------|--------------|
| **Mobile** | 360px | 639px | Single column, stacked UI |
| **Mobile Large** | 640px | 767px | Slightly wider cards |
| **Tablet Portrait** | 768px | 1023px | 2-column layouts |
| **Tablet Landscape** | 1024px | 1279px | Compact sidebar |
| **Desktop** | 1280px | 1535px | Full sidebar, standard |
| **Desktop Large** | 1536px | 1919px | Enhanced spacing |
| **Desktop XL** | 1920px | ∞ | Max width 1440px, centered |

### 4.4 CSS Implementation

```css
/* Mobile-first approach */
:root {
  --max-content-width: 1440px;
}

/* Base (mobile) */
.container {
  width: 100%;
  padding: 0 1rem;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}

/* Large Desktop (1280px+) */
@media (min-width: 1280px) {
  .container {
    max-width: 1140px;
  }
}

/* Extra Large (1536px+) */
@media (min-width: 1536px) {
  .container {
    max-width: var(--max-content-width);
  }
}
```

---

## 5. Test Plan

### 5.1 Required Testing Devices

#### Tier 1: Must Test (Critical)

| Category | Device | Viewport | Priority |
|----------|--------|----------|----------|
| iOS Mobile | iPhone 16 Pro | 393 × 852 | P0 |
| iOS Mobile | iPhone SE | 375 × 667 | P0 |
| Android Mobile | Samsung S24 | 360 × 780 | P0 |
| Android Mobile | Pixel 9 | 412 × 823 | P0 |
| iOS Tablet | iPad Pro 11" | 834 × 1194 | P0 |
| Android Tablet | Galaxy Tab S9 | 800 × 1280 | P1 |
| Desktop | MacBook Pro 14" | 1512 × 982 | P0 |
| Desktop | Windows 1920×1080 | ~1920 × 955 | P0 |

#### Tier 2: Should Test (Important)

| Category | Device | Viewport | Priority |
|----------|--------|----------|----------|
| iOS Mobile | iPhone 16 Pro Max | 430 × 932 | P1 |
| Android Mobile | Galaxy Z Fold 5 | 604 × 725 | P1 |
| iOS Tablet | iPad Pro 12.9" | 1024 × 1366 | P1 |
| iOS Tablet | iPad mini | 744 × 1133 | P1 |
| Desktop | 2560×1440 | ~2560 × 1350 | P1 |
| Desktop | 4K (3840×2160) | ~1920 × 1000 | P1 |

#### Tier 3: Nice to Test (Optional)

| Category | Device | Viewport | Priority |
|----------|--------|----------|----------|
| Android | OnePlus 12 | 412 × 906 | P2 |
| Android | Xiaomi 14 Pro | 393 × 873 | P2 |
| Tablet | Fire HD 10 | 960 × 600 | P2 |
| Desktop | Ultrawide 3440×1440 | ~3440 × 1350 | P2 |

### 5.2 Testing Checklist

#### Layout Testing

- [ ] **Mobile Portrait**: All content visible, no horizontal scroll
- [ ] **Mobile Landscape**: Layout adapts appropriately
- [ ] **Tablet Portrait**: 2-column layout functions
- [ ] **Tablet Landscape**: Sidebar/navigation visible
- [ ] **Desktop**: Full layout with all features accessible
- [ ] **Ultrawide**: Content centered, max-width enforced

#### Component Testing

- [ ] **Navigation**: Hamburger menu on mobile, full nav on desktop
- [ ] **Forms**: Input fields sized appropriately for touch (44px min)
- [ ] **Buttons**: Touch targets ≥ 44×44px on mobile
- [ ] **Images**: Responsive, no overflow
- [ ] **Text**: Readable at all sizes, proper line lengths
- [ ] **Modals**: Properly centered, scrollable if needed

#### Orientation Testing

- [ ] **Portrait to Landscape**: Transition smooth, no layout break
- [ ] **Landscape to Portrait**: Content reflows correctly
- [ ] **Foldable (Z Fold)**: Adapts to cover and main display

#### Accessibility Testing

- [ ] **High Contrast Mode**: Elements visible with `prefers-contrast: more`
- [ ] **Forced Colors**: Windows High Contrast Mode supported
- [ ] **Reduced Motion**: Animations respect `prefers-reduced-motion`
- [ ] **Text Zoom**: Layout handles 200% text zoom

### 5.3 Browser DevTools Testing

```javascript
// Quick viewport check in browser console
console.log({
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  screen: {
    width: window.screen.width,
    height: window.screen.height,
  },
  dpr: window.devicePixelRatio,
});
```

### 5.4 Automated Testing Tools

| Tool | Purpose | URL |
|------|---------|-----|
| Chrome DevTools | Device simulation | Built-in |
| BrowserStack | Real device testing | browserstack.com |
| Responsively | Multi-viewport preview | responsively.app |
| Lighthouse | Performance & accessibility | Built-in Chrome |

---

## 6. Quick Reference

### 6.1 Common Mobile Viewports (Portrait)

| Width Range | Devices |
|-------------|---------|
| 360-375px | iPhone SE, Samsung A series |
| 390-393px | iPhone 16/15/14 standard, Xiaomi |
| 412-448px | Pixel phones, OnePlus |
| 430px | iPhone Pro Max |

### 6.2 Common Tablet Viewports (Portrait)

| Width Range | Devices |
|-------------|---------|
| 744-768px | iPad mini, small tablets |
| 800-834px | iPad Pro 11", Galaxy Tab S9 |
| 1024px | iPad Pro 12.9" |

### 6.3 Desktop Viewport Ranges

| Width Range | Category |
|-------------|----------|
| 1024-1279px | Small desktop / tablet landscape |
| 1280-1439px | Standard desktop |
| 1440-1919px | Large desktop |
| 1920px+ | Full HD and above |

### 6.4 DPR Summary

| DPR | Devices |
|-----|---------|
| 1.0 | Older laptops, budget monitors |
| 1.25-1.5 | Windows laptops (scaled) |
| 2.0 | MacBooks, iPads, premium laptops |
| 2.625-3.0 | Pixel phones, high-end Android |
| 3.0 | iPhones (all modern) |
| 3.5-4.0 | Samsung Ultra series |

### 6.5 CSS Media Query Quick Reference

```css
/* Mobile first - small phones */
/* Default styles for 360px+ */

/* Large phones */
@media (min-width: 640px) { }

/* Tablets portrait */
@media (min-width: 768px) { }

/* Tablets landscape / small desktop */
@media (min-width: 1024px) { }

/* Desktop */
@media (min-width: 1280px) { }

/* Large desktop */
@media (min-width: 1536px) { }

/* Full HD+ */
@media (min-width: 1920px) { }

/* Retina/HiDPI screens */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 192dpi) { }
```

---

## References

- [Blisk Device Database](https://blisk.io/devices)
- [YesViz Device Specifications](https://yesviz.com/)
- [Screen Sizes Database](https://screensiz.es/)
- [WebMobileFirst Device Specs](https://www.webmobilefirst.com/en/devices/)
- [Apple Device Specifications](https://www.apple.com/shop/iphone/compare)
- [Samsung Device Specifications](https://www.samsung.com/specs/)
- [Google Pixel Specifications](https://store.google.com/product/pixel_specs)
- [GSMArena Device Database](https://www.gsmarena.com/)

---

*Document created for Nanobanna Pro - AI-Powered LinkedIn Banner Design Tool*
*Research compiled on 2026-01-08*
