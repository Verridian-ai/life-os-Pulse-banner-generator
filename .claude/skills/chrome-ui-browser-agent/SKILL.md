# Chrome UI Browser Agent

**Model**: Claude Haiku 4.5
**Cost**: $0.80/1M tokens
**Token Budget**: 25,000 tokens/execution
**Execution**: On-demand (high frequency)

---

## Purpose

Visual UI verification and issue detection using Chrome DevTools MCP integration. This is the ONLY agent authorized to perform browser-based testing and visual confirmation of the application.

**Primary Use Cases**:
- Visual regression testing
- UI component verification
- Layout issue detection
- Performance profiling
- Accessibility auditing
- Real-time debugging of visual bugs
- Mobile-first testing (see Section 7)
- Touch target validation
- Thumb zone analysis

---

## Triggers

### Automatic Activation

User requests containing:
- "check the UI"
- "verify the design"
- "test the page"
- "see how it looks"
- "browse to [URL]"
- "inspect [component]"
- "screenshot [page]"
- "performance test"
- "accessibility check"
- "web vitals"
- "mobile test"
- "touch targets"
- "thumb zone"
- "responsive test"
- "mobile viewport"

### Manual Activation

```bash
/skill chrome-ui-browser-agent "Check landing page layout"
```

---

## Capabilities

### 1. Visual Verification

**Screenshot Capture**:
```typescript
// Full page screenshot
chrome.screenshot({
  url: "http://localhost:5173",
  fullPage: true,
  viewport: { width: 1920, height: 1080 }
})

// Component-specific screenshot
chrome.screenshot({
  url: "http://localhost:5173/studio",
  selector: ".canvas-editor",
  fullPage: false
})

// Mobile viewport
chrome.screenshot({
  url: "http://localhost:5173",
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2
})
```

**Visual Comparison**:
- Compare current UI against baseline screenshots
- Detect layout shifts, color changes, spacing issues
- Flag visual regressions automatically

---

### 2. Layout Issue Detection

**Neumorphism Verification**:
```typescript
// Check glass effects are rendering correctly
chrome.evaluateCSS({
  selector: ".neu-card",
  properties: [
    "box-shadow",
    "backdrop-filter",
    "border",
    "background"
  ]
})

// Verify blur budget compliance
chrome.auditPerformance({
  filters: ["backdrop-filter"],
  maxBlur: { mobile: 20, desktop: 40 }
})
```

**Responsive Breakpoints**:
- Test at 375px (mobile), 768px (tablet), 1920px (desktop)
- Verify safe zones on canvas editor
- Check text readability at all sizes
- **See Section 7.1** for comprehensive mobile viewport matrix (8 viewports)
- **See Section 7.4** for mobile-specific blur budget validation (max 20px)

---

### 3. Performance Profiling

**Web Vitals**:
```typescript
chrome.webVitals({
  url: "http://localhost:5173/studio",
  metrics: ["LCP", "FID", "CLS", "TTFB"],
  baseline: {
    LCP: 2500,  // ms
    FID: 100,   // ms
    CLS: 0.1,   // score
    TTFB: 600   // ms
  }
})
```

**Memory Leak Detection**:
```typescript
// Test voice agent session for leaks
chrome.profileMemory({
  scenario: "voice-session",
  iterations: 20,
  alertThreshold: 10 // % growth
})
```

---

### 4. Accessibility Auditing

**WCAG Compliance**:
```typescript
chrome.auditAccessibility({
  url: "http://localhost:5173",
  standard: "WCAG2.1-AA",
  includeWarnings: true
})
```

**Checks**:
- Color contrast ratios (neumorphic elements)
- Keyboard navigation
- Screen reader compatibility
- Focus indicators
- ARIA labels
- **Touch targets** (WCAG 2.5.5) - See Section 7.2
- **Reduced motion** compliance - See Section 7.6
- **Mobile accessibility checklist** - See Section 7.8

---

### 5. Real-Time Debugging

**Console Monitoring**:
```typescript
chrome.watchConsole({
  url: "http://localhost:5173/studio",
  filters: {
    errors: true,
    warnings: true,
    logLevel: "warn"
  },
  duration: 60 // seconds
})
```

