# GitHub Secrets Setup Guide

## Required Secrets Configuration

This guide will help you configure all required secrets for the CI/CD pipeline.

---

## 1. Vercel Integration

### Get Vercel Tokens

1. **Login to Vercel Dashboard**
   - Go to https://vercel.com/
   - Login with your account

2. **Create API Token**
   - Go to https://vercel.com/account/tokens
   - Click "Create Token"
   - Name it: `nanobanna-pro-github-actions`
   - Select scope: "Full Account"
   - Click "Create"
   - **Copy the token immediately** (shown only once)
   - This is your `VERCEL_TOKEN`

3. **Get Organization ID**
   - Go to https://vercel.com/account
   - Scroll to "Your ID" section
   - Copy the ID
   - This is your `VERCEL_ORG_ID`

4. **Get Project ID**
   - Go to your project settings: https://vercel.com/verridian-ai/life-os-banner/settings
   - Under "General" → "Project ID"
   - Copy the ID
   - This is your `VERCEL_PROJECT_ID`

### Alternative: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link your project
vercel link

# Get IDs from .vercel/project.json
cat .vercel/project.json
# orgId = VERCEL_ORG_ID
# projectId = VERCEL_PROJECT_ID
```

---

## 2. Supabase Integration

### Production Supabase

1. **Go to Production Supabase Project**
   - https://app.supabase.com/

2. **Get Project URL**
   - Go to Settings → API
   - Copy "Project URL"
   - This is your `VITE_SUPABASE_URL`

3. **Get Anonymous Key**
   - Same page: Settings → API
   - Copy "anon public" key
   - This is your `VITE_SUPABASE_ANON_KEY`

### Staging Supabase (Recommended)

Create a separate Supabase project for staging:

1. **Create New Project**
   - https://app.supabase.com/
   - Click "New Project"
   - Name it: `nanobanna-pro-staging`

2. **Get Staging Credentials**
   - Follow same steps as production
   - This is your `STAGING_SUPABASE_URL`
   - And `STAGING_SUPABASE_ANON_KEY`

---

## 3. Code Coverage (Optional)

### Codecov

1. **Sign up at Codecov**
   - Go to https://codecov.io/
   - Login with GitHub

2. **Add Repository**
   - Select `nanobanna-pro` repository
   - Copy the upload token
   - This is your `CODECOV_TOKEN`

---

## 4. Security Scanning (Optional)

### Snyk

1. **Sign up at Snyk**
   - Go to https://snyk.io/
   - Login with GitHub

2. **Get API Token**
   - Go to Account Settings → General
   - Click "Click to show" under API Token
   - Copy the token
   - This is your `SNYK_TOKEN`

---

## Adding Secrets to GitHub

### Via GitHub UI

1. **Go to Repository Settings**
   - Navigate to your GitHub repository
   - Click "Settings" tab

2. **Access Secrets**
   - Left sidebar: "Secrets and variables" → "Actions"
   - Click "New repository secret"

3. **Add Each Secret**
   - Name: Secret name (e.g., `VERCEL_TOKEN`)
   - Value: Secret value
   - Click "Add secret"

### Required Secrets Checklist

Production secrets:

- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`

Staging secrets (recommended):

- [ ] `STAGING_SUPABASE_URL`
- [ ] `STAGING_SUPABASE_ANON_KEY`

Optional secrets:

- [ ] `CODECOV_TOKEN`
- [ ] `SNYK_TOKEN`

---

## Environment-Specific Secrets

### Using GitHub Environments

For better security, create environment-specific secrets:

1. **Create Environments**
   - Settings → Environments
   - Create "production" environment
   - Create "staging" environment

2. **Configure Production Environment**
   - Click on "production"
   - Add protection rules:
     - ✅ Required reviewers (1-2 people)
     - ✅ Wait timer (5 minutes)
   - Add environment secrets:
     - `VITE_SUPABASE_URL` (production)
     - `VITE_SUPABASE_ANON_KEY` (production)

