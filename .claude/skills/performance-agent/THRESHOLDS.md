# Performance Thresholds Reference

This document defines the exact performance targets and budgets for Nanobanna Pro.

---

## 1. Core Web Vitals Targets

### 1.1 Largest Contentful Paint (LCP)

**Definition**: Time until the largest visible content element is rendered.

| Rating | Target | Maximum | Description |
|--------|--------|---------|-------------|
| Good | <2.5s | - | Excellent user experience |
| Needs Improvement | 2.5s - 4.0s | - | Noticeable delay |
| Poor | >4.0s | - | Unacceptable, users will bounce |

**Measurement Point**: 75th percentile of page loads

**How to Improve:**
- Optimize images (use WebP, lazy load)
- Reduce server response time (TTFB)
- Eliminate render-blocking resources
- Inline critical CSS
- Use CDN for static assets

---

### 1.2 Interaction to Next Paint (INP)

**Definition**: Time from user interaction to visual response.

| Rating | Target | Maximum | Description |
|--------|--------|---------|-------------|
| Good | <200ms | - | Feels instant |
| Needs Improvement | 200ms - 500ms | - | Slight delay noticeable |
| Poor | >500ms | - | Feels slow/unresponsive |

**Measurement Point**: 75th percentile of all interactions during page lifetime

**How to Improve:**
- Reduce JavaScript execution time
- Break up long tasks (>50ms)
- Use React.memo to prevent unnecessary re-renders
- Debounce expensive operations
- Offload work to web workers

---

### 1.3 Cumulative Layout Shift (CLS)

**Definition**: Sum of all unexpected layout shifts during page lifetime.

| Rating | Target | Maximum | Description |
|--------|--------|---------|-------------|
| Good | <0.1 | - | Stable visual experience |
| Needs Improvement | 0.1 - 0.25 | - | Some visual instability |
| Poor | >0.25 | - | Jarring shifts, poor UX |

**Measurement Point**: Maximum session window (5s gaps)

**How to Improve:**
- Always set width/height on images and videos
- Reserve space for ads/embeds
- Avoid inserting content above existing content
- Use `font-display: swap` with fallback fonts
- Preload fonts

---

### 1.4 Time to First Byte (TTFB)

**Definition**: Time from navigation start to first byte received from server.

| Rating | Target | Maximum | Description |
|--------|--------|---------|-------------|
| Good | <600ms | - | Fast server response |
| Needs Improvement | 600ms - 1800ms | - | Slow server or network |
| Poor | >1800ms | - | Major bottleneck |

**Measurement Point**: Navigation timing API

**How to Improve:**
- Use edge caching (Cloudflare, Vercel)
- Optimize database queries
- Reduce server processing time
- Use CDN for static assets
- Implement efficient caching headers

---

## 2. Bundle Size Budgets

### 2.1 JavaScript Bundles

| Bundle Type | Target (gzip) | Maximum (gzip) | Notes |
|-------------|---------------|----------------|-------|
| Initial Bundle | <150KB | <200KB | First load JS |
| Vendor Bundle | <250KB | <300KB | React, libraries |
| Route Chunks | <30KB | <50KB | Per-route code |
| Total (Initial) | <200KB | <250KB | All initial JS |

### 2.2 CSS Bundles

| Bundle Type | Target (gzip) | Maximum (gzip) | Notes |
|-------------|---------------|----------------|-------|
| Critical CSS | <10KB | <15KB | Above-fold styles |
| Total CSS | <25KB | <30KB | All styles |

### 2.3 Assets

| Asset Type | Target | Maximum | Notes |
|------------|--------|---------|-------|
| Hero Image | <100KB | <150KB | Optimized WebP |
| Icon Set | <20KB | <30KB | SVG sprite |
| Fonts (Total) | <50KB | <75KB | WOFF2 format |

### 2.4 Page Weight Totals

| Page Type | Target (gzip) | Maximum (gzip) |
|-----------|---------------|----------------|
| Landing Page | <300KB | <400KB |
| Dashboard | <400KB | <500KB |
| Editor Page | <500KB | <600KB |

---

## 3. React Performance Targets

### 3.1 Component Render Time

| Component Type | Target | Maximum | Notes |
|----------------|--------|---------|-------|
| Simple Component | <5ms | <10ms | Button, input, etc. |
| List Component | <10ms | <16ms | 10-20 items |
| Complex Feature | <16ms | <32ms | Editor, canvas |

**Note**: 16ms = 60fps frame budget. Exceeding this causes frame drops.

### 3.2 Re-Render Budget

| Scenario | Target | Maximum | Notes |
|----------|--------|---------|-------|
| Per user interaction | <3 | <5 | Component re-renders |
| State change propagation | <100ms | <200ms | Full update cycle |
| List update (100 items) | <50ms | <100ms | Virtual scrolling if exceeded |

### 3.3 React.memo Candidates