**Network Analysis**:
```typescript
chrome.profileNetwork({
  url: "http://localhost:5173",
  trackAssets: ["images", "fonts", "scripts"],
  slowThreshold: 3000 // ms
})
```

---

## Tools Available

| Tool | Purpose | Usage Frequency |
|------|---------|-----------------|
| **ChromeDevTools** | All browser operations | Very High |
| **Read** | Check test results, logs | High |
| **Grep** | Find related issues in code | Medium |
| **Bash(serve)** | Start dev server if needed | Low |

**Forbidden Tools**: `Edit`, `Write` (read-only agent)

---

## Execution Workflow

### Standard UI Check

```
User: "Check the studio page layout"
   ↓
[Chrome UI Browser Agent]
   1. Launch Chrome in headless mode
   2. Navigate to http://localhost:5173/studio
   3. Take full-page screenshot
   4. Audit layout (safe zones, spacing)
   5. Check neumorphic effects rendering
   6. Verify responsive breakpoints
   7. Run accessibility scan
   8. Return visual report + screenshot
   ↓
Result: "✓ Layout correct. ⚠️ Contrast issue on button (4.3:1, needs 4.5:1)"
```

---

### Performance Test

```
User: "Test performance of canvas editor"
   ↓
[Chrome UI Browser Agent]
   1. Launch Chrome with performance profiling
   2. Navigate to /studio
   3. Measure Web Vitals (LCP, FID, CLS)
   4. Profile CSS (backdrop-filter usage)
   5. Check memory usage during canvas operations
   6. Generate performance report
   ↓
Result: "LCP: 1.8s ✓ | FID: 45ms ✓ | CLS: 0.05 ✓ | Blur budget: 35px (88%) ⚠️"
```

---

### Visual Regression

```
User: "Check if the landing page looks correct after my changes"
   ↓
[Chrome UI Browser Agent]
   1. Load baseline screenshot from .claude/screenshots/baseline/
   2. Take current screenshot
   3. Compare pixel-by-pixel
   4. Highlight differences
   5. Flag changes >5% difference
   ↓
Result: "⚠️ Visual regression detected: Header height changed from 64px to 72px"
```

---

## Integration with Other Skills

### Works With

| Skill | Integration | Example |
|-------|-------------|---------|
| **Debugging Agent** | Pass visual issues for code investigation | "Browser agent found layout bug → Debug agent traces root cause" |
| **Coding Agent** | Verify fixes after code changes | "Coding agent fixes bug → Browser agent confirms fix visually" |
| **QA Agent** | Visual confirmation of test results | "QA runs tests → Browser agent screenshots failure states" |
| **Accessibility Officer** | WCAG audit results | "Browser agent finds contrast issue → Accessibility agent suggests fix" |

---

## Configuration

File: `.claude/skills/chrome-ui-browser-agent/config.json`

```json
{
  "enabled": true,
  "auto_activate": true,
  "chrome_config": {
    "headless": true,
    "viewport": {
      "width": 1920,
      "height": 1080
    },
    "device_scale_factor": 1,
    "timeout": 30000
  },
  "screenshot_storage": ".claude/screenshots/",
  "baseline_images": ".claude/screenshots/baseline/",
  "visual_diff_threshold": 0.05,
  "performance_baselines": {
    "LCP": 2500,
    "FID": 100,
    "CLS": 0.1,
    "TTFB": 600
  },
  "accessibility_standard": "WCAG2.1-AA",
  "blur_budget": {
    "mobile_max": 20,
    "desktop_max": 40
  }
}
```

---

## Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Visual regression catches | >95% | TBD | 🟡 |
| Performance baseline compliance | 100% | TBD | 🟡 |
| Accessibility issues detected | >90% | TBD | 🟡 |
| Response time (full check) | <30s | TBD | 🟡 |
| False positives | <5% | TBD | 🟡 |
| Mobile viewport coverage | 100% (8 viewports) | TBD | 🟡 |
| Touch target compliance | 100% | TBD | 🟡 |
| Mobile blur budget compliance | 100% | TBD | 🟡 |

