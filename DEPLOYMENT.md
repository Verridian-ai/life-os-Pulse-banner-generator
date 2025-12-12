# Deployment Guide - Nanobanna Pro

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Deployment Process](#deployment-process)
6. [Rollback Procedures](#rollback-procedures)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Nanobanna Pro uses a comprehensive CI/CD pipeline with GitHub Actions and Vercel for automated deployments across multiple environments:

- **Development**: Local development environment
- **Staging**: Auto-deployed from `develop` branch
- **Production**: Auto-deployed from `main` branch with manual approval

### Architecture

```
┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │
         ├─── develop ──→ Staging (Auto)
         │
         └─── main ─────→ Production (Manual Approval)
```

---

## Prerequisites

### Required Accounts & Tools

1. **GitHub Account** with repository access
2. **Vercel Account** (Team plan recommended for production)
3. **Supabase Project** (separate projects for staging and production recommended)
4. **Node.js 18+** installed locally
5. **Vercel CLI** (optional, for manual deployments)

### Required Secrets

Configure the following secrets in GitHub Settings → Secrets and variables → Actions:

#### Vercel Secrets
```
VERCEL_TOKEN                 # Vercel API token
VERCEL_ORG_ID                # Vercel organization ID
VERCEL_PROJECT_ID            # Vercel project ID
```

#### Supabase Secrets (Production)
```
VITE_SUPABASE_URL           # Production Supabase URL
VITE_SUPABASE_ANON_KEY      # Production Supabase anonymous key
```

#### Supabase Secrets (Staging)
```
STAGING_SUPABASE_URL        # Staging Supabase URL
STAGING_SUPABASE_ANON_KEY   # Staging Supabase anonymous key
```

#### Optional Monitoring Secrets
```
CODECOV_TOKEN               # Code coverage reporting
SNYK_TOKEN                  # Security vulnerability scanning
```

---

## Environment Setup

### 1. Fork/Clone Repository

```bash
git clone https://github.com/Verridian-ai/life-os-Pulse-banner-generator.git
cd life-os-Pulse-banner-generator
npm install
```

### 2. Configure Local Environment

Create `.env.local` file:

```env
# Supabase (Use staging credentials for local dev)
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key

# AI API Keys (Optional - users can provide their own)
VITE_GEMINI_API_KEY=your-gemini-key
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_REPLICATE_API_KEY=your-replicate-key
VITE_OPENAI_API_KEY=your-openai-key

# Environment
VITE_ENVIRONMENT=development
```

### 3. Verify Setup

```bash
npm run dev       # Should start on http://localhost:5173
npm run lint      # Should pass without errors
npm run build     # Should build successfully
npx vitest run    # Should run tests
```

---

## CI/CD Pipeline

### Pipeline Overview

The CI/CD pipeline consists of three main workflows:

#### 1. **Continuous Integration (ci.yml)**

Runs on every push and PR to `main` and `develop` branches.

**Jobs:**
- ✅ Code Quality (ESLint, Prettier, TypeScript)
- ✅ Test Suite (Unit tests with coverage)
- ✅ Build Verification (Multi-node testing: Node 18 & 20)
- ✅ Security Scanning (CodeQL, Trivy, npm audit)
- ✅ Dependency Review (PRs only)
- ✅ Bundle Size Analysis (PRs only)
- ✅ Lighthouse Performance (PRs only)

**Triggers:**
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

#### 2. **Staging Deployment (cd-staging.yml)**

Auto-deploys to staging environment on push to `develop` branch.

**Jobs:**
- Deploy to Vercel Preview
- Run smoke tests
- Comment deployment URL on commit

**Triggers:**
```yaml
on:
  push:
    branches: [develop]
  workflow_dispatch:  # Manual trigger available
```

#### 3. **Production Deployment (cd-production.yml)**

Deploys to production with manual approval on push to `main` branch.

**Jobs:**
- Pre-deployment validation
- Deploy to Vercel Production (requires manual approval)
- Health checks
- Post-deployment tasks (GitHub Release, notifications)
- Automatic rollback on failure

**Triggers:**
```yaml
on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:  # Manual trigger with options
```

#### 4. **PR Preview Deployment (pr-preview.yml)**

Creates preview deployments for pull requests.

**Jobs:**
- Deploy preview environment
- Visual regression testing
- Accessibility testing
- Auto-cleanup on PR closure

---

## Deployment Process

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push origin feature/your-feature-name
# → Opens PR in GitHub
# → CI pipeline runs automatically
# → Preview deployment created
```

### Staging Deployment

```bash
# 1. Merge feature branch to develop
git checkout develop
git merge feature/your-feature-name

# 2. Push to remote
git push origin develop
# → Triggers cd-staging.yml workflow
# → Auto-deploys to staging environment
# → Staging URL commented on commit
```

**Staging URL:** `https://nanobanna-pro-staging.vercel.app` (or auto-generated preview URL)

### Production Deployment

```bash
# 1. Ensure develop is stable and tested
npm run lint && npm run build && npx vitest run

# 2. Merge develop to main
git checkout main
git merge develop

# 3. Tag release (optional but recommended)
git tag -a v1.0.0 -m "Release v1.0.0"

# 4. Push to remote
git push origin main --follow-tags
# → Triggers cd-production.yml workflow
# → Requires manual approval in GitHub Actions UI
# → Deploys to production
# → Creates GitHub Release (if tagged)
# → Runs health checks
```

**Manual Approval:**
1. Go to GitHub Actions → Deploy to Production workflow
2. Click on the running workflow
3. Click "Review deployments"
4. Select "production" environment
5. Click "Approve and deploy"

**Production URL:** `https://life-os-banner.verridian.ai`

---

## Rollback Procedures

### Automatic Rollback

If health checks fail after production deployment:
- Workflow creates incident issue automatically
- Notifies team via GitHub comment
- Previous deployment remains active on Vercel

### Manual Rollback (Vercel CLI)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. List recent deployments
vercel ls

# 4. Rollback to previous deployment
vercel rollback <deployment-url>

# Or rollback to specific deployment ID
vercel alias set <old-deployment-url> life-os-banner.verridian.ai
```

### Manual Rollback (GitHub)

```bash
# 1. Identify last working commit
git log --oneline

# 2. Revert to that commit
git revert <bad-commit-sha>

# 3. Push to trigger new deployment
git push origin main
```

### Emergency Rollback (Vercel Dashboard)

1. Go to https://vercel.com/dashboard
2. Select `nanobanna-pro` project
3. Click "Deployments" tab
4. Find last working deployment
5. Click "..." → "Promote to Production"

---

## Monitoring & Logging

### Application Monitoring

**Vercel Analytics:**
- Real-time traffic monitoring
- Web Vitals (LCP, FID, CLS)
- Access at: https://vercel.com/verridian-ai/life-os-banner → Analytics

**GitHub Actions:**
- Workflow run history
- Build logs and artifacts
- Access at: https://github.com/Verridian-ai/life-os-Pulse-banner-generator/actions

### Performance Monitoring

**Lighthouse CI:**
- Runs on every PR
- Checks performance, accessibility, SEO
- Results uploaded to temporary public storage

**Bundle Size Monitoring:**
- Tracks bundle size changes
- Alerts on PRs if bundle exceeds limits
- Configured in `.size-limit.json`

### Security Monitoring

**CodeQL:**
- Scans for security vulnerabilities
- Runs on every push
- Results in Security tab on GitHub

**Dependabot:**
- Automated dependency updates
- Security vulnerability alerts
- Opens PRs for updates weekly

**npm audit:**
- Runs on every CI build
- Fails build on high/critical vulnerabilities
- Results in workflow artifacts

### Log Access

**Vercel Logs:**
```bash
# View real-time logs
vercel logs nanobanna-pro --follow

# View logs for specific deployment
vercel logs <deployment-url>
```

**GitHub Actions Logs:**
1. Go to Actions tab
2. Click on workflow run
3. Click on specific job
4. View detailed logs

---

## Troubleshooting

### Build Failures

**Symptom:** CI pipeline fails at build step

**Solutions:**
```bash
# 1. Check TypeScript errors
npm run lint
npx tsc --noEmit

# 2. Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# 3. Check environment variables
# Ensure all required VITE_* variables are set
```

### Test Failures

**Symptom:** Tests fail in CI but pass locally

**Solutions:**
```bash
# 1. Run tests in CI mode
CI=true npx vitest run

# 2. Clear test cache
npx vitest run --clearCache

# 3. Check Node version matches CI (18)
node -v
```

### Deployment Failures

**Symptom:** Vercel deployment fails

**Solutions:**
1. Check Vercel dashboard for error logs
2. Verify all GitHub secrets are configured
3. Ensure Vercel project is linked correctly
4. Check build output size (max 50MB)

```bash
# Manual deployment for debugging
vercel --prod --debug
```

### Failed Health Checks

**Symptom:** Production deployment succeeds but health checks fail

**Solutions:**
1. Check Vercel function logs
2. Verify Supabase connection
3. Test production URL manually
4. Check for CORS issues

```bash
# Test health endpoint
curl -I https://life-os-banner.verridian.ai

# Check response time
curl -o /dev/null -s -w '%{time_total}\n' https://life-os-banner.verridian.ai
```

### Secret Configuration Issues

**Symptom:** "Secret not found" errors

**Solutions:**
1. Go to GitHub Settings → Secrets and variables → Actions
2. Verify all required secrets exist
3. Check secret names match exactly (case-sensitive)
4. Re-add secrets if needed

### Dependency Issues

**Symptom:** Package installation fails

**Solutions:**
```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Remove lock file and reinstall
rm package-lock.json
npm install

# 3. Check for conflicting peer dependencies
npm ls

# 4. Update to latest compatible versions
npx npm-check-updates -u
npm install
```

---

## Best Practices

### Branching Strategy

```
main (production)
  └─ develop (staging)
      └─ feature/* (feature branches)
      └─ fix/* (bug fix branches)
      └─ hotfix/* (emergency fixes)
```

### Commit Messages

Follow Conventional Commits:
```
feat: add user authentication
fix: resolve canvas export issue
chore: update dependencies
docs: improve deployment guide
```

### Release Process

1. **Staging Validation**
   - Deploy to staging first
   - Run manual QA
   - Verify all features work

2. **Production Deployment**
   - Tag release with semantic version
   - Create detailed release notes
   - Monitor health checks post-deployment
   - Communicate deployment to team

3. **Post-Deployment**
   - Monitor error rates
   - Check performance metrics
   - Verify user reports
   - Update documentation if needed

### Security Checklist

- [ ] All secrets stored in GitHub Secrets (never in code)
- [ ] Environment variables prefixed with `VITE_` for client-side exposure
- [ ] API keys encrypted in database
- [ ] CORS configured correctly
- [ ] Supabase Row Level Security (RLS) enabled
- [ ] Dependencies regularly updated
- [ ] Security scanning enabled

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build               # Build for production
npm run preview             # Preview production build
npm run lint                # Run ESLint
npm run format              # Format code with Prettier

# Testing
npx vitest run              # Run tests once
npx vitest run --coverage   # Run tests with coverage
npx vitest watch            # Watch mode

# Deployment
vercel                      # Deploy preview
vercel --prod               # Deploy to production
vercel ls                   # List deployments
vercel logs                 # View logs

# Git
git checkout -b feature/name   # Create feature branch
git push origin feature/name   # Push feature branch
git checkout develop           # Switch to develop
git merge feature/name         # Merge feature
git push origin develop        # Deploy to staging
git checkout main              # Switch to main
git merge develop              # Prepare for production
git tag -a v1.0.0 -m "Release" # Tag release
git push origin main --tags    # Deploy to production
```

### Support Contacts

- **Technical Issues:** Create issue in GitHub repository
- **Deployment Issues:** Check GitHub Actions logs first
- **Vercel Issues:** Vercel support at vercel.com/support
- **Supabase Issues:** Supabase support at supabase.com/support

---

## Changelog

### v1.0.0 (Initial Release)
- Enterprise-grade CI/CD pipeline
- Multi-environment deployments
- Automated security scanning
- Performance monitoring
- Rollback capabilities

---

*Last Updated: 2025-12-13*
*Maintained by: Development Team*
