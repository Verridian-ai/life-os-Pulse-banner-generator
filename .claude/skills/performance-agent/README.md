# Performance Profiler Agent - Usage Guide

The Performance Profiler Agent conducts comprehensive performance audits across your entire application stack.

---

## Quick Start

```bash
# Full application audit
"Run a performance audit on the entire app"

# Specific feature audit
"Audit performance of the GenerativeSidebar component"

# Database query audit
"Check for N+1 queries in the user routes"

# Bundle size analysis
"Analyze bundle size and find optimization opportunities"

# Core Web Vitals check
"Check Core Web Vitals for the landing page"
```

---

## Usage Examples

### Example 1: Full Application Audit

**User Request:**
```
Run a comprehensive performance audit
```

**Agent Process:**
1. Analyzes package.json for bundle size
2. Profiles React components for unnecessary re-renders
3. Reviews database queries for N+1 patterns
4. Checks for memory leak patterns
5. Audits animation performance against blur budgets
6. Identifies lazy loading opportunities
7. Generates prioritized report

**Expected Output:**
```markdown
# Performance Audit Report
**Date**: 2026-01-13T14:30:00Z
**Scope**: Full application
**Duration**: 35 minutes

## Executive Summary
- **Overall Score**: 72/100
- **Critical Issues**: 2
- **High Priority**: 5
- **Medium Priority**: 8
- **Low Priority**: 3
- **Estimated Total Impact**: 1.8s faster load time, 120KB smaller bundle

## 1. Bundle Size Analysis
Current: 450KB (gzip)
Target: <200KB

**CRITICAL** Large lodash import
- Location: `src/utils/helpers.ts:3`
- Impact: +67KB bundle size
- Fix: Replace `import _ from 'lodash'` with `import { debounce } from 'lodash-es'`
- Estimated Savings: 65KB

...
```

---

### Example 2: Component-Specific Audit

**User Request:**
```
The GenerativeSidebar component feels slow. Audit its performance.
```

**Agent Process:**
1. Reads `src/components/features/GenerativeSidebar.tsx`
2. Identifies re-render triggers
3. Checks for missing React.memo opportunities
4. Analyzes prop drilling patterns
5. Reviews useEffect dependencies

**Expected Output:**
```markdown
# Performance Audit: GenerativeSidebar Component

## Issues Found

**HIGH** Unnecessary re-renders (12x per user interaction)
- Location: `src/components/features/GenerativeSidebar.tsx:45`
- Trigger: Parent AIContext state change causes full re-render
- Fix: Add React.memo and split context
  ```typescript
  export const GenerativeSidebar = React.memo(({
    onGenerate,
    isLoading
  }: GenerativeSidebarProps) => {
    // component code
  });
  ```
- Estimated Impact: -180ms render time

**MEDIUM** Expensive inline function in map
- Location: `src/components/features/GenerativeSidebar.tsx:67`
- Pattern: `prompts.map(p => <PromptCard onClick={() => handleSelect(p.id)} />)`
- Fix: Use useCallback for handleSelect
- Estimated Impact: -40ms render time
```

---

### Example 3: Database Query Audit

**User Request:**
```
Check for slow database queries in the admin routes
```

**Agent Process:**
1. Reads `server/src/routes/admin.ts`
2. Identifies query patterns
3. Checks for N+1 patterns
4. Reviews index usage (if schema available)
5. Suggests query optimizations