---

## Example Invocations

### Example 1: Quick Visual Check

```
User: "Check if the canvas editor looks right"

[Chrome UI Browser Agent]:
🚀 Launching Chrome...
📸 Capturing screenshot: /studio
✓ Layout verified
✓ Neumorphic effects rendering correctly
✓ Safe zones intact (1920x1080)
⚠️ Warning: Blur budget at 38px (95% of 40px max)

Screenshot saved: .claude/screenshots/studio-2026-01-13-1430.png

[Tokens: 8,200 | Cost: $0.007]
```

---

### Example 2: Performance Profiling

```
User: "Test voice agent performance"

[Chrome UI Browser Agent]:
🚀 Launching Chrome with profiling...
🎤 Starting voice session simulation...
📊 Profiling for 60 seconds...

Results:
✓ LCP: 1.2s (baseline: 2.5s)
✓ FID: 32ms (baseline: 100ms)
✓ CLS: 0.03 (baseline: 0.1)
⚠️ Memory growth: 8% over 20 iterations (threshold: 10%)

Recommendation: Voice session memory usage is acceptable but approaching limit.

[Tokens: 12,400 | Cost: $0.010]
```

---

### Example 3: Accessibility Audit

```
User: "Run accessibility check on landing page"

[Chrome UI Browser Agent]:
🚀 Launching Chrome...
♿ Running WCAG 2.1 AA audit...

Issues Found: 3

🔴 Critical (1):
- Button "Get Started" has insufficient contrast (3.8:1, needs 4.5:1)
  Location: .landing-hero button.cta

🟡 Warnings (2):
- Missing alt text on logo image
  Location: header img.logo
- Heading hierarchy skip (h1 → h3)
  Location: section.features

✓ Keyboard navigation: Passed
✓ Screen reader compatibility: Passed
✓ Focus indicators: Passed

[Tokens: 9,800 | Cost: $0.008]
```

---

### Example 4: Visual Regression Detection

```
User: "Did my changes break the UI?"

[Chrome UI Browser Agent]:
🚀 Launching Chrome...
📸 Comparing against baseline...

Pages checked: 3 (/, /studio, /gallery)

✓ / (landing): No changes detected
⚠️ /studio: Layout shift detected
   - Canvas safe zone moved 8px right
   - Sidebar width changed 320px → 340px
✓ /gallery: No changes detected

Screenshot diff: .claude/screenshots/diff-studio-2026-01-13.png

Recommendation: Verify sidebar width change is intentional.

[Tokens: 11,200 | Cost: $0.009]
```

---

## Screenshot Organization

```
.claude/screenshots/
  baseline/
    landing-1920x1080.png
    studio-1920x1080.png
    gallery-1920x1080.png
    landing-375x812.png    # Mobile
    studio-375x812.png
  current/
    landing-2026-01-13-1430.png
    studio-2026-01-13-1430.png
  diff/
    studio-diff-2026-01-13-1430.png  # Visual regression
  components/
    canvas-editor-2026-01-13.png
    generative-sidebar-2026-01-13.png
  mobile/                            # Mobile-first testing (Section 7.7)
    baseline/
      mobile-sm-portrait-default.png
      mobile-md-portrait-default.png
      tablet-portrait-default.png
    current/
      mobile-sm-portrait-default.png
      mobile-md-landscape-scrolled.png
    diff/
      mobile-md-portrait-diff.png
```

---

## Chrome DevTools MCP Commands

### Available Commands

```bash
# Screenshot
chrome-devtools screenshot --url [URL] --selector [CSS] --viewport [WxH]

# Performance
chrome-devtools web-vitals --url [URL] --metrics LCP,FID,CLS

# Accessibility
chrome-devtools audit-a11y --url [URL] --standard WCAG2.1-AA

# Console
chrome-devtools console --url [URL] --duration [seconds]

# Network
chrome-devtools network --url [URL] --track [asset-types]

# Memory
chrome-devtools memory-profile --scenario [name] --iterations [N]

# CSS
chrome-devtools css-audit --url [URL] --property [backdrop-filter]
```