3. **Configure Staging Environment**
   - Click on "staging"
   - Add environment secrets:
     - `VITE_SUPABASE_URL` (staging)
     - `VITE_SUPABASE_ANON_KEY` (staging)

---

## Verifying Secrets

### Test CI Pipeline

1. **Trigger Workflow**

   ```bash
   git commit --allow-empty -m "test: verify CI pipeline"
   git push origin develop
   ```

2. **Check Workflow**
   - Go to Actions tab
   - Click on the running workflow
   - Verify all jobs pass

### Test Deployment

1. **Trigger Staging Deployment**

   ```bash
   git push origin develop
   ```

2. **Check Deployment**
   - Go to Actions → Deploy to Staging
   - Verify deployment succeeds
   - Check deployment URL works

---

## Secret Rotation

### Best Practices

- Rotate secrets every 90 days
- Use different tokens for CI/CD and local development
- Never commit secrets to repository
- Use environment-specific secrets when possible

### How to Rotate

1. **Create New Token**
   - Generate new token in service dashboard
   - Test new token locally

2. **Update GitHub Secret**
   - Go to Settings → Secrets
   - Click on secret name
   - Click "Update"
   - Paste new value

3. **Verify**
   - Trigger workflow
   - Ensure it works with new secret

4. **Revoke Old Token**
   - Go to service dashboard
   - Revoke old token

---

## Troubleshooting

### Secret Not Found

**Error:** `Secret VERCEL_TOKEN not found`

**Solution:**

1. Check secret name matches exactly (case-sensitive)
2. Ensure secret is added to repository (not user account)
3. Re-add secret if needed

### Invalid Token

**Error:** `Authentication failed` or `Invalid token`

**Solution:**

1. Verify token is copied completely (no spaces)
2. Check token hasn't expired
3. Generate new token
4. Ensure token has correct permissions

### Wrong Environment

**Error:** Deployment works in staging but fails in production

**Solution:**

1. Check environment-specific secrets
2. Verify production secrets are configured
3. Ensure environment names match in workflows

---

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit secrets to git**
   - Add `.env*` to `.gitignore`
   - Use git secrets scanning

2. **Least privilege principle**
   - Use read-only tokens when possible
   - Scope tokens to specific projects

3. **Monitor secret usage**
   - Review webhook logs
   - Check for unauthorized access
   - Set up alerts for failed attempts

4. **Separate environments**
   - Use different credentials for staging/production
   - Never share production secrets with staging

---

## Quick Setup Script

Save this as `setup-secrets.sh` (DO NOT commit this file):

```bash
#!/bin/bash

# GitHub Repository
REPO_OWNER="yourusername"
REPO_NAME="nanobanna-pro"

# Install GitHub CLI if needed
# brew install gh  # macOS
# or download from https://cli.github.com/

# Login to GitHub CLI
gh auth login

# Set secrets (you'll be prompted for values)
echo "Setting up GitHub Secrets..."

gh secret set VERCEL_TOKEN -R "$REPO_OWNER/$REPO_NAME"
gh secret set VERCEL_ORG_ID -R "$REPO_OWNER/$REPO_NAME"
gh secret set VERCEL_PROJECT_ID -R "$REPO_OWNER/$REPO_NAME"
gh secret set VITE_SUPABASE_URL -R "$REPO_OWNER/$REPO_NAME"
gh secret set VITE_SUPABASE_ANON_KEY -R "$REPO_OWNER/$REPO_NAME"
gh secret set STAGING_SUPABASE_URL -R "$REPO_OWNER/$REPO_NAME"
gh secret set STAGING_SUPABASE_ANON_KEY -R "$REPO_OWNER/$REPO_NAME"

echo "✅ Secrets configured successfully!"
```

Usage:

```bash
chmod +x setup-secrets.sh
./setup-secrets.sh
```

---

## Support

If you encounter issues:

1. Check [DEPLOYMENT.md](../DEPLOYMENT.md) for troubleshooting
2. Verify all secrets are configured correctly
3. Check GitHub Actions logs for specific errors
4. Create an issue in the repository

---

_Last Updated: 2025-12-13_
