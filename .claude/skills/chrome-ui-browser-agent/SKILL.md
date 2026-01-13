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

## Notes

- **Fastest Agent**: Haiku for speed (UI checks need to be quick)
- **High Frequency**: Expected to run 20-50 times per day
- **Read-Only**: Cannot modify code, only reports issues
- **Visual Authority**: Only agent authorized to browse and screenshot
- **Cost-Effective**: ~$0.008 per full page check
- **Screenshot Storage**: Max 100 screenshots, auto-cleanup after 7 days

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
*Version: 1.0.0 - 2026-01-13*