---

## 7. MOBILE-FIRST TESTING PROTOCOLS

Mobile testing is critical for modern applications. This section defines comprehensive protocols for validating UI behavior across mobile devices.

---

### 7.1 Mobile Viewport Testing Matrix

```javascript
const MOBILE_VIEWPORTS = {
  // Critical mobile breakpoints
  'mobile-xs': { width: 320, height: 568 },   // iPhone SE/5
  'mobile-sm': { width: 375, height: 667 },   // iPhone 8
  'mobile-md': { width: 390, height: 844 },   // iPhone 12/13/14
  'mobile-lg': { width: 428, height: 926 },   // iPhone 12 Pro Max
  'android-sm': { width: 360, height: 640 },  // Common Android
  'android-md': { width: 412, height: 915 },  // Pixel 6
  'tablet-portrait': { width: 768, height: 1024 }, // iPad
  'tablet-landscape': { width: 1024, height: 768 },
};

// Usage in screenshot workflow
async function captureAllMobileViewports(page, url) {
  const screenshots = [];
  for (const [name, viewport] of Object.entries(MOBILE_VIEWPORTS)) {
    await page.setViewport({ ...viewport, deviceScaleFactor: 2 });
    const screenshot = await page.screenshot({ fullPage: true });
    screenshots.push({ name, viewport, screenshot });
  }
  return screenshots;
}
```

**Required Coverage**: All mobile viewports MUST be tested for any UI change affecting responsive layout.

---

### 7.2 Touch Target Validation

```javascript
// WCAG 2.5.5 Target Size validation
function validateTouchTargets(element) {
  const rect = element.getBoundingClientRect();
  const MIN_SIZE = 44; // pixels - WCAG minimum
  const RECOMMENDED_SIZE = 48; // pixels - Material Design recommendation

  return {
    width: rect.width,
    height: rect.height,
    meetsMinimum: rect.width >= MIN_SIZE && rect.height >= MIN_SIZE,
    meetsRecommended: rect.width >= RECOMMENDED_SIZE && rect.height >= RECOMMENDED_SIZE,
    spacing: getSpacingFromNeighbors(element), // Must be >= 8px
  };
}

// Full page touch target audit
async function auditTouchTargets(page) {
  return page.evaluate(() => {
    const interactiveSelectors = 'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]';
    const elements = [...document.querySelectorAll(interactiveSelectors)];

    return elements.map(el => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);

      // Skip hidden elements
      if (style.display === 'none' || style.visibility === 'hidden') return null;

      return {
        selector: getUniqueSelector(el),
        text: el.textContent?.trim().slice(0, 50),
        width: rect.width,
        height: rect.height,
        meetsMinimum: rect.width >= 44 && rect.height >= 44,
        meetsRecommended: rect.width >= 48 && rect.height >= 48,
        violation: rect.width < 44 || rect.height < 44,
      };
    }).filter(Boolean);
  });
}
```

**Enforcement**: Any interactive element failing touch target validation MUST be flagged as a critical issue.

---

### 7.3 Mobile Performance Profiling

