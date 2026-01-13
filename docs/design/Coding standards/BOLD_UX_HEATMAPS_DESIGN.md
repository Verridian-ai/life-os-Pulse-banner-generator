# Bold UX: Heatmaps & Avant-Garde Design

> Research-backed gaze mechanics and unconventional design patterns
> Source: Extracted from Bold UX: Heatmaps & Avant-Garde Design.pdf

---

## 1. Gaze Mechanics & Eye Tracking Patterns

### 1.1 Traditional Patterns

**F-Pattern**
- Users scan horizontally across the top
- Then vertically down the left side
- Best for: Text-heavy content, articles, documentation

**Z-Pattern**
- Eyes move: Top-left → Top-right → Bottom-left → Bottom-right
- Best for: Landing pages with minimal text

**Layer Cake Pattern**
- Users scan headings horizontally
- Skip body text, jump to next heading
- Best for: Scannable content with clear hierarchy

### 1.2 Avant-Garde Patterns

**Pinball Pattern (Broken Grids)**
- Eyes bounce between visual "anchors"
- Requires deliberate placement of focal points
- Creates engagement through visual tension

```
Traditional Grid:        Pinball Layout:
┌───┬───┬───┐           ┌─────────┬───┐
│   │   │   │           │  ANCHOR │   │
├───┼───┼───┤           │    1    │   │
│   │   │   │           ├───┬─────┴───┤
├───┼───┼───┤           │   │ ANCHOR  │
│   │   │   │           │   │    2    │
└───┴───┴───┘           └───┴─────────┘
```

**Focused Linear Pattern (Scrollytelling)**
- Single-column narrative flow
- Content reveals as user scrolls
- Maximum engagement through controlled pacing

### 1.3 The "Anchor & Orbit" Strategy

For broken grid layouts, use visual anchors:

```typescript
// Anchor elements that draw the eye
const anchorElements = {
  primary: {
    size: 'large',      // 2-3x other elements
    contrast: 'high',   // Dark on light or vice versa
    motion: true        // Subtle animation
  },
  secondary: {
    size: 'medium',
    contrast: 'medium',
    motion: false
  }
};
```

**Anchor Placement Rules**:
1. Maximum 2-3 anchors per viewport
2. Anchors should form a triangular relationship
3. Orbit elements (smaller) guide between anchors
4. Never place anchors at exact grid intersections

---

## 2. Micro-Interaction ROI

### 2.1 Measured Impact

| Metric | Improvement | Source |
|--------|-------------|--------|
| Browsing time | +12% | UserZoom study |
| User satisfaction | +17% | Baymard Institute |
| Form completion | +23% | Nielsen Norman |
| Return visits | +15% | Internal A/B tests |

### 2.2 High-ROI Micro-Interactions

**Button Feedback**
```css
.button-premium {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.button-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button-premium:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**Input Focus States**
```css
.input-premium {
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-premium:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
  outline: none;
}
```

**Loading States**
```typescript
// Skeleton with subtle shimmer
const SkeletonShimmer = styled.div`
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
```

---

## 3. 3D UI Engagement Metrics

### 3.1 Research Data

| Metric | 3D vs 2D | Significance |
|--------|----------|--------------|
| Conversion lift | +94% | p < 0.01 |
| Interaction rate | 82% | (vs 45% for 2D) |
| Dwell time >30s | 34% | (vs 12% for 2D) |
| Scroll depth | +67% | More page explored |
| Return rate | +28% | Within 7 days |

### 3.2 When to Use 3D

**High Impact**:
- Product showcases (e-commerce)
- Portfolio/case studies
- Interactive demos
- Data visualization
- Hero sections (sparingly)

**Avoid 3D**:
- Form-heavy pages
- Text-heavy content
- Mobile-first experiences (without fallback)
- Users on low-end devices

### 3.3 3D Performance Considerations

```typescript
import { getGPUTier } from 'detect-gpu';

async function setup3DExperience() {
  const gpu = await getGPUTier();

  return {
    tier0: {
      // Integrated graphics - 2D fallback
      use3D: false,
      fallback: 'static-image'
    },
    tier1: {
      // Low-end discrete - simple 3D
      use3D: true,
      quality: 'low',
      shadows: false,
      postProcessing: false
    },
    tier2: {
      // Mid-range - full 3D
      use3D: true,
      quality: 'medium',
      shadows: true,
      postProcessing: false
    },
    tier3: {
      // High-end - all effects
      use3D: true,
      quality: 'high',
      shadows: true,
      postProcessing: true
    }
  }[`tier${gpu.tier}`];
}
```

---

## 4. Good Friction: Intentional Slowdowns

### 4.1 The Concept

**Bad Friction**: Unnecessary obstacles that frustrate users
**Good Friction**: Intentional slowdowns that improve outcomes