**Expected Output:**
```markdown
# Database Query Audit: Admin Routes

## Issues Found

**CRITICAL** N+1 query when fetching users with roles
- Location: `server/src/routes/admin.ts:78-82`
- Pattern:
  ```typescript
  const users = await db.query('SELECT * FROM users');
  for (const user of users) {
    user.roles = await db.query('SELECT * FROM roles WHERE user_id = $1', [user.id]);
  }
  ```
- Current: 1 + N queries (N = user count)
- Fix: Use JOIN or single query with aggregation
  ```sql
  SELECT u.*, json_agg(r.*) as roles
  FROM users u
  LEFT JOIN roles r ON r.user_id = u.id
  GROUP BY u.id;
  ```
- Estimated Impact: -850ms for 100 users

**HIGH** Missing index on `created_at` column
- Location: `users` table (queried in admin.ts:45)
- Query: `SELECT * FROM users WHERE created_at > $1 ORDER BY created_at DESC`
- Current: Sequential scan (2.3s for 10k rows)
- Fix: `CREATE INDEX idx_users_created_at ON users(created_at DESC);`
- Estimated Impact: -2.1s query time
```

---

### Example 4: Bundle Size Analysis

**User Request:**
```
Why is my bundle so large? Analyze bundle size.
```

**Agent Process:**
1. Reads `package.json` dependencies
2. Analyzes import patterns
3. Identifies duplicate dependencies
4. Checks for tree-shaking opportunities
5. Calculates gzip savings potential

**Expected Output:**
```markdown
# Bundle Size Analysis

## Current State
- Total bundle: 450KB (gzip)
- Vendor bundle: 320KB
- App bundle: 130KB
- Target: <200KB total

## Top 5 Largest Dependencies
1. `moment` - 72KB (gzip) - Used in 3 files
2. `lodash` - 67KB (gzip) - Full library imported
3. `recharts` - 45KB (gzip) - Used only in admin
4. `react-icons` - 38KB (gzip) - Full icon set imported
5. `framer-motion` - 34KB (gzip) - Legitimate usage

## Optimization Opportunities

**HIGH** Replace moment with date-fns
- Impact: -60KB
- Files affected: 3
- Effort: Medium (1 hour)
- ROI: ⭐⭐⭐

**HIGH** Replace full lodash import with lodash-es
- Impact: -55KB
- Files affected: 8
- Effort: Low (30 minutes)
- ROI: ⭐⭐⭐

**MEDIUM** Code split recharts (admin only)
- Impact: -45KB initial bundle
- Files affected: 1
- Effort: Low (15 minutes)
- ROI: ⭐⭐

**MEDIUM** Import specific react-icons
- Impact: -30KB
- Files affected: 12
- Effort: Low (20 minutes)
- ROI: ⭐⭐

## Estimated Total Savings
If all optimizations applied: -190KB (42% reduction)
New bundle size: ~260KB (still above target, but major improvement)
```

---

### Example 5: Animation Performance Audit

**User Request:**
```
The glass effect animations are janky on mobile. What's wrong?
```

**Agent Process:**
1. Searches for `backdrop-filter` usage
2. Checks blur values against mobile budget (20px max)
3. Identifies animated properties
4. Verifies GPU-safe property usage
5. Checks for reduced motion support

**Expected Output:**
```markdown
# Animation Performance Audit

## Issues Found

**CRITICAL** Blur budget violation on mobile
- Location: `src/components/ui/GlassCard.tsx:34`
- Current: `backdrop-filter: blur(30px)` (no media query)
- Limit: 20px max on mobile (from shared_contract.md §11.4)
- Impact: 15-20fps drop on mid-range devices
- Fix: Progressive blur with media queries
  ```css
  .glass-card {
    backdrop-filter: blur(12px); /* Mobile default */
  }
  @media (min-width: 768px) {
    .glass-card { backdrop-filter: blur(20px); }
  }
  @media (min-width: 1024px) {
    .glass-card { backdrop-filter: blur(30px); }
  }
  ```

**HIGH** Animating box-shadow (CPU-intensive)
- Location: `src/components/features/PromptCard.tsx:56`
- Current: `transition: box-shadow 0.3s ease;`
- Problem: Triggers layout recalculation
- Fix: Use filter: drop-shadow() instead
  ```css
  /* Replace */
  .card:hover {
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  }

  /* With */
  .card {
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
  }
  .card:hover {
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));
  }
  ```

**HIGH** Missing reduced motion support
- Location: All animated components
- Problem: No `@media (prefers-reduced-motion)` fallback
- Impact: Accessibility violation (WCAG 2.3.3)
- Fix: Add fallback to all animations
  ```css
  @media (prefers-reduced-motion: reduce) {
    .animated-element {
      animation: none !important;
      transition: none !important;
    }
  }
  ```

**MEDIUM** Multiple glass layers on mobile
- Location: `src/pages/Dashboard.tsx`
- Current: 3 overlapping glass elements (36px total blur)
- Limit: 2 elements max on mobile
- Impact: Significant GPU overhead
- Fix: Reduce glass layers or disable blur on mobile
```