```javascript
const MOBILE_PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint (ms)
  INP: { good: 200, poor: 500 },         // Interaction to Next Paint (ms)
  CLS: { good: 0.1, poor: 0.25 },        // Cumulative Layout Shift (score)
  TTFB: { good: 600, poor: 1800 },       // Time to First Byte (ms)
  FCP: { good: 1800, poor: 3000 },       // First Contentful Paint (ms)
  TBT: { good: 200, poor: 600 },         // Total Blocking Time (ms)
};

// Simulate slow network conditions
const NETWORK_CONDITIONS = {
  '3G-slow': { downloadKbps: 500, uploadKbps: 500, latencyMs: 400 },
  '3G-fast': { downloadKbps: 1500, uploadKbps: 750, latencyMs: 150 },
  '4G': { downloadKbps: 4000, uploadKbps: 3000, latencyMs: 50 },
};

// Mobile performance test with network throttling
async function testMobilePerformance(page, url, networkProfile = '3G-fast') {
  const client = await page.target().createCDPSession();

  // Apply network throttling
  const network = NETWORK_CONDITIONS[networkProfile];
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (network.downloadKbps * 1024) / 8,
    uploadThroughput: (network.uploadKbps * 1024) / 8,
    latency: network.latencyMs,
  });

  // Simulate mobile CPU (4x slowdown)
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Collect performance metrics
  await page.goto(url, { waitUntil: 'networkidle0' });
  const metrics = await page.evaluate(() => {
    const paint = performance.getEntriesByType('paint');
    const navigation = performance.getEntriesByType('navigation')[0];

    return {
      FCP: paint.find(e => e.name === 'first-contentful-paint')?.startTime,
      LCP: window.largestContentfulPaint,
      TTFB: navigation?.responseStart - navigation?.requestStart,
      TBT: window.totalBlockingTime,
      CLS: window.cumulativeLayoutShift,
    };
  });

  // Evaluate against thresholds
  const results = {};
  for (const [metric, value] of Object.entries(metrics)) {
    const threshold = MOBILE_PERFORMANCE_THRESHOLDS[metric];
    results[metric] = {
      value,
      status: value <= threshold.good ? 'good' : value <= threshold.poor ? 'needs-improvement' : 'poor',
      threshold,
    };
  }

  return results;
}
```

**Required Testing**: All pages MUST pass mobile performance thresholds under 3G-fast network conditions.

---

### 7.4 Blur Budget Validation (Mobile)

```javascript
function validateMobileBlurBudget(page) {
  const MAX_BLUR_MOBILE = 20; // px - mobile maximum
  const MAX_BLUR_ELEMENTS = 2; // Maximum blur elements on screen

  return page.evaluate((maxBlur, maxElements) => {
    const getSelector = (el) => {
      if (el.id) return `#${el.id}`;
      if (el.className) return `.${el.className.split(' ')[0]}`;
      return el.tagName.toLowerCase();
    };

    const blurredElements = [...document.querySelectorAll('*')].filter(el => {
      const style = getComputedStyle(el);
      const backdrop = style.backdropFilter || style.webkitBackdropFilter;
      return backdrop && backdrop.includes('blur');
    }).map(el => {
      const style = getComputedStyle(el);
      const backdrop = style.backdropFilter || style.webkitBackdropFilter;
      const blurMatch = backdrop.match(/blur\((\d+(?:\.\d+)?)px\)/);
      const blur = blurMatch ? parseFloat(blurMatch[1]) : 0;

      return {
        selector: getSelector(el),
        blurRadius: blur,
        visible: el.offsetParent !== null,
      };
    }).filter(e => e.visible);

    const violations = blurredElements.filter(e => e.blurRadius > maxBlur);

    return {
      passed: blurredElements.length <= maxElements && violations.length === 0,
      totalBlurElements: blurredElements.length,
      maxAllowed: maxElements,
      violations: violations,
      elements: blurredElements,
      recommendation: violations.length > 0
        ? `Reduce blur radius to max ${maxBlur}px for mobile performance`
        : blurredElements.length > maxElements
          ? `Reduce number of blur elements from ${blurredElements.length} to ${maxElements}`
          : null,
    };
  }, MAX_BLUR_MOBILE, MAX_BLUR_ELEMENTS);
}
```

**Enforcement**: Mobile blur violations MUST be fixed before deployment. Max blur: 20px, max elements: 2.

---

### 7.5 Thumb Zone Analysis

```javascript
function analyzeThumbZones(page, viewport) {
  const EASY_ZONE_BOTTOM = 0.33; // Bottom 33% - Easy reach
  const STRETCH_ZONE = 0.47;     // Middle 47% - Comfortable stretch
  const HARD_ZONE_TOP = 0.20;    // Top 20% - Hard to reach

  return page.evaluate((vp, zones) => {
    const getSelector = (el) => {
      if (el.id) return `#${el.id}`;
      return el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
    };

    const interactiveElements = [
      ...document.querySelectorAll('button, a, [role="button"], input[type="submit"], .cta')
    ];

    const viewportHeight = vp.height;

    return interactiveElements.map(btn => {
      const rect = btn.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const normalizedY = centerY / viewportHeight;

      let zone = 'stretch';
      let reachability = 'comfortable';

      if (normalizedY > (1 - zones.EASY_ZONE_BOTTOM)) {
        zone = 'easy';
        reachability = 'optimal';
      } else if (normalizedY < zones.HARD_ZONE_TOP) {
        zone = 'hard';
        reachability = 'difficult';
      }

      const isPrimaryCTA = btn.classList.contains('primary') ||
                           btn.classList.contains('cta') ||
                           btn.type === 'submit' ||
                           btn.getAttribute('role') === 'button';

      return {
        selector: getSelector(btn),
        text: btn.textContent?.trim().slice(0, 30),
        zone,
        reachability,
        isPrimaryCTA,
        warning: zone === 'hard' && isPrimaryCTA,
        recommendation: zone === 'hard' && isPrimaryCTA
          ? 'Move primary CTA to bottom 33% of screen for better thumb reach'
          : null,
        position: {
          top: rect.top,
          centerY: centerY,
          normalizedY: normalizedY.toFixed(2),
        },
      };
    });
  }, viewport, { EASY_ZONE_BOTTOM, HARD_ZONE_TOP });
}

