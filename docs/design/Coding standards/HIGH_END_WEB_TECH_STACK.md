# High-End Web Tech Stack Analysis

> Production-ready techniques for award-winning web development (2026)
> Source: Extracted from High-End Web Tech Stack Analysis.pdf

---

## 1. Aesthetic Physics: The Luxury Lag Principle

### 1.1 Core Concept

High-end web experiences deliberately introduce **controlled latency** between user input and visual response. This creates a sense of weight, polish, and intentionality.

**Key Insight**: The gap between "functional" and "premium" often lies in this intentional delay.

### 1.2 Lerp (Linear Interpolation)

The foundation of smooth motion:

```typescript
// Standard Lerp Formula
v_current = v_current + (v_target - v_current) * factor;

// Frame-rate independent version (preferred)
v_current = lerp(v_current, v_target, 1 - Math.exp(-speed * deltaTime));
```

**Standard Values**:
| Use Case | Lerp Factor | Feel |
|----------|-------------|------|
| General UI | 0.1 | Smooth, responsive |
| Heavy cursor effects | 0.05 - 0.08 | Weighty, premium |
| Magnetic snapping | 0.15 - 0.2 | Quick but controlled |
| Background parallax | 0.03 - 0.05 | Slow, atmospheric |

### 1.3 Spring Physics

For more natural, organic motion:

```typescript
// Spring configuration
const springConfig = {
  stiffness: 100,    // How snappy (higher = faster)
  damping: 10,       // How much resistance (higher = less bounce)
  mass: 1            // Weight (higher = more momentum)
};

// Framer Motion spring
<motion.div
  animate={{ x: targetX }}
  transition={{ type: "spring", ...springConfig }}
/>
```

**Presets**:
| Preset | Stiffness | Damping | Use Case |
|--------|-----------|---------|----------|
| Gentle | 100 | 15 | Modal transitions |
| Snappy | 300 | 30 | Button feedback |
| Bouncy | 200 | 10 | Playful UI elements |
| Heavy | 50 | 20 | Large page transitions |

---

## 2. Essential Library Stack (2026)

### 2.1 Core 3D & WebGL

```bash
npm install three @react-three/fiber @react-three/drei ogl
```

| Package | Purpose | Key Features |
|---------|---------|--------------|
| `three` | 3D engine | Full WebGL abstraction |
| `@react-three/fiber` | React renderer for Three.js | Declarative 3D |
| `@react-three/drei` | Helper components | OrbitControls, Text, etc. |
| `ogl` | Lightweight WebGL | When Three.js is overkill |

### 2.2 Animation & Motion

```bash
npm install gsap lenis framer-motion
```

| Package | Purpose | Best For |
|---------|---------|----------|
| `gsap` | Timeline animation | Complex sequences, ScrollTrigger |
| `lenis` | Smooth scroll | Inertia scrolling, momentum |
| `framer-motion` | React motion | State-based UI animations |

**GSAP ScrollTrigger Pattern**:
```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.to('.element', {
  scrollTrigger: {
    trigger: '.element',
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: 1,           // Smooth scrubbing
    markers: false      // Debug markers
  },
  y: -100,
  opacity: 1
});
```

**Lenis Smooth Scroll Setup**:
```typescript
import Lenis from 'lenis';

const lenis = new Lenis({
  duration: 1.2,        // Scroll duration
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

### 2.3 State & Performance

```bash
npm install zustand detect-gpu tunnel-rat
```

| Package | Purpose | Pattern |
|---------|---------|---------|
| `zustand` | Lightweight state | Replace Redux for 3D state |
| `detect-gpu` | GPU capability detection | Graceful degradation |
| `tunnel-rat` | React portal for R3F | Escape Three.js canvas |

**detect-gpu Pattern**:
```typescript
import { getGPUTier } from 'detect-gpu';

const gpuTier = await getGPUTier();

// Adjust quality based on GPU
const qualitySettings = {
  0: { shadows: false, postProcessing: false, particles: 100 },
  1: { shadows: false, postProcessing: true, particles: 500 },
  2: { shadows: true, postProcessing: true, particles: 1000 },
  3: { shadows: true, postProcessing: true, particles: 5000 }
};

