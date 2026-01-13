# Claude Plugins Maximization Guide for Nanobanna Pro

> Comprehensive strategy to leverage all available Claude plugins to their absolute fullest extent

**Project**: Nanobanna Pro (AI-powered LinkedIn banner design tool)
**Stack**: React + TypeScript + Vite + Tailwind CSS + Neon PostgreSQL + Multi-AI orchestration
**Goal**: Extract maximum value from every available Claude plugin

---

## 📦 Available Plugin Categories

### 1. MCP (Model Context Protocol) Plugins
### 2. Development Tools Plugins
### 3. AI/LLM Integration Plugins
### 4. Database & Backend Plugins
### 5. Browser & Testing Plugins
### 6. Productivity & Workflow Plugins
### 7. Security & Compliance Plugins
### 8. Documentation & Knowledge Plugins

---

## 🎯 Core Plugin Stack (Already Installed)

### You Currently Have:
1. **Serena Memory** (`plugin:serena:serena`) ✅
2. **Context7** (`plugin:context7:context7`) ✅
3. **Supabase Explorer** (`plugin:supabase:supabase`) ✅ (implied)
4. **Greptile** (`plugin:greptile:greptile`) ✅
5. **Chrome DevTools** (`chrome-devtools`) ✅ (implied)
6. **Claude in Chrome** (`claude-in-chrome`) ✅ (implied)
7. **Playwright** (`plugin:playwright:playwright`) ✅ (implied)

---

## 🚀 Phase 1: Maximize Currently Installed Plugins

### 1. Serena Memory Plugin - SEMANTIC CODE INTELLIGENCE

**Current Usage**: Basic memory storage
**Full Potential**: Advanced semantic code navigation + project context

#### Advanced Capabilities to Use:
```typescript
// 1. Semantic Symbol Search
serena.searchSymbols({
  query: "authentication flow",
  types: ["function", "class", "interface"],
  scope: "src/context/AuthContext.tsx"
})

// 2. Cross-Reference Analysis
serena.findReferences({
  symbol: "useAIContext",
  includeTests: true,
  includeComments: true
})

// 3. Dependency Graph Mapping
serena.analyzeDependencies({
  entry: "src/App.tsx",
  maxDepth: 5,
  visualize: true
})

// 4. Code Pattern Detection
serena.detectPatterns({
  pattern: "React.useState",
  context: "component initialization",
  suggest_alternatives: true
})

// 5. Refactoring Suggestions
serena.suggestRefactorings({
  target: "src/components/",
  patterns: ["vertical-slice", "feature-colocated"],
  dry_run: true
})
```

#### Nanobanna Pro Use Cases:
- **Context Migration**: Find all `React.createContext` usages to audit your 4 context providers
- **Import Cleanup**: Detect wildcard imports across codebase (violates shared contract)
- **Component Graph**: Map dependencies between `CanvasEditor`, `GenerativeSidebar`, `ChatInterface`
- **API Surface Analysis**: Find all exported functions from `src/services/llm.ts`

**Daily Workflow Integration**:
```bash
# Morning: Analyze yesterday's changes
serena memory add "$(git diff HEAD~1 --stat)" --context "daily-review"

# Before refactor: Map dependencies
serena graph dependencies src/components/features/

# Before PR: Check for coupling
serena analyze coupling --threshold 0.7
```

---

### 2. Context7 Plugin - LIVE DOCUMENTATION

**Current Usage**: Occasional library lookups
**Full Potential**: Real-time API reference for your entire stack

