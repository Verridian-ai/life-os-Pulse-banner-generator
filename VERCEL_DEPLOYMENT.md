# Vercel Deployment Guide

## Custom Domain: life-os-banner.verridian.ai

This guide will walk you through deploying your application to Vercel with your custom domain.

---

## Prerequisites

- Vercel account (free tier works)
- GitHub repository access
- Custom domain: `verridian.ai` (already owned)
- Access to DNS settings for `verridian.ai`

---

## Step 1: Create Vercel Project

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Git Repository**
   - Click "Import Project"
   - Select "Import Git Repository"
   - Search for: `Verridian-ai/life-os-Pulse-banner-generator`
   - Click "Import"

3. **Configure Project**
   ```
   Project Name: life-os-banner
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm ci
   ```

4. **Environment Variables (Add Now)**
   Click "Add Environment Variable" for each:
   ```
   VITE_SUPABASE_URL = your-supabase-url
   VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
   VITE_ENVIRONMENT = production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for first deployment
   - Note the deployment URL: `life-os-banner.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to project directory
cd life-os-Pulse-banner-generator

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

---

## Step 2: Get Vercel Credentials for GitHub Actions

After creating the project, you need these for GitHub Actions:

### A. Get Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: `GitHub Actions - life-os-banner`
4. Scope: "Full Account" (or scope to specific projects)
5. Expiration: "No Expiration" or set custom
6. Click "Create"
7. **Copy the token immediately** (shown only once)
8. This is your `VERCEL_TOKEN`

### B. Get Organization ID

**Method 1: From Vercel Dashboard**
1. Go to: https://vercel.com/account
2. Look for "Your ID" or "Team ID" section
3. Copy the ID (format: `team_xxxxxxxxxxxxxxxxxxxxx`)
4. This is your `VERCEL_ORG_ID`

**Method 2: Using Vercel CLI**
```bash
# Link project (if not already linked)
vercel link

# View project settings (shows org ID)
cat .vercel/project.json
```

The `.vercel/project.json` file will contain:
```json
{
  "orgId": "team_xxxxxxxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxxxxxxx"
}
```

### C. Get Project ID

**From Same File:**
The `projectId` in `.vercel/project.json` is your `VERCEL_PROJECT_ID`

**Or From Dashboard:**
1. Go to your project: https://vercel.com/verridian-ai/life-os-banner
2. Settings → General
3. Look for "Project ID"

---

## Step 3: Add GitHub Secrets

Go to your GitHub repository settings:
👉 **https://github.com/Verridian-ai/life-os-Pulse-banner-generator/settings/secrets/actions**

Click "New repository secret" for each:

```
Name: VERCEL_TOKEN
Value: [paste the token from Step 2A]

Name: VERCEL_ORG_ID
Value: [paste the org ID from Step 2B]

Name: VERCEL_PROJECT_ID
Value: [paste the project ID from Step 2C]

Name: VITE_SUPABASE_URL
Value: [your production Supabase URL]

Name: VITE_SUPABASE_ANON_KEY
Value: [your production Supabase anon key]
```

**Optional (for staging):**
```
Name: STAGING_SUPABASE_URL
Value: [your staging Supabase URL]

Name: STAGING_SUPABASE_ANON_KEY
Value: [your staging Supabase anon key]
```

---

## Step 4: Configure Custom Domain

### A. Add Domain in Vercel

1. **Go to Project Settings**
   - Visit: https://vercel.com/verridian-ai/life-os-banner/settings/domains
   - Or: Dashboard → Your Project → Settings → Domains

2. **Add Custom Domain**
   - Click "Add Domain"
   - Enter: `life-os-banner.verridian.ai`
   - Click "Add"

3. **Vercel Will Show DNS Records**
   You'll see one of these configurations:

   **Option A: CNAME Record (Recommended)**
   ```
   Type: CNAME
   Name: life-os-banner
   Value: cname.vercel-dns.com
   ```

   **Option B: A Records**
   ```
   Type: A
   Name: life-os-banner
   Value: 76.76.21.21
   ```

### B. Configure DNS at Your Domain Provider

1. **Login to Your DNS Provider**
   (Where you manage `verridian.ai` - could be Cloudflare, Namecheap, GoDaddy, etc.)