**Use React.memo when:**
- Component renders >5 times with identical props
- Component render cost >10ms
- Component is used in lists/repeated UI

**Don't use React.memo when:**
- Props change frequently (>50% of renders)
- Component render cost <5ms
- Premature optimization (profile first)

---

## 4. Database Query Performance

### 4.1 Query Execution Time

| Query Type | Target | Maximum | Notes |
|------------|--------|---------|-------|
| Simple SELECT | <20ms | <50ms | Single table, indexed |
| JOIN (2-3 tables) | <50ms | <100ms | With proper indexes |
| Complex aggregation | <100ms | <200ms | Multiple JOINs, GROUP BY |
| Full-text search | <150ms | <300ms | PostgreSQL tsvector |

### 4.2 Query Patterns

#### FORBIDDEN Patterns

| Pattern | Why Forbidden | Fix |
|---------|---------------|-----|
| N+1 queries | Executes 1+N queries instead of 1 | Use JOIN or IN clause |
| SELECT * | Returns unnecessary data | Specify columns explicitly |
| Sequential scan on large tables | Scans entire table | Add index |
| No LIMIT on queries | Can return millions of rows | Always use LIMIT |

#### REQUIRED Patterns

| Pattern | When Required | Example |
|---------|---------------|---------|
| Indexes on foreign keys | Always | `CREATE INDEX idx_posts_user_id ON posts(user_id)` |
| Indexes on WHERE clauses | Queries >1000 rows | `CREATE INDEX idx_users_created_at ON users(created_at)` |
| LIMIT on all queries | Always | `SELECT * FROM posts LIMIT 100` |
| Connection pooling | Always | Max 10 connections in Neon |

### 4.3 Index Strategy

| Table Size | Strategy |
|------------|----------|
| <1,000 rows | Indexes optional (seq scan is fast) |
| 1,000 - 10,000 rows | Index frequent WHERE/JOIN columns |
| 10,000 - 100,000 rows | Index all WHERE/JOIN/ORDER BY columns |
| >100,000 rows | Composite indexes, partial indexes |

---

## 5. Animation Performance

### 5.1 Blur Budget (MANDATORY)

From `shared_contract.md` §11.4:

| Device | Max Blur Radius | Max Glass Elements | Notes |
|--------|-----------------|-------------------|-------|
| Mobile (320px-767px) | 20px | 2 | Strict enforcement |
| Tablet (768px-1023px) | 32px | 3 | Moderate usage |
| Desktop (1024px+) | 40px | 5 | Full effects |

**Enforcement:**
```css
/* Mobile default (required) */
.glass {
  backdrop-filter: blur(12px);
}

/* Progressive enhancement (required) */
@media (min-width: 768px) {
  .glass { backdrop-filter: blur(24px); }
}

@media (min-width: 1024px) {
  .glass { backdrop-filter: blur(40px); }
}
```

### 5.2 GPU-Safe Properties

| Property | Safe to Animate? | Notes |
|----------|------------------|-------|
| `transform` | ✅ YES | Uses GPU |
| `opacity` | ✅ YES | Uses GPU |
| `filter` | ⚠️ CAUTION | Can use GPU, but expensive |
| `width`, `height` | ❌ NO | Triggers layout |
| `margin`, `padding` | ❌ NO | Triggers layout |
| `top`, `left`, `right`, `bottom` | ❌ NO | Triggers layout |
| `box-shadow` | ❌ NO | CPU-intensive |
| `backdrop-filter` | ❌ NO | Very expensive |

### 5.3 Frame Budget

| Target | Maximum | Notes |
|--------|---------|-------|
| 60fps (16.67ms/frame) | 50fps (20ms/frame) | Smooth animation |

**Frame Time Breakdown:**
- JavaScript: <5ms
- Style calculation: <3ms
- Layout: <3ms
- Paint: <3ms
- Composite: <2ms

### 5.4 Animation Checklist

Before shipping any animation:

- [ ] Uses only `transform` and `opacity` (or approved exceptions)
- [ ] Frame time <16ms (profile with DevTools)
- [ ] Includes `will-change: transform` for frequent animations
- [ ] Removes `will-change` after animation completes
- [ ] Includes `@media (prefers-reduced-motion)` fallback
- [ ] Blur budget respected on mobile
- [ ] No layout thrashing (batch DOM reads/writes)

---

## 6. Memory Usage Targets

### 6.1 Memory Limits

| Scenario | Target | Maximum | Notes |
|----------|--------|---------|-------|
| Initial page load | <50MB | <75MB | JavaScript heap |
| After 5 minutes usage | <100MB | <150MB | With normal usage |
| Memory growth rate | <1MB/min | <2MB/min | Should be flat |

### 6.2 Memory Leak Patterns (FORBIDDEN)