// Visual thumb zone map
const THUMB_ZONE_MAP = `
  ┌─────────────────────┐
  │   HARD ZONE (20%)   │  ← Avoid primary CTAs
  │   ⚠️ Difficult       │
  ├─────────────────────┤
  │                     │
  │  STRETCH ZONE (47%) │  ← Secondary actions OK
  │  👍 Comfortable     │
  │                     │
  ├─────────────────────┤
  │                     │
  │   EASY ZONE (33%)   │  ← Primary CTAs HERE
  │   ✅ Optimal        │
  └─────────────────────┘
`;
```

**Best Practice**: Primary CTAs SHOULD be in the "easy zone" (bottom 33%) for optimal one-handed use.

---

### 7.6 Reduced Motion Compliance

```javascript
async function testReducedMotion(page) {
  // Enable reduced motion preference
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);

  // Wait for styles to apply
  await page.waitForTimeout(100);

  // Check for animated elements that should be disabled
  const violations = await page.evaluate(() => {
    const getSelector = (el) => {
      if (el.id) return `#${el.id}`;
      return el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
    };

    return [...document.querySelectorAll('*')].map(el => {
      const style = getComputedStyle(el);
      const animationName = style.animationName;
      const animationDuration = parseFloat(style.animationDuration);
      const transitionDuration = parseFloat(style.transitionDuration);

      const hasAnimation = animationName !== 'none' && animationDuration > 0;
      const hasTransition = transitionDuration > 0.01; // Allow micro-transitions

      if (!hasAnimation && !hasTransition) return null;

      return {
        selector: getSelector(el),
        animation: hasAnimation ? `${animationName} (${animationDuration}s)` : null,
        transition: hasTransition ? `${transitionDuration}s` : null,
        issue: 'Animation/transition active despite prefers-reduced-motion: reduce',
      };
    }).filter(Boolean);
  });

  return {
    passed: violations.length === 0,
    violations,
    count: violations.length,
    recommendation: violations.length > 0
      ? 'Add @media (prefers-reduced-motion: reduce) { animation: none; transition: none; } fallbacks'
      : null,
    exampleFix: `
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
  };
}
```

**Enforcement**: ALL animations MUST respect `prefers-reduced-motion: reduce`. This is a WCAG 2.1 AA requirement.

---

### 7.7 Mobile Screenshot Comparison Workflow

```javascript
const MOBILE_SCREENSHOT_WORKFLOW = {
  // Capture at multiple viewports
  viewports: ['mobile-sm', 'mobile-md', 'tablet-portrait'],

  // Check orientations
  orientations: ['portrait', 'landscape'],

  // Test states
  states: [
    'default',           // Initial load
    'scrolled',          // After scroll (sticky headers)
    'touch-hover',       // Simulated touch state
    'keyboard-open',     // With virtual keyboard
    'dark-mode',         // Dark theme if applicable
  ],

  // Device simulation
  deviceEmulation: {
    mobile: true,
    touch: true,
    deviceScaleFactor: 2, // Retina
  },

  // Output paths
  outputPaths: {
    baseline: '.claude/screenshots/mobile/baseline/',
    current: '.claude/screenshots/mobile/current/',
    diff: '.claude/screenshots/mobile/diff/',
  },
};

// Execute mobile screenshot workflow
async function executeMobileScreenshotWorkflow(page, url, options = MOBILE_SCREENSHOT_WORKFLOW) {
  const results = [];

  for (const viewport of options.viewports) {
    const vp = MOBILE_VIEWPORTS[viewport];

    for (const orientation of options.orientations) {
      const adjustedVp = orientation === 'landscape'
        ? { width: vp.height, height: vp.width }
        : vp;

      await page.setViewport({
        ...adjustedVp,
        deviceScaleFactor: options.deviceEmulation.deviceScaleFactor,
        isMobile: options.deviceEmulation.mobile,
        hasTouch: options.deviceEmulation.touch,
      });

      for (const state of options.states) {
        await applyState(page, state);

        const filename = `${viewport}-${orientation}-${state}.png`;
        const screenshot = await page.screenshot({
          fullPage: state !== 'keyboard-open',
          path: `${options.outputPaths.current}${filename}`,
        });

        results.push({
          viewport,
          orientation,
          state,
          filename,
          dimensions: adjustedVp,
        });
      }
    }
  }

  return results;
}

async function applyState(page, state) {
  switch (state) {
    case 'scrolled':
      await page.evaluate(() => window.scrollTo(0, 500));
      break;
    case 'touch-hover':
      await page.hover('button:first-of-type');
      break;
    case 'keyboard-open':
      await page.focus('input:first-of-type');
      break;
    case 'dark-mode':
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
      break;
  }
  await page.waitForTimeout(100);
}
```

---

### 7.8 Mobile Accessibility Checklist

```javascript
const MOBILE_A11Y_CHECKLIST = [
  {
    id: 'touch-targets',
    test: 'All interactive elements >= 44x44px',
    wcag: 'WCAG 2.5.5 Target Size (Level AAA)',
    critical: true,
  },
  {
    id: 'spacing',
    test: 'Touch targets have >= 8px spacing',
    wcag: 'WCAG 2.5.5 Target Size',
    critical: true,
  },
  {
    id: 'color-contrast',
    test: 'Text contrast >= 4.5:1 (7:1 recommended for outdoor viewing)',
    wcag: 'WCAG 1.4.3 Contrast (Minimum)',
    critical: true,
  },
  {
    id: 'focus-visible',
    test: 'Focus indicators visible on all interactive elements',
    wcag: 'WCAG 2.4.7 Focus Visible',
    critical: true,
  },
  {
    id: 'reduced-motion',
    test: 'Animations respect prefers-reduced-motion',
    wcag: 'WCAG 2.3.3 Animation from Interactions',
    critical: true,
  },
  {
    id: 'screen-reader',
    test: 'All content accessible via VoiceOver/TalkBack',
    wcag: 'WCAG 4.1.2 Name, Role, Value',
    critical: true,
  },
  {
    id: 'zoom-support',
    test: 'Page supports 200% zoom without horizontal scroll',
    wcag: 'WCAG 1.4.10 Reflow',
    critical: true,
  },
  {
    id: 'one-handed',
    test: 'Primary actions reachable with one hand (bottom 33%)',
    wcag: 'Best Practice',
    critical: false,
  },
  {
    id: 'text-resize',
    test: 'Text remains readable at 200% browser zoom',
    wcag: 'WCAG 1.4.4 Resize Text',
    critical: true,
  },
  {
    id: 'orientation',
    test: 'Content adapts to both portrait and landscape',
    wcag: 'WCAG 1.3.4 Orientation',
    critical: false,
  },
];

// Run full mobile accessibility audit
async function runMobileA11yAudit(page) {
  const results = [];

  for (const check of MOBILE_A11Y_CHECKLIST) {
    const result = await runCheck(page, check.id);
    results.push({
      ...check,
      passed: result.passed,
      details: result.details,
      violations: result.violations,
    });
  }

  const criticalFailures = results.filter(r => r.critical && !r.passed);
  const warnings = results.filter(r => !r.critical && !r.passed);

  return {
    passed: criticalFailures.length === 0,
    criticalFailures,
    warnings,
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      criticalFailed: criticalFailures.length,
      warnings: warnings.length,
    },
  };
}
```

---

### 7.9 Mobile Testing Example Invocations

**Example 1: Full Mobile Audit**

```
User: "Run mobile testing on the landing page"

[Chrome UI Browser Agent]:
📱 Starting mobile-first test suite...

Viewport Coverage:
✓ mobile-xs (320x568) - iPhone SE
✓ mobile-sm (375x667) - iPhone 8
✓ mobile-md (390x844) - iPhone 14
✓ android-md (412x915) - Pixel 6
✓ tablet-portrait (768x1024) - iPad

Touch Target Validation:
✓ 23/24 elements pass minimum (44px)
⚠️ 1 violation: .social-link (32x32px) - Needs 44x44px minimum

Thumb Zone Analysis:
✓ Primary CTA "Get Started" in easy zone (78% from top)
⚠️ Navigation menu in hard zone (12% from top)

Blur Budget (Mobile):
✓ 2 blur elements found (max: 2)
✓ Max blur: 16px (limit: 20px)

Performance (3G-fast):
✓ LCP: 2.1s (good < 2.5s)
✓ FCP: 1.4s (good < 1.8s)
⚠️ CLS: 0.12 (needs improvement, target < 0.1)

Reduced Motion Compliance:
✓ All animations disabled with prefers-reduced-motion

Mobile Accessibility:
8/10 checks passed
2 warnings (non-critical)

[Tokens: 18,400 | Cost: $0.015]
```

**Example 2: Touch Target Audit**

```
User: "Check touch targets on studio page"

[Chrome UI Browser Agent]:
📱 Auditing touch targets at mobile-md viewport (390x844)...

Results: 45 interactive elements analyzed

✓ Passed (38 elements):
  - All buttons: 48x48px ✓
  - Form inputs: 44x56px ✓
  - Navigation links: 44x44px ✓

⚠️ Violations (7 elements):
  1. .toolbar-icon (32x32px) → Needs 44x44px
  2. .color-swatch (24x24px) → Needs 44x44px
  3. .zoom-control (36x36px) → Needs 44x44px
  4-7. .layer-toggle (28x28px) → Needs 44x44px

Spacing Analysis:
✓ 89% of elements have >= 8px spacing
⚠️ Toolbar icons have 4px spacing (needs 8px)

Recommendation:
Increase toolbar icon size to 44x44px with 8px spacing.
Consider using a bottom sheet for mobile toolbar.

[Tokens: 9,200 | Cost: $0.007]
```

---

## Notes

- **Fastest Agent**: Haiku for speed (UI checks need to be quick)
- **High Frequency**: Expected to run 20-50 times per day
- **Read-Only**: Cannot modify code, only reports issues
- **Visual Authority**: Only agent authorized to browse and screenshot
- **Cost-Effective**: ~$0.008 per full page check
- **Screenshot Storage**: Max 100 screenshots, auto-cleanup after 7 days
- **Mobile-First**: All new UI features MUST pass mobile testing before desktop

---

## Integration with CLAUDE.md

Add to Section 7 (Skills Index):

```markdown
| 13 | Chrome UI Browser | Haiku | Visual UI verification, performance profiling | 25k | ChromeDevTools |
```

Add to Section 3 (Routing Examples):

```markdown
User: "Check the studio page"
→ Delegates to: chrome-ui-browser-agent (Haiku, $0.008)
```

---

*Chrome UI Browser Agent - Visual Authority*
*Version: 2.0.0 - 2026-01-13*
*Added: Section 7 - Mobile-First Testing Protocols*