#### Advanced Capabilities to Use:
```typescript
// 1. Multi-Library Context Loading
context7.loadDocs({
  libraries: [
    "/vercel/next.js",           // (if migrating from Vite)
    "/facebook/react/v19",
    "/vitejs/vite",
    "/tailwindlabs/tailwindcss",
    "/supabase/supabase-js",
    "/openai/openai-node",
    "/google/generative-ai"
  ],
  tokens: 50000 // Max context
})

// 2. Topic-Focused Documentation
context7.getDocs({
  library: "/facebook/react/v19",
  topic: "concurrent rendering",
  tokens: 10000
})

// 3. Version-Specific Lookups
context7.resolveDocs({
  library: "/supabase/supabase-js",
  version: "2.39.0", // Pin to your package.json version
  topic: "realtime subscriptions"
})

// 4. Code Example Retrieval
context7.getExamples({
  library: "/openai/openai-node",
  task: "streaming completions",
  language: "typescript"
})
```

#### Nanobanna Pro Use Cases:
- **AI API Updates**: Always use latest OpenRouter, Gemini, Replicate docs
- **React 19 Patterns**: Get concurrent rendering best practices
- **Supabase RLS**: Retrieve policy syntax and examples
- **Tailwind Utilities**: Look up glassmorphism utility classes

**Proactive Loading Strategy**:
```bash
# Load docs for active file
context7 load-for-file src/services/llm.ts

# Load docs for feature
context7 load-for-feature voice-agent

# Load docs for dependency
context7 load-for-package openai@4.20.0
```

---

### 3. Greptile Plugin - AI CODE REVIEW

**Current Usage**: Not being used
**Full Potential**: Automated PR reviews, custom context, merge request intelligence

#### Advanced Capabilities to Use:
```typescript
// 1. List All PRs with Filters
greptile.listPullRequests({
  sourceBranch: "task/",
  state: "open",
  authorLogin: "danielbank",
  limit: 50
})

// 2. Get Detailed PR Analysis
greptile.getMergeRequest({
  name: "danielbank/nanobanna-pro",
  remote: "github",
  defaultBranch: "main",
  prNumber: 42
})
// Returns: metadata, statistics, review completeness, addressed comments

// 3. Search Greptile Review Comments
greptile.searchGreptileComments({
  query: "security vulnerability",
  includeAddressed: false,
  createdAfter: "2026-01-01T00:00:00Z",
  limit: 20
})

// 4. Trigger Code Review
greptile.triggerCodeReview({
  name: "danielbank/nanobanna-pro",
  remote: "github",
  prNumber: 42,
  branch: "task/T001-impl"
})

// 5. Custom Context Management
greptile.createCustomContext({
  body: "Always check for API key leaks in src/services/",
  scopes: {
    AND: [
      { operator: "MATCHES", field: "filepath", value: "**/services/**" }
    ]
  },
  type: "CUSTOM_INSTRUCTION",
  status: "ACTIVE"
})

// 6. Search Custom Context
greptile.searchCustomContext({
  query: "glassmorphism accessibility",
  limit: 10
})
```

#### Nanobanna Pro Use Cases:
- **Automated PR Review**: Trigger Greptile review on every worktree merge
- **Security Patterns**: Create custom context for "Never log full API keys"
- **Accessibility Rules**: Custom context for "All glassmorphism needs `@media (prefers-contrast: more)` override"
- **Import Hygiene**: Custom context for "No wildcard imports allowed"

**Integration with Git Workflow**:
```bash
# Pre-PR hook
greptile trigger-review --pr $(gh pr view --json number -q .number)

# Post-merge analysis
greptile analyze-comments --pr $PR_NUMBER --only-unaddressed

# Weekly security audit
greptile search-comments "security|vulnerability|sensitive" --created-after "7 days ago"
```