2. **Add DNS Record**

   **If Using CNAME (Recommended):**
   ```
   Type: CNAME
   Host: life-os-banner
   Target/Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

   **If Using A Record:**
   ```
   Type: A
   Host: life-os-banner
   Target/Value: 76.76.21.21
   TTL: 3600 (or Auto)
   ```

3. **Save Changes**

4. **Wait for DNS Propagation**
   - Usually takes 5-60 minutes
   - Can take up to 48 hours in rare cases

### C. Verify Domain Configuration

**Check DNS Propagation:**
```bash
# Check CNAME
dig life-os-banner.verridian.ai CNAME

# Check A record
dig life-os-banner.verridian.ai A

# Check from external DNS
nslookup life-os-banner.verridian.ai 8.8.8.8
```

**Or use online tools:**
- https://dnschecker.org/#CNAME/life-os-banner.verridian.ai
- https://www.whatsmydns.net/#CNAME/life-os-banner.verridian.ai

### D. SSL Certificate (Automatic)

Vercel automatically provisions SSL certificates via Let's Encrypt:
- Certificate is issued within minutes after DNS propagation
- Auto-renews every 90 days
- HTTPS is enforced automatically
- HTTP automatically redirects to HTTPS

---

## Step 5: Verify Deployment

### A. Check Vercel Dashboard

1. **Go to Deployments**
   - Visit: https://vercel.com/verridian-ai/life-os-banner
   - Check latest deployment status

2. **View Deployment Logs**
   - Click on latest deployment
   - Check build logs for errors
   - Verify environment variables are loaded

### B. Test URLs

**Vercel Default URL:**
```
https://life-os-banner.vercel.app
```

**Production Custom Domain:**
```
https://life-os-banner.verridian.ai
```

**Test Checklist:**
- [ ] Homepage loads
- [ ] No console errors
- [ ] Images load correctly
- [ ] API connections work (Supabase)
- [ ] SSL certificate valid (padlock icon)
- [ ] HTTP redirects to HTTPS
- [ ] Mobile responsive

### C. Test GitHub Actions Deployment

```bash
# Create test commit
git checkout -b test/vercel-deployment
git commit --allow-empty -m "test: verify Vercel deployment from GitHub Actions"
git push origin test/vercel-deployment

# Open PR on GitHub
# → CI pipeline runs
# → Preview deployment created
# → Check Actions tab for deployment status
```

---

## Step 6: Configure Production Settings

### A. Environment-Specific Configuration

**Production Environment Variables:**
```
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_ENVIRONMENT=production
VITE_ENABLE_ANALYTICS=true
```

**Set in Vercel Dashboard:**
1. Go to: Settings → Environment Variables
2. For each variable:
   - Add variable
   - Select "Production" environment
   - Add value
   - Click "Save"

### B. Build Configuration

In Vercel Dashboard → Settings → General:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
Node.js Version: 18.x
```

### C. Security Headers (Already Configured)

Your `vercel.json` already includes security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: microphone=(self), camera=(self)

### D. Performance Settings

**Enable these in Vercel Dashboard:**
1. **Speed Insights**
   - Settings → Speed Insights
   - Enable for production

2. **Analytics**
   - Settings → Analytics
   - Enable Web Analytics

3. **Caching**
   - Already configured in `vercel.json`
   - Assets cached for 1 year

---

## Step 7: Set Up Staging Environment (Optional)

### A. Create Staging Branch

```bash
# Create develop branch
git checkout -b develop
git push origin develop

# Configure as staging in Vercel
# Dashboard → Settings → Git → Production Branch: main
# Any deploy from 'develop' becomes preview/staging
```

### B. Staging Domain (Optional)

Add a staging subdomain:
```
staging.life-os-banner.verridian.ai
```

1. Add in Vercel: Settings → Domains → Add Domain
2. Add DNS CNAME record at your DNS provider
3. Link to `develop` branch deployments

---

## Step 8: Monitoring & Maintenance

### A. Set Up Alerts

**Vercel Integrations:**
1. Go to: https://vercel.com/integrations
2. Consider adding:
   - **Slack** - Deployment notifications
   - **Sentry** - Error tracking
   - **LogDrain** - Log aggregation

### B. Monitor Deployments