---

## Common Use Cases

### 1. Pre-Release Audit
```
"Run a full performance audit before we ship v2.0"
```
Best for: Catching regressions before users do

---

### 2. Incident Investigation
```
"Users are reporting slow page loads. What's causing it?"
```
Best for: Root cause analysis of reported issues

---

### 3. Continuous Monitoring
```
"Audit performance of the new credit system feature"
```
Best for: Validating new features don't hurt performance

---

### 4. Optimization Planning
```
"Where should we focus optimization efforts?"
```
Best for: Identifying high-ROI improvements

---

### 5. Core Web Vitals Improvement
```
"Our LCP is 4.2s. How do we improve it?"
```
Best for: Targeted metric improvement

---

## Output Interpretation

### Priority Levels

- **CRITICAL**: User-facing impact, immediate action required
- **HIGH**: Significant performance impact, fix within 1 week
- **MEDIUM**: Moderate impact, fix within 1 month
- **LOW**: Minor optimization, nice-to-have

### ROI Ratings

- ⭐⭐⭐ High ROI: Low effort, high impact (do first)
- ⭐⭐ Medium ROI: Moderate effort/impact
- ⭐ Low ROI: High effort, low impact (defer)

### Impact Estimates

The agent provides estimated performance gains:
- **Latency**: Milliseconds saved per request/render
- **Bundle Size**: Kilobytes reduced
- **Memory**: MB saved over time
- **FPS**: Frame rate improvement

These are conservative estimates based on typical scenarios.

---

## Agent Constraints

### What the Agent DOES:
- Read code and configuration files
- Analyze patterns and detect issues
- Provide specific recommendations with code examples
- Estimate performance impact
- Prioritize issues by ROI

### What the Agent DOES NOT DO:
- Edit files automatically
- Install packages
- Run benchmarks (provides static analysis)
- Make architectural decisions (Decision Agent's role)
- Deploy changes

---

## Integration with Other Agents

### After Performance Audit:
1. **Quick Tasks Agent** - For simple fixes (import cleanup, memo additions)
2. **Coding Agent** - For feature refactors (code splitting, lazy loading)
3. **Database Agent** - For schema changes (adding indexes)
4. **Decision Agent** - For major architectural decisions (framework changes)

Example workflow:
```
1. Performance Agent: Audits and reports issues
2. User reviews report and prioritizes
3. Quick Tasks Agent: Fixes simple issues (imports, memo)
4. Coding Agent: Implements larger refactors (lazy loading)
5. Database Agent: Adds missing indexes
6. Performance Agent: Re-audits to verify improvements
```

---

## Best Practices

### 1. Audit Regularly
- After each feature implementation
- Before major releases
- Monthly for baseline tracking

### 2. Focus on User Impact
- Prioritize user-facing performance (LCP, INP)
- Fix critical issues first
- Balance effort vs. impact

### 3. Measure Twice, Optimize Once
- Verify issues with real profiling when possible
- Test fixes in staging
- Re-audit after changes

### 4. Document Baselines
- Save audit reports for historical comparison
- Track Core Web Vitals over time
- Monitor bundle size trends

---

## Cost Estimate

- **Token Budget**: 35,000 tokens
- **Estimated Cost**: ~$0.84 per audit
- **Typical Audit Time**: 30-35 minutes
- **Files Analyzed**: 20-30 files per audit

---

*Last Updated: 2026-01-13*