const settings = qualitySettings[gpuTier.tier];
```

### 2.4 Typography & Effects

```bash
npm install troika-three-text postprocessing @react-three/postprocessing
```

| Package | Purpose | Key Feature |
|---------|---------|-------------|
| `troika-three-text` | 3D text rendering | MSDF for crisp text at any scale |
| `postprocessing` | WebGL post-effects | Bloom, chromatic aberration |
| `@react-three/postprocessing` | React wrapper | Declarative effects |

**MSDF Text Pattern**:
```typescript
import { Text } from '@react-three/drei';

<Text
  font="/fonts/GeneralSans-Bold.woff"
  fontSize={2}
  letterSpacing={-0.05}
  textAlign="center"
  anchorX="center"
  anchorY="middle"
>
  Premium Typography
</Text>
```

---

## 3. Visual Effects Techniques

### 3.1 Chromatic Aberration

Subtle color fringing that adds depth:

```typescript
import { ChromaticAberration, EffectComposer } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

<EffectComposer>
  <ChromaticAberration
    blendFunction={BlendFunction.NORMAL}
    offset={[0.002, 0.002]}  // Subtle offset
  />
</EffectComposer>
```

**Values**:
| Intensity | Offset | Use Case |
|-----------|--------|----------|
| Subtle | [0.001, 0.001] | Always-on polish |
| Medium | [0.003, 0.003] | Hover states |
| Strong | [0.005, 0.005] | Glitch effects |

### 3.2 Optical vs Mathematical Centering

**Mathematical centering** looks off. **Optical centering** accounts for visual weight:

```css
/* Mathematical (wrong for display text) */
.text-math {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Optical (correct) */
.text-optical {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Shift up slightly to account for descenders */
  transform: translateY(-0.05em);
}
```

### 3.3 Noise & Grain Overlay

Adds texture to flat designs:

```css
.grain-overlay {
  position: relative;
}

.grain-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 200px;
  opacity: 0.03;  /* 3-5% for subtle effect */
  pointer-events: none;
  mix-blend-mode: overlay;
}
```

---

## 4. Performance Budgets

### 4.1 Animation Frame Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| Frame time | ≤16ms | 60fps |
| JS execution | ≤10ms | Leaves 6ms for rendering |
| Layout/Paint | ≤4ms | Avoid forced reflows |

### 4.2 WebGL Performance

| Metric | Budget | Notes |
|--------|--------|-------|
| Draw calls | ≤100 | Batch geometries |
| Triangles | ≤500k | LOD for complex models |
| Texture memory | ≤256MB | Compress with basis |
| Shader complexity | Low | Avoid complex fragment shaders |

### 4.3 Blur Budget

| Context | Max Blur Radius | Notes |
|---------|-----------------|-------|
| Mobile | 20px | Heavy GPU load |
| Desktop | 40px | Still expensive |
| Count | ≤3 elements | Total blur elements on screen |

---

## 5. Implementation Checklist

### Before Launch

- [ ] GPU tier detection implemented
- [ ] Graceful degradation for low-end devices
- [ ] Lerp/Spring values tuned for target feel
- [ ] Smooth scroll tested across browsers
- [ ] Post-processing effects have performance fallbacks
- [ ] MSDF fonts loaded for crisp 3D text
- [ ] Animation frame budget verified (≤16ms)
- [ ] Blur count under budget (≤3 elements)

### Quality Assurance

- [ ] Test on GPU tier 0 (integrated graphics)
- [ ] Test on GPU tier 1-2 (mid-range)
- [ ] Test on GPU tier 3 (dedicated GPU)
- [ ] Mobile performance verified
- [ ] Reduced motion preference respected

---

## 6. Quick Reference

### Lerp Cheat Sheet

```typescript
// Cursor follow
const lerp = 0.08;

// UI transitions
const lerp = 0.1;

// Parallax
const lerp = 0.03;

// Magnetic effect
const lerp = 0.15;
```

### Spring Cheat Sheet

```typescript
// Modal open
{ stiffness: 300, damping: 30 }

// Button press
{ stiffness: 400, damping: 25 }

// Page transition
{ stiffness: 100, damping: 20 }

// Bounce effect
{ stiffness: 200, damping: 10 }
```

---

*Last Updated: 2026-01-13*
*Source: High-End Web Tech Stack Analysis.pdf*