**Vercel Dashboard:**
- Deployments tab: View all deployments
- Analytics: Traffic and performance
- Logs: Runtime logs

**GitHub Actions:**
- Actions tab: CI/CD pipeline status
- Deployments: GitHub deployment history

### C. Scheduled Tasks

**Health Checks:**
```bash
# Add to cron job or monitoring service
curl -f https://life-os-banner.verridian.ai || \
  echo "Site down!" | mail -s "Alert" your-email@example.com
```

**Uptime Monitoring Services:**
- UptimeRobot (free): https://uptimerobot.com/
- Pingdom
- StatusCake

---

## Troubleshooting

### Issue 1: Build Fails in Vercel

**Symptoms:**
- Build succeeds locally but fails on Vercel
- "Command failed" error

**Solutions:**
```bash
# Check build locally
npm run build

# Check for missing dependencies
npm ci
npm run build

# Check Node version
node -v  # Should be 18+

# Clear Vercel cache (in dashboard)
# Settings → General → Clear Cache
```

### Issue 2: Environment Variables Not Working

**Symptoms:**
- "undefined" in console
- Features not working

**Solutions:**
1. Check variable names start with `VITE_`
2. Redeploy after adding variables
3. Verify in build logs: Search for "Loaded env"

```bash
# Test locally
cat .env
npm run build
npm run preview
```

### Issue 3: Custom Domain Not Working

**Symptoms:**
- DNS_PROBE_FINISHED_NXDOMAIN
- Domain doesn't resolve

**Solutions:**
```bash
# Check DNS propagation
dig life-os-banner.verridian.ai

# Check nameservers
dig verridian.ai NS

# Wait 1 hour and check again
# DNS can take up to 48 hours
```

### Issue 4: SSL Certificate Issues

**Symptoms:**
- "Not Secure" warning
- Certificate error

**Solutions:**
1. Wait 10-15 minutes after DNS propagation
2. Check: Vercel Dashboard → Domains → Certificate Status
3. If "Invalid Configuration": Fix DNS records
4. If stuck: Remove and re-add domain

### Issue 5: GitHub Actions Deployment Fails

**Symptoms:**
- "Invalid credentials" error
- "Project not found" error

**Solutions:**
1. Verify GitHub Secrets are set correctly
2. Check token hasn't expired
3. Verify project IDs match

```bash
# Regenerate token
# Vercel Dashboard → Account → Tokens → Create New

# Get fresh project ID
vercel link
cat .vercel/project.json
```

---

## Quick Reference

### URLs

| Environment | URL |
|-------------|-----|
| Production | https://life-os-banner.verridian.ai |
| Vercel Default | https://life-os-banner.vercel.app |
| PR Previews | https://life-os-banner-pr-{number}.vercel.app |

### Commands

```bash
# Deploy manually
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs life-os-banner.vercel.app

# Rollback
vercel rollback [deployment-url]

# Link project
vercel link

# Environment variables
vercel env ls
vercel env add VARIABLE_NAME production
```

### Important Links

- **Vercel Dashboard**: https://vercel.com/verridian-ai/life-os-banner
- **Project Settings**: https://vercel.com/verridian-ai/life-os-banner/settings
- **Domains**: https://vercel.com/verridian-ai/life-os-banner/settings/domains
- **Environment Variables**: https://vercel.com/verridian-ai/life-os-banner/settings/environment-variables
- **Deployments**: https://vercel.com/verridian-ai/life-os-banner/deployments
- **Analytics**: https://vercel.com/verridian-ai/life-os-banner/analytics

---

## Next Steps After Deployment

1. ✅ Test all features on production
2. ✅ Configure Supabase RLS policies
3. ✅ Set up monitoring and alerts
4. ✅ Create staging environment
5. ✅ Train team on deployment process
6. ✅ Document incident response procedures
7. ✅ Set up backup and recovery plan

---

## Support

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: https://vercel.com/support

### Project-Specific
- See: `DEPLOYMENT.md` for full deployment guide
- See: `.github/SECRETS_SETUP.md` for secrets configuration
- See: `CI_CD_SETUP_COMPLETE.md` for CI/CD overview

---

**Deployment Date:** 2025-12-13
**Domain:** life-os-banner.verridian.ai
**Status:** ✅ Ready for deployment