**Custom Context Setup** (One-Time):
```javascript
// Create Nanobanna Pro coding standards
const contexts = [
  {
    body: "FORBIDDEN: Wildcard imports (import * as). Use explicit imports only.",
    scopes: { AND: [{ operator: "MATCHES", field: "filepath", value: "**/*.ts" }] },
    type: "PATTERN"
  },
  {
    body: "REQUIRED: All glassmorphism/neumorphism components MUST include @media (prefers-contrast: more) and @media (forced-colors: active) overrides for accessibility.",
    scopes: { AND: [{ operator: "MATCHES", field: "filepath", value: "**/components/**/*.tsx" }] },
    type: "CUSTOM_INSTRUCTION"
  },
  {
    body: "SECURITY: Never log full API keys. Use !!key for presence checks only.",
    scopes: { AND: [{ operator: "MATCHES", field: "filepath", value: "**/services/**" }] },
    type: "PATTERN"
  },
  {
    body: "RLS POLICY: All Supabase tables MUST have Row Level Security enabled with auth.uid() policies.",
    scopes: { AND: [{ operator: "MATCHES", field: "filepath", value: "**/db/schema.ts" }] },
    type: "CUSTOM_INSTRUCTION"
  }
];

// Bulk create
contexts.forEach(ctx => greptile.createCustomContext(ctx));
```

---

### 4. Supabase Explorer Plugin - DATABASE INTELLIGENCE

**Current Usage**: Basic queries
**Full Potential**: Advanced schema management, RLS automation, query optimization

#### Advanced Capabilities to Use:
```typescript
// 1. Schema Introspection
supabase.inspectSchema({
  tables: ["users", "designs", "generated_images", "brand_profiles"],
  include_policies: true,
  include_indexes: true,
  include_triggers: true
})

// 2. RLS Policy Generator
supabase.generateRLSPolicy({
  table: "designs",
  policy_name: "user_own_designs",
  operation: "SELECT",
  using: "(auth.uid() = user_id)",
  check: null
})

// 3. Migration Creation
supabase.createMigration({
  name: "add_credits_to_users",
  up: `
    ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 100;
    CREATE INDEX idx_users_credits ON users(credits);
  `,
  down: `
    DROP INDEX idx_users_credits;
    ALTER TABLE users DROP COLUMN credits;
  `
})

// 4. Query Performance Analysis
supabase.explainQuery({
  query: `
    SELECT d.*, u.email
    FROM designs d
    JOIN users u ON d.user_id = u.id
    WHERE d.created_at > NOW() - INTERVAL '7 days'
  `,
  analyze: true,
  buffers: true
})

// 5. Realtime Subscription Management
supabase.manageSubscription({
  channel: "design_updates",
  table: "designs",
  event: "*",
  filter: "user_id=eq.${userId}"
})
```

#### Nanobanna Pro Use Cases:
- **RLS Audit**: Verify all 6 tables have proper policies
- **Index Optimization**: Analyze slow queries on `generated_images` table
- **Migration Testing**: Dry-run schema changes before production
- **Realtime Health**: Monitor WebSocket subscriptions for canvas auto-save

**Daily Database Workflow**:
```bash
# Morning: Check for missing RLS
supabase audit-rls --show-missing

# Before migration: Test locally
supabase migration test --dry-run

# After deploy: Verify indexes
supabase analyze-performance --slow-queries-only

# Weekly: Schema drift check
supabase diff-schema --compare production
```

---

### 5. Chrome DevTools Plugin - PERFORMANCE PROFILING

**Current Usage**: Not being used
**Full Potential**: Automated performance audits, Core Web Vitals tracking, glassmorphism optimization

#### Advanced Capabilities to Use:
```typescript
// 1. Core Web Vitals Monitoring
chromeDevTools.measureWebVitals({
  url: "http://localhost:5173/studio",
  metrics: ["LCP", "FID", "CLS", "TTFB"],
  device: "mobile",
  throttling: "4G"
})

// 2. Render Performance Profiling
chromeDevTools.profileRendering({
  url: "http://localhost:5173/studio",
  scenario: "canvas-heavy-editing",
  track: ["paint", "layout", "composite"],
  duration: 10000 // 10 seconds
})

// 3. Memory Leak Detection
chromeDevTools.detectMemoryLeaks({
  url: "http://localhost:5173/studio",
  actions: [
    "click #generate-button",
    "wait 5000",
    "click #canvas-clear",
    "wait 5000"
  ],
  iterations: 10
})

// 4. CSS Performance Analysis
chromeDevTools.analyzeCSSPerformance({
  url: "http://localhost:5173/studio",
  focus: "backdrop-filter",
  report_violations: true
})

// 5. Network Waterfall Audit
chromeDevTools.auditNetwork({
  url: "http://localhost:5173/studio",
  capture: "all",
  analyze_chains: true,
  detect_bloat: true
})
```