| Pattern | Detection | Fix |
|---------|-----------|-----|
| Event listener leak | Growing listener count | Add cleanup in useEffect |
| Timer leak | Timers still running after unmount | clearInterval/clearTimeout |
| Growing cache | Unbounded object growth | Implement cache eviction (LRU) |
| Detached DOM nodes | Nodes retained in memory | Remove references on unmount |

---

## 7. Lazy Loading Thresholds

### 7.1 When to Lazy Load

| Resource Type | Threshold | Strategy |
|---------------|-----------|----------|
| Images | >50KB | Lazy load if below fold |
| Components | >30KB | React.lazy + Suspense |
| Routes | Always | Route-based code splitting |
| Third-party scripts | Always | Load on demand |

### 7.2 Priority Levels

| Priority | Load Strategy | Example |
|----------|---------------|---------|
| Critical | Eager | Above-fold hero image |
| High | Prefetch | Next likely route |
| Medium | Lazy (in viewport) | Below-fold images |
| Low | On-demand | Rarely used features |

---

## 8. Network Performance

### 8.1 API Response Time

| Endpoint Type | Target | Maximum | Notes |
|---------------|--------|---------|-------|
| GET (cached) | <50ms | <100ms | CDN/edge cache |
| GET (database) | <200ms | <500ms | Simple query |
| POST (write) | <300ms | <1000ms | Database write |
| AI generation | <5s | <15s | With progress indicator |

### 8.2 Concurrent Requests

| Scenario | Target | Maximum | Notes |
|----------|--------|---------|-------|
| Initial page load | <6 | <10 | HTTP/2 allows more |
| Background requests | <3 | <5 | Don't block UI |

---

## 9. Testing Requirements

### 9.1 Performance Testing Frequency

| Event | Test Type | Threshold |
|-------|-----------|-----------|
| Every commit | Unit test performance | Existing tests <+10% slower |
| Every PR | Lighthouse CI | All metrics pass |
| Weekly | Full performance audit | No regressions |
| Before release | Load testing | Handles 10x normal traffic |

### 9.2 Lighthouse Score Targets

| Category | Target | Minimum | Notes |
|----------|--------|---------|-------|
| Performance | 95+ | 90 | Core Web Vitals |
| Accessibility | 100 | 95 | WCAG 2.1 AA |
| Best Practices | 100 | 95 | Security, HTTPS |
| SEO | 100 | 90 | Metadata, structure |

---

## 10. Device-Specific Targets

### 10.1 Mobile (Critical)

| Metric | Target | Notes |
|--------|--------|-------|
| LCP | <2.5s | On 3G network |
| INP | <200ms | Touch interaction |
| Total bundle | <300KB | Initial load |
| Blur budget | 20px | Strict enforcement |

### 10.2 Desktop

| Metric | Target | Notes |
|--------|--------|-------|
| LCP | <1.5s | Fast network |
| INP | <100ms | Mouse/keyboard |
| Total bundle | <500KB | More capacity |
| Blur budget | 40px | Full effects |

---

## 11. Progressive Enhancement Tiers

### Tier 1: Basic Experience (ALL devices)
- Functional UI without JavaScript
- Core content visible
- Forms work
- Accessibility maintained

### Tier 2: Enhanced Experience (Modern mobile)
- JavaScript-powered interactivity
- Basic animations (transform/opacity)
- Lazy loading
- Service worker

### Tier 3: Premium Experience (Desktop)
- Full glass/neumorphic effects
- Complex animations
- Real-time features
- Advanced AI features

---

## 12. Monitoring & Alerting

### 12.1 Real User Monitoring (RUM)

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| LCP p75 | >3.0s | Investigate immediately |
| INP p75 | >300ms | Review recent changes |
| CLS p75 | >0.15 | Check layout shifts |
| Error rate | >1% | Rollback/hotfix |

### 12.2 Synthetic Monitoring

| Test | Frequency | Threshold |
|------|-----------|-----------|
| Lighthouse | Every deployment | Score <90 = block |
| Load test | Weekly | <1000 RPS = alert |
| Uptime | 1 minute | <99.9% = page |

---

## Summary: Critical Thresholds

Quick reference for the most important thresholds:

| Metric | Target | Maximum | Impact |
|--------|--------|---------|--------|
| **LCP** | <2.5s | 4.0s | User bounce rate |
| **INP** | <200ms | 500ms | Perceived speed |
| **CLS** | <0.1 | 0.25 | User frustration |
| **Initial Bundle** | <200KB | 250KB | Load time |
| **Mobile Blur** | 12-16px | 20px | FPS drops |
| **Query Time** | <100ms | 500ms | User wait time |
| **Memory Growth** | <1MB/min | 2MB/min | Crashes |

**Remember**: These are not aspirational goals. They are hard limits enforced by the Performance Profiler Agent.

---

*Last Updated: 2026-01-13*
*Thresholds Version: 1.0.0*
*Based on: Web Vitals 2023, WCAG 2.1, Chrome Performance Best Practices*