### 4.2 Examples of Good Friction

**Confirmation Steps**
```typescript
// Bad: Instant delete
const deleteItem = () => {
  api.delete(item.id);
};

// Good: Confirmation friction
const deleteItem = () => {
  if (window.confirm('Delete this item? This cannot be undone.')) {
    api.delete(item.id);
  }
};

// Better: Undo instead of confirmation
const deleteItem = () => {
  api.softDelete(item.id);
  showToast({
    message: 'Item deleted',
    action: { label: 'Undo', onClick: () => api.restore(item.id) },
    duration: 5000
  });
};
```

**Progressive Disclosure**
```typescript
// Reveal complexity gradually
const FormWithDisclosure = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form>
      {/* Essential fields always visible */}
      <Input name="email" required />
      <Input name="password" required />

      {/* Advanced options hidden by default */}
      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? 'Hide' : 'Show'} advanced options
      </button>

      {showAdvanced && (
        <div className="advanced-options">
          <Input name="twoFactor" />
          <Input name="sessionDuration" />
        </div>
      )}
    </form>
  );
};
```

**Deliberate Loading States**
```typescript
// Minimum display time for loading states
// Prevents jarring flash for fast operations
const useMinimumLoadingTime = (isLoading: boolean, minTime = 300) => {
  const [showLoading, setShowLoading] = useState(false);
  const loadingStarted = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading && !loadingStarted.current) {
      loadingStarted.current = Date.now();
      setShowLoading(true);
    } else if (!isLoading && loadingStarted.current) {
      const elapsed = Date.now() - loadingStarted.current;
      const remaining = Math.max(0, minTime - elapsed);

      setTimeout(() => {
        setShowLoading(false);
        loadingStarted.current = null;
      }, remaining);
    }
  }, [isLoading, minTime]);

  return showLoading;
};
```

---

## 5. Scrollytelling Implementation

### 5.1 Core Pattern

```typescript
import { useScroll, useTransform, motion } from 'framer-motion';

const ScrollytellingSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Transform scroll progress to animation values
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <div ref={containerRef} style={{ height: '200vh' }}>
      <motion.div
        style={{
          opacity,
          y,
          scale,
          position: 'sticky',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        <h2>Content reveals as you scroll</h2>
      </motion.div>
    </div>
  );
};
```

### 5.2 Multi-Stage Scrollytelling

```typescript
const stages = [
  { id: 1, title: 'Introduction', content: '...' },
  { id: 2, title: 'Problem', content: '...' },
  { id: 3, title: 'Solution', content: '...' },
  { id: 4, title: 'Results', content: '...' }
];

const MultiStageScrollytelling = () => {
  const [activeStage, setActiveStage] = useState(0);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      const stageIndex = Math.floor(v * stages.length);
      setActiveStage(Math.min(stageIndex, stages.length - 1));
    });
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <div ref={containerRef} style={{ height: `${stages.length * 100}vh` }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2>{stages[activeStage].title}</h2>
            <p>{stages[activeStage].content}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
```

---

## 6. Aesthetic-Usability Effect

### 6.1 The Principle

Users perceive aesthetically pleasing designs as more usable, even when they're not. This creates a "halo effect" that influences:

- Trust perception (+32%)
- Error tolerance (+18%)
- Time-on-task perception (-15% perceived time)
- Recommendation likelihood (+27%)

### 6.2 Leveraging the Effect

**Do**:
- Invest in visual polish for first impressions
- Use aesthetic quality to build trust before asking for data
- Apply premium aesthetics to error states

**Don't**:
- Sacrifice actual usability for aesthetics
- Use beauty to hide poor UX
- Assume good looks = good UX (still test!)

---

## 7. Implementation Checklist

### Gaze Mechanics
- [ ] Identified primary gaze pattern for content type
- [ ] Placed visual anchors strategically (max 2-3 per viewport)
- [ ] Broken grids use Anchor & Orbit strategy
- [ ] Scrollytelling sections have clear narrative flow

### Micro-Interactions
- [ ] All buttons have hover/active states
- [ ] Inputs have clear focus indicators
- [ ] Loading states show progress (not just spinners)
- [ ] Transitions are 150-300ms (not too fast, not too slow)

### 3D Elements
- [ ] GPU tier detection implemented
- [ ] Fallbacks for low-end devices
- [ ] 3D used for high-impact areas only
- [ ] Performance budget verified

### Good Friction
- [ ] Destructive actions have confirmation/undo
- [ ] Complex features use progressive disclosure
- [ ] Loading states have minimum display time
- [ ] Form validation is inline, not blocking

---

*Last Updated: 2026-01-13*
*Source: Bold UX: Heatmaps & Avant-Garde Design.pdf*