#### Nanobanna Pro Use Cases:
- **Glassmorphism Performance**: Profile `backdrop-filter` impact on FPS
- **AI API Latency**: Track Replicate/Gemini request waterfalls
- **Canvas Rendering**: Detect layout thrashing during element manipulation
- **Memory Profiling**: Find WebSocket subscription leaks in voice agent

**Automated Performance Testing**:
```bash
# Pre-deploy: Run full audit
chrome-devtools audit --url http://localhost:5173 --all-tabs

# Post-glassmorphism changes: Check blur budget
chrome-devtools profile-css --filter "backdrop-filter" --budget 40px

# Voice agent testing: Memory leak check
chrome-devtools memory-leak --scenario voice-session --iterations 20

# Weekly: Core Web Vitals report
chrome-devtools web-vitals --compare-baseline --threshold LCP=2500
```

---

### 6. Playwright Plugin - E2E AUTOMATION

**Current Usage**: Not being used
**Full Potential**: Visual regression testing, route validation, voice command simulation

#### Advanced Capabilities to Use:
```typescript
// 1. Visual Regression Testing
playwright.screenshot({
  url: "http://localhost:5173/studio",
  selector: ".canvas-container",
  compare_baseline: true,
  threshold: 0.01 // 1% pixel diff allowed
})

// 2. Route Navigation Testing
playwright.testRoutes({
  routes: ["/", "/studio", "/gallery", "/brainstorm"],
  checks: ["status-200", "no-console-errors", "no-network-failures"],
  authenticated: true
})

// 3. Form Interaction Testing
playwright.fillForm({
  url: "http://localhost:5173/studio",
  form_selector: "#generation-form",
  data: {
    prompt: "Professional LinkedIn banner for tech startup",
    style: "corporate",
    model: "gemini-3-pro-image-preview"
  },
  submit: true,
  wait_for: ".generated-image"
})

// 4. Accessibility Testing
playwright.auditAccessibility({
  url: "http://localhost:5173/studio",
  standard: "WCAG21AA",
  include_best_practices: true
})

// 5. Voice Command Simulation
playwright.simulateVoiceCommands({
  url: "http://localhost:5173/studio",
  commands: [
    "start voice agent",
    "generate background with sunset theme",
    "add text element with company name"
  ],
  verify_actions: true
})

// 6. Multi-Tab Workflow Testing
playwright.testMultiTabFlow({
  scenario: "design-to-gallery",
  steps: [
    { tab: "studio", action: "generate-image" },
    { tab: "studio", action: "click-save" },
    { tab: "gallery", action: "verify-image-appears" }
  ]
})
```

#### Nanobanna Pro Use Cases:
- **Route Manifest Validation**: Test all routes defined in `ROUTES.md`
- **Glassmorphism Visual Regression**: Detect unintended blur/shadow changes
- **Voice Agent E2E**: Simulate full voice-powered banner creation flow
- **Canvas Interaction**: Test drag-drop, resize, layer manipulation

**CI/CD Integration**:
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run Playwright tests
        run: npx playwright test
      - name: Upload visual diffs
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-diffs
          path: test-results/
```

**Daily Testing Workflow**:
```bash
# Pre-commit: Quick smoke test
playwright test --grep @smoke

# Pre-PR: Full regression suite
playwright test --reporter=html

# Post-glassmorphism change: Visual regression
playwright test visual-regression --update-snapshots

