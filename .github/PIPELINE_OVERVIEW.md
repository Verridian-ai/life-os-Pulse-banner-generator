# CI/CD Pipeline Overview

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                          │
│                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  feature/*      │  │  develop        │  │  main           │  │
│  │  (PR Branch)    │  │  (Staging)      │  │  (Production)   │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            │                    │                    │
     ┌──────▼──────┐      ┌──────▼──────┐     ┌──────▼──────┐
     │ PR Preview  │      │ CD Staging  │     │CD Production│
     │  Workflow   │      │  Workflow   │     │  Workflow   │
     └──────┬──────┘      └──────┬──────┘     └──────┬──────┘
            │                    │                    │
     ┌──────▼──────────────────┐ │             ┌──────▼──────────┐
     │   CI Pipeline            │ │             │ Pre-Deployment  │
     │ ┌────────────────────┐   │ │             │  Validation    │
     │ │ Code Quality       │   │ │             └──────┬──────────┘
     │ │ - ESLint           │   │ │                    │
     │ │ - Prettier         │   │ │             ┌──────▼──────────┐
     │ │ - TypeScript       │   │ │             │ Manual Approval │
     │ └────────────────────┘   │ │             │  (Production)   │
     │ ┌────────────────────┐   │ │             └──────┬──────────┘
     │ │ Testing            │   │ │                    │
     │ │ - Unit Tests       │   │ │             ┌──────▼──────────┐
     │ │ - Coverage         │   │ │             │ Deploy to       │
     │ └────────────────────┘   │ │             │ Vercel Prod     │
     │ ┌────────────────────┐   │ │             └──────┬──────────┘
     │ │ Build              │   │ │                    │
     │ │ - Multi-node       │   │ │             ┌──────▼──────────┐
     │ │ - Artifacts        │   │ │             │ Health Checks   │
     │ └────────────────────┘   │ │             └──────┬──────────┘
     │ ┌────────────────────┐   │ │                    │
     │ │ Security           │   │ │             ┌──────▼──────────┐
     │ │ - CodeQL           │   │ │             │ Post-Deploy     │
     │ │ - Trivy            │   │ │             │ - Release       │
     │ │ - npm audit        │   │ │             │ - Notifications │
     │ └────────────────────┘   │ │             └─────────────────┘
     └──────────────────────────┘ │
            │                     │
     ┌──────▼──────────────────┐  │
     │ PR Specific Jobs        │  │
     │ ┌────────────────────┐  │  │
     │ │ Bundle Analysis    │  │  │
     │ │ Lighthouse CI      │  │  │
     │ │ Dependency Review  │  │  │
     │ │ Visual Regression  │  │  │
     │ │ Accessibility      │  │  │
     │ └────────────────────┘  │  │
     └──────┬──────────────────┘  │
            │                     │
     ┌──────▼──────────────────┐  │
     │ Deploy Preview          │  │
     │ to Vercel               │  │
     └──────┬──────────────────┘  │
            │                     │
            │                   ┌─▼──────────────────┐
            │                   │ Deploy Staging     │
            │                   │ to Vercel          │
            │                   └─┬──────────────────┘
            │                     │
            │                   ┌─▼──────────────────┐
            │                   │ Smoke Tests        │
            │                   └────────────────────┘
            │
     ┌──────▼──────────────────┐
     │ Auto-Comment PR         │
     │ with Preview URL        │
     └─────────────────────────┘
```

---

## Workflow Files

### 1. Continuous Integration (`.github/workflows/ci.yml`)

**Purpose:** Validate code quality, run tests, and build on every push/PR

**Jobs:**
1. **Quality** (10 min timeout)
   - ESLint linting
   - Prettier formatting check
   - TypeScript type checking
   - Console.log detection

2. **Test** (15 min timeout)
   - Vitest unit tests
   - Coverage reporting
   - Codecov upload
   - PR coverage comments

3. **Build** (15 min timeout)
   - Multi-node matrix (Node 18 & 20)
   - Build verification
   - Bundle size check
   - Artifact upload

4. **Security** (15 min timeout)
   - npm audit
   - CodeQL analysis
   - Trivy vulnerability scan
   - SARIF upload to GitHub Security

5. **Dependency Review** (PRs only)
   - Detect vulnerable dependencies
   - License checking
   - PR comments

6. **Bundle Analysis** (PRs only)
   - size-limit checks
   - Bundle size comparison
   - PR comments

7. **Lighthouse** (PRs only)
   - Performance audits
   - Accessibility checks
   - SEO scoring

8. **CI Status**
   - Gates all jobs
   - PR success comment
   - Fail fast on errors

**Triggers:**
- Push to `main`, `develop`
- Pull requests to `main`, `develop`

**Concurrency:** Cancel in-progress for same branch

---

### 2. Staging Deployment (`.github/workflows/cd-staging.yml`)

**Purpose:** Auto-deploy to staging on develop branch updates

**Jobs:**
1. **Deploy Staging**
   - Install dependencies
   - Run tests
   - Build with staging env vars
   - Deploy to Vercel preview
   - Run smoke tests
   - Comment deployment URL

**Triggers:**
- Push to `develop`
- Manual dispatch

**Environment:**
- Name: `staging`
- Secrets: `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`

---

### 3. Production Deployment (`.github/workflows/cd-production.yml`)

**Purpose:** Deploy to production with manual approval and health checks

**Jobs:**
1. **Pre-Deploy Checks**
   - Lint
   - Test (skippable in emergencies)
   - Build verification
   - Version extraction
   - Breaking change detection

2. **Deploy Production**
   - Requires manual approval
   - Build with production env vars
   - Deploy to Vercel production
   - Create deployment record

3. **Health Check**
   - Wait for propagation
   - Homepage health check
   - Critical endpoints check
   - Performance check

4. **Post-Deployment**
   - Create GitHub Release (if tagged)
   - Success notifications
   - Metrics logging

5. **Rollback** (on failure)
   - Create incident issue
   - Notify team
   - Rollback instructions

**Triggers:**
- Push to `main`
- Tags matching `v*`
- Manual dispatch (with options)

**Environment:**
- Name: `production`
- Requires: Manual approval
- Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

### 4. PR Preview (`.github/workflows/pr-preview.yml`)

**Purpose:** Create preview deployments for pull requests

**Jobs:**
1. **Deploy Preview**
   - Build application
   - Deploy to Vercel
   - Comment preview URL
   - Update on new commits

2. **Visual Regression**
   - Run visual tests
   - Comment results

3. **Accessibility**
   - Run pa11y tests
   - Comment results

4. **Cleanup**
   - Remove preview on PR close

**Triggers:**
- PR opened, synchronized, reopened
- PR review submitted
- PR closed (cleanup)

---

## Automation Features

### Dependabot (`.github/dependabot.yml`)

**NPM Dependencies:**
- Weekly updates (Mondays, 9 AM ET)
- Groups by production/development
- Max 10 PRs at once
- Ignore major version updates

**GitHub Actions:**
- Weekly updates (Mondays, 10 AM ET)
- Max 5 PRs at once
- Auto-labels

---

## Code Quality Tools

### 1. Lighthouse CI (`.lighthouserc.json`)

**Metrics:**
- Performance: ≥ 80%
- Accessibility: ≥ 90%
- Best Practices: ≥ 85%
- SEO: ≥ 85%

**Core Web Vitals:**
- FCP: < 2s
- LCP: < 2.5s
- CLS: < 0.1
- TBT: < 300ms
- TTI: < 4s

### 2. Bundle Size (`.size-limit.json`)

**Limits:**
- Main Bundle: 500 KB
- Main CSS: 50 KB
- Vendor Bundle: 300 KB
- Total Assets: 1 MB

### 3. Test Coverage (vite.config.ts)

**Thresholds:**
- Statements: 70%
- Branches: 65%
- Functions: 65%
- Lines: 70%

---

## Security Features

### 1. CodeQL Analysis
- JavaScript/TypeScript scanning
- Security and quality queries
- SARIF results in Security tab

### 2. Trivy Scanning
- Filesystem vulnerability scan
- SARIF format
- GitHub Security integration

### 3. npm audit
- Moderate+ severity check
- JSON results artifact
- Continue on error (warning)

### 4. Dependency Review
- PR dependency changes
- License compliance
- Security vulnerabilities

---

## Deployment Targets

### Vercel Configuration (vercel.json)

**Build:**
- Command: `npm run build`
- Output: `dist/`
- Node: 18

**Security Headers:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: microphone=(self), camera=(self)

**Caching:**
- Assets: 1 year (immutable)
- HTML: No cache

**Regions:**
- Primary: iad1 (US East)

---

## Monitoring & Observability

### GitHub Actions
- Workflow run history
- Job-level logs
- Artifact downloads
- Deployment records

### Vercel
- Real-time logs
- Analytics dashboard
- Web Vitals tracking
- Function metrics

### Codecov
- Coverage trends
- File-level coverage
- PR coverage impact

---

## Quick Reference

### Required GitHub Secrets

```
VERCEL_TOKEN              # Vercel API token
VERCEL_ORG_ID             # Vercel organization ID
VERCEL_PROJECT_ID         # Vercel project ID
VITE_SUPABASE_URL         # Production Supabase URL
VITE_SUPABASE_ANON_KEY    # Production Supabase key
STAGING_SUPABASE_URL      # Staging Supabase URL
STAGING_SUPABASE_ANON_KEY # Staging Supabase key
```

### Optional Secrets

```
CODECOV_TOKEN             # Code coverage
SNYK_TOKEN                # Security scanning
```

---

## Status Badges

Add to README.md:

```markdown
[![CI](https://github.com/USERNAME/nanobanna-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/nanobanna-pro/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/USERNAME/nanobanna-pro/branch/main/graph/badge.svg)](https://codecov.io/gh/USERNAME/nanobanna-pro)
[![Deploy Production](https://github.com/USERNAME/nanobanna-pro/actions/workflows/cd-production.yml/badge.svg)](https://github.com/USERNAME/nanobanna-pro/actions/workflows/cd-production.yml)
```

---

## Troubleshooting

See [DEPLOYMENT.md](../DEPLOYMENT.md#troubleshooting) for detailed troubleshooting guide.

---

*Last Updated: 2025-12-13*
