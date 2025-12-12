# 🚀 Deployment Guide

This document explains the automated deployment pipeline and branch protection setup for the Life OS Banner Generator.

## Table of Contents

- [Overview](#overview)
- [Automated Deployment Pipeline](#automated-deployment-pipeline)
- [Branch Protection](#branch-protection)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Deployment Workflow](#deployment-workflow)
- [Troubleshooting](#troubleshooting)

## Overview

The application uses **automated CI/CD** with GitHub Actions and deploys to **Vercel**. Every push to the `main` branch triggers:

1. ✅ Code quality checks (ESLint, Prettier, TypeScript)
2. ✅ Test suite execution (unit & integration tests)
3. ✅ Security scanning (CodeQL, Trivy, npm audit)
4. ✅ Build verification
5. ✅ Automatic deployment to Vercel
6. ✅ Post-deployment health checks
7. ✅ Deployment notifications

## Automated Deployment Pipeline

### Workflow Files

The repository includes 4 GitHub Actions workflows:

#### 1. **CI Pipeline** (`.github/workflows/ci.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Code Quality**: ESLint, Prettier, TypeScript checks
- **Test Suite**: Vitest with coverage reporting
- **Build Check**: Multi-node build verification (Node 18 & 20)
- **Security Scan**: CodeQL, Trivy, npm audit
- **Dependency Review**: Checks for vulnerable dependencies in PRs
- **Bundle Analysis**: Tracks bundle size changes
- **Lighthouse CI**: Performance testing

#### 2. **Production Deployment** (`.github/workflows/cd-production.yml`)
Automatically deploys to production on push to `main` branch.

**Jobs:**
- **Pre-Deployment Checks**: Linting, testing, building
- **Deploy to Vercel**: Production deployment with manual approval option
- **Health Checks**: Validates deployed application
- **Post-Deployment**: Creates GitHub releases, sends notifications
- **Rollback**: Automatic incident creation on failure

#### 3. **Staging Deployment** (`.github/workflows/cd-staging.yml`)
Deploys to staging environment for testing before production.

#### 4. **PR Preview** (`.github/workflows/pr-preview.yml`)
Creates preview deployments for pull requests.

### Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Push to main                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Pre-Deployment Checks                                          │
│  ├── Run ESLint                                                 │
│  ├── Run Tests                                                  │
│  ├── Build Verification                                         │
│  └── Get Version                                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Deploy to Vercel Production                                    │
│  ├── Install dependencies                                       │
│  ├── Build for production                                       │
│  ├── Deploy to Vercel                                           │
│  └── Create deployment record                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Health Checks                                                  │
│  ├── Check homepage (HTTP 200)                                 │
│  ├── Check critical endpoints                                  │
│  └── Performance check (< 5s load time)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Post-Deployment                                                │
│  ├── Create GitHub Release (if tagged)                         │
│  ├── Post success comment                                      │
│  └── Update metrics                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Branch Protection

### Quick Setup

Run the automated setup script:

```bash
bash scripts/setup-branch-protection.sh
```

### Manual Setup

If you prefer to set up branch protection manually:

1. Go to **Settings** → **Branches** in your GitHub repository
2. Click **Add rule** for the `main` branch
3. Configure the following settings:

#### Required Status Checks
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required checks:
  - `Code Quality`
  - `Test Suite`
  - `Build Check`
  - `Security Scan`
  - `CI Status`

#### Pull Request Requirements
- ✅ Require a pull request before merging
- ✅ Require approvals: **1**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require approval of the most recent reviewable push

#### Additional Restrictions
- ✅ Require linear history
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings
- ✅ Apply rules to administrators
- ❌ Allow force pushes (DISABLED)
- ❌ Allow deletions (DISABLED)

### CODEOWNERS File

The `.github/CODEOWNERS` file automatically assigns reviewers based on file paths:

```
# Global owner
* @Verridian-ai

# Frontend components
/src/components/** @Verridian-ai

# Configuration files
/.github/workflows/** @Verridian-ai
/vercel.json @Verridian-ai
```

To add team reviewers:
```
# Security-related files require security team approval
/src/services/auth.ts @Verridian-ai/security-team
```

## GitHub Secrets Configuration

The following secrets must be configured in **Settings** → **Secrets and variables** → **Actions**:

### Required Secrets

| Secret Name | Description | Where to Get |
|------------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel authentication token | [Vercel Account Settings](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | `.vercel/project.json` after linking project |
| `VERCEL_PROJECT_ID` | Vercel project ID | `.vercel/project.json` after linking project |
| `VITE_SUPABASE_URL` | Supabase project URL | [Supabase Project Settings](https://supabase.com/dashboard/project/_/settings/api) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | [Supabase Project Settings](https://supabase.com/dashboard/project/_/settings/api) |

### Optional Secrets

| Secret Name | Description | Required For |
|------------|-------------|--------------|
| `CODECOV_TOKEN` | Codecov upload token | Test coverage reporting |
| `GITHUB_TOKEN` | Automatically provided | All workflows (no setup needed) |

### Setting Up Vercel Secrets

1. **Link your local project to Vercel:**
   ```bash
   npm install -g vercel
   vercel link
   ```

2. **Get your Organization and Project IDs:**
   ```bash
   cat .vercel/project.json
   ```

3. **Create a Vercel token:**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Click **Create Token**
   - Name it "GitHub Actions Deploy"
   - Copy the token

4. **Add secrets to GitHub:**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add each secret with its value

## Deployment Workflow

### Normal Development Flow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

3. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
   - GitHub Actions will run CI checks
   - A preview deployment will be created
   - Request review from code owners

4. **Merge to main:**
   - Once approved, merge the PR
   - GitHub Actions will automatically deploy to production
   - Health checks will verify the deployment

### Hotfix Flow

For urgent production fixes:

1. **Create hotfix branch:**
   ```bash
   git checkout -b hotfix/critical-fix
   ```

2. **Make the fix and push:**
   ```bash
   git add .
   git commit -m "fix: critical production issue"
   git push origin hotfix/critical-fix
   ```

3. **Emergency deployment (skip tests if needed):**
   - Go to **Actions** → **Deploy to Production**
   - Click **Run workflow**
   - Select `skip_tests: true` (only if absolutely necessary)
   - Click **Run workflow**

### Rolling Back a Deployment

If a deployment causes issues:

1. **Using Vercel CLI:**
   ```bash
   vercel rollback
   ```

2. **Using GitHub:**
   - Go to the previous successful deployment
   - Click **Re-run all jobs**

3. **Using Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

## Environment Configuration

### Production Environment

The production environment requires manual approval:

1. **Set up environment protection:**
   - Go to **Settings** → **Environments**
   - Select `production`
   - Add required reviewers
   - Set deployment branch to `main` only

2. **Configure environment variables:**
   ```
   VITE_SUPABASE_URL=your-production-url
   VITE_SUPABASE_ANON_KEY=your-production-key
   VITE_ENVIRONMENT=production
   VITE_ENABLE_ANALYTICS=true
   ```

### Staging Environment

For pre-production testing:

```bash
git push origin develop
```

This will automatically deploy to the staging environment at:
`https://life-os-banner-staging.vercel.app`

## Monitoring & Notifications

### Deployment Status

Check deployment status at:
- **GitHub Actions**: https://github.com/Verridian-ai/life-os-Pulse-banner-generator/actions
- **Vercel Dashboard**: https://vercel.com/dashboard

### Notifications

The workflows automatically:
- ✅ Post success comments on commits
- ✅ Create GitHub releases for tagged deployments
- ✅ Open incident issues on deployment failures
- ✅ Comment on PRs with CI results

### Health Monitoring

After each deployment, the workflow checks:
1. **Homepage availability** (HTTP 200)
2. **Load time** (< 5 seconds)
3. **Critical endpoints** (if configured)

## Troubleshooting

### Common Issues

#### 1. Deployment Fails with "Missing Secrets"

**Solution:** Verify all required secrets are configured:
```bash
# Check if secrets exist (won't show values)
gh secret list
```

Add missing secrets:
```bash
gh secret set VERCEL_TOKEN
gh secret set VITE_SUPABASE_URL
```

#### 2. Tests Fail in CI but Pass Locally

**Solution:**
- Ensure dependencies are up to date: `npm ci`
- Check for environment-specific issues
- Review test logs in GitHub Actions

#### 3. Build Fails in Production but Works Locally

**Solution:**
- Check environment variables are set correctly
- Verify Node version matches (18 or 20)
- Review build logs for missing dependencies

#### 4. Branch Protection Blocking Your Push

**Solution:**
- Create a pull request instead of pushing directly
- Request review from code owners
- Ensure all CI checks pass

#### 5. Vercel Deployment Timeout

**Solution:**
- Check if build is too large (> 50MB warning)
- Optimize bundle size
- Review build logs for hanging processes

### Getting Help

1. **Check workflow logs:**
   - Go to Actions tab
   - Click on failed workflow
   - Review step-by-step logs

2. **Deployment logs:**
   - Go to Vercel dashboard
   - Select deployment
   - Review build and runtime logs

3. **Create an issue:**
   - Include error messages
   - Attach workflow logs
   - Mention deployment ID

## Best Practices

### 1. Never Push Directly to Main

Always use pull requests to leverage:
- Automated testing
- Code review
- Preview deployments
- Branch protection

### 2. Write Meaningful Commit Messages

Follow conventional commits:
```
feat: add new canvas export feature
fix: resolve image upload bug
docs: update deployment guide
test: add canvas component tests
```

### 3. Tag Releases

For production releases:
```bash
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```

This triggers:
- Production deployment
- GitHub release creation
- Changelog generation

### 4. Monitor Deployments

- Check the deployment status in Vercel
- Verify health checks pass
- Test critical user flows after deployment

### 5. Keep Dependencies Updated

Regularly update dependencies:
```bash
npm update
npm audit fix
```

Run security checks:
```bash
npm audit
```

## Quick Reference

### Deploy to Production
```bash
git push origin main
```

### Deploy to Staging
```bash
git push origin develop
```

### Create Preview Deployment
```bash
# Create PR from feature branch
git push origin feature/your-feature
```

### Emergency Deployment
1. Go to Actions → Deploy to Production
2. Click "Run workflow"
3. Set `skip_tests: true`
4. Click "Run workflow"

### Rollback
```bash
vercel rollback
# or
git revert HEAD && git push origin main
```

---

## Summary

Your repository is now configured with:

- ✅ **Automated CI/CD** - Every push triggers testing and deployment
- ✅ **Branch Protection** - Main branch is protected from direct pushes
- ✅ **Code Review** - PRs require approval before merging
- ✅ **Security Scanning** - Automatic vulnerability detection
- ✅ **Health Checks** - Post-deployment verification
- ✅ **Rollback Protection** - Automatic incident creation on failures

**Live URL:** https://life-os-banner.verridian.ai

**Questions?** Open an issue or check the GitHub Actions logs.