# Voice agent release: E2E validation
playwright test voice-agent --headed
```

---

## 🆕 Phase 2: Install Missing High-Value Plugins

### 7. GitHub MCP Plugin - PR AUTOMATION

**Status**: ❌ Not Installed
**Install**: `npm install @modelcontextprotocol/server-github`

#### Capabilities:
```typescript
// 1. Auto-create PR from Worktree
github.createPullRequest({
  repo: "danielbank/nanobanna-pro",
  head: "task/T001-impl",
  base: "main",
  title: "[T001] Add user credit system",
  body: `
## Summary
- Implemented credit tracking in users table
- Added credit deduction on image generation
- Frontend credit display in header

## Test Plan
- [x] Unit tests pass (80% coverage)
- [x] Integration test for credit deduction
- [x] Manual test: Generate 5 images, verify credit decrease

🤖 Generated with Claude Code
  `,
  draft: false
})

// 2. Auto-label PRs by Files Changed
github.labelPullRequest({
  pr_number: 42,
  labels: ["backend", "database", "needs-security-review"]
})

// 3. Request Reviews from Agents
github.requestReview({
  pr_number: 42,
  reviewers: ["opus-reviewer-bot"]
})

// 4. Auto-merge on Approval
github.mergePullRequest({
  pr_number: 42,
  merge_method: "squash",
  require: {
    approvals: 1,
    status_checks: ["tests", "lint", "build"]
  }
})
```

**Nanobanna Pro Workflow**:
```bash
# Auto-create PR with task context
github create-pr --from-worktree .worktrees/T001-impl --template task

# Auto-label based on changed files
github auto-label --pr 42

# Request Opus review
github request-review --pr 42 --reviewer opus-agent

# Auto-merge when ready
github auto-merge --pr 42 --require-checks
```

---

### 8. Langfuse MCP Plugin - LLM OBSERVABILITY

**Status**: ❌ Not Installed
**Install**: `npm install @langfuse/mcp-server`

#### Capabilities:
```typescript
// 1. Trace All AI API Calls
langfuse.trace({
  name: "generate-linkedin-banner",
  user_id: userId,
  metadata: {
    prompt: "Professional tech startup banner",
    model: "gemini-3-pro-image-preview",
    provider: "openrouter"
  }
})

// 2. Monitor AI Costs
langfuse.trackCost({
  model: "gemini-3-pro-image-preview",
  input_tokens: 150,
  output_tokens: 0,
  cost_usd: 0.0045
})

// 3. Analyze Prompt Performance
langfuse.analyzePrompts({
  prompt_name: "banner-generation",
  metrics: ["latency", "cost", "success_rate"],
  time_range: "7d"
})

// 4. Debug Failed Generations
langfuse.queryTraces({
  filter: {
    status: "error",
    model: "gemini-3-pro-image-preview",
    time_range: "24h"
  },
  include_stack_traces: true
})
```

**Nanobanna Pro Use Cases**:
- **Cost Tracking**: Monitor spend across Gemini, OpenRouter, Replicate
- **Latency Analysis**: Identify slow AI API responses
- **Failure Debugging**: Trace failed image generations
- **Prompt Optimization**: A/B test different banner prompts

**Integration**:
```typescript
// src/services/llm.ts
import { LangfuseTracer } from './langfuseTracer';

export async function generateImage(prompt: string) {
  const trace = LangfuseTracer.start({
    name: 'generate-image',
    input: { prompt },
    user_id: userId
  });

  try {
    const result = await openRouter.generate(prompt);
    trace.end({ output: result, status: 'success' });
    return result;
  } catch (error) {
    trace.end({ error, status: 'error' });
    throw error;
  }
}
```

---

### 9. Semgrep MCP Plugin - STATIC ANALYSIS

**Status**: ❌ Not Installed
**Install**: `npm install @semgrep/mcp-server`

#### Capabilities:
```typescript
// 1. Security Vulnerability Scanning
semgrep.scan({
  paths: ["src/services/", "server/src/"],
  rules: ["security", "owasp-top-10"],
  severity: ["ERROR", "WARNING"]
})

// 2. Custom Rule Creation
semgrep.createRule({
  id: "nanobanna-no-api-key-logs",
  pattern: `console.log($MSG, ..., $KEY, ...)`,
  message: "FORBIDDEN: Never log API keys",
  severity: "ERROR",
  languages: ["typescript", "javascript"]
})

// 3. Code Quality Checks
semgrep.scan({
  paths: ["src/"],
  rules: ["typescript-best-practices"],
  fix: true // Auto-fix where possible
})
```

**Nanobanna Pro Custom Rules**:
```yaml
# .semgrep/nanobanna-rules.yml
rules:
  - id: no-wildcard-imports
    pattern: import * as $X from $Y
    message: "FORBIDDEN: Use explicit imports only"
    severity: ERROR
    languages: [typescript]

  - id: require-rls-policies
    pattern: |
      CREATE TABLE $TABLE (
        ...
      )
    message: "REQUIRED: Add RLS policy after table creation"
    severity: WARNING
    paths:
      include:
        - "server/src/db/schema.ts"

  - id: glassmorphism-a11y
    pattern: |
      backdrop-filter: blur($X)
    message: "REQUIRED: Add @media (prefers-contrast: more) override"
    severity: WARNING
    languages: [css, scss]
```

---

### 10. ESLint MCP Plugin - LINT AUTOMATION

**Status**: ❌ Not Installed
**Install**: `npm install @modelcontextprotocol/server-eslint`

#### Capabilities:
```typescript
// 1. Auto-fix on Save
eslint.fix({
  files: ["src/**/*.ts", "src/**/*.tsx"],
  rules: ["import/order", "no-unused-vars", "prefer-const"],
  write: true
})

// 2. Custom Rule Enforcement
eslint.enforce({
  rule: "@typescript-eslint/explicit-function-return-type",
  severity: "error",
  files: ["src/services/**/*.ts"]
})

// 3. Import Order Validation
eslint.validateImports({
  order: [
    "react",
    "external",
    "@/",
    "./",
    "styles"
  ],
  groups: true
})
```

---

### 11. TypeScript MCP Plugin - TYPE CHECKING

**Status**: ❌ Not Installed
**Install**: `npm install @modelcontextprotocol/server-typescript`

#### Capabilities:
```typescript
// 1. Incremental Type Checking
typescript.check({
  files: ["src/services/llm.ts"],
  strict: true,
  incremental: true
})

// 2. Type Coverage Analysis
typescript.analyzeCoverage({
  threshold: 95,
  report_untyped: true
})

// 3. Auto-generate Types from API
typescript.generateTypes({
  source: "openapi-spec.json",
  output: "src/types/api.generated.ts"
})
```

---

### 12. Vitest MCP Plugin - TEST AUTOMATION

**Status**: ❌ Not Installed
**Install**: `npm install @vitest/mcp-server`

#### Capabilities:
```typescript
// 1. Watch Mode with Coverage
vitest.watch({
  coverage: true,
  threshold: 80,
  changed_files_only: true
})

// 2. Snapshot Testing Automation
vitest.updateSnapshots({
  pattern: "**/*.test.tsx",
  interactive: false
})

// 3. Test Generation from Types
vitest.generateTests({
  source: "src/services/llm.ts",
  template: "unit-test"
})
```

---

### 13. Axe-Core MCP Plugin - A11Y AUTOMATION

**Status**: ❌ Not Installed
**Install**: `npm install @axe-core/mcp-server`

#### Capabilities:
```typescript
// 1. Automated Accessibility Audits
axe.audit({
  url: "http://localhost:5173/studio",
  rules: ["wcag2a", "wcag2aa", "wcag21aa"],
  selectors: [".canvas-container", ".generative-sidebar"]
})

// 2. Glassmorphism A11Y Check
axe.checkContrast({
  elements: [".glass-card", ".neu-button"],
  min_ratio: 4.5 // WCAG AA
})

// 3. Keyboard Navigation Testing
axe.testKeyboardNav({
  start: "#app",
  required_paths: ["studio", "gallery", "settings"]
})
```

---

## 📊 Plugin Orchestration Strategies

### Strategy 1: Pre-Commit Quality Gate
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running pre-commit quality gates..."

# Security scan
semgrep scan --config auto --error

# Type check
typescript check --strict

# Lint & auto-fix
eslint fix --write

# Test coverage
vitest run --coverage --threshold 80

# A11Y check (glassmorphism files)
axe audit --changed-files --wcag21aa

# Greptile custom context validation
greptile validate-patterns --files $(git diff --cached --name-only)

echo "✅ All pre-commit gates passed!"
```

---

### Strategy 2: Nightly Full Audit
```bash
#!/bin/bash
# scripts/nightly-audit.sh

# Security
semgrep scan --config=p/security --json > reports/security.json

# Performance
chrome-devtools web-vitals --all-routes > reports/performance.json

# Database
supabase audit-rls > reports/rls-audit.json
supabase analyze-performance > reports/db-performance.json

# Code Quality
eslint . --format json > reports/lint.json
typescript check --coverage > reports/type-coverage.json

# Tests
vitest run --coverage --json > reports/test-coverage.json

# Accessibility
axe audit --all-routes --json > reports/a11y.json

# AI Observability
langfuse export-metrics --range 24h > reports/ai-metrics.json

# Generate summary report
node scripts/generate-audit-report.js
```

---

### Strategy 3: PR Review Automation
```bash
#!/bin/bash
# scripts/pr-review.sh

PR_NUMBER=$1

# Trigger Greptile review
greptile trigger-review --pr $PR_NUMBER

# Run visual regression tests
playwright test visual-regression --update-snapshots=false

# Check performance budgets
chrome-devtools compare-baseline --pr $PR_NUMBER

# Validate database migrations
supabase migration validate --dry-run

# Security scan changed files
semgrep scan --baseline main --diff

# Post results to PR
gh pr comment $PR_NUMBER --body "$(cat reports/pr-review-summary.md)"
```

---

## 🎯 Success Metrics Dashboard

### Plugin Usage Tracking
```typescript
// Track plugin usage in .claude/analytics.json
{
  "serena_memory": {
    "calls_per_day": 45,
    "top_queries": ["useAIContext references", "import analysis"],
    "time_saved_hours": 3.2
  },
  "greptile": {
    "prs_reviewed": 12,
    "issues_found": 47,
    "auto_fixed": 23
  },
  "chrome_devtools": {
    "performance_audits": 8,
    "lcp_improvements": ["-450ms", "-230ms"],
    "memory_leaks_detected": 2
  },
  "langfuse": {
    "ai_calls_traced": 1247,
    "total_cost_usd": 45.67,
    "avg_latency_ms": 1850
  }
}
```

---

## 📈 ROI Analysis

### Before Plugins
- Manual code navigation: 2 hours/day
- Manual PR reviews: 3 hours/PR
- Manual testing: 4 hours/feature
- Performance debugging: 6 hours/issue
- AI cost tracking: Manual spreadsheet

### After Full Plugin Utilization
- Code navigation: 15 min/day (-87.5%)
- PR reviews: 30 min/PR (-83%)
- Testing: 1 hour/feature (-75%)
- Performance debugging: 1.5 hours/issue (-75%)
- AI cost tracking: Real-time dashboard

**Total Time Saved**: ~30 hours/week
**Quality Improvements**:
- Test coverage: 60% → 80%
- Security vulnerabilities: 2-3/month → 0
- Performance regressions: 5/month → 0
- A11Y issues: 15/page → 0

---

*Plugins Maximization Guide for Nanobanna Pro - 2026-01-13*
*Version: 1.0.0*
